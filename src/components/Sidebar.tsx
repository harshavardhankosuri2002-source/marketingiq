import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  GitFork,
  DollarSign,
  Sliders,
  Sparkles,
  Upload,
  BookOpen,
  PieChart,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export type NavigationTab =
  | 'overview'
  | 'campaigns'
  | 'customers'
  | 'funnel'
  | 'revenue'
  | 'optimizer'
  | 'simulator'
  | 'recommendations'
  | 'upload'
  | 'methodology';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  datasetName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, datasetName }) => {
  const navSections = [
    {
      title: 'CORE',
      items: [
        { id: 'overview' as NavigationTab, label: 'Overview', icon: LayoutDashboard },
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { id: 'campaigns' as NavigationTab, label: 'Campaign Analytics', icon: BarChart3 },
        { id: 'customers' as NavigationTab, label: 'Customer Intelligence', icon: Users },
        { id: 'funnel' as NavigationTab, label: 'Conversion Funnel', icon: GitFork },
        { id: 'revenue' as NavigationTab, label: 'Revenue Analytics', icon: DollarSign },
      ]
    },
    {
      title: 'OPTIMIZATION',
      items: [
        { id: 'optimizer' as NavigationTab, label: 'Budget Optimizer', icon: Sliders, badge: 'Core' },
        { id: 'simulator' as NavigationTab, label: 'Scenario Simulator', icon: PieChart },
        { id: 'recommendations' as NavigationTab, label: 'AI Recommendations', icon: Sparkles, badge: 'AI' },
      ]
    },
    {
      title: 'DATA & SCIENCE',
      items: [
        { id: 'upload' as NavigationTab, label: 'Upload Data', icon: Upload },
        { id: 'methodology' as NavigationTab, label: 'Methodology', icon: BookOpen },
      ]
    }
  ];

  return (
    <aside className="w-72 bg-navy-950 text-slate-300 border-r border-navy-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 no-print select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-navy-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-iceberg-600 to-iceberg-400 flex items-center justify-center text-white shadow-lg shadow-iceberg-500/20 font-bold text-xl tracking-tight">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-lg tracking-wider">MARKETING</span>
                <span className="text-iceberg-400 font-extrabold text-lg">IQ</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">AI Budget Optimization</p>
            </div>
          </div>
        </div>

        {/* Company Context Badge */}
        <div className="mx-4 my-3 px-3 py-2 rounded-lg bg-navy-900/90 border border-navy-800 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Active Workspace</div>
          <div className="text-white font-medium flex items-center justify-between">
            <span className="truncate">{datasetName}</span>
            <span className="text-[10px] bg-iceberg-500/20 text-iceberg-300 px-1.5 py-0.5 rounded border border-iceberg-500/30">
              B2B
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 py-2 space-y-5 overflow-y-auto max-h-[calc(100vh-220px)]">
          {navSections.map((section, sIdx) => (
            <div key={sIdx}>
              <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-iceberg-600 text-white shadow-md shadow-iceberg-600/30'
                          : 'text-slate-300 hover:text-white hover:bg-navy-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-iceberg-500/15 text-iceberg-400 border border-iceberg-500/20'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-navy-800/80 bg-navy-950/60">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">Observational Model v2.4</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          Predictions are estimates subject to diminishing returns.
        </p>
      </div>
    </aside>
  );
};
