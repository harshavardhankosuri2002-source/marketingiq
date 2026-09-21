import { CampaignRecord } from './types';

// Seeded pseudorandom generator for deterministic, internally consistent generation
class PseudoRandom {
  private seed: number;
  constructor(seed: number = 42) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  intRange(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

export function generateTCSDemoData(rowCount: number = 2400): CampaignRecord[] {
  const rng = new PseudoRandom(1337);

  const channels = [
    { name: 'LinkedIn Enterprise', baseCTR: 0.026, clickToLead: 0.09, leadToMql: 0.65, mqlToSql: 0.52, sqlToOpp: 0.65, oppToProp: 0.75, propToContract: 0.38, avgDeal: 4800000, spendRange: [18000, 65000] },
    { name: 'Google Search', baseCTR: 0.038, clickToLead: 0.075, leadToMql: 0.58, mqlToSql: 0.44, sqlToOpp: 0.58, oppToProp: 0.68, propToContract: 0.32, avgDeal: 3200000, spendRange: [22000, 75000] },
    { name: 'Executive Events & Roundtables', baseCTR: 0.015, clickToLead: 0.12, leadToMql: 0.70, mqlToSql: 0.35, sqlToOpp: 0.45, oppToProp: 0.58, propToContract: 0.28, avgDeal: 7500000, spendRange: [45000, 140000] },
    { name: 'Account-Based Email', baseCTR: 0.042, clickToLead: 0.085, leadToMql: 0.68, mqlToSql: 0.55, sqlToOpp: 0.68, oppToProp: 0.78, propToContract: 0.42, avgDeal: 4200000, spendRange: [8000, 28000] },
    { name: 'Tech Analyst Webinars', baseCTR: 0.022, clickToLead: 0.065, leadToMql: 0.52, mqlToSql: 0.40, sqlToOpp: 0.52, oppToProp: 0.62, propToContract: 0.30, avgDeal: 2900000, spendRange: [12000, 42000] },
    { name: 'Industry Display & Media', baseCTR: 0.009, clickToLead: 0.035, leadToMql: 0.42, mqlToSql: 0.28, sqlToOpp: 0.40, oppToProp: 0.50, propToContract: 0.22, avgDeal: 2400000, spendRange: [15000, 50000] },
  ];

  const serviceCategories = [
    'Cloud & Infrastructure Transformation',
    'Cognitive AI & Enterprise Automation',
    'Cyber Defense & Risk Governance',
    'BFSI Core Modernization',
    'Healthcare & Life Sciences Digital Labs',
    'Retail Omnichannel & Supply Chain',
  ];

  const geographies = ['North America', 'Europe & UK', 'APAC & Australia', 'India & Middle East', 'Nordics & Benelux'];
  const industries = ['Banking & Capital Markets', 'Healthcare & Life Sciences', 'Manufacturing & Auto', 'Retail & CPG', 'Telecom & Media', 'Energy & Utilities'];
  const segments = ['Enterprise High-Value', 'Strategic Growth Accounts', 'Nurture / Mid-Market', 'Emerging Tier / High-CAC'];
  const objectives = ['Pipeline Generation', 'Strategic Account Penetration', 'Executive Engagement', 'Brand Authority & MQLs'];

  const campaignPrefixes = [
    'Q1 Cloud Scale', 'GenAI Catalyst', 'CyberShield 360', 'BFSI Resiliency',
    'NextGen CX', 'Global Horizon', 'SAP S/4 Hana Accelerated', 'Zero Trust Enterprise',
    'Cognitive Ops 2.0', 'Life Sciences DataHub', 'OmniCommerce Edge', 'Sustainable Tech Suite'
  ];

  const months = [
    '2025-10', '2025-11', '2025-12',
    '2026-01', '2026-02', '2026-03',
    '2026-04', '2026-05', '2026-06',
    '2026-07', '2026-08', '2026-09'
  ];

  const records: CampaignRecord[] = [];

  for (let i = 0; i < rowCount; i++) {
    const ch = rng.choice(channels);
    const service = rng.choice(serviceCategories);
    const geo = rng.choice(geographies);
    const ind = rng.choice(industries);
    const seg = rng.choice(segments);
    const month = rng.choice(months);
    const obj = rng.choice(objectives);
    const prefix = rng.choice(campaignPrefixes);

    // Spend in INR
    const spend = Math.round(rng.range(ch.spendRange[0], ch.spendRange[1]));
    
    // Funnel calculations with realistic variance
    // Impressions: dependent on channel cost per mille (CPM)
    const cpm = ch.name === 'Industry Display & Media' ? rng.range(120, 240) : ch.name === 'Executive Events & Roundtables' ? rng.range(800, 1600) : rng.range(300, 700);
    const impressions = Math.max(100, Math.round((spend / cpm) * 1000 * rng.range(0.85, 1.15)));
    
    const ctr = ch.baseCTR * rng.range(0.8, 1.25);
    const clicks = Math.max(5, Math.round(impressions * ctr));

    const clickToLead = ch.clickToLead * rng.range(0.75, 1.25);
    const leads = Math.max(1, Math.round(clicks * clickToLead));

    const leadToMql = ch.leadToMql * rng.range(0.8, 1.2);
    const mqls = Math.max(0, Math.min(leads, Math.round(leads * leadToMql)));

    const mqlToSql = ch.mqlToSql * rng.range(0.8, 1.2);
    const sqls = Math.max(0, Math.min(mqls, Math.round(mqls * mqlToSql)));

    const sqlToOpp = ch.sqlToOpp * rng.range(0.8, 1.15);
    const opportunities = Math.max(0, Math.min(sqls, Math.round(sqls * sqlToOpp)));

    const oppToProp = ch.oppToProp * rng.range(0.8, 1.15);
    const proposals = Math.max(0, Math.min(opportunities, Math.round(opportunities * oppToProp)));

    // Contracts (Won Deals)
    const propToContract = ch.propToContract * rng.range(0.7, 1.3);
    const contracts = Math.max(0, Math.min(proposals, Math.round(proposals * propToContract)));

    // Deal value with segment multiplier
    let segMultiplier = 1.0;
    if (seg === 'Enterprise High-Value') segMultiplier = rng.range(1.6, 2.8);
    else if (seg === 'Strategic Growth Accounts') segMultiplier = rng.range(1.1, 1.5);
    else if (seg === 'Nurture / Mid-Market') segMultiplier = rng.range(0.65, 0.95);
    else segMultiplier = rng.range(0.35, 0.6);

    const dealValue = Math.round(ch.avgDeal * segMultiplier * rng.range(0.85, 1.2));
    const revenue = contracts > 0 ? Math.round(contracts * dealValue) : 0;

    const dayOfMonth = rng.intRange(1, 28).toString().padStart(2, '0');
    const date = `${month}-${dayOfMonth}`;
    const salesCycleDays = Math.round(rng.range(50, 160) * (seg === 'Enterprise High-Value' ? 1.3 : 0.9));

    records.push({
      id: `TCS-CMP-${(i + 1).toString().padStart(5, '0')}`,
      campaignName: `${prefix} - ${service.split(' ')[0]}`,
      channel: ch.name,
      date,
      month,
      spend,
      impressions,
      clicks,
      leads,
      mqls,
      sqls,
      opportunities,
      proposals,
      contracts,
      revenue,
      customerSegment: seg,
      industry: ind,
      geography: geo,
      serviceCategory: service,
      campaignType: ch.name.includes('Event') ? 'Experiential' : ch.name.includes('Email') ? 'Outbound ABM' : 'Digital Inbound',
      campaignObjective: obj,
      dealValue,
      salesCycleDays,
    });
  }

  return records;
}
