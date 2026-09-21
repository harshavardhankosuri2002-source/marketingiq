import React from 'react';
import { NavigationTab } from './Sidebar';
import {
  Sparkles,
  BarChart3,
  TrendingUp,
  Sliders,
  Upload,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  PieChart
} from 'lucide-react';

interface LandingPageProps {
  onExploreDemo: () => void;
  onUploadData: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExploreDemo, onUploadData }) => {
  return (
    <div className="min-h-screen bg-navy-950 text-white flex flex-col justify-between selection:bg-iceberg-500 selection:text-white">
      {/* Top Bar */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-navy-800/80 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-iceberg-600 to-iceberg-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-iceberg-500/20">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-lg tracking-wider">MARKETING</span>
              <span className="text-iceberg-400 font-extrabold text-lg">IQ</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Enterprise Budget Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onUploadData}
            className="text-xs font-semibold px-4 py-2 rounded-lg border border-navy-700 hover:border-navy-600 text-slate-300 hover:text-white transition-colors"
          >
            Upload Custom Data
          </button>
          <button
            onClick={onExploreDemo}
            className="text-xs font-semibold px-5 py-2.5 rounded-lg bg-iceberg-600 hover:bg-iceberg-500 text-white shadow-md shadow-iceberg-600/30 transition-all flex items-center gap-2 group"
          >
            <span>Explore Demo</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center">
        {/* Enterprise Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-iceberg-500/10 border border-iceberg-500/20 text-iceberg-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-iceberg-400" />
          <span>Production AI Optimization Engine • Default: Tata Consultancy Services (TCS) B2B</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-tight">
          Turn Marketing Spend Into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-iceberg-400 via-sky-300 to-emerald-400">
            Measurable Growth.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mt-6 font-normal leading-relaxed">
          AI-powered campaign intelligence that identifies inefficiencies, predicts performance,
          and answers the definitive executive question: <br className="hidden sm:inline" />
          <span className="font-semibold text-white">
            "Where should your next ₹1 crore of marketing budget go?"
          </span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-iceberg-600 hover:bg-iceberg-500 text-white font-bold text-base shadow-xl shadow-iceberg-600/30 transition-all flex items-center justify-center gap-3 group"
          >
            <span>Explore Demo Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onUploadData}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-navy-900/90 hover:bg-navy-800 text-slate-200 hover:text-white font-semibold text-base border border-navy-700 transition-all flex items-center justify-center gap-2.5"
          >
            <Upload className="w-4 h-4 text-iceberg-400" />
            <span>Upload Your Data (CSV / XLSX)</span>
          </button>
        </div>

        {/* 3 Core Pillar Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          {/* Card 1: Analyze */}
          <div className="p-7 rounded-2xl bg-navy-900/80 border border-navy-800/90 hover:border-iceberg-500/40 transition-all shadow-xl hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-iceberg-500/10 border border-iceberg-500/20 flex items-center justify-center text-iceberg-400 mb-5">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Analyze</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Deep full-funnel diagnostics across 9 enterprise stages (Impressions to Closed Revenue). Identify commercial bottlenecks and K-Means customer segments.
            </p>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>9-Stage Conversion Funnel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>K-Means Customer Intelligence</span>
              </div>
            </div>
          </div>

          {/* Card 2: Predict */}
          <div className="p-7 rounded-2xl bg-navy-900/80 border border-navy-800/90 hover:border-iceberg-500/40 transition-all shadow-xl hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Predict</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Estimate revenue, deal velocity, and campaign effectiveness using transparent weighted CES and S-curve diminishing marginal returns (Hill functions).
            </p>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Marginal ROI (dR/ds) Estimation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Configurable Effectiveness Score (CES)</span>
              </div>
            </div>
          </div>

          {/* Card 3: Optimize */}
          <div className="p-7 rounded-2xl bg-navy-900/80 border border-navy-800/90 hover:border-iceberg-500/40 transition-all shadow-xl hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Optimize</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Solve constrained reallocation under realistic business bounds, strategic locks, and multi-objectives (Max Revenue, Max ROI, Min CAC, or Balanced).
            </p>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Current vs Recommended Allocation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Real-Time Scenario Simulator</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-navy-800/80 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>MarketingIQ Enterprise Intelligence Suite • Built with modern data science principles</span>
        </div>
        <div className="text-slate-400">
          Observational econometric modeling. Estimates reflect non-linear diminishing returns.
        </div>
      </footer>
    </div>
  );
};
