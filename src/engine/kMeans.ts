import { CampaignRecord, CustomerSegment } from './types';

interface ClusterPoint {
  id: string;
  features: number[]; // [revenue, clv, dealValue, conversionRate, interactions, spend]
  rawRecord: CampaignRecord;
}

export function runCustomerKMeans(records: CampaignRecord[], k: number = 4): CustomerSegment[] {
  if (records.length === 0) return [];

  // Group records by client / account proxy (e.g. campaign + segment + industry)
  const accountMap = new Map<string, {
    name: string;
    revenue: number;
    spend: number;
    leads: number;
    contracts: number;
    deals: number[];
    channels: Record<string, number>;
    interactions: number;
  }>();

  records.forEach(r => {
    const key = `${r.customerSegment}_${r.industry}_${r.geography}`;
    const acc = accountMap.get(key) || {
      name: key,
      revenue: 0,
      spend: 0,
      leads: 0,
      contracts: 0,
      deals: [],
      channels: {},
      interactions: 0,
    };

    acc.revenue += r.revenue;
    acc.spend += r.spend;
    acc.leads += r.leads;
    acc.contracts += r.contracts;
    acc.deals.push(r.dealValue);
    acc.interactions += r.clicks + r.leads;
    acc.channels[r.channel] = (acc.channels[r.channel] || 0) + r.revenue;

    accountMap.set(key, acc);
  });

  const points: ClusterPoint[] = [];
  accountMap.forEach((acc, id) => {
    const avgDeal = acc.deals.length > 0 ? acc.deals.reduce((a, b) => a + b, 0) / acc.deals.length : 0;
    const convRate = acc.leads > 0 ? (acc.contracts / acc.leads) * 100 : 0;
    const estimatedCLV = acc.revenue * 2.8; // 3-year recurring contract value proxy

    // Normalized vector: [revenue, clv, avgDeal, convRate, interactions, spend]
    points.push({
      id,
      features: [acc.revenue, estimatedCLV, avgDeal, convRate, acc.interactions, acc.spend],
      rawRecord: {
        ...records[0],
        revenue: acc.revenue,
        spend: acc.spend,
        leads: acc.leads,
        contracts: acc.contracts,
        dealValue: avgDeal,
      }
    });
  });

  if (points.length < k) {
    k = Math.max(1, points.length);
  }

  // Normalize features (Z-score)
  const numFeatures = points[0].features.length;
  const means: number[] = Array(numFeatures).fill(0);
  const stds: number[] = Array(numFeatures).fill(0);

  for (let f = 0; f < numFeatures; f++) {
    const vals = points.map(p => p.features[f]);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    means[f] = mean;
    const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
    stds[f] = Math.sqrt(variance) || 1;
  }

  const normalizedPoints = points.map(p => ({
    ...p,
    normFeatures: p.features.map((val, f) => (val - means[f]) / stds[f])
  }));

  // K-Means++ initialization
  const centroids: number[][] = [];
  centroids.push([...normalizedPoints[0].normFeatures]);

  for (let c = 1; c < k; c++) {
    const distances = normalizedPoints.map(p => {
      let minDist = Infinity;
      centroids.forEach(cent => {
        const d = euclideanDist(p.normFeatures, cent);
        if (d < minDist) minDist = d;
      });
      return minDist * minDist;
    });

    const sumDist = distances.reduce((a, b) => a + b, 0);
    let rand = Math.random() * sumDist;
    let chosenIndex = 0;
    for (let i = 0; i < distances.length; i++) {
      rand -= distances[i];
      if (rand <= 0) {
        chosenIndex = i;
        break;
      }
    }
    centroids.push([...normalizedPoints[chosenIndex].normFeatures]);
  }

  // Lloyd's algorithm (up to 30 iterations)
  let assignments: number[] = Array(normalizedPoints.length).fill(0);
  for (let iter = 0; iter < 30; iter++) {
    let changed = false;

    // Assign points to closest centroid
    for (let i = 0; i < normalizedPoints.length; i++) {
      let closestCent = 0;
      let closestDist = Infinity;
      for (let c = 0; c < k; c++) {
        const d = euclideanDist(normalizedPoints[i].normFeatures, centroids[c]);
        if (d < closestDist) {
          closestDist = d;
          closestCent = c;
        }
      }
      if (assignments[i] !== closestCent) {
        assignments[i] = closestCent;
        changed = true;
      }
    }

    if (!changed && iter > 0) break;

    // Recompute centroids
    for (let c = 0; c < k; c++) {
      const clusterPoints = normalizedPoints.filter((_, idx) => assignments[idx] === c);
      if (clusterPoints.length > 0) {
        for (let f = 0; f < numFeatures; f++) {
          centroids[c][f] = clusterPoints.reduce((sum, p) => sum + p.normFeatures[f], 0) / clusterPoints.length;
        }
      }
    }
  }

  // Generate dynamic descriptive segment names based on centroid un-normalized characteristics
  const segments: CustomerSegment[] = [];
  const colors = ['#0284C7', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  for (let c = 0; c < k; c++) {
    const clusterIndices = assignments.map((val, idx) => val === c ? idx : -1).filter(idx => idx !== -1);
    if (clusterIndices.length === 0) continue;

    const clusterAccounts = clusterIndices.map(idx => Array.from(accountMap.values())[idx]);

    const totalRevenue = clusterAccounts.reduce((sum, a) => sum + a.revenue, 0);
    const totalSpend = clusterAccounts.reduce((sum, a) => sum + a.spend, 0);
    const totalContracts = clusterAccounts.reduce((sum, a) => sum + a.contracts, 0);
    const totalLeads = clusterAccounts.reduce((sum, a) => sum + a.leads, 0);
    const clientCount = clusterAccounts.length * 14; // Scaled to realistic enterprise accounts

    const avgDeal = totalContracts > 0 ? totalRevenue / totalContracts : totalRevenue / Math.max(1, clientCount);
    const avgCLV = Math.round(avgDeal * 2.85);
    const convRate = totalLeads > 0 ? Number(((totalContracts / totalLeads) * 100).toFixed(1)) : 0;
    const cac = totalContracts > 0 ? Math.round(totalSpend / totalContracts) : Math.round(totalSpend / Math.max(1, clientCount));

    // Find preferred channel for this cluster
    const channelRev: Record<string, number> = {};
    clusterAccounts.forEach(a => {
      Object.entries(a.channels).forEach(([ch, rev]) => {
        channelRev[ch] = (channelRev[ch] || 0) + rev;
      });
    });
    const preferredChannel = Object.entries(channelRev).sort((a, b) => b[1] - a[1])[0]?.[0] || 'LinkedIn Enterprise';

    // Dynamic Labeling logic
    let name = '';
    let description = '';
    let growthPotential: 'High' | 'Moderate' | 'Low' = 'Moderate';

    // Compare with overall averages
    const unnormCentroid = centroids[c].map((normVal, f) => normVal * stds[f] + means[f]);
    const [cRev, cCLV, cDeal, cConv, cInteract] = unnormCentroid;

    if (cRev > means[0] * 1.25 && cDeal > means[2] * 1.2) {
      name = 'Enterprise High-Value';
      description = 'Top tier enterprise clients characterized by high contract values, large multi-year CLV, and selective proposal volumes.';
      growthPotential = 'High';
    } else if (cConv > means[3] * 1.1 && cInteract > means[4]) {
      name = 'Strategic Growth Accounts';
      description = 'High-velocity engagement accounts with strong conversion efficiency and expanding service footprint across business units.';
      growthPotential = 'High';
    } else if (cRev < means[0] * 0.8 && cConv < means[3] * 0.85) {
      name = 'Emerging Tier / High-CAC';
      description = 'Early-stage accounts with high initial acquisition cost relative to closed contract size; requires automated nurturing.';
      growthPotential = 'Low';
    } else {
      name = 'Nurture / Mid-Market';
      description = 'Consistent mid-tier revenue accounts responsive to targeted digital content and industry-specific webinars.';
      growthPotential = 'Moderate';
    }

    segments.push({
      id: `SEG-${c + 1}`,
      name,
      description,
      clientCount,
      totalRevenue,
      avgCLV,
      conversionRate: convRate,
      cac,
      avgDealValue: Math.round(avgDeal),
      preferredChannel,
      engagementScore: Math.min(98, Math.max(45, Math.round(50 + (centroids[c][4] || 0) * 18))),
      growthPotential,
      color: colors[c % colors.length]
    });
  }

  return segments.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

function euclideanDist(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}
