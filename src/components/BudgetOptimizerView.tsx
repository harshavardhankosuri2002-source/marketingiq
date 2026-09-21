import React, { useState } from 'react';
import {
  AggregatedChannel,
  ChannelMarginalCurve,
  OptimizationConstraints,
  OptimizationResult,
  OptimizationObjective,
  StrategicConstraint
} from '../engine/types';
import { runBudgetOptimization } from '../engine/budgetOptimizer';
import { formatINR, formatPercent, formatROI, formatDelta } from '../engine/formatters';
import {
  Sliders,
  DollarSign,
  TrendingUp,
  Target,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  ChevronDown
} from 'lucide-react';

interface BudgetOptimizerViewProps {
  channels: AggregatedChannel[];
  curves: Map<string, ChannelMarginalCurve>;
  onApplyToSimulator?: (budget: number) => void;
}

export const BudgetOptimizerView: React.FC<BudgetOptimizerViewProps> = ({
  channels,
  curves,
  onApplyToSimulator,
}) => {
  // Budget presets in INR: 50L, 1Cr, 2Cr, 5Cr
  const [totalBudget, setTotalBudget] = useState<number>(10000000); // ₹1.00 Cr default
  const [objective, setObjective] = useState<OptimizationObjective>('BALANCED');

  // Channel bounds & locks
  const [channelMinSpend, setChannelMinSpend] = useState<Record<string, number>>({});
  const [channelMaxSpend, setChannelMaxSpend] = useState<Record<string, number>>({});
  const [strategicLocks, setStrategicLocks] = useState<StrategicConstraint[]>([
    {
      campaignOrChannel: 'Executive Events & Roundtables',
      minSpend: 1500000,
      reason: 'Protect C-level executive relationship building & enterprise brand presence',
      locked: true
    }
  ]);

  const [showConstraintsDrawer, setShowConstraintsDrawer] = useState<boolean>(false);

  // Run Optimization dynamically
  const constraints: OptimizationConstraints = {
    totalBudget,
    objective,
    channelMinSpend,
    channelMaxSpend,
    strategicLocks
  };

  const optResult: OptimizationResult = runBudgetOptimization(channels, curves, constraints);

  const toggleLock = (channelName: string) => {
    setStrategicLocks(prev => {
      const existing = prev.find(l => l.campaignOrChannel === channelName);
      if (existing) {
        return prev.map(l => l.campaignOrChannel === channelName ? { ...l, locked: !l.locked } : l);
      } else {
        return [...prev, {
          campaignOrChannel: channelName,
          minSpend: 1200000,
          reason: 'Custom strategic campaign lock',
          locked: true
        }];
      }
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner: Where should the next ₹1 crore go? */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 rounded-2xl p-7 text-white shadow-xl border border-navy-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Core Analytical Question</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Where should your next marketing budget go?
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            The optimization engine balances historical ROI, customer acquisition costs, lead qualification rates, and diminishing marginal return curves to maximize enterprise portfolio value.
          </p>
        </div>

        {/* Budget Preset Selector */}
        <div className="mt-6 pt-5 border-t border-navy-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Total Marketing Budget:</span>
            <div className="flex items-center gap-2">
              {[
                { label: '₹50 Lakh', val: 5000000 },
                { label: '₹1.00 Crore', val: 10000000 },
                { label: '₹2.00 Crore', val: 20000000 },
                { label: '₹5.00 Crore', val: 50000000 },
              ].map(b => (
                <button
                  key={b.val}
                  onClick={() => setTotalBudget(b.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    totalBudget === b.val
                      ? 'bg-iceberg-500 text-white shadow-md shadow-iceberg-500/30'
                      : 'bg-navy-800 text-slate-300 hover:bg-navy-750 hover:text-white'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Objective Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Objective:</span>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value as OptimizationObjective)}
              className="text-xs bg-navy-800 border border-navy-700 rounded-lg px-3 py-1.5 font-bold text-iceberg-300 focus:outline-none focus:ring-1 focus:ring-iceberg-500"
            >
              <option value="BALANCED">Balanced (Revenue + Efficiency)</option>
              <option value="MAX_REVENUE">Maximize Closed Revenue</option>
              <option value="MAX_ROI">Maximize Marketing ROI</option>
              <option value="MAX_CONVERSIONS">Maximize Deal Volume</option>
              <option value="MIN_CAC">Minimize Customer Acquisition Cost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lift / Impact Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Projected Revenue Lift</div>
          <div className="text-2xl font-extrabold text-emerald-600">
            +{formatINR(optResult.revenueLift)}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            {formatINR(optResult.currentRevenue)} → <span className="font-bold text-slate-800">{formatINR(optResult.recommendedRevenue)}</span> ({formatPercent(optResult.revenueLiftPct)})
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Optimized Portfolio ROI</div>
          <div className="text-2xl font-extrabold text-indigo-700">
            {formatROI(optResult.recommendedROI)}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Current: {formatROI(optResult.currentROI)} (Δ {formatDelta(optResult.recommendedROI - optResult.currentROI, 'roi').text})
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Customer Acquisition Cost</div>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatINR(optResult.recommendedCAC)}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Saved {formatINR(Math.max(0, optResult.currentCAC - optResult.recommendedCAC))} per won deal
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Allocated Budget</div>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatINR(optResult.totalBudget)}
          </div>
          <div className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Budget Exhaustion Satisfied</span>
          </div>
        </div>
      </div>

      {/* Core Table: Current vs Recommended Allocation (Requirement 17) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Current vs Recommended Channel Allocation
            </h3>
            <p className="text-xs text-slate-500">
              Optimal reallocation derived from marginal response curves and strategic minimum constraints
            </p>
          </div>

          <button
            onClick={() => setShowConstraintsDrawer(!showConstraintsDrawer)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 self-start"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>{showConstraintsDrawer ? 'Hide Constraints' : 'Manage Strategic Locks & Bounds'}</span>
          </button>
        </div>

        {/* Strategic Locks / Constraints Drawer */}
        {showConstraintsDrawer && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800">Strategic Spend Constraints & Channel Protection</div>
            <p className="text-xs text-slate-500">
              Lock minimum spend floors for high-touch enterprise brand channels or executive client roundtables.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {channels.map(ch => {
                const lock = strategicLocks.find(l => l.campaignOrChannel === ch.channel);
                const isLocked = !!lock && lock.locked;

                return (
                  <div key={ch.channel} className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{ch.channel}</div>
                      <div className="text-[10px] text-slate-500">
                        {isLocked ? `Locked floor: ${formatINR(lock.minSpend)}` : 'No floor restriction'}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleLock(ch.channel)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isLocked ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                      }`}
                      title={isLocked ? 'Unlock channel' : 'Lock minimum floor'}
                    >
                      {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Current Allocation</th>
                <th className="py-3 px-4">Recommended Allocation</th>
                <th className="py-3 px-4">Budget Change (Δ)</th>
                <th className="py-3 px-4">Change %</th>
                <th className="py-3 px-4">Expected Revenue</th>
                <th className="py-3 px-4">Expected ROI</th>
                <th className="py-3 px-4">Marginal ROI (dR/ds)</th>
                <th className="py-3 px-4">Saturation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {optResult.channels.map((p, idx) => {
                const isIncrease = p.spendChange > 0;
                const isNeutral = Math.abs(p.spendChange) < 1000;

                return (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-iceberg-500"></span>
                      <span>{p.channel}</span>
                    </td>
                    <td className="py-3 px-4">{formatINR(p.currentSpend)}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">{formatINR(p.recommendedSpend)}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${
                        isNeutral ? 'text-slate-500' : isIncrease ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {isNeutral ? '₹0' : (isIncrease ? '+' : '') + formatINR(p.spendChange)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${
                        isNeutral ? 'text-slate-500' : isIncrease ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {isNeutral ? '0%' : (isIncrease ? '+' : '') + formatPercent(p.spendChangePct)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatINR(p.expectedRevenue)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        p.expectedROI >= 3.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {formatROI(p.expectedROI)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-indigo-700">{p.marginalROIAtPlan}x</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.saturationStatus === 'Healthy' ? 'bg-emerald-100 text-emerald-800' :
                        p.saturationStatus === 'Near Saturation' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {p.saturationStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Data Science Safety Notice */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-slate-800">Safety & Governance Note: </span>
            {optResult.disclaimer} Observational historical data cannot guarantee identical future response rates. Reallocations should be executed incrementally over 4-6 week sprint cycles.
          </div>
        </div>
      </div>
    </div>
  );
};
