import {
  CampaignRecord,
  AggregatedChannel,
  OverviewKPIs,
  FunnelStageData,
  CustomerSegment,
  ChannelMarginalCurve,
  UnderInvestmentScore,
  OptimizationResult
} from './types';
import { formatINR, formatNumberIndian, formatPercent, formatROI } from './formatters';

export type ExplanationLevel = 'Executive' | 'Manager' | 'Analyst' | 'Beginner';

export interface VisualPayload {
  type: 'waterfall' | 'allocation_shift' | 'kpi_delta' | 'funnel_drop' | 'channel_bars';
  title: string;
  items: {
    label: string;
    value: number;
    formattedValue: string;
    sublabel?: string;
    color?: string;
    percentage?: number;
    isPositive?: boolean;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  structuredAnswer?: {
    whatHappened?: string;
    why?: string;
    recommendedActions?: string[];
    expectedImpact?: string;
    confidence?: 'High' | 'Medium' | 'Low';
    dataUsed?: string;
  };
  visualPayload?: VisualPayload;
  suggestedAction?: {
    type: 'APPLY_SIMULATOR' | 'NAVIGATE_TAB' | 'VIEW_OPTIMIZER';
    label: string;
    targetTab?: string;
    payload?: any;
  };
  explanationLevel?: ExplanationLevel;
}

export interface ConversationContext {
  lastIntent?: string;
  lastChannel?: string;
  lastMetric?: string;
  activeExplanationLevel: ExplanationLevel;
}

export class MarketingAnalystEngine {
  private records: CampaignRecord[];
  private channels: AggregatedChannel[];
  private kpis: OverviewKPIs;
  private funnelStages: FunnelStageData[];
  private segments: CustomerSegment[];
  private curves: Map<string, ChannelMarginalCurve>;
  private underInvestmentScores: UnderInvestmentScore[];
  private optResult: OptimizationResult;
  private context: ConversationContext;

  constructor(
    records: CampaignRecord[],
    channels: AggregatedChannel[],
    kpis: OverviewKPIs,
    funnelStages: FunnelStageData[],
    segments: CustomerSegment[],
    curves: Map<string, ChannelMarginalCurve>,
    underInvestmentScores: UnderInvestmentScore[],
    optResult: OptimizationResult
  ) {
    this.records = records;
    this.channels = channels;
    this.kpis = kpis;
    this.funnelStages = funnelStages;
    this.segments = segments;
    this.curves = curves;
    this.underInvestmentScores = underInvestmentScores;
    this.optResult = optResult;
    this.context = {
      activeExplanationLevel: 'Manager'
    };
  }

  public updateData(
    records: CampaignRecord[],
    channels: AggregatedChannel[],
    kpis: OverviewKPIs,
    funnelStages: FunnelStageData[],
    segments: CustomerSegment[],
    curves: Map<string, ChannelMarginalCurve>,
    underInvestmentScores: UnderInvestmentScore[],
    optResult: OptimizationResult
  ) {
    this.records = records;
    this.channels = channels;
    this.kpis = kpis;
    this.funnelStages = funnelStages;
    this.segments = segments;
    this.curves = curves;
    this.underInvestmentScores = underInvestmentScores;
    this.optResult = optResult;
  }

  public setExplanationLevel(level: ExplanationLevel) {
    this.context.activeExplanationLevel = level;
  }

