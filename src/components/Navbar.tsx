import React from 'react';
import { NavigationTab } from './Sidebar';
import { ExplanationLevel } from '../engine/analystChatEngine';
import {
  Sparkles,
  Printer,
  RotateCcw,
  HelpCircle,
  Layers,
  Bot,
  MessageSquare,
  Lightbulb
} from 'lucide-react';

interface NavbarProps {
  currentTab: NavigationTab;
  onResetDemo: () => void;
  onOpenLanding: () => void;
  isCustomData: boolean;
  totalRecords: number;
  explanationLevel: ExplanationLevel;
  onExplanationLevelChange: (level: ExplanationLevel) => void;
  onToggleExplainSimply: () => void;
  onOpenChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onResetDemo,
  onOpenLanding,
  isCustomData,
  totalRecords,
  explanationLevel,
  onExplanationLevelChange,
  onToggleExplainSimply,
  onOpenChat,
}) => {
  const tabTitles: Record<NavigationTab, { title: string; subtitle: string }> = {
    overview: { title: 'Executive Overview', subtitle: 'Macro-level marketing ROI, Action Center & predictive revenue' },
    campaigns: { title: 'Campaign Analytics', subtitle: 'Multi-channel attribution, conversion rates & effectiveness score' },
    customers: { title: 'Customer Intelligence', subtitle: 'K-Means clustering, account value tiers & engagement behavior' },
    funnel: { title: 'Conversion Funnel', subtitle: 'End-to-end B2B pipeline conversion, drop-off & commercial bottlenecks' },
    revenue: { title: 'Revenue Analytics', subtitle: 'Multi-dimensional revenue drill-down, contract sizes & deal velocity' },
    optimizer: { title: 'Budget Optimizer', subtitle: 'Where should the next ₹1 crore go? Constrained equimarginal reallocation' },
    simulator: { title: 'Scenario Simulator', subtitle: 'Interactive what-if simulations with 0ms real-time elasticity modeling' },
    recommendations: { title: 'AI Recommendations', subtitle: 'Data-driven reallocation actions with evidence, impact & risk scoring' },
    upload: { title: 'Data Upload & Ingestion', subtitle: 'Upload custom CSV/XLSX with automated schema mapping and health checks' },
    methodology: { title: 'Mathematical Methodology', subtitle: 'Model equations, Hill curves, K-Means clustering & causal limitations' },
  };

  const currentInfo = tabTitles[currentTab] || { title: 'Dashboard', subtitle: '' };

  return (
    <header className="h-18 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {currentInfo.title}
          {currentTab === 'overview' && (
            <span className="text-xs bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded-full border border-rose-200">
              Action Center Live
            </span>
          )}
          {currentTab === 'optimizer' && (
            <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
              Core Engine
            </span>
          )}
        </h1>
        <p className="text-xs text-slate-500 font-normal">{currentInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* "Explain Simply" Mode Button (Requirement 11) */}
        <button
          onClick={onToggleExplainSimply}
          className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
            explanationLevel === 'Beginner'
              ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
          }`}
          title="Explain It to Everyone: Convert metrics into plain business language"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          <span>Explain Simply</span>
        </button>

        {/* Explanation Level Selector (Requirement 12) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 px-1">Mode:</span>
          {(['Executive', 'Manager', 'Analyst', 'Beginner'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => onExplanationLevelChange(lvl)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                explanationLevel === lvl
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Ask Live Analyst Button */}
        <button
          onClick={onOpenChat}
          className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-iceberg-600 hover:bg-iceberg-500 text-white shadow-sm shadow-iceberg-600/30 transition-all group"
        >
          <Bot className="w-4 h-4 text-iceberg-200 group-hover:rotate-12 transition-transform" />
          <span>AI Analyst</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>

        {/* Currency & Records Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{totalRecords.toLocaleString()} Records</span>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-slate-800">₹ INR Format</span>
        </div>

        {/* Reset Demo button if custom data is loaded */}
        {isCustomData ? (
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300"
            title="Reset to Tata Consultancy Services demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        ) : (
          <div className="hidden 2xl:flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            <span className="font-medium text-slate-700">Company:</span>
            <span>TCS Enterprise B2B</span>
          </div>
        )}

        {/* Print / Export Report */}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors shadow-2xs"
          title="Print or Export PDF Report"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Landing Page link */}
        <button
          onClick={onOpenLanding}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Intro</span>
        </button>
      </div>
    </header>
  );
};
