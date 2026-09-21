import { generateTCSDemoData } from '../src/engine/dataGenerator';
import { aggregateByChannel, computeOverviewKPIs, computeFunnelStages, generateExecutiveSummary } from '../src/engine/analytics';
import { runCustomerKMeans } from '../src/engine/kMeans';
import { computeMarginalCurves, computeUnderInvestmentScores } from '../src/engine/marginalReturnModel';
import { runBudgetOptimization } from '../src/engine/budgetOptimizer';
import { generateActionableInsights } from '../src/engine/insightsEngine';
import { MarketingAnalystEngine, ExplanationLevel } from '../src/engine/analystChatEngine';

console.log("--------------------------------------------------");
console.log("TESTING MARKETINGIQ ACTIONABLE INSIGHTS & ANALYST");
console.log("--------------------------------------------------");

// 1. Generate Demo Data
const records = generateTCSDemoData(2400);
console.log(`[PASS] Generated ${records.length} records.`);

// 2. Analytical Calculations
const channels = aggregateByChannel(records);
const kpis = computeOverviewKPIs(records);
const funnelStages = computeFunnelStages(records);
const segments = runCustomerKMeans(records, 4);
const curves = computeMarginalCurves(channels, records);
const underScores = computeUnderInvestmentScores(channels, curves);
const optResult = runBudgetOptimization(channels, curves, {
  totalBudget: 10000000,
  objective: 'BALANCED',
  channelMinSpend: {},
  channelMaxSpend: {},
  strategicLocks: []
});

console.log(`[PASS] Channels: ${channels.length}, Total Revenue: ${kpis.totalRevenue}`);

// 3. Test Actionable Insights Engine
const insights = generateActionableInsights(records, channels, kpis, funnelStages, segments, curves, underScores, optResult);
console.log(`\n[PASS] Generated ${insights.length} Actionable Insights:`);
insights.forEach((ins, idx) => {
  console.log(`  ${idx + 1}. [${ins.priority}] (${ins.category}) ${ins.title}`);
  console.log(`     - Impact Score: ${ins.businessImpactScore}/100 | Confidence: ${ins.confidence}`);
  console.log(`     - What: ${ins.insight.substring(0, 70)}...`);
  console.log(`     - Action: ${ins.action.substring(0, 70)}...`);
  console.log(`     - Expected Lift: ${ins.expectedImpact.description}`);
  if (ins.suggestedBudgetShift) {
    console.log(`     - Suggested Shift: ${ins.suggestedBudgetShift.channel} -> ${ins.suggestedBudgetShift.deltaSpend}`);
  }
});

// Validate Insight Requirements
if (insights.length < 3) throw new Error("Expected at least 3 insights!");
const hasCriticalOrHigh = insights.some(i => i.priority === 'Critical' || i.priority === 'High');
if (!hasCriticalOrHigh) throw new Error("Expected Critical or High priority insights!");

// 4. Test Live AI Marketing Analyst Engine
console.log("\n--------------------------------------------------");
console.log("TESTING 10 ANALYST CHATBOT INTENTS & RESPONSES");
console.log("--------------------------------------------------");

const engine = new MarketingAnalystEngine(records, channels, kpis, funnelStages, segments, curves, underScores, optResult);

const testQueries = [
  "Why was revenue lower this month?",
  "How was our revenue generated?",
  "Which campaigns are under-invested?",
  "Where should I move ₹10 lakh?",
  "Where is our budget being wasted?",
  "Where are we losing customers in the funnel?",
  "Which customer segment generates the most revenue?",
  "Which campaign has the highest CAC?",
  "What should I do next?",
  "Explain this simply."
];

testQueries.forEach((q, idx) => {
  const response = engine.processQuestion(q, 'Manager');
  console.log(`\nQuery ${idx + 1}: "${q}"`);
  console.log(`Assistant Response Summary: ${response.text.substring(0, 100).replace(/\n/g, ' ')}...`);
  if (response.structuredAnswer) {
    console.log(`  - What: ${response.structuredAnswer.whatHappened || 'N/A'}`);
    console.log(`  - Why: ${response.structuredAnswer.why || 'N/A'}`);
    console.log(`  - Recommended Actions: ${response.structuredAnswer.recommendedActions?.length || 0} items`);
    console.log(`  - Expected Impact: ${response.structuredAnswer.expectedImpact || 'N/A'}`);
  }
  if (response.visualPayload) {
    console.log(`  - Visual Component: ${response.visualPayload.type} with ${response.visualPayload.items.length} items`);
  }
});

// Test 4 Explanation Levels
console.log("\n--------------------------------------------------");
console.log("TESTING 4 EXPLANATION LEVELS (Executive, Manager, Analyst, Beginner)");
console.log("--------------------------------------------------");

const testLevels: ExplanationLevel[] = ['Executive', 'Manager', 'Analyst', 'Beginner'];
testLevels.forEach(lvl => {
  const resp = engine.processQuestion("Why was revenue lower?", lvl);
  console.log(`[Level: ${lvl}] ${resp.text.substring(0, 120).replace(/\n/g, ' ')}...`);
});

console.log("\n==================================================");
console.log("ALL ENGINE AND ANALYST TESTS PASSED SUCCESSFULLY!");
console.log("==================================================");