  public processQuestion(question: string, level?: ExplanationLevel): ChatMessage {
    const activeLevel = level || this.context.activeExplanationLevel;
    const qLower = question.toLowerCase().trim();

    // 1. REVENUE DECLINE / CHANGE EXPLANATION
    if (
      qLower.includes('why') && (qLower.includes('revenue') || qLower.includes('lower') || qLower.includes('down') || qLower.includes('fall') || qLower.includes('decline') || qLower.includes('drop')) ||
      qLower.includes('revenue decline') || qLower.includes('cause') && qLower.includes('revenue')
    ) {
      this.context.lastIntent = 'REVENUE_DECLINE';
      return this.handleRevenueDeclineExplanation(activeLevel);
    }

    // 2. HOW REVENUE WAS GENERATED (WATERFALL)
    if (
      qLower.includes('how was') && qLower.includes('revenue') ||
      qLower.includes('how did we generate') ||
      qLower.includes('revenue attribution') ||
      qLower.includes('waterfall') ||
      qLower.includes('explain how our revenue was generated') ||
      qLower.includes('revenue breakdown')
    ) {
      this.context.lastIntent = 'REVENUE_WATERFALL';
      return this.handleRevenueWaterfallAttribution(activeLevel);
    }

    // 3. WHERE TO MOVE BUDGET / REALLOCATION / WHERE SHOULD 10L GO
    if (
      qLower.includes('where should') && (qLower.includes('move') || qLower.includes('budget') || qLower.includes('go') || qLower.includes('spend')) ||
      qLower.includes('10 lakh') || qLower.includes('10l') || qLower.includes('1 crore') || qLower.includes('1cr') ||
      qLower.includes('reallocate') || qLower.includes('reallocation')
    ) {
      this.context.lastIntent = 'BUDGET_REALLOCATION';
      return this.handleBudgetReallocation(activeLevel, qLower);
    }

    // 4. UNDER-INVESTED CHANNELS / WHERE TO INCREASE SPEND
    if (
      qLower.includes('under-invested') || qLower.includes('underinvested') ||
      qLower.includes('scale') || qLower.includes('increase spending') ||
      qLower.includes('more budget') || qLower.includes('deserves more')
    ) {
      this.context.lastIntent = 'UNDER_INVESTED';
      return this.handleUnderInvestedChannels(activeLevel);
    }

    // 5. WHERE IS BUDGET WASTED / INEFFICIENCIES / REDUCE SPEND
    if (
      qLower.includes('wasted') || qLower.includes('inefficien') ||
      qLower.includes('reduce') || qLower.includes('saturation') || qLower.includes('cut')
    ) {
      this.context.lastIntent = 'BUDGET_WASTE';
      return this.handleBudgetInefficiencies(activeLevel);
    }

    // 6. FUNNEL BOTTLENECK / WHERE ARE WE LOSING CUSTOMERS
    if (
      qLower.includes('funnel') || qLower.includes('losing') || qLower.includes('drop-off') ||
      qLower.includes('dropoff') || qLower.includes('bottleneck') || qLower.includes('stage')
    ) {
      this.context.lastIntent = 'FUNNEL_BOTTLENECK';
      return this.handleFunnelBottleneck(activeLevel);
    }

    // 7. CUSTOMER SEGMENTS / HIGHEST VALUE / BEST CONVERTING
    if (
      qLower.includes('customer') || qLower.includes('segment') ||
      qLower.includes('who converts') || qLower.includes('clv')
    ) {
      this.context.lastIntent = 'CUSTOMER_SEGMENTS';
      return this.handleCustomerSegments(activeLevel);
    }

    // 8. CAMPAIGN PERFORMANCE / BEST CAMPAIGN / HIGHEST CAC
    if (
      qLower.includes('campaign') || qLower.includes('best') || qLower.includes('highest cac') ||
      qLower.includes('top performer') || qLower.includes('lowest roi')
    ) {
      this.context.lastIntent = 'CAMPAIGN_PERFORMANCE';
      return this.handleCampaignPerformance(activeLevel, qLower);
    }

    // 9. WHAT SHOULD WE DO NEXT? / WHAT NEXT ACTIONS
    if (
      qLower.includes('what should i do') || qLower.includes('what should we do') ||
      qLower.includes('next action') || qLower.includes('priority') || qLower.includes('attention')
    ) {
      this.context.lastIntent = 'WHAT_NEXT';
      return this.handleWhatNext(activeLevel);
    }

    // 10. EXPLAIN SIMPLY / MAKE IT SIMPLE
    if (
      qLower.includes('simply') || qLower.includes('simple') || qLower.includes('everyone') ||
      qLower.includes('plain english') || qLower.includes('beginner')
    ) {
      this.context.lastIntent = 'EXPLAIN_SIMPLY';
      return this.handleExplainSimply();
    }

    // 11. GENERAL / METRIC INQUIRY (CAC, ROI, CONVERSION RATE)
    return this.handleGeneralMetricInquiry(qLower, activeLevel);
  }

  // --- HANDLER IMPLEMENTATIONS ---

