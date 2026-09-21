import React, { useState, useMemo } from 'react';
import { CampaignRecord, CESWeights, CampaignCES } from '../engine/types';
import { computeCampaignCES, DEFAULT_CES_WEIGHTS } from '../engine/effectivenessModel';
import { formatINR, formatNumberIndian, formatPercent, formatROI } from '../engine/formatters';
import {
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Info,
  TrendingUp,
  Award,
  Layers,
  BarChart2
} from 'lucide-react';

interface CampaignAnalyticsViewProps {
  records: CampaignRecord[];
}

export const CampaignAnalyticsView: React.FC<CampaignAnalyticsViewProps> = ({ records }) => {
  // 8 Filters
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedGeo, setSelectedGeo] = useState<string>('ALL');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ALL');
  const [selectedObjective, setSelectedObjective] = useState<string>('ALL');

  // CES weights state
  const [cesWeights, setCesWeights] = useState<CESWeights>(DEFAULT_CES_WEIGHTS);
  const [showWeightModal, setShowWeightModal] = useState<boolean>(false);

  // Extract unique filter options
  const filterOptions = useMemo(() => {
    const months = Array.from(new Set(records.map(r => r.month))).sort();
    const channels = Array.from(new Set(records.map(r => r.channel))).sort();
    const campaigns = Array.from(new Set(records.map(r => r.campaignName))).sort();
    const types = Array.from(new Set(records.map(r => r.campaignType))).sort();
    const geos = Array.from(new Set(records.map(r => r.geography))).sort();
    const segments = Array.from(new Set(records.map(r => r.customerSegment))).sort();
    const industries = Array.from(new Set(records.map(r => r.industry))).sort();
    const objectives = Array.from(new Set(records.map(r => r.campaignObjective))).sort();
    return { months, channels, campaigns, types, geos, segments, industries, objectives };
  }, [records]);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedMonth !== 'ALL' && r.month !== selectedMonth) return false;
      if (selectedChannel !== 'ALL' && r.channel !== selectedChannel) return false;
      if (selectedCampaign !== 'ALL' && r.campaignName !== selectedCampaign) return false;
      if (selectedType !== 'ALL' && r.campaignType !== selectedType) return false;
      if (selectedGeo !== 'ALL' && r.geography !== selectedGeo) return false;
      if (selectedSegment !== 'ALL' && r.customerSegment !== selectedSegment) return false;
      if (selectedIndustry !== 'ALL' && r.industry !== selectedIndustry) return false;
      if (selectedObjective !== 'ALL' && r.campaignObjective !== selectedObjective) return false;
      return true;
    });
  }, [
    records,
    selectedMonth,
    selectedChannel,
    selectedCampaign,
    selectedType,
    selectedGeo,
    selectedSegment,
    selectedIndustry,
    selectedObjective
  ]);

  const resetFilters = () => {
    setSelectedMonth('ALL');
    setSelectedChannel('ALL');
    setSelectedCampaign('ALL');
    setSelectedType('ALL');
    setSelectedGeo('ALL');
    setSelectedSegment('ALL');
    setSelectedIndustry('ALL');
    setSelectedObjective('ALL');
  };

  // 11 KPIs
  const kpis = useMemo(() => {
    const sum = (key: keyof CampaignRecord) =>
      filteredRecords.reduce((acc, r) => acc + (typeof r[key] === 'number' ? (r[key] as number) : 0), 0);

    const spend = sum('spend');
    const impressions = sum('impressions');
    const clicks = sum('clicks');
    const leads = sum('leads');
    const mqls = sum('mqls');
    const sqls = sum('sqls');
    const opportunities = sum('opportunities');
    const conversions = sum('contracts');
    const revenue = sum('revenue');
    const roi = spend > 0 ? Number((revenue / spend).toFixed(2)) : 0;
    const cac = conversions > 0 ? Math.round(spend / conversions) : spend;

    return {
      spend,
      impressions,
      clicks,
      leads,
      mqls,
      sqls,
      opportunities,
      conversions,
      revenue,
      roi,
      cac,
    };
  }, [filteredRecords]);

  // CES computation
  const cesResults = useMemo(() => {
    return computeCampaignCES(filteredRecords, cesWeights);
  }, [filteredRecords, cesWeights]);

  // Aggregate channel metrics for charts
  const channelData = useMemo(() => {
    const map = new Map<string, { spend: number; revenue: number; leads: number; contracts: number }>();
    filteredRecords.forEach(r => {
      const existing = map.get(r.channel) || { spend: 0, revenue: 0, leads: 0, contracts: 0 };
      existing.spend += r.spend;
      existing.revenue += r.revenue;
      existing.leads += r.leads;
      existing.contracts += r.contracts;
      map.set(r.channel, existing);
    });
    return Array.from(map.entries()).map(([channel, d]) => ({
      channel,
      spend: d.spend,
      revenue: d.revenue,
      roi: d.spend > 0 ? Number((d.revenue / d.spend).toFixed(2)) : 0,
      convRate: d.leads > 0 ? Number(((d.contracts / d.leads) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredRecords]);

  // Monthly trends
  const monthlyTrends = useMemo(() => {
    const map = new Map<string, { spend: number; revenue: number; deals: number }>();
    filteredRecords.forEach(r => {
      const existing = map.get(r.month) || { spend: 0, revenue: 0, deals: 0 };
      existing.spend += r.spend;
      existing.revenue += r.revenue;
      existing.deals += r.contracts;
      map.set(r.month, existing);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, d]) => ({ month, ...d }));
  }, [filteredRecords]);

  // Top campaigns by revenue and CAC
  const topCampaignsByRevenue = useMemo(() => {
    const map = new Map<string, { spend: number; revenue: number; contracts: number }>();
    filteredRecords.forEach(r => {
      const existing = map.get(r.campaignName) || { spend: 0, revenue: 0, contracts: 0 };
      existing.spend += r.spend;
      existing.revenue += r.revenue;
      existing.contracts += r.contracts;
      map.set(r.campaignName, existing);
    });
    return Array.from(map.entries()).map(([name, d]) => ({
      name,
      spend: d.spend,
      revenue: d.revenue,
      cac: d.contracts > 0 ? Math.round(d.spend / d.contracts) : d.spend,
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [filteredRecords]);

  return (
    <div className="space-y-8 pb-12">
      {/* Filters Bar (Requirement 9: 8 Filters) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Filter className="w-4 h-4 text-iceberg-600" />
            <span>Multi-Dimensional Filters ({filteredRecords.length} / {records.length} records)</span>
          </div>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* 1. Date/Month */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-iceberg-500 text-slate-800"
            >
              <option value="ALL">All Months</option>
              {filterOptions.months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* 2. Channel */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Channel</label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-iceberg-500 text-slate-800"
            >
              <option value="ALL">All Channels</option>
              {filterOptions.channels.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* 3. Campaign */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Campaign</label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-iceberg-500 text-slate-800"
            >
              <option value="ALL">All Campaigns</option>
              {filterOptions.campaigns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* 4. Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-iceberg-500 text-slate-800"
            >
              <option value="ALL">All Types</option>
              {filterOptions.types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* 5. Geography */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Geography</label>
            <select
              value={selectedGeo}
              onChange={(e) => setSelectedGeo(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-iceberg-500 text-slate-800"
            >
              <option value="ALL">All Geographies</option>
              {filterOptions.geos.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* 6. Customer Segment */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Segment</label>
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-iceberg-500 text-slate-800"
            >
              <option value="ALL">All Segments</option>
              {filterOptions.segments.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* 7. Industry */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Industry</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-iceberg-500 text-slate-800"
            >
              <option value="ALL">All Industries</option>
              {filterOptions.industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          {/* 8. Objective */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Objective</label>
            <select
              value={selectedObjective}
              onChange={(e) => setSelectedObjective(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-iceberg-500 text-slate-800"
            >
              <option value="ALL">All Objectives</option>
              {filterOptions.objectives.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 11 KPI Cards (Requirement 9) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700 tracking-tight">Campaign Funnel & Efficiency Metrics</h3>
          <span className="text-xs text-slate-500">11 Full-Funnel Indicators</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-11 gap-3">
          {[
            { label: 'Spend', val: formatINR(kpis.spend), sub: 'Deployed' },
            { label: 'Impressions', val: formatNumberIndian(kpis.impressions), sub: 'Total Views' },
            { label: 'Clicks', val: formatNumberIndian(kpis.clicks), sub: 'Traffic' },
            { label: 'Leads', val: formatNumberIndian(kpis.leads), sub: 'Inquiries' },
            { label: 'MQLs', val: formatNumberIndian(kpis.mqls), sub: 'Marketing Qual' },
            { label: 'SQLs', val: formatNumberIndian(kpis.sqls), sub: 'Sales Qual' },
            { label: 'Opps', val: formatNumberIndian(kpis.opportunities), sub: 'Pipeline' },
            { label: 'Deals Won', val: formatNumberIndian(kpis.conversions), sub: 'Contracts' },
            { label: 'Revenue', val: formatINR(kpis.revenue), sub: 'Closed Contract' },
            { label: 'ROI', val: formatROI(kpis.roi), sub: 'Efficiency' },
            { label: 'CAC', val: formatINR(kpis.cac), sub: 'Cost / Won' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate mb-1">{item.label}</div>
              <div className="text-base font-extrabold text-slate-900 tracking-tight truncate">{item.val}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 7 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Spend vs Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">1. Spend vs Revenue by Channel</h4>
              <p className="text-xs text-slate-500">Capital deployed vs closed contract value</p>
            </div>
          </div>
          <div className="space-y-4">
            {channelData.map((ch, idx) => {
              const maxVal = Math.max(...channelData.map(c => c.revenue), 1);
              const revWidth = (ch.revenue / maxVal) * 100;
              const spendWidth = (ch.spend / maxVal) * 100;

              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium text-slate-700">
                    <span className="font-semibold text-slate-900">{ch.channel}</span>
                    <span className="text-slate-500">Rev: {formatINR(ch.revenue)} | Spend: {formatINR(ch.spend)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex gap-0.5">
                    <div className="bg-emerald-500 h-full rounded-l-full transition-all" style={{ width: `${revWidth}%` }} title={`Revenue: ${formatINR(ch.revenue)}`}></div>
                    <div className="bg-blue-400 h-full transition-all" style={{ width: `${spendWidth}%` }} title={`Spend: ${formatINR(ch.spend)}`}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span>Revenue</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span><span>Spend</span></div>
          </div>
        </div>

        {/* Chart 2 & 3: ROI and Conversion Rate by Channel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">2 & 3. ROI & Conversion Rate by Channel</h4>
              <p className="text-xs text-slate-500">Capital yield multiple vs lead-to-contract closure rate</p>
            </div>
          </div>
          <div className="space-y-4">
            {channelData.map((ch, idx) => {
              const maxRoi = Math.max(...channelData.map(c => c.roi), 1);
              const roiWidth = (ch.roi / maxRoi) * 100;

              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-800 font-semibold">{ch.channel}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-700 font-bold">{formatROI(ch.roi)} ROI</span>
                      <span className="text-slate-500">({formatPercent(ch.convRate)} Conv)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-iceberg-500 h-full rounded-full transition-all" style={{ width: `${roiWidth}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: CAC by Top Campaigns */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">4. CAC by Top Campaigns</h4>
              <p className="text-xs text-slate-500">Lower CAC reflects higher acquisition efficiency</p>
            </div>
          </div>
          <div className="space-y-3">
            {topCampaignsByRevenue.map((c, idx) => {
              const maxCac = Math.max(...topCampaignsByRevenue.map(item => item.cac), 1);
              const cacWidth = (c.cac / maxCac) * 100;

              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span className="font-medium truncate max-w-[200px]">{c.name}</span>
                    <span className="font-bold text-slate-900">{formatINR(c.cac)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${cacWidth}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 5: Revenue by Top Campaigns */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">5. Revenue by Top Campaigns</h4>
              <p className="text-xs text-slate-500">Highest gross enterprise revenue contributors</p>
            </div>
          </div>
          <div className="space-y-3">
            {topCampaignsByRevenue.map((c, idx) => {
              const maxRev = Math.max(...topCampaignsByRevenue.map(item => item.revenue), 1);
              const revWidth = (c.revenue / maxRev) * 100;

              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span className="font-medium truncate max-w-[200px]">{c.name}</span>
                    <span className="font-bold text-emerald-700">{formatINR(c.revenue)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${revWidth}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 6: Campaign Effectiveness Score (CES) Engine (Requirement 10) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">6. Campaign Effectiveness Score (CES: 0–100)</h4>
                <span className="text-xs bg-iceberg-100 text-iceberg-800 font-semibold px-2 py-0.5 rounded">
                  Transparent Formula
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                CES = {Math.round(cesWeights.roi * 100)}% ROI + {Math.round(cesWeights.conversionRate * 100)}% Conv + {Math.round(cesWeights.revenueShare * 100)}% Rev + {Math.round(cesWeights.leadQuality * 100)}% Lead Quality + {Math.round(cesWeights.cacEfficiency * 100)}% CAC
              </p>
            </div>

            <button
              onClick={() => setShowWeightModal(!showWeightModal)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 self-start"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showWeightModal ? 'Hide Weight Sliders' : 'Adjust Formula Weights'}</span>
            </button>
          </div>

          {/* Weight Sliders Drawer */}
          {showWeightModal && (
            <div className="p-4 mb-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-700 mb-2">Configure Effectiveness Weights (Auto-normalized)</div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {[
                  { key: 'roi' as keyof CESWeights, label: 'ROI Weight', val: cesWeights.roi },
                  { key: 'conversionRate' as keyof CESWeights, label: 'Conversion Rate', val: cesWeights.conversionRate },
                  { key: 'revenueShare' as keyof CESWeights, label: 'Revenue Share', val: cesWeights.revenueShare },
                  { key: 'leadQuality' as keyof CESWeights, label: 'Lead Quality', val: cesWeights.leadQuality },
                  { key: 'cacEfficiency' as keyof CESWeights, label: 'CAC Efficiency', val: cesWeights.cacEfficiency },
                ].map(w => (
                  <div key={w.key} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium text-slate-600">
                      <span>{w.label}</span>
                      <span className="font-bold text-slate-900">{Math.round(w.val * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.50"
                      step="0.05"
                      value={w.val}
                      onChange={(e) => setCesWeights({ ...cesWeights, [w.key]: parseFloat(e.target.value) })}
                      className="w-full accent-iceberg-600 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CES Table */}
          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-semibold sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Campaign</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">CES Score</th>
                  <th className="py-2.5 px-3">Tier</th>
                  <th className="py-2.5 px-3">ROI Score</th>
                  <th className="py-2.5 px-3">Conv Score</th>
                  <th className="py-2.5 px-3">Lead Q Score</th>
                  <th className="py-2.5 px-3">CAC Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {cesResults.slice(0, 10).map((ces, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{ces.campaignName}</td>
                    <td className="py-2.5 px-3 text-slate-500">{ces.channel}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-sm font-extrabold text-slate-900">{ces.score}</span> / 100
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ces.tier === 'Top Tier' ? 'bg-emerald-100 text-emerald-800' :
                        ces.tier === 'High Performer' ? 'bg-blue-100 text-blue-800' :
                        ces.tier === 'Moderate' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ces.tier}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{ces.roiScore}</td>
                    <td className="py-2.5 px-3">{ces.conversionScore}</td>
                    <td className="py-2.5 px-3">{ces.leadQualityScore}</td>
                    <td className="py-2.5 px-3">{ces.cacScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart 7: Monthly Campaign Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">7. Monthly Campaign Spend & Closed Contract Trend</h4>
              <p className="text-xs text-slate-500">12-month longitudinal trend of marketing expenditure vs closed deals</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-12 gap-2 text-center">
            {monthlyTrends.map((m, idx) => {
              const maxRev = Math.max(...monthlyTrends.map(t => t.revenue), 1);
              const heightPct = Math.max(15, Math.round((m.revenue / maxRev) * 100));

              return (
                <div key={idx} className="flex flex-col items-center justify-end h-44 p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-emerald-700">{formatINR(m.revenue, { compact: true })}</div>
                  <div className="w-full bg-slate-200 rounded-t-lg my-1 flex flex-col justify-end" style={{ height: `${heightPct}%` }}>
                    <div className="w-full bg-gradient-to-t from-iceberg-600 to-iceberg-400 rounded-t-lg h-full"></div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-700">{m.month.split('-')[1]}/{m.month.split('-')[0].substring(2)}</div>
                  <div className="text-[9px] text-slate-400">{m.deals} deals</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
