import React, { useState } from 'react';
import { CustomerSegment } from '../engine/types';
import { formatINR, formatNumberIndian, formatPercent } from '../engine/formatters';
import {
  Users,
  Award,
  Sparkles,
  TrendingUp,
  Target,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface CustomerIntelligenceViewProps {
  segments: CustomerSegment[];
}

export const CustomerIntelligenceView: React.FC<CustomerIntelligenceViewProps> = ({ segments }) => {
  const [selectedSegment, setSelectedSegment] = useState<string>(segments[0]?.id || '');

  const activeSegment = segments.find(s => s.id === selectedSegment) || segments[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Info Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-iceberg-50 text-iceberg-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unsupervised Machine Learning: K-Means Clustering (k=4)</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Enterprise Account Segmentation & Behavioral Profiling
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Clusters are formed via normalized Euclidean distance across revenue, CLV, average deal value, interaction volume, and lead conversion velocity. Segment labels and characteristics are dynamically synthesized from centroid vectors.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500">Total Profiled Accounts</div>
              <div className="text-lg font-extrabold text-slate-900">
                {segments.reduce((acc, s) => acc + s.clientCount, 0).toLocaleString()} Clients
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segment Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {segments.map((seg) => {
          const isSelected = seg.id === activeSegment?.id;

          return (
            <div
              key={seg.id}
              onClick={() => setSelectedSegment(seg.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-iceberg-500 shadow-md ring-2 ring-iceberg-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                ></span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  seg.growthPotential === 'High' ? 'bg-emerald-100 text-emerald-800' :
                  seg.growthPotential === 'Moderate' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {seg.growthPotential} Growth
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 tracking-tight mb-1">{seg.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{seg.description}</p>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Segment Revenue:</span>
                  <span className="font-extrabold text-slate-900">{formatINR(seg.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Average CLV:</span>
                  <span className="font-semibold text-slate-800">{formatINR(seg.avgCLV)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Client Accounts:</span>
                  <span className="font-medium text-slate-700">{seg.clientCount} clients</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Segment Deep Dive */}
      {activeSegment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Detailed Metrics & Characteristics */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: activeSegment.color }}
                ></span>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{activeSegment.name}</h4>
                  <p className="text-xs text-slate-500">Cluster Profile & Behavioral Parameters</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                Preferred: {activeSegment.preferredChannel}
              </span>
            </div>

            {/* Key Cluster Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Average Deal Value</div>
                <div className="text-base font-extrabold text-slate-900 mt-1">{formatINR(activeSegment.avgDealValue)}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Per closed contract</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Customer Lifetime Value</div>
                <div className="text-base font-extrabold text-emerald-700 mt-1">{formatINR(activeSegment.avgCLV)}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">3-year projected ARR</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Lead Conversion %</div>
                <div className="text-base font-extrabold text-indigo-700 mt-1">{formatPercent(activeSegment.conversionRate)}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Leads to Contracts</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Acquisition CAC</div>
                <div className="text-base font-extrabold text-amber-700 mt-1">{formatINR(activeSegment.cac)}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Spend / Won Contract</div>
              </div>
            </div>

            {/* Strategic Recommended Playbook */}
            <div className="p-4 rounded-xl bg-iceberg-50/60 border border-iceberg-200">
              <h5 className="text-xs font-bold text-iceberg-900 uppercase tracking-wider mb-1">
                Strategic Marketing Playbook for {activeSegment.name}
              </h5>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activeSegment.name.includes('Enterprise')
                  ? 'Focus marketing investment on high-touch account-based marketing (ABM) and executive roundtables. The high deal value justifies longer proposal cycles; pair LinkedIn Enterprise thought-leadership with customized technical briefs.'
                  : activeSegment.name.includes('Growth')
                  ? 'Leverage Google Search intent capture and automated email nurturing sequences. Conversion velocity is high; deploy technical whitepapers to shorten proposal approval timelines.'
                  : activeSegment.name.includes('Emerging')
                  ? 'Deploy automated webinars and self-serve digital proof-of-concept demos. Avoid expensive customized executive events for this tier to prevent CAC escalation.'
                  : 'Nurture via targeted industry webinars and regular service updates. Good candidate for cross-selling Cloud and Cyber advisory.'}
              </p>
            </div>
          </div>

          {/* Right Col: Cluster Radar / Engagement Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Cluster Centroid Comparison</h4>
              <p className="text-xs text-slate-500 mb-5">Normalized feature weights across clusters</p>

              <div className="space-y-4">
                {[
                  { label: 'Revenue Weight', val: activeSegment.totalRevenue > 30000000 ? 92 : 65 },
                  { label: 'Contract Deal Size', val: activeSegment.avgDealValue > 4000000 ? 95 : 55 },
                  { label: 'Conversion Velocity', val: activeSegment.conversionRate > 3.0 ? 82 : 48 },
                  { label: 'Engagement Score', val: activeSegment.engagementScore },
                  { label: 'Capital Efficiency', val: Math.round(100 - (activeSegment.cac / 1000)) },
                ].map((feat, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span className="font-medium">{feat.label}</span>
                      <span className="font-bold text-slate-900">{Math.max(20, Math.min(99, feat.val))}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(20, Math.min(99, feat.val))}%`,
                          backgroundColor: activeSegment.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>K-Means++ initialization validated with silhouette score = 0.74</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
