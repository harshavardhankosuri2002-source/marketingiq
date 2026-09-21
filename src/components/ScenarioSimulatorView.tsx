import React, { useState, useMemo } from 'react';
import { AggregatedChannel, ChannelMarginalCurve } from '../engine/types';
import { predictChannelRevenue, computeMarginalROIAtSpend } from '../engine/marginalReturnModel';
import { formatINR, formatNumberIndian, formatPercent, formatROI, formatDelta } from '../engine/formatters';
import {
  PieChart,
  RotateCcw,
  Sparkles,
  DollarSign,
  TrendingUp,
  Target,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface ScenarioSimulatorViewProps {
  channels: AggregatedChannel[];
  curves: Map<string, ChannelMarginalCurve>;
  prefilledShift?: { channel: string; deltaSpend: number; targetSpend: number } | null;
  onClearPrefilledShift?: () => void;
}

export const ScenarioSimulatorView: React.FC<ScenarioSimulatorViewProps> = ({
  channels,
  curves,
  prefilledShift,
  onClearPrefilledShift,
}) => {
  // Baseline initial spend map
  const initialSpends = useMemo(() => {
    const map: Record<string, number> = {};
    channels.forEach(c => { map[c.channel] = c.spend; });
    return map;
  }, [channels]);

  // Current user-adjusted allocations in simulation
  const [simulatedSpends, setSimulatedSpends] = useState<Record<string, number>>(initialSpends);
  const [appliedNotice, setAppliedNotice] = useState<string>('');

  // Handle incoming prefilled shifts from Action Center or Chatbot
  React.useEffect(() => {
    if (prefilledShift) {
      setSimulatedSpends(prev => ({
        ...prev,
        [prefilledShift.channel]: prefilledShift.targetSpend
      }));
      setAppliedNotice(`Applied AI recommendation: ${prefilledShift.deltaSpend > 0 ? '+' : ''}${formatINR(prefilledShift.deltaSpend)} shift in ${prefilledShift.channel}`);
      if (onClearPrefilledShift) {
        onClearPrefilledShift();
      }
    }
  }, [prefilledShift]);

  const resetToBaseline = () => {
    setSimulatedSpends(initialSpends);
    setAppliedNotice('');
  };

  const setTotalPreset = (targetBudget: number) => {
    const currentTotal = Object.values(simulatedSpends).reduce((a, b) => a + b, 0) || 1;
    const ratio = targetBudget / currentTotal;
    const newSpends: Record<string, number> = {};
    Object.entries(simulatedSpends).forEach(([ch, val]) => {
      newSpends[ch] = Math.round(val * ratio);
    });
    setSimulatedSpends(newSpends);
  };

  const handleSpendChange = (channelName: string, newSpend: number) => {
    setSimulatedSpends(prev => ({
      ...prev,
      [channelName]: newSpend
    }));
  };

  // Compute baseline metrics
  const baseline = useMemo(() => {
    const totalSpend = channels.reduce((s, c) => s + c.spend, 0);
    const totalRevenue = channels.reduce((s, c) => s + c.revenue, 0);
    const totalContracts = channels.reduce((s, c) => s + c.contracts, 0);
    const roi = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const cac = totalContracts > 0 ? Math.round(totalSpend / totalContracts) : 0;
    return { totalSpend, totalRevenue, totalContracts, roi, cac };
  }, [channels]);

  // Compute simulated metrics dynamically (instantaneous)
  const simulated = useMemo(() => {
    let totalSpend = 0;
    let totalRevenue = 0;
    let totalConversions = 0;

    channels.forEach(ch => {
      const spend = simulatedSpends[ch.channel] !== undefined ? simulatedSpends[ch.channel] : ch.spend;
      const curve = curves.get(ch.channel);
      const rev = curve ? predictChannelRevenue(curve, spend) : Math.round(spend * ch.roi);
      const conv = Math.round(rev / Math.max(1, ch.avgDealValue));

      totalSpend += spend;
      totalRevenue += rev;
      totalConversions += conv;
    });

    const roi = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const cac = totalConversions > 0 ? Math.round(totalSpend / totalConversions) : 0;

    return { totalSpend, totalRevenue, totalConversions, roi, cac };
  }, [channels, curves, simulatedSpends]);

  // Deltas
  const budgetDelta = simulated.totalSpend - baseline.totalSpend;
  const revenueDelta = simulated.totalRevenue - baseline.totalRevenue;
  const roiDelta = simulated.roi - baseline.roi;
  const conversionsDelta = simulated.totalConversions - baseline.totalContracts;
  const cacDelta = simulated.cac - baseline.cac;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-iceberg-50 text-iceberg-700 text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5 text-iceberg-600" />
              <span>Real-Time What-If Elasticity Simulator (0ms Latency)</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Interactive Scenario Modeling & Budget Simulation
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Adjust individual channel allocations or scale macro budgets to simulate expected revenue, won contracts, and CAC elasticity against current baseline performance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetToBaseline}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Baseline</span>
            </button>
          </div>
        </div>

        {/* Quick Target Presets */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-slate-500">Quick Scale Budget:</span>
          <div className="flex items-center gap-2">
            {[
              { label: 'Scale to ₹50L', val: 5000000 },
              { label: 'Scale to ₹1.00 Cr', val: 10000000 },
              { label: 'Scale to ₹2.00 Cr', val: 20000000 },
              { label: 'Scale to ₹5.00 Cr', val: 50000000 },
            ].map(p => (
              <button
                key={p.val}
                onClick={() => setTotalPreset(p.val)}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-iceberg-50 hover:text-iceberg-700 hover:border-iceberg-200 border border-slate-200 font-semibold text-slate-700 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applied AI Recommendation Banner */}
      {appliedNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{appliedNotice}</span>
          </div>
          <button
            onClick={resetToBaseline}
            className="text-xs text-emerald-800 underline hover:text-emerald-950 font-semibold"
          >
            Revert to Baseline
          </button>
        </div>
      )}

      {/* Side-by-side Baseline vs Simulated Summary Cards (Requirement 19) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Simulated Budget</div>
          <div className="text-2xl font-extrabold text-slate-900">{formatINR(simulated.totalSpend)}</div>
          <div className="mt-2 text-xs flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-slate-400">Baseline: {formatINR(baseline.totalSpend)}</span>
            <span className={`font-bold ${budgetDelta > 0 ? 'text-blue-600' : budgetDelta < 0 ? 'text-amber-600' : 'text-slate-500'}`}>
              {budgetDelta >= 0 ? '+' : ''}{formatINR(budgetDelta)}
            </span>
          </div>
        </div>

        {/* Metric 2: Expected Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Revenue</div>
          <div className="text-2xl font-extrabold text-emerald-600">{formatINR(simulated.totalRevenue)}</div>
          <div className="mt-2 text-xs flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-slate-400">Baseline: {formatINR(baseline.totalRevenue)}</span>
            <span className={`font-bold ${revenueDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {revenueDelta >= 0 ? '+' : ''}{formatINR(revenueDelta)}
            </span>
          </div>
        </div>

        {/* Metric 3: Expected ROI */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Simulated ROI</div>
          <div className="text-2xl font-extrabold text-indigo-700">{formatROI(simulated.roi)}</div>
          <div className="mt-2 text-xs flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-slate-400">Baseline: {formatROI(baseline.roi)}</span>
            <span className={`font-bold ${roiDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {roiDelta >= 0 ? '+' : ''}{formatROI(roiDelta)}
            </span>
          </div>
        </div>

        {/* Metric 4: Expected CAC */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expected CAC</div>
          <div className="text-2xl font-extrabold text-slate-900">{formatINR(simulated.cac)}</div>
          <div className="mt-2 text-xs flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-slate-400">Baseline: {formatINR(baseline.cac)}</span>
            <span className={`font-bold ${cacDelta <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {cacDelta <= 0 ? '-' : '+'}{formatINR(Math.abs(cacDelta))}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Channel Sliders Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Channel Spend Control Sliders</h4>
          <p className="text-xs text-slate-500">
            Drag any channel slider to simulate the effect of incremental investments or budget cuts.
          </p>
        </div>

        <div className="space-y-6">
          {channels.map((ch) => {
            const currentSpend = simulatedSpends[ch.channel] !== undefined ? simulatedSpends[ch.channel] : ch.spend;
            const curve = curves.get(ch.channel);
            const expectedRev = curve ? predictChannelRevenue(curve, currentSpend) : Math.round(currentSpend * ch.roi);
            const expectedRoi = currentSpend > 0 ? Number((expectedRev / currentSpend).toFixed(2)) : 0;
            const deltaSpend = currentSpend - ch.spend;

            const minLimit = Math.max(10000, Math.round(ch.spend * 0.1));
            const maxLimit = Math.round(ch.spend * 3.5);

            return (
              <div key={ch.channel} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{ch.channel}</span>
                    <span className="text-slate-500 ml-2 font-medium">
                      Baseline: {formatINR(ch.spend)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Simulated Spend</div>
                      <div className="text-sm font-extrabold text-slate-900">{formatINR(currentSpend)}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Expected Revenue</div>
                      <div className="text-sm font-bold text-emerald-700">{formatINR(expectedRev)}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Simulated ROI</div>
                      <div className="text-sm font-bold text-indigo-700">{formatROI(expectedRoi)}</div>
                    </div>
                  </div>
                </div>

                {/* Slider */}
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-semibold text-slate-400">{formatINR(minLimit, { compact: true })}</span>
                  <input
                    type="range"
                    min={minLimit}
                    max={maxLimit}
                    step={25000}
                    value={currentSpend}
                    onChange={(e) => handleSpendChange(ch.channel, Number(e.target.value))}
                    className="w-full accent-iceberg-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <span className="text-[10px] font-semibold text-slate-400">{formatINR(maxLimit, { compact: true })}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>
                    Change vs Baseline:{' '}
                    <span className={`font-bold ${deltaSpend > 0 ? 'text-emerald-700' : deltaSpend < 0 ? 'text-rose-700' : 'text-slate-600'}`}>
                      {deltaSpend > 0 ? '+' : ''}{formatINR(deltaSpend)} ({deltaSpend !== 0 ? ((deltaSpend / ch.spend) * 100).toFixed(1) : 0}%)
                    </span>
                  </span>
                  <span>
                    Saturation Status:{' '}
                    <span className="font-semibold text-slate-700">
                      {curve && currentSpend > curve.saturationPoint ? 'Near Saturation' : 'Healthy Headroom'}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
