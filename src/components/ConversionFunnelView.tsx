import React from 'react';
import { FunnelStageData } from '../engine/types';
import { formatNumberIndian, formatPercent } from '../engine/formatters';
import {
  GitFork,
  AlertTriangle,
  Clock,
  ArrowDown,
  TrendingDown,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface ConversionFunnelViewProps {
  stages: FunnelStageData[];
}

export const ConversionFunnelView: React.FC<ConversionFunnelViewProps> = ({ stages }) => {
  const bottleneckStage = stages.find(s => s.isBottleneck) || stages[4]; // Default to SQL/Opportunity if not explicitly marked

  return (
    <div className="space-y-8 pb-12">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-iceberg-50 text-iceberg-700 text-xs font-semibold mb-2">
              <GitFork className="w-3.5 h-3.5" />
              <span>Full-Cycle Enterprise B2B Pipeline</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              9-Stage Commercial Conversion Funnel
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Track conversion velocity, stage-to-stage attrition, and cycle durations from raw upper-funnel impressions through to contracted enterprise revenue.
            </p>
          </div>
        </div>
      </div>

      {/* AI Finding / Bottleneck Detection (Requirement 12) */}
      <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-amber-900">
                AI Diagnostic Finding: Primary Funnel Bottleneck
              </h4>
              <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                High Attrition
              </span>
            </div>
            <p className="text-sm text-amber-900 leading-relaxed font-medium">
              "{bottleneckStage.label} conversion demonstrates the steepest drop-off ({formatPercent(bottleneckStage.dropOffRate)} attrition) across the sales cycle. This indicates that marketing-generated lead volume is not translating proportionally into validated commercial pipeline. Sales qualification criteria and solution-engineering handoffs require immediate alignment."
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-amber-800">
              <div>Stage Drop-Off: <span className="underline">{formatPercent(bottleneckStage.dropOffRate)}</span></div>
              <div>Estimated Lag Time: <span className="underline">{bottleneckStage.avgDaysInStage} days</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 9-Stage Visual Funnel Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Pipeline Progression & Conversion Velocity</h4>
            <p className="text-xs text-slate-500">Stage count, conversion from previous stage, and average incubation days</p>
          </div>
        </div>

        <div className="space-y-4">
          {stages.map((st, idx) => {
            const maxCount = stages[0]?.count || 1;
            const widthPct = Math.max(12, Math.min(100, Math.log10(st.count + 1) / Math.log10(maxCount + 1) * 100));

            return (
              <div key={st.stage} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{st.label}</span>
                    {st.isBottleneck && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold text-[10px] rounded-full">
                        Bottleneck
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-slate-600 font-medium">
                    <div>
                      <span className="text-slate-400">Volume: </span>
                      <span className="font-extrabold text-slate-900">{formatNumberIndian(st.count)}</span>
                    </div>

                    {idx > 0 && (
                      <div>
                        <span className="text-slate-400">Stage Conv: </span>
                        <span className={`font-bold ${st.isBottleneck ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {formatPercent(st.conversionFromPrev)}
                        </span>
                      </div>
                    )}

                    {idx > 0 && (
                      <div>
                        <span className="text-slate-400">Drop-off: </span>
                        <span className="font-semibold text-slate-500">{formatPercent(st.dropOffRate)}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{st.avgDaysInStage}d avg</span>
                    </div>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      st.isBottleneck
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                        : 'bg-gradient-to-r from-iceberg-600 to-iceberg-400'
                    }`}
                    style={{ width: `${widthPct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
