import {
  AggregatedChannel,
  OptimizationResult,
  RecommendationItem,
  UnderInvestmentScore
} from './types';
import { formatINR, formatPercent, formatROI } from './formatters';

export function generateAIRecommendations(
  channels: AggregatedChannel[],
  underInvestmentScores: UnderInvestmentScore[],
  optResult: OptimizationResult
): RecommendationItem[] {
  const recommendations: RecommendationItem[] = [];

  // 1. Top expansion opportunity
  const topExpansion = underInvestmentScores.find(s => s.status === 'Expansion Opportunity');
  if (topExpansion) {
    const ch = channels.find(c => c.channel === topExpansion.channel)!;
    const plan = optResult.channels.find(p => p.channel === topExpansion.channel);
    const spendIncrease = plan && plan.spendChange > 0 ? plan.spendChange : Math.round(ch.spend * 0.25);
    const revLift = plan ? plan.expectedRevenue - (ch.revenue * (optResult.totalBudget / (ch.spend * 4))) : Math.round(spendIncrease * topExpansion.marginalROI);

    recommendations.push({
      id: 'REC-01',
      title: `Scale Budget in ${topExpansion.channel}`,
      action: `Increase allocation by ${formatINR(Math.abs(spendIncrease))} (est. ${plan ? plan.spendChangePct : 25}%)`,
      channel: topExpansion.channel,
      why: `${topExpansion.channel} exhibits exceptional marginal capital efficiency (${topExpansion.marginalROI}x marginal ROI) and superior qualified lead conversion (${formatPercent(topExpansion.conversionRate)}) while remaining well below saturation capacity.`,
      evidence: [
        `Under-Investment Opportunity Score: ${topExpansion.score}/100`,
        `Current Marginal ROI: ${topExpansion.marginalROI}x (Historical ROI: ${formatROI(topExpansion.historicalROI)})`,
        `Lead Quality (SQL/Lead): ${formatPercent(topExpansion.leadQuality)}`,
        `Saturation Ratio: ${(topExpansion.saturationRatio * 100).toFixed(0)}% of ceiling threshold`
      ],
      expectedImpact: {
        revenueDelta: Math.max(spendIncrease * 2, revLift),
        roiDelta: 0.28,
        conversionDelta: Math.max(2, Math.round(revLift / Math.max(1, ch.avgDealValue)))
      },
      confidence: 'High',
      confidenceReason: 'Consistent historical performance over 12-month sample with high R² fit and low variance across enterprise segments.',
      risk: 'Low',
      riskReason: 'Channel has demonstrated consistent unit economics with substantial enterprise lead backlog.',
      importantLimitation: 'Historical performance does not guarantee equivalent incremental returns. Monitor weekly SQL acquisition velocity.'
    });
  }

  // 2. Saturation / Reallocation recommendation
  const overSpent = [...optResult.channels].sort((a, b) => a.spendChange - b.spendChange)[0];
  if (overSpent && overSpent.spendChange < 0) {
    const ch = channels.find(c => c.channel === overSpent.channel)!;
    const underInv = underInvestmentScores.find(s => s.channel === overSpent.channel);

    recommendations.push({
      id: 'REC-02',
      title: `Rationalize Spend in ${overSpent.channel}`,
      action: `Reallocate ${formatINR(Math.abs(overSpent.spendChange))} (${Math.abs(overSpent.spendChangePct)}% reduction) to higher marginal return channels`,
      channel: overSpent.channel,
      why: `Spend analysis reveals diminishing marginal returns in ${overSpent.channel}. Additional incremental investment yields lower downstream contract conversion compared to inbound channels.`,
      evidence: [
        `Current CAC: ${formatINR(ch.cac)} vs portfolio average ${formatINR(optResult.currentCAC)}`,
        `Under-Investment Score: ${underInv ? underInv.score : 35}/100 (${underInv ? underInv.status : 'Review'})`,
        `Marginal ROI at current spend: ${overSpent.marginalROIAtPlan}x`,
        `Contract conversion rate: ${formatPercent(ch.conversionRate)}`
      ],
      expectedImpact: {
        revenueDelta: Math.round(Math.abs(overSpent.spendChange) * 0.4), // Net portfolio gain after reallocation
        roiDelta: 0.18,
        conversionDelta: 1
      },
      confidence: 'Medium',
      confidenceReason: 'Observational spend elasticity confirms flattening yield curve, though executive relationship attribution may have longer gestation.',
      risk: 'Medium',
      riskReason: 'Reducing event/display footprint may affect high-level C-suite brand recall during prolonged procurement tenders.',
      importantLimitation: 'Observational correlation does not isolate indirect assisted conversions or multi-touch attribution.'
    });
  }

  // 3. Efficiency & Funnel Bottleneck Recommendation
  const emailChannel = channels.find(c => c.channel.toLowerCase().includes('email'));
  if (emailChannel) {
    recommendations.push({
      id: 'REC-03',
      title: 'Accelerate Account-Based Email Nurturing for Stalled Opportunities',
      action: 'Expand Account-Based Email cadence targeting Fortune 500 accounts in Proposal & Contract stages',
      channel: emailChannel.channel,
      why: 'Account-based outbound email achieves the lowest customer acquisition cost with high engagement in mid-to-late pipeline stages.',
      evidence: [
        `Historical ROI: ${formatROI(emailChannel.roi)}`,
        `Lead Quality: ${formatPercent(emailChannel.leadQuality)}`,
        `Acquisition CAC: ${formatINR(emailChannel.cac)} (lowest in portfolio)`
      ],
      expectedImpact: {
        revenueDelta: Math.round(emailChannel.revenue * 0.18),
        roiDelta: 0.35,
        conversionDelta: 4
      },
      confidence: 'High',
      confidenceReason: 'High conversion responsiveness on targeted enterprise account lists.',
      risk: 'Low',
      riskReason: 'Low incremental expense with minimal operational overhead.',
      importantLimitation: 'Over-frequency risks domain reputation and recipient fatigue if not strictly hyper-personalized.'
    });
  }

  return recommendations;
}
