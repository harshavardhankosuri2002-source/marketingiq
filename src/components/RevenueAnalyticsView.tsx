import React, { useState, useMemo } from 'react';
import { CampaignRecord } from '../engine/types';
import { formatINR, formatNumberIndian, formatPercent, formatROI } from '../engine/formatters';
import {
  DollarSign,
  TrendingUp,
  PieChart,
  Layers,
  MapPin,
  Building2,
  Calendar,
  Briefcase
} from 'lucide-react';

interface RevenueAnalyticsViewProps {
  records: CampaignRecord[];
}

type DrilldownDim = 'channel' | 'serviceCategory' | 'customerSegment' | 'geography' | 'industry' | 'campaignName';

export const RevenueAnalyticsView: React.FC<RevenueAnalyticsViewProps> = ({ records }) => {
  const [activeDim, setActiveDim] = useState<DrilldownDim>('channel');

  // Overall totals
  const totalRevenue = useMemo(() => records.reduce((s, r) => s + r.revenue, 0), [records]);
  const totalSpend = useMemo(() => records.reduce((s, r) => s + r.spend, 0), [records]);
  const totalContracts = useMemo(() => records.reduce((s, r) => s + r.contracts, 0), [records]);
  const avgDealValue = totalContracts > 0 ? Math.round(totalRevenue / totalContracts) : 0;
  const revPerRupee = totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0;
  const estimatedCLV = Math.round(avgDealValue * 2.85);

  // Group by active dimension
  const dimData = useMemo(() => {
    const map = new Map<string, { revenue: number; spend: number; contracts: number }>();

    records.forEach(r => {
      const key = (r[activeDim] as string) || 'Other';
      const existing = map.get(key) || { revenue: 0, spend: 0, contracts: 0 };
      existing.revenue += r.revenue;
      existing.spend += r.spend;
      existing.contracts += r.contracts;
      map.set(key, existing);
    });

    let runningShare = 0;
    return Array.from(map.entries())
      .map(([name, d]) => ({
        name,
        revenue: d.revenue,
        spend: d.spend,
        contracts: d.contracts,
        roi: d.spend > 0 ? Number((d.revenue / d.spend).toFixed(2)) : 0,
        share: totalRevenue > 0 ? (d.revenue / totalRevenue) * 100 : 0,
        avgDeal: d.contracts > 0 ? Math.round(d.revenue / d.contracts) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .map(item => {
        runningShare += item.share;
        return { ...item, cumulativeShare: Math.min(100, Number(runningShare.toFixed(1))) };
      });
  }, [records, activeDim, totalRevenue]);

  const dimensionTabs: { id: DrilldownDim; label: string; icon: any }[] = [
    { id: 'channel', label: 'By Channel', icon: Layers },
    { id: 'serviceCategory', label: 'By Service Category', icon: Briefcase },
    { id: 'customerSegment', label: 'By Customer Segment', icon: PieChart },
    { id: 'geography', label: 'By Geography', icon: MapPin },
    { id: 'industry', label: 'By Industry', icon: Building2 },
    { id: 'campaignName', label: 'By Campaign', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Macro KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Closed Revenue</div>
          <div className="text-2xl font-extrabold text-slate-900">{formatINR(totalRevenue)}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Across {totalContracts} closed enterprise contracts</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Revenue Per Marketing Rupee</div>
          <div className="text-2xl font-extrabold text-indigo-700">{formatROI(revPerRupee)}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Gross capital productivity</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Average Contract Deal Value</div>
          <div className="text-2xl font-extrabold text-slate-900">{formatINR(avgDealValue)}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Mean commercial deal size</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Estimated Customer Lifetime Value</div>
          <div className="text-2xl font-extrabold text-emerald-700">{formatINR(estimatedCLV)}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">3-year recurring retention multiplier</div>
        </div>
      </div>

      {/* Interactive Drilldown Tabs & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Multi-Dimensional Revenue Drill-Down</h3>
            <p className="text-xs text-slate-500">Explore Pareto revenue distribution, contract counts, and deal sizes</p>
          </div>

          {/* Dimension Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {dimensionTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeDim === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveDim(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drill-down Table with Pareto Share */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Segment / Category</th>
                <th className="py-3 px-4">Gross Revenue</th>
                <th className="py-3 px-4">Revenue Contribution</th>
                <th className="py-3 px-4">Cumulative (Pareto)</th>
                <th className="py-3 px-4">Spend</th>
                <th className="py-3 px-4">ROI</th>
                <th className="py-3 px-4">Deals Won</th>
                <th className="py-3 px-4">Avg Deal Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {dimData.map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{d.name}</td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">{formatINR(d.revenue)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${d.share}%` }}></div>
                      </div>
                      <span className="font-semibold text-slate-700">{formatPercent(d.share)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-500">{formatPercent(d.cumulativeShare)}</td>
                  <td className="py-3 px-4">{formatINR(d.spend)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      d.roi >= 3.0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {formatROI(d.roi)}
                    </span>
                  </td>
                  <td className="py-3 px-4">{d.contracts}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{formatINR(d.avgDeal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
