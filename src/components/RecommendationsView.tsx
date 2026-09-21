import React from 'react';
import { RecommendationItem, UnderInvestmentScore, FeatureImportanceItem } from '../engine/types';
import { formatINR, formatPercent, formatROI } from '../engine/formatters';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Award,
  ArrowRight,
  Info,
  HelpCircle
} from 'lucide-react';

interface RecommendationsViewProps {
  recommendations: RecommendationItem[];
  underInvestmentScores: UnderInvestmentScore[];
  featureImportance: FeatureImportanceItem[];
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  underInvestmentScores,
  featureImportance,
}) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-iceberg-50 text-iceberg-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Decision Engine & Explainability</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Actionable Executive Recommendations & Capital Reallocation Plan
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Each recommendation provides quantitative backing, expected portfolio lift, explicit confidence ratings, risk exposure, and mandatory causal limitation notices.
            </p>
          </div>
        </div>
      </div>

      {/* Under-Investment Opportunity Score Table (Requirement 14) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-slate-900">
              Under-Investment Opportunity Score (0–100)
            </h4>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
              Requirement 14
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluates marginal ROI (dR/ds), historical efficiency, qualified lead ratio, and saturation headroom to detect under-invested channels.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Opportunity Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Marginal ROI (dR/ds)</th>
                <th className="py-3 px-4">Historical ROI</th>
                <th className="py-3 px-4">Lead Quality</th>
                <th className="py-3 px-4">Saturation Ratio</th>
                <th className="py-3 px-4">Analytical Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {underInvestmentScores.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{s.channel}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">{s.score}</span>
                      <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            s.score >= 75 ? 'bg-emerald-500' : s.score >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${s.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'Expansion Opportunity' ? 'bg-emerald-100 text-emerald-800' :
                      s.status === 'Monitor' ? 'bg-blue-100 text-blue-800' :
                      s.status === 'Review' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-indigo-700">{s.marginalROI}x</td>
                  <td className="py-3 px-4">{formatROI(s.historicalROI)}</td>
                  <td className="py-3 px-4">{formatPercent(s.leadQuality)}</td>
                  <td className="py-3 px-4 font-semibold text-slate-600">{(s.saturationRatio * 100).toFixed(0)}%</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">{s.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Structured Recommendation Cards (Requirement 20) */}
      <div className="space-y-5">
        <h4 className="text-base font-bold text-slate-900 tracking-tight">
          Executive Decision Cards
        </h4>

        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all"
          >
            {/* Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-iceberg-50 text-iceberg-600 flex items-center justify-center font-bold text-xs shrink-0">
                  {rec.id}
                </div>
                <div>
                  <h5 className="text-base font-bold text-slate-900">{rec.title}</h5>
                  <p className="text-xs font-semibold text-iceberg-700">{rec.action}</p>
                </div>
              </div>

              {/* Confidence & Risk Pills */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Confidence: {rec.confidence}</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-xs font-semibold text-amber-800 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Risk: {rec.risk}</span>
                </div>
              </div>
            </div>

            {/* Why & Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Strategic Rationale (Why?)
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">{rec.why}</p>
              </div>

              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Quantitative Evidence Supporting
                </div>
                <ul className="space-y-1 text-slate-600 font-medium">
                  {rec.evidence.map((ev, eIdx) => (
                    <li key={eIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Expected Impact */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Estimated Revenue Impact</span>
                <div className="text-base font-extrabold text-emerald-700">+{formatINR(rec.expectedImpact.revenueDelta)}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Estimated ROI Lift</span>
                <div className="text-base font-extrabold text-emerald-700">+{formatROI(rec.expectedImpact.roiDelta)}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Additional Won Contracts</span>
                <div className="text-base font-extrabold text-emerald-700">+{rec.expectedImpact.conversionDelta} deals</div>
              </div>
            </div>

            {/* Mandatory Limitation Disclaimer (Requirement 20) */}
            <div className="pt-2 flex items-start gap-2 text-[11px] text-slate-500 italic">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>Important Limitation: {rec.importantLimitation}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Importance & Explainability (Requirement 21) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h4 className="text-base font-bold text-slate-900">
            Model Explainability & Feature Importance (Tree-Based Model)
          </h4>
          <p className="text-xs text-slate-500">
            Relative weight of independent variables predicting closed contract revenue and conversion probability
          </p>
        </div>

        <div className="space-y-4 pt-2">
          {featureImportance.map((feat, idx) => (
            <div key={idx} className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-800">
                <span className="font-bold flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[10px]">{idx + 1}.</span>
                  <span>{feat.feature}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    {feat.direction}
                  </span>
                </span>
                <span className="font-extrabold text-slate-900">{Math.round(feat.importance * 100)}% Influence</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-iceberg-600 to-iceberg-400 h-full rounded-full transition-all"
                  style={{ width: `${feat.importance * 100 * 2.5}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