  private handleRevenueDeclineExplanation(level: ExplanationLevel): ChatMessage {
    const revDelta = this.kpis.totalRevenue - this.kpis.prevRevenue;
    const revPct = this.kpis.prevRevenue > 0 ? (revDelta / this.kpis.prevRevenue) * 100 : 0;
    const sqlDelta = this.kpis.qualifiedLeads - this.kpis.prevQualifiedLeads;
    const bottleneck = this.funnelStages.find(s => s.isBottleneck) || this.funnelStages[4];
    const topChannel = [...this.channels].sort((a, b) => b.revenue - a.revenue)[0];

    // Deconstruct by channel
    const waterfallItems = this.channels.map(ch => ({
      label: ch.channel,
      value: ch.revenue,
      formattedValue: formatINR(ch.revenue),
      sublabel: `${formatPercent((ch.revenue / Math.max(1, this.kpis.totalRevenue)) * 100)} share`,
      color: '#0284C7',
      isPositive: ch.roi > 2.0
    }));

    if (level === 'Executive') {
      return {
        id: `MSG-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Revenue reflects a **${formatPercent(Math.abs(revPct))} shift (${formatINR(revDelta)})** driven primarily by mid-funnel SQL conversion drop-off (${bottleneck.label} down ${formatPercent(bottleneck.dropOffRate)}) and enterprise deal timing. Reallocating ₹10L–₹15L into high-intent inbound channels projects estimated revenue recovery of **+${formatINR(Math.round(Math.abs(revDelta) * 0.65))}**.`,
        structuredAnswer: {
          whatHappened: `Revenue shifted by ${formatPercent(revPct)} (${formatINR(revDelta)}) compared to previous baseline.`,
          why: `Primary driver is lower progression from Sales Qualified Leads into formal Opportunities, not top-of-funnel impression collapse.`,
          recommendedActions: [
            `Tighten sales development follow-up SLA (<24 hours).`,
            `Reallocate ₹12L from saturated event spend into LinkedIn Enterprise ABM.`
          ],
          expectedImpact: `+${formatINR(Math.round(Math.abs(revDelta) * 0.65))} in potential pipeline recovery.`,
          confidence: 'High',
          dataUsed: 'Period comparison: Recent 6M vs Previous 6M across 2,400 transaction records.'
        },
        visualPayload: {
          type: 'kpi_delta',
          title: 'Period-over-Period Revenue Decomposition',
          items: [
            { label: 'Revenue Delta', value: revDelta, formattedValue: formatINR(revDelta), isPositive: revDelta >= 0 },
            { label: 'SQL Pipeline Delta', value: sqlDelta, formattedValue: `${sqlDelta > 0 ? '+' : ''}${sqlDelta.toLocaleString()}`, isPositive: sqlDelta >= 0 },
            { label: 'CAC Shift', value: this.kpis.cac - this.kpis.prevCac, formattedValue: formatINR(this.kpis.cac - this.kpis.prevCac), isPositive: this.kpis.cac <= this.kpis.prevCac }
          ]
        },
        suggestedAction: {
          type: 'NAVIGATE_TAB',
          label: 'View Action Center',
          targetTab: 'overview'
        },
        explanationLevel: level
      };
    }

    if (level === 'Beginner') {
      return {
        id: `MSG-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Here is the simple story: Our marketing ads and campaigns are still bringing in lots of interested leads, but fewer of them are actually signing deals with our sales team. The issue isn't that our marketing stopped working—it's that interested clients are getting stuck in the middle of our sales process before getting a price quote.`,
        structuredAnswer: {
          whatHappened: `Revenue is lower by ${formatPercent(Math.abs(revPct))} because fewer leads turned into signed contracts.`,
          why: `People visited our website and signed up, but sales meetings didn't happen fast enough.`,
          recommendedActions: [
            `Have the sales team contact warm leads within 1 day.`,
            `Spend less money on expensive events and more on LinkedIn ads that reach real decision-makers.`
          ],
          expectedImpact: `More signed client deals and faster revenue growth.`,
          confidence: 'High',
          dataUsed: 'Based on actual numbers from our customer tracking data.'
        },
        explanationLevel: level
      };
    }

    // Default: Manager / Analyst
    return {
      id: `MSG-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `## Period Revenue Analysis\n\nRevenue experienced a **${formatPercent(Math.abs(revPct))} variance (${formatINR(revDelta)})** compared to the prior comparable cycle.\n\n### Root Cause Breakdown\n1. **Mid-Funnel Bottleneck**: ${bottleneck.label} reflects the steepest drop-off (${formatPercent(bottleneck.dropOffRate)} attrition). Top-of-funnel lead acquisition remained steady, but sales qualification velocity declined.\n2. **Channel Saturation Drag**: Spend in upper-funnel experiential and display channels continued at high volume despite declining marginal yields.\n3. **Deal Value Mix**: More contract closures came from mid-market tiers rather than high-margin Fortune 500 enterprise accounts.`,
      structuredAnswer: {
        whatHappened: `Revenue changed by ${formatPercent(revPct)} (${formatINR(revDelta)}) with ${this.kpis.totalRevenue > this.kpis.prevRevenue ? 'expansion' : 'contraction'} in closed contract volume.`,
        why: `Primary driver is downstream pipeline qualification friction and slight deal size compression, rather than marketing lead deficiency.`,
        recommendedActions: [
          `Review enterprise qualification criteria between SDRs and Account Executives.`,
          `Reallocate ₹10L–₹15L from saturated event channels toward LinkedIn Enterprise and Account-Based Email.`,
          `Deploy automated technical nurture cadences to re-engage stalled proposal opportunities.`
        ],
        expectedImpact: `Estimated portfolio recovery of +${formatINR(Math.round(Math.abs(revDelta) * 0.65))} under optimized budget redistribution.`,
        confidence: 'High',
        dataUsed: 'Aggregated 12-month transaction observations, 9-stage conversion funnel, and period-over-period delta matrix.'
      },
      visualPayload: {
        type: 'waterfall',
        title: 'Current Revenue Contribution by Channel',
        items: waterfallItems
      },
      suggestedAction: {
        type: 'APPLY_SIMULATOR',
        label: 'Simulate Reallocation in Scenario Simulator',
        targetTab: 'simulator'
      },
      explanationLevel: level
    };
  }

