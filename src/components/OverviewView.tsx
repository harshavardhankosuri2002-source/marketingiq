import React from 'react';
import { OverviewKPIs, AggregatedChannel } from '../engine/types';
import { ActionableInsight } from '../engine/insightsEngine';
import { formatINR, formatNumberIndian, formatPercent, formatROI, formatDelta } from '../engine/formatters';
import {
  DollarSign,
  TrendingUp,
  Target,
  Users,
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ShieldAlert,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { NavigationTab } from './Sidebar';
import { ActionCenter } from './ActionCenter';

interface OverviewViewProps {
  kpis: OverviewKPIs;
  channels: AggregatedChannel[];
  executiveSummary: string;
  insights: ActionableInsight[];
  onNavigateTab: (tab: NavigationTab) => void;
  onApplyToSimulator: (shift: { channel: string; deltaSpend: number; targetSpend: number }) => void;
  onAskAnalyst: (initialQuestion: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  kpis,
  channels,
  executiveSummary,
  insights,
  onNavigateTab,
  onApplyToSimulator,
  onAskAnalyst,
}) => {
  // KPI Cards configuration
  const kpiCards = [
    {
      label: 'Total Marketing Spend',
      value: formatINR(kpis.totalSpend),
      prevValue: formatINR(kpis.prevSpend),
      delta: formatDelta(((kpis.totalSpend - kpis.prevSpend) / Math.max(1, kpis.prevSpend)) * 100, 'percent'),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Total capital deployed across all active channels'
    },
    {
      label: 'Generated Revenue',
      value: formatINR(kpis.totalRevenue),
      prevValue: formatINR(kpis.prevRevenue),
      delta: formatDelta(((kpis.totalRevenue - kpis.prevRevenue) / Math.max(1, kpis.prevRevenue)) * 100, 'percent'),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Closed commercial enterprise contract value'
    },
    {
      label: 'Marketing ROI',
      value: formatROI(kpis.roi),
      prevValue: formatROI(kpis.prevRoi),
      delta: formatDelta(kpis.roi - kpis.prevRoi, 'roi'),
      icon: Award,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Gross return multiple per marketing rupee'
    },
    {
      label: 'Conversion Rate',
      value: formatPercent(kpis.conversionRate),
      prevValue: formatPercent(kpis.prevConversionRate),
      delta: formatDelta(kpis.conversionRate - kpis.prevConversionRate, 'percent'),
      icon: Target,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      description: 'Lead-to-contract closure velocity'
    },
    {
      label: 'Customer Acquisition Cost (CAC)',
      value: formatINR(kpis.cac),
      prevValue: formatINR(kpis.prevCac),
      delta: {
        ...formatDelta(((kpis.cac - kpis.prevCac) / Math.max(1, kpis.prevCac)) * 100, 'percent'),
        isPositive: kpis.cac < kpis.prevCac
      },
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Average marketing cost per won contract'
    },
    {
      label: 'Sales Qualified Leads (SQL)',
      value: formatNumberIndian(kpis.qualifiedLeads),
      prevValue: formatNumberIndian(kpis.prevQualifiedLeads),
      delta: formatDelta(((kpis.qualifiedLeads - kpis.prevQualifiedLeads) / Math.max(1, kpis.prevQualifiedLeads)) * 100, 'percent'),
      icon: Users,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      description: 'High-intent enterprise pipeline volume'
    },
    {
      label: 'Predicted Revenue (Est.)',
      value: formatINR(kpis.predictedRevenue),
      prevValue: `Confidence: ${kpis.predictedRevenueConfidence.split(' ')[0]}`,
      delta: formatDelta(((kpis.predictedRevenue - kpis.totalRevenue) / Math.max(1, kpis.totalRevenue)) * 100, 'percent'),
      icon: Sparkles,
      color: 'text-iceberg-600',
      bgColor: 'bg-iceberg-50',
      isHero: true,
      description: 'Estimated revenue under optimized reallocation'
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Hero Callout: Where should the next ₹1 Crore go? */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 p-7 text-white shadow-xl border border-navy-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-iceberg-500/10 border border-iceberg-500/20 text-iceberg-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-iceberg-400" />
              <span>Core Decision Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Where should the next ₹1 crore of marketing budget go?
            </h2>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Our non-linear S-curve model reveals that channels with the highest historical ROI have reached diminishing marginal returns, while high-velocity digital channels possess untapped expansion headroom.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('optimizer')}
              className="px-6 py-3 rounded-xl bg-iceberg-600 hover:bg-iceberg-500 text-white font-bold text-sm shadow-lg shadow-iceberg-600/30 transition-all flex items-center justify-center gap-2 group"
            >
              <Sliders className="w-4 h-4" />
              <span>Run Budget Optimizer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigateTab('simulator')}
              className="px-5 py-3 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 text-sm font-semibold border border-navy-700 transition-colors"
            >
              Live Simulator
            </button>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-iceberg-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Top 7 KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">Executive Performance Indicators</h3>
          <span className="text-xs text-slate-500">Period-over-period comparison (Recent 6M vs Previous 6M)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  kpi.isHero
                    ? 'bg-iceberg-50/50 border-iceberg-200 shadow-xs'
                    : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                    {kpi.label}
                  </span>
                  <div className={`w-7 h-7 rounded-lg ${kpi.bgColor} ${kpi.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {kpi.value}
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    {kpi.delta.isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 font-bold" />
                    )}
                    <span className={`font-bold ${kpi.delta.isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {kpi.delta.text}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                    vs {kpi.prevValue}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTION CENTER ("What Needs Your Attention?") - Major Requirement 1 & 2 */}
      <ActionCenter
        insights={insights}
        onApplyToSimulator={onApplyToSimulator}
        onAskAnalyst={onAskAnalyst}
      />

      {/* Dynamic AI Executive Summary Panel */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-iceberg-50 text-iceberg-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">AI Executive Summary</h3>
            <p className="text-xs text-slate-500">Synthesized dynamically from observational dataset observations</p>
          </div>
        </div>

        <blockquote className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 italic font-medium">
          "{executiveSummary}"
        </blockquote>

        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 gap-2">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Note: This summary reflects empirical observational data, not causal counterfactual guarantees.</span>
          </div>
          <button
            onClick={() => onNavigateTab('recommendations')}
            className="text-xs font-semibold text-iceberg-600 hover:text-iceberg-700 flex items-center gap-1"
          >
            <span>View Full Recommendations</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Channel Performance Snapshot Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Channel Performance & Efficiency Snapshot</h3>
            <p className="text-xs text-slate-500">High-level distribution of spend, closed revenue, ROI, and CAC</p>
          </div>
          <button
            onClick={() => onNavigateTab('campaigns')}
            className="text-xs font-semibold text-iceberg-600 hover:text-iceberg-700 flex items-center gap-1"
          >
            <span>Deep Campaign Analytics</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/90 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Spend</th>
                <th className="py-3 px-4">Revenue</th>
                <th className="py-3 px-4">ROI</th>
                <th className="py-3 px-4">Lead Quality</th>
                <th className="py-3 px-4">Conversion %</th>
                <th className="py-3 px-4">CAC</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {channels.map((ch, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-iceberg-500"></span>
                    <span>{ch.channel}</span>
                  </td>
                  <td className="py-3 px-4">{formatINR(ch.spend)}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{formatINR(ch.revenue)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      ch.roi >= 3.0 ? 'bg-emerald-100 text-emerald-800' : ch.roi >= 2.0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {formatROI(ch.roi)}
                    </span>
                  </td>
                  <td className="py-3 px-4">{formatPercent(ch.leadQuality)}</td>
                  <td className="py-3 px-4">{formatPercent(ch.conversionRate)}</td>
                  <td className="py-3 px-4">{formatINR(ch.cac)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigateTab('optimizer')}
                      className="text-xs text-iceberg-600 hover:text-iceberg-800 font-semibold"
                    >
                      Optimize →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
