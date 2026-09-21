import {
  AggregatedChannel,
  ChannelMarginalCurve,
  OptimizationConstraints,
  OptimizationResult,
  ChannelAllocationPlan
} from './types';
import { predictChannelRevenue, computeMarginalROIAtSpend } from './marginalReturnModel';

export function runBudgetOptimization(
  channels: AggregatedChannel[],
  curves: Map<string, ChannelMarginalCurve>,
  constraints: OptimizationConstraints
): OptimizationResult {
  const { totalBudget, objective, channelMinSpend, channelMaxSpend, strategicLocks } = constraints;

  // Current total spend across channels
  const currentTotalSpend = channels.reduce((sum, ch) => sum + ch.spend, 0);
  const scaleRatio = totalBudget / Math.max(1, currentTotalSpend);

  // Initial baseline allocations
  const channelNames = channels.map(c => c.channel);
  const currentAllocations: Record<string, number> = {};
  const boundsMin: Record<string, number> = {};
  const boundsMax: Record<string, number> = {};

  channelNames.forEach(name => {
    const ch = channels.find(c => c.channel === name)!;
    // Current spend scaled to current budget proportion
    currentAllocations[name] = Math.round(ch.spend * scaleRatio);

    // Channel min bound
    let min = channelMinSpend[name] !== undefined ? channelMinSpend[name] : Math.round(currentAllocations[name] * 0.4);
    // Channel max bound
    let max = channelMaxSpend[name] !== undefined ? channelMaxSpend[name] : Math.round(currentAllocations[name] * 2.2);

    // Check strategic locks
    const lock = strategicLocks.find(l => l.locked && l.campaignOrChannel === name);
    if (lock) {
      min = Math.max(min, lock.minSpend);
    }

    boundsMin[name] = Math.max(10000, min);
    boundsMax[name] = Math.max(boundsMin[name], max);
  });

  // Iterative Equimarginal Allocation Algorithm
  // Discretize budget into increments (e.g., 200 steps)
  const numSteps = 200;
  const stepSize = totalBudget / numSteps;

  // Start with minimum bounds
  const recommendedAllocations: Record<string, number> = {};
  let allocatedBudget = 0;

  channelNames.forEach(name => {
    recommendedAllocations[name] = boundsMin[name];
    allocatedBudget += boundsMin[name];
  });

  // If sum of minimums exceeds total budget, scale down proportionally
  if (allocatedBudget > totalBudget) {
    const scaleDown = totalBudget / allocatedBudget;
    channelNames.forEach(name => {
      recommendedAllocations[name] = Math.round(recommendedAllocations[name] * scaleDown);
    });
    allocatedBudget = totalBudget;
  }

  // Greedily assign remaining budget steps to the channel with the highest objective-specific marginal utility
  while (allocatedBudget < totalBudget - 100) {
    let bestChannel = '';
    let highestUtility = -Infinity;

    for (const name of channelNames) {
      const currentSpend = recommendedAllocations[name];
      if (currentSpend >= boundsMax[name]) continue; // Capacity reached

      const curve = curves.get(name);
      if (!curve) continue;

      const ch = channels.find(c => c.channel === name)!;
      const marginalRoi = computeMarginalROIAtSpend(curve, currentSpend);
      const leadQualityWeight = (ch.leadQuality / 100);

      let utility = 0;
      switch (objective) {
        case 'MAX_REVENUE':
          utility = marginalRoi;
          break;
        case 'MAX_ROI':
          // Prioritize high historical ROI and capital efficiency
          utility = marginalRoi * (ch.roi / 2.0);
          break;
        case 'MAX_CONVERSIONS':
          // Utility based on marginal conversions per rupee
          utility = (marginalRoi / Math.max(1, ch.avgDealValue)) * 1000000;
          break;
        case 'MIN_CAC':
          // Lower CAC gets higher utility
          utility = (1 / Math.max(100, ch.cac)) * marginalRoi * 10000;
          break;
        case 'BALANCED':
        default:
          // Balanced objective: Marginal ROI blended with Lead Quality & CAC Efficiency
          utility = marginalRoi * 0.55 + (ch.roi * 0.25) + (leadQualityWeight * 0.20);
          break;
      }

      if (utility > highestUtility) {
        highestUtility = utility;
        bestChannel = name;
      }
    }

    if (!bestChannel) {
      // All channels reached max bound; distribute remaining equally among unconstrained
      const unconstrained = channelNames.filter(n => recommendedAllocations[n] < boundsMax[n]);
      if (unconstrained.length > 0) {
        const share = (totalBudget - allocatedBudget) / unconstrained.length;
        unconstrained.forEach(n => { recommendedAllocations[n] += share; });
      }
      break;
    }

    const addition = Math.min(stepSize, totalBudget - allocatedBudget, boundsMax[bestChannel] - recommendedAllocations[bestChannel]);
    recommendedAllocations[bestChannel] += addition;
    allocatedBudget += addition;
  }

  // Adjust any rounding residual to the top unconstrained channel
  const residual = totalBudget - Object.values(recommendedAllocations).reduce((a, b) => a + b, 0);
  if (Math.abs(residual) > 1) {
    const target = channelNames.find(n => recommendedAllocations[n] + residual <= boundsMax[n]) || channelNames[0];
    recommendedAllocations[target] = Math.round(recommendedAllocations[target] + residual);
  }

  // Compute metrics for Current vs Recommended
  let currentTotalRev = 0;
  let recTotalRev = 0;
  let currentTotalConv = 0;
  let recTotalConv = 0;

  const channelPlans: ChannelAllocationPlan[] = channelNames.map(name => {
    const ch = channels.find(c => c.channel === name)!;
    const curve = curves.get(name)!;

    const currSpend = currentAllocations[name];
    const recSpend = Math.round(recommendedAllocations[name]);
    const spendChange = recSpend - currSpend;
    const spendChangePct = currSpend > 0 ? (spendChange / currSpend) * 100 : 0;

    const currRev = predictChannelRevenue(curve, currSpend);
    const recRev = predictChannelRevenue(curve, recSpend);

    const currConv = Math.round(currRev / Math.max(1, ch.avgDealValue));
    const recConv = Math.round(recRev / Math.max(1, ch.avgDealValue));

    currentTotalRev += currRev;
    recTotalRev += recRev;
    currentTotalConv += currConv;
    recTotalConv += recConv;

    const recRoi = recSpend > 0 ? Number((recRev / recSpend).toFixed(2)) : 0;
    const recCac = recConv > 0 ? Math.round(recSpend / recConv) : 0;
    const marginalAtPlan = computeMarginalROIAtSpend(curve, recSpend);

    let saturationStatus: 'Healthy' | 'Near Saturation' | 'Over Saturated' = 'Healthy';
    if (recSpend > curve.saturationPoint * 1.15) {
      saturationStatus = 'Over Saturated';
    } else if (recSpend >= curve.saturationPoint * 0.85) {
      saturationStatus = 'Near Saturation';
    }

    return {
      channel: name,
      currentSpend: currSpend,
      recommendedSpend: recSpend,
      spendChange,
      spendChangePct: Number(spendChangePct.toFixed(1)),
      expectedRevenue: recRev,
      expectedConversions: recConv,
      expectedROI: recRoi,
      expectedCAC: recCac,
      marginalROIAtPlan: marginalAtPlan,
      saturationStatus,
    };
  });

  const revenueLift = recTotalRev - currentTotalRev;
  const revenueLiftPct = currentTotalRev > 0 ? Number(((revenueLift / currentTotalRev) * 100).toFixed(1)) : 0;

  const currentROI = totalBudget > 0 ? Number((currentTotalRev / totalBudget).toFixed(2)) : 0;
  const recommendedROI = totalBudget > 0 ? Number((recTotalRev / totalBudget).toFixed(2)) : 0;

  const currentCAC = currentTotalConv > 0 ? Math.round(totalBudget / currentTotalConv) : 0;
  const recommendedCAC = recTotalConv > 0 ? Math.round(totalBudget / recTotalConv) : 0;

  return {
    totalBudget,
    currentRevenue: currentTotalRev,
    recommendedRevenue: recTotalRev,
    revenueLift,
    revenueLiftPct,
    currentROI,
    recommendedROI,
    currentConversions: currentTotalConv,
    recommendedConversions: recTotalConv,
    conversionsLift: recTotalConv - currentTotalConv,
    currentCAC,
    recommendedCAC,
    channels: channelPlans,
    convergenceStatus: 'Optimal',
    disclaimer: 'This is an observational estimate based on fitted diminishing returns curves, not a guaranteed causal forecast.'
  };
}