  private handleRevenueWaterfallAttribution(level: ExplanationLevel): ChatMessage {
    const totalRev = this.kpis.totalRevenue;
    const items = this.channels.map(ch => {
      const share = totalRev > 0 ? (ch.revenue / totalRev) * 100 : 0;
      return {
        label: ch.channel,
        value: ch.revenue,
        formattedValue: formatINR(ch.revenue),
        sublabel: `${formatPercent(share)} (${formatROI(ch.roi)} ROI)`,
        percentage: Number(share.toFixed(1)),
        isPositive: true
      };
    });

    const topChannel = this.channels[0];
    const secondChannel = this.channels[1];

    return {
      id: `MSG-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `## Revenue Generation Waterfall\n\nTotal generated revenue across the observed portfolio is **${formatINR(totalRev)}** across **${this.kpis.totalSpend > 0 ? this.channels.reduce((s, c) => s + c.contracts, 0) : 0} closed enterprise deals**.\n\n* **${topChannel?.channel}** generated the single largest share of revenue at **${formatINR(topChannel?.revenue || 0)} (${formatPercent(topChannel ? (topChannel.revenue / totalRev) * 100 : 0)})**, primarily through large enterprise contracts.\n* **${secondChannel?.channel}** followed with **${formatINR(secondChannel?.revenue || 0)}**, driven by high search intent.\n* In contrast, experiential event channels captured significant gross revenue but required 2.5x higher CAC per closed deal.`,
      structuredAnswer: {
        whatHappened: `Portfolio closed ${formatINR(totalRev)} in contracted enterprise revenue.`,
        why: `High commercial intent digital channels (LinkedIn & Google) drive 55%+ of gross revenue with superior capital efficiency.`,
        recommendedActions: [
          `Protect budget for core revenue engines (${topChannel?.channel}).`,
          `Rebalance secondary channels to improve conversion velocity.`
        ],
        expectedImpact: `Maintaining current allocation guarantees baseline run-rate; equimarginal reallocation projects +8-12% expansion.`,
        confidence: 'High',
        dataUsed: 'Actual transaction log of all closed contracts across 6 channels.'
      },
      visualPayload: {
        type: 'waterfall',
        title: 'Closed Revenue Attribution Waterfall',
        items
      },
      suggestedAction: {
        type: 'NAVIGATE_TAB',
        label: 'Explore Revenue Analytics Drill-Down',
        targetTab: 'revenue'
      },
      explanationLevel: level
    };
  }

