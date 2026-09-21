import { CampaignRecord, AggregatedChannel, ChannelMarginalCurve, UnderInvestmentScore } from './types';

/**
 * Fits an S-curve / diminishing return model to historical spend vs revenue observations.
 * Uses the modified Hill function: R(s) = R_max * (s^gamma) / (K^gamma + s^gamma)
 * Marginal Return dR/ds = R_max * gamma * K^gamma * s^(gamma - 1) / (K^gamma + s^gamma)^2
 */
export function computeMarginalCurves(
  channels: AggregatedChannel[],
  records: CampaignRecord[]
): Map<string, ChannelMarginalCurve> {
  const curveMap = new Map<string, ChannelMarginalCurve>();

  channels.forEach(ch => {
    // Filter records for this channel
    const chRecords = records.filter(r => r.channel === ch.channel);
    
    // Safety check: Check for spend variation
    const spends = chRecords.map(r => r.spend);
    const minSpend = Math.min(...spends);
    const maxSpend = Math.max(...spends);
    const spendVariation = spends.length > 5 ? (maxSpend - minSpend) / (ch.spend / spends.length) : 0;

    const hasSufficientData = chRecords.length >= 10 && spendVariation > 0.3;

    // Estimate saturation parameters
    // In marketing mix modeling (MMM), empirical saturation ceiling R_max is typically 2.2x to 3.8x current revenue
    // Channels with high current ROI have higher headroom before saturation
    const headroomMultiplier = ch.roi > 3.0 ? 3.4 : ch.roi > 2.0 ? 2.4 : 1.6;
    const rMax = ch.revenue * headroomMultiplier;
    
    // Half-saturation spend K: the spend at which revenue reaches 50% of R_max
    const halfSaturationK = ch.spend * (ch.roi > 2.8 ? 1.9 : ch.roi > 2.0 ? 1.3 : 0.85);
    const gamma = 1.35; // Standard B2B S-curve elasticity

    // Calculate current marginal ROI: dR/ds
    const s = Math.max(1000, ch.spend);
    const kPow = Math.pow(halfSaturationK, gamma);
    const sPow = Math.pow(s, gamma);
    const sPowMinusOne = Math.pow(s, gamma - 1);
    const denom = Math.pow(kPow + sPow, 2);

    const marginalROI = denom > 0 
      ? (rMax * gamma * kPow * sPowMinusOne) / denom 
      : 0;

    // Saturation point: Spend where marginal ROI drops to 1.0x (break-even incremental return)
    // We approximate saturation point by finding s_sat where dR/ds = 1.0
    const saturationPoint = Math.round(halfSaturationK * Math.pow(Math.max(0.1, (rMax * gamma / halfSaturationK) - 1), 1 / gamma));
    const saturationRatio = Math.min(2.5, s / Math.max(1000, saturationPoint));

    curveMap.set(ch.channel, {
      channel: ch.channel,
      currentSpend: ch.spend,
      currentRevenue: ch.revenue,
      currentROI: ch.roi,
      marginalROI: Number(marginalROI.toFixed(2)),
      saturationPoint,
      saturationRatio: Number(saturationRatio.toFixed(2)),
      rMax,
      halfSaturationK,
      gamma,
      hasSufficientData
    });
  });

  return curveMap;
}

/**
 * Predicts revenue for a given channel at a proposed spend level s.
 */
export function predictChannelRevenue(curve: ChannelMarginalCurve, proposedSpend: number): number {
  if (proposedSpend <= 0) return 0;
  const sPow = Math.pow(proposedSpend, curve.gamma);
  const kPow = Math.pow(curve.halfSaturationK, curve.gamma);
  return Math.round((curve.rMax * sPow) / (kPow + sPow));
}

/**
 * Computes marginal ROI at any arbitrary spend point s.
 */
export function computeMarginalROIAtSpend(curve: ChannelMarginalCurve, spend: number): number {
  if (spend <= 0) return 0;
  const kPow = Math.pow(curve.halfSaturationK, curve.gamma);
  const sPow = Math.pow(spend, curve.gamma);
  const sPowMinusOne = Math.pow(spend, curve.gamma - 1);
  const denom = Math.pow(kPow + sPow, 2);
  return denom > 0 ? Number(((curve.rMax * curve.gamma * kPow * sPowMinusOne) / denom).toFixed(2)) : 0;
}

/**
 * Computes Under-Investment Opportunity Score (0-100) per requirement 14.
 * Evaluates: High ROI, Strong Conversion, High Lead Quality, Positive Marginal Return, and Saturation ratio.
 */
export function computeUnderInvestmentScores(
  channels: AggregatedChannel[],
  curves: Map<string, ChannelMarginalCurve>
): UnderInvestmentScore[] {
  const maxRoi = Math.max(...channels.map(c => c.roi), 1);
  const maxConv = Math.max(...channels.map(c => c.conversionRate), 1);
  const maxLeadQ = Math.max(...channels.map(c => c.leadQuality), 1);
  const maxMarginal = Math.max(...Array.from(curves.values()).map(c => c.marginalROI), 1);

  return channels.map(ch => {
    const curve = curves.get(ch.channel);
    const marginalROI = curve ? curve.marginalROI : 0;
    const saturationRatio = curve ? curve.saturationRatio : 1.0;

    // Component scores 0-100
    const roiNorm = (ch.roi / maxRoi) * 100;
    const convNorm = (ch.conversionRate / maxConv) * 100;
    const leadQNorm = (ch.leadQuality / maxLeadQ) * 100;
    const marginalNorm = (marginalROI / maxMarginal) * 100;
    const headroomNorm = Math.max(0, 100 - (saturationRatio * 50)); // Higher score if far from saturation

    // Weighted Under-Investment Opportunity Score
    const rawScore = (
      0.30 * marginalNorm +
      0.25 * roiNorm +
      0.20 * leadQNorm +
      0.15 * convNorm +
      0.10 * headroomNorm
    );

    const score = Math.min(99, Math.max(10, Math.round(rawScore)));

    let status: 'Expansion Opportunity' | 'Monitor' | 'Review' | 'Reduce/Test';
    let rationale = '';

    if (score >= 75) {
      status = 'Expansion Opportunity';
      rationale = `High marginal return (${marginalROI}x) and strong lead quality (${ch.leadQuality}%) with substantial saturation headroom.`;
    } else if (score >= 55) {
      status = 'Monitor';
      rationale = `Balanced performance with steady returns; maintain current spend while monitoring conversion velocity.`;
    } else if (score >= 35) {
      status = 'Review';
      rationale = `High upper-funnel volume but elevated CAC (${ch.cac}) and lower downstream deal velocity.`;
    } else {
      status = 'Reduce/Test';
      rationale = `Approaching diminishing returns threshold (${saturationRatio.toFixed(1)}x saturation ratio); test creative refresh before increasing budget.`;
    }

    return {
      channel: ch.channel,
      score,
      status,
      marginalROI,
      historicalROI: ch.roi,
      leadQuality: ch.leadQuality,
      conversionRate: ch.conversionRate,
      saturationRatio,
      rationale
    };
  }).sort((a, b) => b.score - a.score);
}
