import { CampaignRecord, CESWeights, CampaignCES } from './types';

export const DEFAULT_CES_WEIGHTS: CESWeights = {
  roi: 0.25,
  conversionRate: 0.20,
  revenueShare: 0.25,
  leadQuality: 0.20,
  cacEfficiency: 0.10,
};

export function computeCampaignCES(
  records: CampaignRecord[],
  weights: CESWeights = DEFAULT_CES_WEIGHTS
): CampaignCES[] {
  if (records.length === 0) return [];

  // Group by campaign
  const campaignMap = new Map<string, {
    name: string;
    channel: string;
    spend: number;
    revenue: number;
    leads: number;
    sqls: number;
    contracts: number;
  }>();

  records.forEach(r => {
    const key = r.campaignName;
    const existing = campaignMap.get(key) || {
      name: r.campaignName,
      channel: r.channel,
      spend: 0,
      revenue: 0,
      leads: 0,
      sqls: 0,
      contracts: 0,
    };
    existing.spend += r.spend;
    existing.revenue += r.revenue;
    existing.leads += r.leads;
    existing.sqls += r.sqls;
    existing.contracts += r.contracts;
    campaignMap.set(key, existing);
  });

  const campaigns = Array.from(campaignMap.values());

  // Compute raw metrics
  const totalRevenueAll = campaigns.reduce((sum, c) => sum + c.revenue, 0) || 1;
  const rawData = campaigns.map(c => {
    const roi = c.spend > 0 ? c.revenue / c.spend : 0;
    const convRate = c.leads > 0 ? (c.contracts / c.leads) * 100 : 0;
    const revShare = (c.revenue / totalRevenueAll) * 100;
    const leadQuality = c.leads > 0 ? (c.sqls / c.leads) * 100 : 0;
    const cac = c.contracts > 0 ? c.spend / c.contracts : c.spend;
    return { ...c, roi, convRate, revShare, leadQuality, cac };
  });

  // Find min and max for normalization
  const maxRoi = Math.max(...rawData.map(d => d.roi), 1);
  const minRoi = Math.min(...rawData.map(d => d.roi), 0);

  const maxConv = Math.max(...rawData.map(d => d.convRate), 1);
  const minConv = Math.min(...rawData.map(d => d.convRate), 0);

  const maxRevShare = Math.max(...rawData.map(d => d.revShare), 1);
  const minRevShare = Math.min(...rawData.map(d => d.revShare), 0);

  const maxLeadQ = Math.max(...rawData.map(d => d.leadQuality), 1);
  const minLeadQ = Math.min(...rawData.map(d => d.leadQuality), 0);

  const maxCac = Math.max(...rawData.map(d => d.cac), 1);
  const minCac = Math.min(...rawData.map(d => d.cac), 1);

  // Normalize and apply configurable weights
  // Normalize CAC inversed: lower CAC = higher efficiency
  const results: CampaignCES[] = rawData.map(c => {
    const roiScore = maxRoi > minRoi ? ((c.roi - minRoi) / (maxRoi - minRoi)) * 100 : 50;
    const conversionScore = maxConv > minConv ? ((c.convRate - minConv) / (maxConv - minConv)) * 100 : 50;
    const revenueScore = maxRevShare > minRevShare ? ((c.revShare - minRevShare) / (maxRevShare - minRevShare)) * 100 : 50;
    const leadQualityScore = maxLeadQ > minLeadQ ? ((c.leadQuality - minLeadQ) / (maxLeadQ - minLeadQ)) * 100 : 50;
    const cacScore = maxCac > minCac ? ((maxCac - c.cac) / (maxCac - minCac)) * 100 : 50;

    const totalWeight = weights.roi + weights.conversionRate + weights.revenueShare + weights.leadQuality + weights.cacEfficiency;
    const wRoi = weights.roi / totalWeight;
    const wConv = weights.conversionRate / totalWeight;
    const wRev = weights.revenueShare / totalWeight;
    const wLeadQ = weights.leadQuality / totalWeight;
    const wCac = weights.cacEfficiency / totalWeight;

    const finalScore = Math.round(
      wRoi * roiScore +
      wConv * conversionScore +
      wRev * revenueScore +
      wLeadQ * leadQualityScore +
      wCac * cacScore
    );

    let tier: 'Top Tier' | 'High Performer' | 'Moderate' | 'Underperforming';
    if (finalScore >= 80) tier = 'Top Tier';
    else if (finalScore >= 65) tier = 'High Performer';
    else if (finalScore >= 45) tier = 'Moderate';
    else tier = 'Underperforming';

    return {
      campaignId: c.name,
      campaignName: c.name,
      channel: c.channel,
      score: finalScore,
      roiScore: Math.round(roiScore),
      conversionScore: Math.round(conversionScore),
      revenueScore: Math.round(revenueScore),
      leadQualityScore: Math.round(leadQualityScore),
      cacScore: Math.round(cacScore),
      tier
    };
  });

  return results.sort((a, b) => b.score - a.score);
}
