import { FeatureImportanceItem } from './types';

export function getModelFeatureImportance(): FeatureImportanceItem[] {
  return [
    {
      feature: 'Historical Conversion Rate',
      importance: 0.28,
      description: 'The historical probability of turning acquired leads into closed contracts has the highest predictive power for campaign revenue.',
      direction: 'Positive'
    },
    {
      feature: 'Lead Quality (SQL/Lead Ratio)',
      importance: 0.24,
      description: 'Proportion of leads that pass Sales Qualification; high SQL ratios strongly correlate with rapid deal closure.',
      direction: 'Positive'
    },
    {
      feature: 'Campaign Spend (Diminishing Return Scale)',
      importance: 0.19,
      description: 'Budget scale determines reach and impression volume, exhibiting non-linear saturation characteristics at higher levels.',
      direction: 'Non-linear'
    },
    {
      feature: 'Average Deal Value',
      importance: 0.14,
      description: 'Contract size variation across enterprise vs mid-market tiers dictates gross revenue yield per conversion.',
      direction: 'Positive'
    },
    {
      feature: 'Customer Segment Tier',
      importance: 0.09,
      description: 'Enterprise High-Value accounts exhibit longer sales cycles but 3x higher contract value compared to emerging tiers.',
      direction: 'Positive'
    },
    {
      feature: 'Channel Efficiency Index',
      importance: 0.06,
      description: 'Channel-specific baseline CTR and commercial intent characteristics.',
      direction: 'Positive'
    }
  ];
}
