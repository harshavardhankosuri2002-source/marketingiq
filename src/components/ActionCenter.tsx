import React, { useState } from 'react';
import { ActionableInsight, InsightPriority, InsightCategory } from '../engine/insightsEngine';
import { formatINR, formatROI, formatPercent } from '../engine/formatters';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Sliders,
  MessageSquare,
  ShieldAlert,
  X,
  ShieldCheck,
  ChevronDown,
  Layers
} from 'lucide-react';

interface ActionCenterProps {
  insights: ActionableInsight[];
  onApplyToSimulator: (shift: { channel: string; deltaSpend: number; targetSpend: number }) => void;
  onAskAnalyst: (initialQuestion: string) => void;
}

export const ActionCenter: React.FC<ActionCenterProps> = ({
  insights,
  onApplyToSimulator,
  onAskAnalyst,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | InsightPriority>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | InsightCategory>('ALL');
  const [activeModalInsight, setActiveModalInsight] = useState<ActionableInsight | null>(null);

  const filteredInsights = insights.filter(ins => {
    if (priorityFilter !== 'ALL' && ins.priority !== priorityFilter) return false;
    if (categoryFilter !== 'ALL' && ins.category !== categoryFilter) return false;
    return true;
  });

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Action Center
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            What Needs Your Attention?
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated root-cause diagnostics, priority ranking, and prescriptive marketing interventions.
          </p>
        </div>

        {/* Priority Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          {(['ALL', 'Critical', 'High', 'Medium'] as const).map((p) => {
            const count = p === 'ALL' ? insights.length : insights.filter(i => i.priority === p).length;
            const isActive = priorityFilter === p;

            return (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{p === 'ALL' ? 'All Alerts' : p}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  p === 'Critical' ? 'bg-rose-100 text-rose-700' :
                  p === 'High' ? 'bg-amber-100 text-amber-700' :
                  p === 'Medium' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Insight Cards Grid */}
      <div className="space-y-4">
        {filteredInsights.map((ins) => {
          const isCritical = ins.priority === 'Critical';
          const isHigh = ins.priority === 'High';

          return (
            <div
              key={ins.id}
              className={`p-6 rounded-2xl border transition-all ${
                isCritical
                  ? 'bg-rose-50/20 border-rose-200 hover:border-rose-300'
                  : isHigh
                  ? 'bg-amber-50/20 border-amber-200 hover:border-amber-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              } shadow-2xs space-y-4`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isCritical ? 'bg-rose-100 text-rose-700' : isHigh ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isCritical ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isCritical ? 'bg-rose-100 text-rose-800' : isHigh ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ins.priority} Priority
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        {ins.category} Domain
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Impact Score: {ins.businessImpactScore}/100
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                      {ins.title}
                    </h4>
                  </div>
                </div>

                {/* Confidence & "Why am I seeing this?" */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Confidence: {ins.confidence}
                  </span>
                  <button
                    onClick={() => setActiveModalInsight(ins)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100 transition-colors"
                    title="Trust & Transparency: View underlying data and model assumptions"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Why am I seeing this?</span>
                  </button>
                </div>
              </div>

              {/* 4-Box Structured Explanation (What / Why / Action / Expected Impact) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. WHAT HAPPENED? */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    1. What Changed? (Observation)
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">{ins.insight}</p>
                  <div className="pt-2 text-[11px] text-slate-500 space-y-0.5">
                    {ins.evidence.slice(0, 2).map((ev, eIdx) => (
                      <div key={eIdx} className="flex items-center gap-1.5 font-mono text-[10px]">
                        <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. WHY DID IT HAPPEN? (CAUSE) */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    2. Why Did It Happen? (Root Cause)
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">{ins.cause}</p>
                </div>

                {/* 3. WHAT SHOULD WE DO NEXT? (ACTION) */}
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-950 space-y-1">
                  <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                    <span>3. Recommended Next Action</span>
                  </div>
                  <p className="text-blue-900 font-medium leading-relaxed">{ins.action}</p>
                </div>

                {/* 4. WHAT COULD HAPPEN IF WE ACT? (EXPECTED IMPACT) */}
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span>4. Estimated Business Impact</span>
                  </div>
                  <p className="text-emerald-900 font-semibold leading-relaxed">{ins.expectedImpact.description}</p>
                </div>
              </div>

              {/* Direct Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  {ins.suggestedBudgetShift && (
                    <button
                      onClick={() => onApplyToSimulator(ins.suggestedBudgetShift!)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-iceberg-600 hover:bg-iceberg-500 text-white font-bold transition-all shadow-sm shadow-iceberg-600/30"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Apply to Scenario Simulator</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    onClick={() => onAskAnalyst(`Explain ${ins.title}. Why is this happening and what should we do?`)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-300 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-iceberg-600" />
                    <span>Ask MarketingIQ Analyst</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 italic">
                  Confidence: {ins.confidence} • Grounded in observational data
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* "Why am I seeing this?" Transparency Modal (Requirement 21) */}
      {activeModalInsight && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-base font-bold text-slate-900">
                  Trust & Transparency: Analytical Context
                </h4>
              </div>
              <button
                onClick={() => setActiveModalInsight(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Alert / Insight:</span>
                <p className="text-slate-600">{activeModalInsight.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block text-[10px] uppercase text-slate-500">Sample Period</span>
                  <span className="font-medium text-slate-800">{activeModalInsight.transparency.dataPeriod}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-[10px] uppercase text-slate-500">Metrics Evaluated</span>
                  <span className="font-medium text-slate-800">{activeModalInsight.transparency.metricsUsed.join(', ')}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 block mb-0.5">Model Assumptions:</span>
                <p className="text-slate-600 leading-relaxed">{activeModalInsight.transparency.modelAssumptions}</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Causal Safety Limitation: </span>
                  {activeModalInsight.transparency.limitations} This is an observational finding based on historical covariance, not a counterfactual guarantee.
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModalInsight(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
