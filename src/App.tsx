import React, { useState, useMemo } from 'react';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { OverviewView } from './components/OverviewView';
import { CampaignAnalyticsView } from './components/CampaignAnalyticsView';
import { CustomerIntelligenceView } from './components/CustomerIntelligenceView';
import { ConversionFunnelView } from './components/ConversionFunnelView';
import { RevenueAnalyticsView } from './components/RevenueAnalyticsView';
import { BudgetOptimizerView } from './components/BudgetOptimizerView';
import { ScenarioSimulatorView } from './components/ScenarioSimulatorView';
import { RecommendationsView } from './components/RecommendationsView';
import { DataUploadView } from './components/DataUploadView';
import { MethodologyView } from './components/MethodologyView';
import { ChatbotPanel } from './components/ChatbotPanel';

import { CampaignRecord } from './engine/types';
import { generateTCSDemoData } from './engine/dataGenerator';
import {
  aggregateByChannel,
  computeOverviewKPIs,
  computeFunnelStages,
  generateExecutiveSummary
} from './engine/analytics';
import { runCustomerKMeans } from './engine/kMeans';
import { computeMarginalCurves, computeUnderInvestmentScores } from './engine/marginalReturnModel';
import { runBudgetOptimization } from './engine/budgetOptimizer';
import { generateAIRecommendations } from './engine/recommendationEngine';
import { getModelFeatureImportance } from './engine/featureImportance';
import { generateActionableInsights } from './engine/insightsEngine';
import { MarketingAnalystEngine, ExplanationLevel } from './engine/analystChatEngine';