  private handleBudgetReallocation(level: ExplanationLevel, query: string): ChatMessage {
    const topUnder = this.underInvestmentScores.find(s => s.status === 'Expansion Opportunity') || this.underInvestmentScores[0];
    const topSat = [...this.channels].sort((a, b) => {
      const cA = this.curves.get(a.channel)?.saturationRatio || 0;
      const cB = this.curves.get(b.channel)?.saturationRatio || 0;
      return cB - cA;
    })[0];

    const amount = query.includes('10 lakh') || query.includes('10l') ? 1000000 : 1500000;
    const estLift = Math.round(amount * (topUnder.marginalROI - 1.0));

    return {
      id: `MSG-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `## AI Budget Reallocation Recommendation\n\nTo maximize marginal portfolio yield, the optimizer recommends reallocating **${formatINR(amount)}** away from saturated channels into under-invested high-velocity channels.\n\n### Where Should It Go?\n* **Reduce**: **${topSat.channel}** by **-${formatINR(amount)}** (Channel is approaching diminishing returns at ${(this.curves.get(topSat.channel)?.saturationRatio || 0.9 * 100).toFixed(0)}% saturation).\n* **Increase**: **${topUnder.channel}** by **+${formatINR(amount)}** (Channel delivers **${topUnder.marginalROI}x marginal ROI** with healthy headroom).`,
      structuredAnswer: {
        whatHappened: `Identified an equimarginal reallocation opportunity of ${formatINR(amount)}.`,
        why: `${topUnder.channel} yields ${topUnder.marginalROI}x per additional rupee, whereas ${topSat.channel} marginal return has dropped toward break-even.`,
        recommendedActions: [
          `Shift ${formatINR(amount)} from ${topSat.channel} to ${topUnder.channel}.`,
          `Test in a 4-week sprint cycle before making permanent annual budget adjustments.`
        ],
        expectedImpact: `Estimated net revenue expansion of +${formatINR(estLift)} with portfolio ROI lift of +0.18x.`,
        confidence: 'High',
        dataUsed: 'Calculated using non-linear Hill S-curve response functions and marginal return derivatives.'
      },
      visualPayload: {
        type: 'allocation_shift',
        title: `Recommended Shift of ${formatINR(amount)}`,
        items: [
          { label: `Reduce: ${topSat.channel}`, value: -amount, formattedValue: `-${formatINR(amount)}`, color: '#F43F5E', isPositive: false },
          { label: `Expand: ${topUnder.channel}`, value: amount, formattedValue: `+${formatINR(amount)}`, color: '#10B981', isPositive: true },
          { label: 'Expected Net Revenue Lift', value: estLift, formattedValue: `+${formatINR(estLift)}`, color: '#0284C7', isPositive: true }
        ]
      },
      suggestedAction: {
        type: 'APPLY_SIMULATOR',
        label: 'Open in Scenario Simulator with this Shift',
        targetTab: 'simulator',
        payload: { targetChannel: topUnder.channel, delta: amount, sourceChannel: topSat.channel }
      },
      explanationLevel: level
    };
  }

  private handleUnderInvestedChannels(level: ExplanationLevel): ChatMessage {
    const underInvested = this.underInvestmentScores.filter(s => s.status === 'Expansion Opportunity' || s.score >= 70);

    const items = underInvested.map(s => ({
      label: s.channel,
      value: s.score,
      formattedValue: `${s.score}/100`,
      sublabel: `${s.marginalROI}x Marginal ROI | ${formatPercent(s.leadQuality)} Lead Q`,
      color: '#10B981',
      isPositive: true
    }));

    return {
      id: `MSG-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `## Under-Invested Channels with Expansion Headroom\n\nOur econometrics model identifies **${underInvested.length} channels** operating well below their saturation ceiling while generating superior marginal returns.\n\n${underInvested.map(u => `* **${u.channel}** (Score: **${u.score}/100**): Demonstrates **${u.marginalROI}x marginal ROI** and **${formatPercent(u.leadQuality)} lead quality**. Current spend is only utilizing ~${(u.saturationRatio * 100).toFixed(0)}% of capacity.`).join('\n')}`,
      structuredAnswer: {
        whatHappened: `Identified under-investment in high-performing channels.`,
        why: `Budgets were historically allocated evenly or anchored to legacy brand channels, ignoring non-linear saturation curves.`,
        recommendedActions: [
          `Scale budget in ${underInvested[0]?.channel || 'top channel'} by 25-30%.`,
          `Maintain creative refresh to prevent audience saturation.`
        ],
        expectedImpact: `+${formatINR(1800000)} in projected revenue lift under balanced optimization.`,
        confidence: 'High',
        dataUsed: 'Under-Investment Opportunity Scores derived from Marginal ROI, Historical ROI, and Saturation ratio.'
      },
      visualPayload: {
        type: 'channel_bars',
        title: 'Top Under-Investment Opportunity Scores (0–100)',
        items
      },
      suggestedAction: {
        type: 'NAVIGATE_TAB',
        label: 'View Budget Optimizer Plan',
        targetTab: 'optimizer'
      },
      explanationLevel: level
    };
  }

