export interface CampaignRecord {
  id: string;
  campaignName: string;
  channel: string;
  date: string;
  month: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  mqls: number;
  sqls: number;
  opportunities: number;
  proposals: number;
  contracts: number;
  revenue: number;
  customerSegment: string;
  industry: string;
  geography: string;
  serviceCategory: string;
  campaignType: string;
  campaignObjective: string;
  dealValue: number;
  salesCycleDays: number;
}

export interface AggregatedChannel {
  channel: string;
  spend: number;
  revenue: number;
  roi: number;
  leads: number;
  mqls: number;
  sqls: number;
  opportunities: number;
  contracts: number;
  conversionRate: number; // contracts / leads %
  leadQuality: number; // sqls / leads %
  cac: number; // spend / contracts
  avgDealValue: number;
  campaignCount: number;
}

export interface FunnelStageData {
  stage: string;
  label: string;
  count: number;
  conversionFromPrev: number; // %
  dropOffRate: number; // %
  avgDaysInStage: number;
  bottleneckScore: number; // 0-100
  isBottleneck: boolean;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  clientCount: number;
  totalRevenue: number;
  avgCLV: number;
  conversionRate: number;
  cac: number;
  avgDealValue: number;
  preferredChannel: string;
  engagementScore: number;
  growthPotential: 'High' | 'Moderate' | 'Low';
  color: string;
}

export interface CESWeights {
  roi: number;             // default 0.25
  conversionRate: number;  // default 0.20
  revenueShare: number;    // default 0.25
  leadQuality: number;     // default 0.20
  cacEfficiency: number;   // default 0.10
}

export interface CampaignCES {
  campaignId: string;
  campaignName: string;
  channel: string;
  score: number; // 0 - 100
  roiScore: number;
  conversionScore: number;
  revenueScore: number;
  leadQualityScore: number;
  cacScore: number;
  tier: 'Top Tier' | 'High Performer' | 'Moderate' | 'Underperforming';
}

export interface ChannelMarginalCurve {
  channel: string;
  currentSpend: number;
  currentRevenue: number;
  currentROI: number;
  marginalROI: number; // dR/ds at current spend
  saturationPoint: number; // spend at which marginal ROI falls below 1.0x
  saturationRatio: number; // currentSpend / saturationPoint (0 to 1+)
  rMax: number;
  halfSaturationK: number;
  gamma: number;
  hasSufficientData: boolean;
}

export interface UnderInvestmentScore {
  channel: string;
  score: number; // 0 - 100
  status: 'Expansion Opportunity' | 'Monitor' | 'Review' | 'Reduce/Test';
  marginalROI: number;
  historicalROI: number;
  leadQuality: number;
  conversionRate: number;
  saturationRatio: number;
  rationale: string;
}

export type OptimizationObjective = 
  | 'MAX_REVENUE'
  | 'MAX_ROI'
  | 'MAX_CONVERSIONS'
  | 'MIN_CAC'
  | 'BALANCED';

export interface StrategicConstraint {
  campaignOrChannel: string;
  minSpend: number;
  reason: string;
  locked: boolean;
}

export interface OptimizationConstraints {
  totalBudget: number;
  objective: OptimizationObjective;
  channelMinSpend: Record<string, number>;
  channelMaxSpend: Record<string, number>;
  strategicLocks: StrategicConstraint[];
}

export interface ChannelAllocationPlan {
  channel: string;
  currentSpend: number;
  recommendedSpend: number;
  spendChange: number;
  spendChangePct: number;
  expectedRevenue: number;
  expectedConversions: number;
  expectedROI: number;
  expectedCAC: number;
  marginalROIAtPlan: number;
  saturationStatus: 'Healthy' | 'Near Saturation' | 'Over Saturated';
}

export interface OptimizationResult {
  totalBudget: number;
  currentRevenue: number;
  recommendedRevenue: number;
  revenueLift: number;
  revenueLiftPct: number;
  currentROI: number;
  recommendedROI: number;
  currentConversions: number;
  recommendedConversions: number;
  conversionsLift: number;
  currentCAC: number;
  recommendedCAC: number;
  channels: ChannelAllocationPlan[];
  convergenceStatus: 'Optimal' | 'Feasible' | 'Constrained';
  disclaimer: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  action: string;
  channel?: string;
  why: string;
  evidence: string[];
  expectedImpact: {
    revenueDelta: number;
    roiDelta: number;
    conversionDelta: number;
  };
  confidence: 'High' | 'Medium' | 'Low';
  confidenceReason: string;
  risk: 'Low' | 'Medium' | 'High';
  riskReason: string;
  importantLimitation: string;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number; // 0 to 1
  description: string;
  direction: 'Positive' | 'Negative' | 'Non-linear';
}

export interface OverviewKPIs {
  totalSpend: number;
  prevSpend: number;
  totalRevenue: number;
  prevRevenue: number;
  roi: number;
  prevRoi: number;
  conversionRate: number;
  prevConversionRate: number;
  cac: number;
  prevCac: number;
  qualifiedLeads: number;
  prevQualifiedLeads: number;
  predictedRevenue: number;
  predictedRevenueConfidence: string;
}

export interface UploadColumnMapping {
  campaignName: string;
  channel: string;
  date: string;
  spend: string;
  revenue: string;
  impressions?: string;
  clicks?: string;
  leads?: string;
  mqls?: string;
  sqls?: string;
  opportunities?: string;
  conversions?: string;
  customerSegment?: string;
  industry?: string;
  geography?: string;
  dealValue?: string;
}