export const App: React.FC = () => {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [showLanding, setShowLanding] = useState<boolean>(false);

  // Explanation Level & Chatbot State (Requirements 11, 12)
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>('Manager');
  const [analystInitialQuestion, setAnalystInitialQuestion] = useState<string>('');
  const [prefilledSimulatorShift, setPrefilledSimulatorShift] = useState<{
    channel: string;
    deltaSpend: number;
    targetSpend: number;
  } | null>(null);

  // Dataset State (Default: TCS Demo Data ~2,400 rows)
  const [datasetName, setDatasetName] = useState<string>('Tata Consultancy Services (TCS)');
  const [isCustomData, setIsCustomData] = useState<boolean>(false);
  const [records, setRecords] = useState<CampaignRecord[]>(() => generateTCSDemoData(2400));

  // Analytics & ML calculations (Recalculated automatically when records change)
  const channels = useMemo(() => aggregateByChannel(records), [records]);
  const overviewKPIs = useMemo(() => computeOverviewKPIs(records), [records]);
  const executiveSummary = useMemo(() => generateExecutiveSummary(channels, overviewKPIs), [channels, overviewKPIs]);
  const funnelStages = useMemo(() => computeFunnelStages(records), [records]);
  const customerSegments = useMemo(() => runCustomerKMeans(records, 4), [records]);
  const marginalCurves = useMemo(() => computeMarginalCurves(channels, records), [channels, records]);
  const underInvestmentScores = useMemo(() => computeUnderInvestmentScores(channels, marginalCurves), [channels, marginalCurves]);

  // Baseline Optimization Result
  const baselineOptResult = useMemo(() => {
    return runBudgetOptimization(channels, marginalCurves, {
      totalBudget: 10000000, // ₹1.00 Cr
      objective: 'BALANCED',
      channelMinSpend: {},
      channelMaxSpend: {},
      strategicLocks: [
        {
          campaignOrChannel: 'Executive Events & Roundtables',
          minSpend: 1500000,
          reason: 'Strategic enterprise presence',
          locked: true
        }
      ]
    });
  }, [channels, marginalCurves]);

  const recommendations = useMemo(() => {
    return generateAIRecommendations(channels, underInvestmentScores, baselineOptResult);
  }, [channels, underInvestmentScores, baselineOptResult]);

  const featureImportance = useMemo(() => getModelFeatureImportance(), []);

  // Actionable Insights Engine (Requirement 1)
  const actionableInsights = useMemo(() => {
    return generateActionableInsights(
      records,
      channels,
      overviewKPIs,
      funnelStages,
      customerSegments,
      marginalCurves,
      underInvestmentScores,
      baselineOptResult
    );
  }, [
    records,
    channels,
    overviewKPIs,
    funnelStages,
    customerSegments,
    marginalCurves,
    underInvestmentScores,
    baselineOptResult
  ]);

  // Live AI Marketing Analyst Engine (Requirement 5)
  const analystEngine = useMemo(() => {
    const eng = new MarketingAnalystEngine(
      records,
      channels,
      overviewKPIs,
      funnelStages,
      customerSegments,
      marginalCurves,
      underInvestmentScores,
      baselineOptResult
    );
    eng.setExplanationLevel(explanationLevel);
    return eng;
  }, [
    records,
    channels,
    overviewKPIs,
    funnelStages,
    customerSegments,
    marginalCurves,
    underInvestmentScores,
    baselineOptResult
  ]);

  // Keep engine explanation level synchronized
  React.useEffect(() => {
    analystEngine.setExplanationLevel(explanationLevel);
  }, [explanationLevel, analystEngine]);

  // Handlers
  const handleResetDemo = () => {
    const demoData = generateTCSDemoData(2400);
    setRecords(demoData);
    setDatasetName('Tata Consultancy Services (TCS)');
    setIsCustomData(false);
  };

  const handleDatasetLoaded = (newRecords: CampaignRecord[], newName: string) => {
    setRecords(newRecords);
    setDatasetName(newName);
    setIsCustomData(true);
    setCurrentTab('overview');
  };

  const handleApplyToSimulator = (shift: { channel: string; deltaSpend: number; targetSpend: number }) => {
    setPrefilledSimulatorShift(shift);
    setCurrentTab('simulator');
  };

  const handleAskAnalyst = (question: string) => {
    setAnalystInitialQuestion(question);
  };

  const handleToggleExplainSimply = () => {
    const nextLevel: ExplanationLevel = explanationLevel === 'Beginner' ? 'Manager' : 'Beginner';
    setExplanationLevel(nextLevel);
    analystEngine.setExplanationLevel(nextLevel);
  };

  const handleApplySimulatorPayload = (payload: any) => {
    if (payload && payload.targetChannel && payload.delta) {
      const currentSpend = channels.find(c => c.channel === payload.targetChannel)?.spend || 2000000;
      setPrefilledSimulatorShift({
        channel: payload.targetChannel,
        deltaSpend: payload.delta,
        targetSpend: currentSpend + payload.delta
      });
      setCurrentTab('simulator');
    }
  };

  if (showLanding) {
    return (
      <LandingPage
        onExploreDemo={() => {
          setShowLanding(false);
          setCurrentTab('overview');
        }}
        onUploadData={() => {
          setShowLanding(false);
          setCurrentTab('upload');
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        datasetName={datasetName}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          currentTab={currentTab}
          onResetDemo={handleResetDemo}
          onOpenLanding={() => setShowLanding(true)}
          isCustomData={isCustomData}
          totalRecords={records.length}
          explanationLevel={explanationLevel}
          onExplanationLevelChange={(lvl) => setExplanationLevel(lvl)}
          onToggleExplainSimply={handleToggleExplainSimply}
          onOpenChat={() => setAnalystInitialQuestion('What should I do next?')}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <OverviewView
              kpis={overviewKPIs}
              channels={channels}
              executiveSummary={executiveSummary}
              insights={actionableInsights}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onApplyToSimulator={handleApplyToSimulator}
              onAskAnalyst={handleAskAnalyst}
            />
          )}

          {currentTab === 'campaigns' && (
            <CampaignAnalyticsView records={records} />
          )}

          {currentTab === 'customers' && (
            <CustomerIntelligenceView segments={customerSegments} />
          )}

          {currentTab === 'funnel' && (
            <ConversionFunnelView stages={funnelStages} />
          )}

          {currentTab === 'revenue' && (
            <RevenueAnalyticsView records={records} />
          )}

          {currentTab === 'optimizer' && (
            <BudgetOptimizerView
              channels={channels}
              curves={marginalCurves}
              onApplyToSimulator={(budget) => {
                setCurrentTab('simulator');
              }}
            />
          )}

          {currentTab === 'simulator' && (
            <ScenarioSimulatorView
              channels={channels}
              curves={marginalCurves}
              prefilledShift={prefilledSimulatorShift}
              onClearPrefilledShift={() => setPrefilledSimulatorShift(null)}
            />
          )}

          {currentTab === 'recommendations' && (
            <RecommendationsView
              recommendations={recommendations}
              underInvestmentScores={underInvestmentScores}
              featureImportance={featureImportance}
            />
          )}

          {currentTab === 'upload' && (
            <DataUploadView onDatasetLoaded={handleDatasetLoaded} />
          )}

          {currentTab === 'methodology' && (
            <MethodologyView />
          )}
        </main>
      </div>

      {/* Persistent Live AI Marketing Analyst Chatbot Drawer (Requirement 5 & 6) */}
      <ChatbotPanel
        engine={analystEngine}
        onNavigateTab={(tab) => setCurrentTab(tab)}
        onApplySimulatorPayload={handleApplySimulatorPayload}
        externalInitialQuestion={analystInitialQuestion}
        onClearInitialQuestion={() => setAnalystInitialQuestion('')}
      />
    </div>
  );
};