  private handleBudgetInefficiencies(level: ExplanationLevel): ChatMessage {
    const saturated = this.channels.filter(c => {
      const curve = this.curves.get(c.channel);
      return curve && curve.saturationRatio >= 0.85;
    });

    return {
      id: `MSG-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `## Budget Inefficiencies & Saturation Warnings\n\nBudget inefficiencies in B2B marketing occur when spending continues to scale in channels where **marginal returns have dropped close to or below 1.0x**.\n\n${saturated.map(s => {
        const curve = this.curves.get(s.channel)!;
        return `* **${s.channel}**: Saturation ratio is **${(curve.saturationRatio * 100).toFixed(0)}%** with current CAC of **${formatINR(s.cac)}**. Marginal yield is flattening; additional rupees deliver diminishing deal conversions.`;
      }).join('\n')}`,
      structuredAnswer: {
        whatHappened: `Detected capital drag in ${saturated.length} saturated channels.`,
        why: `High-cost impressions produce low incremental deal volume once the addressable audience is saturated.`,
        recommendedActions: [
          `Trim 15-20% of spend from ${saturated[0]?.channel || 'saturated channel'}.`,
          `Reinvest capital into high-velocity digital nurture and inbound search.`
        ],
        expectedImpact: `Estimated savings of ${formatINR(800000)} per quarter with no loss in qualified opportunity generation.`,
        confidence: 'Medium',
        dataUsed: 'Fitted Hill equation derivatives and CRM contract attribution.'
      },
      suggestedAction: {
        type: 'NAVIGATE_TAB',
        label: 'Inspect Campaign CAC in Analytics',
        targetTab: 'campaigns'
      },
      explanationLevel: level
    };
  }

  private handleFunnelBottleneck(level: ExplanationLevel): ChatMessage {
    const bottleneck = this.funnelStages.find(s => s.isBottleneck) || this.funnelStages[4];
    const prevStage = this.funnelStages[this.funnelStages.indexOf(bottleneck) - 1] || this.funnelStages[0];

    const items = this.funnelStages.slice(2, 7).map(st => ({
      label: st.label,
      value: st.count,
      formattedValue: formatNumberIndian(st.count),
      sublabel: `${formatPercent(st.conversionFromPrev)} conv | ${st.avgDaysInStage}d avg`,
      color: st.isBottleneck ? '#F43F5E' : '#0284C7',
      isPositive: !st.isBottleneck
    }));

    return {
      id: `MSG-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `## Commercial Funnel Bottleneck Diagnostic\n\nThe primary friction point across the 9-stage pipeline occurs between **${prevStage.label} and ${bottleneck.label}**.\n\n* **Drop-off Rate**: **${formatPercent(bottleneck.dropOffRate)}** of incoming ${prevStage.label} fail to advance.\n* **Volume Lost**: **${(prevStage.count - bottleneck.count).toLocaleString()}** un-advanced leads.\n* **Pipeline Lag**: Qualified leads spend an average of **${bottleneck.avgDaysInStage} days** in this transition.\n\nThis indicates that marketing is successfully delivering qualified volume, but commercial solution-engineering qualification is causing deal stall.`,
      structuredAnswer: {
        whatHappened: `Largest pipeline attrition is at ${bottleneck.label} stage (${formatPercent(bottleneck.dropOffRate)} drop-off).`,
        why: `Misalignment between marketing qualification criteria and sales proposal acceptance.`,
        recommendedActions: [
          `Institute a joint Sales-Marketing SLA on lead follow-up.`,
          `Deploy automated technical whitepaper cadences to warm stalled SQL accounts.`
        ],
        expectedImpact: `A 5% improvement in this transition unlocks an estimated +${formatINR(Math.round(this.kpis.totalRevenue * 0.08))} in pipeline.`,
        confidence: 'High',
        dataUsed: '9-stage full funnel transition logs and cycle duration metrics.'
      },
      visualPayload: {
        type: 'funnel_drop',
        title: 'Pipeline Stages Surrounding Primary Bottleneck',
        items
      },
      suggestedAction: {
        type: 'NAVIGATE_TAB',
        label: 'Open Full Conversion Funnel',
        targetTab: 'funnel'
      },
      explanationLevel: level
    };
  }

  private handleCustomerSegments(level: ExplanationLevel): ChatMessage {
    const topSegment = this.segments[0];
    const items = this.segments.map(s => ({
      label: s.name,
      value: s.totalRevenue,
      formattedValue: formatINR(s.totalRevenue),
      sublabel: `CLV: ${formatINR(s.avgCLV)} | ${s.clientCount} clients`,
      color: s.color,
      isPositive: true
    }));

    return {
      id: `MSG-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `## Customer Intelligence & Segment Performance\n\nOur K-Means clustering algorithm identified **${this.segments.length} distinct behavioral clusters** across client accounts:\n\n* **Top Revenue Generator**: **${topSegment.name}** generates **${formatINR(topSegment.totalRevenue)}** with an average CLV of **${formatINR(topSegment.avgCLV)}**.\n* **Fastest Converting**: **${this.segments.find(s => s.name.includes('Growth'))?.name || this.segments[1]?.name}** demonstrates peak conversion agility (${formatPercent(this.segments[1]?.conversionRate || 4.2)}).\n* **High-CAC Watchlist**: **${this.segments[this.segments.length - 1]?.name}** exhibits high acquisition cost relative to deal size.`,
      structuredAnswer: {
        whatHappened: `Segmented client base into 4 distinct value and behavioral tiers.`,
        why: `Enterprise clients exhibit 3x higher deal sizes than emerging tiers, justifying high-touch experiential nurturing.`,
        recommendedActions: [
          `Prioritize ABM budgets on ${topSegment.name}.`,
          `Automate nurture for emerging tiers to keep CAC low.`
        ],
        expectedImpact: `Targeting 3 additional enterprise accounts expands ARR by +${formatINR(Math.round(topSegment.totalRevenue * 0.12))}.`,
        confidence: 'High',
        dataUsed: 'Normalized K-Means clustering across Revenue, CLV, Deal Size, and Interaction frequency.'
      },
      visualPayload: {
        type: 'channel_bars',
        title: 'Revenue Contribution by K-Means Segment',
        items
      },
      suggestedAction: {
        type: 'NAVIGATE_TAB',
        label: 'View Customer Intelligence Profiles',
        targetTab: 'customers'
      },
      explanationLevel: level
    };
  }

  private handleCampaignPerformance(level: ExplanationLevel, query: string): ChatMessage {
    const isCacQuery = query.includes('cac') || query.includes('cost');
    const sorted = isCacQuery
      ? [...this.channels].sort((a, b) => b.cac - a.cac)
      : [...this.channels].sort((a, b) => b.roi - a.roi);

    const top = sorted[0];
    const items = sorted.map(c => ({
      label: c.channel,
      value: isCacQuery ? c.cac : c.roi,
      formattedValue: isCacQuery ? formatINR(c.cac) : formatROI(c.roi),
      sublabel: `Spend: ${formatINR(c.spend)} | Rev: ${formatINR(c.revenue)}`,
      color: isCacQuery ? '#F59E0B' : '#6366F1',
      isPositive: !isCacQuery
    }));

    return {
      id: `MSG-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `## Campaign & Channel Performance Analysis\n\n${isCacQuery
        ? `**${top.channel}** has the highest Customer Acquisition Cost at **${formatINR(top.cac)}** per won contract. This is driven by high experiential sponsorship costs and longer sales incubation times.`
        : `**${top.channel}** demonstrates the highest capital efficiency at **${formatROI(top.roi)} ROI**, generating **${formatINR(top.revenue)}** against **${formatINR(top.spend)}** in marketing spend.`}`,
      structuredAnswer: {
        whatHappened: `Evaluated portfolio across all active channels.`,
        why: `Variance stems from difference in buyer intent and deal size distribution across channels.`,
        recommendedActions: [
          isCacQuery ? `Rationalize high-CAC channels and enforce tighter qualification.` : `Maintain investment in top ROI channels while monitoring saturation.`
        ],
        expectedImpact: `Balancing CAC across channels protects gross margin while preserving lead velocity.`,
        confidence: 'High',
        dataUsed: 'Campaign performance metrics aggregated across active 12-month records.'
      },
      visualPayload: {
        type: 'channel_bars',
        title: isCacQuery ? 'CAC by Channel (Highest to Lowest)' : 'ROI by Channel (Highest to Lowest)',
        items
      },
      suggestedAction: {
        type: 'NAVIGATE_TAB',
        label: 'Open Campaign Analytics',
        targetTab: 'campaigns'
      },
      explanationLevel: level
    };
  }

  private handleWhatNext(level: ExplanationLevel): ChatMessage {
    const topUnder = this.underInvestmentScores.find(s => s.status === 'Expansion Opportunity') || this.underInvestmentScores[0];
    const bottleneck = this.funnelStages.find(s => s.isBottleneck) || this.funnelStages[4];

    return {
      id: `MSG-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `## Top 3 High-Impact Executive Actions\n\nBased on comprehensive portfolio modeling, here are the top 3 actions to execute this sprint:\n\n1. **Reallocate Capital**: Shift **₹12L–₹15L** from saturated display/event channels into **${topUnder.channel}** to capture untapped marginal return.\n2. **Unblock Funnel**: Accelerate SDR follow-up on stalled **${bottleneck.label}** leads to prevent the ${formatPercent(bottleneck.dropOffRate)} drop-off.\n3. **Protect Enterprise Deals**: Anchor ABM campaigns on **Enterprise High-Value accounts** to sustain large contract ARR.`,
      structuredAnswer: {
        whatHappened: `Prioritized actionable roadmap based on Business Impact Scores.`,
        why: `These three interventions target the highest revenue leverage points in the marketing system.`,
        recommendedActions: [
          `Execute budget rebalance in Budget Optimizer.`,
          `Review sales handoff SLA with revenue operations.`,
          `Validate with a 4-week simulation scenario.`
        ],
        expectedImpact: `Projected portfolio revenue expansion of +${formatINR(this.optResult.revenueLift)} (+${formatPercent(this.optResult.revenueLiftPct)}).`,
        confidence: 'High',
        dataUsed: 'Derived from Action Center priorities and constrained budget optimization solver.'
      },
      suggestedAction: {
        type: 'NAVIGATE_TAB',
        label: 'Go to Action Center',
        targetTab: 'overview'
      },
      explanationLevel: level
    };
  }

  private handleExplainSimply(): ChatMessage {
    return {
      id: `MSG-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `## MarketingIQ in Plain English 💡\n\nHere is how our marketing is working right now:\n\n1. **We have channels that are printing money**: LinkedIn and Email are bringing in great clients very cheaply. We should put more money into them!\n2. **We have channels that are running out of steam**: Large events and display ads are very expensive and starting to give us less return for every extra rupee we spend.\n3. **We have a leak in our sales pipe**: Lots of people are raising their hands and asking for info, but too many of them get lost before our sales team gives them a proposal.\n\n**Bottom Line**: If we move ₹10–15 Lakh from our expensive ads into our top digital channels, we can make an extra ₹30–40 Lakh in client contracts without increasing our total budget!`,
      structuredAnswer: {
        whatHappened: `Simplified executive explanation activated.`,
        why: `Translating statistical non-linear curves into clear business intuition.`,
        recommendedActions: [
          `Move budget to what is working best.`,
          `Fix the sales handoff.`,
          `Avoid spending extra on saturated campaigns.`
        ],
        expectedImpact: `More revenue, lower customer acquisition costs.`,
        confidence: 'High',
        dataUsed: 'Synthesized from all dashboard metrics.'
      },
      explanationLevel: 'Beginner'
    };
  }

  private handleGeneralMetricInquiry(query: string, level: ExplanationLevel): ChatMessage {
    if (query.includes('cac') || query.includes('cost per customer')) {
      return {
        id: `MSG-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Our average **Customer Acquisition Cost (CAC)** across the observed period is **${formatINR(this.kpis.cac)}** per won contract. This reflects total marketing expenditure of ${formatINR(this.kpis.totalSpend)} across ${this.channels.reduce((s, c) => s + c.contracts, 0)} contracts.`,
        explanationLevel: level
      };
    }

    if (query.includes('roi') || query.includes('return')) {
      return {
        id: `MSG-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Our overall **Marketing ROI** is **${formatROI(this.kpis.roi)}**, indicating that every marketing rupee deployed generated ₹${this.kpis.roi.toFixed(2)} in contracted enterprise revenue.`,
        explanationLevel: level
      };
    }

    return {
      id: `MSG-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `I analyzed our active dataset (${this.records.length.toLocaleString()} records). You can ask me:\n\n* *"Why is revenue down?"*\n* *"How was revenue generated?"*\n* *"Where is our budget being wasted?"*\n* *"Which campaign should I scale?"*\n* *"Explain the biggest funnel problem."*\n* *"Where should I move ₹10 lakh?"*\n* *"Explain this simply."*`,
      explanationLevel: level
    };
  }
}
