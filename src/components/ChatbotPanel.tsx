import React, { useState, useRef, useEffect } from 'react';
import {
  MarketingAnalystEngine,
  ChatMessage,
  ExplanationLevel,
  VisualPayload
} from '../engine/analystChatEngine';
import { formatINR, formatROI, formatPercent } from '../engine/formatters';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Sliders,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Zap,
  CheckCircle2,
  Info
} from 'lucide-react';
import { NavigationTab } from './Sidebar';

interface ChatbotPanelProps {
  engine: MarketingAnalystEngine;
  onNavigateTab: (tab: NavigationTab) => void;
  onApplySimulatorPayload?: (payload: any) => void;
  externalInitialQuestion?: string;
  onClearInitialQuestion?: () => void;
}

export const ChatbotPanel: React.FC<ChatbotPanelProps> = ({
  engine,
  onNavigateTab,
  onApplySimulatorPayload,
  externalInitialQuestion,
  onClearInitialQuestion,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>('Manager');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'INIT-1',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Hello! I am your **MarketingIQ Live Analyst**. I have complete access to your active campaign, conversion, and revenue dataset.\n\nAsk me anything about your marketing performance, revenue drivers, funnel bottlenecks, or budget optimization!`,
      explanationLevel: 'Manager'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle external trigger from Action Center ("Ask Analyst")
  useEffect(() => {
    if (externalInitialQuestion) {
      setIsOpen(true);
      handleSendMessage(externalInitialQuestion);
      if (onClearInitialQuestion) {
        onClearInitialQuestion();
      }
    }
  }, [externalInitialQuestion]);

  const handleLevelChange = (level: ExplanationLevel) => {
    setExplanationLevel(level);
    engine.setExplanationLevel(level);

    // Add brief confirmation
    setMessages(prev => [
      ...prev,
      {
        id: `SYS-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Switched explanation level to **${level}**. Future responses will be calibrated for **${
          level === 'Executive' ? 'C-suite summary & bottom-line ₹ impact' :
          level === 'Manager' ? 'tactical business actions & execution checklist' :
          level === 'Analyst' ? 'mathematical calculations & regression decomposition' :
          'plain conversational English free of jargon'
        }**.`,
        explanationLevel: level
      }
    ]);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `USER-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');

    // Process through MarketingAnalystEngine
    setTimeout(() => {
      const response = engine.processQuestion(text, explanationLevel);
      setMessages(prev => [...prev, response]);
    }, 150);
  };

  const quickQuestions = [
    'Why is revenue down?',
    'How was revenue generated?',
    'Where is our budget being wasted?',
    'Which campaign should I scale?',
    'Explain the biggest funnel problem.',
    'Where should I move ₹10 lakh?',
    'What should I do next?',
    'Explain this simply.',
  ];

  const renderVisualPayload = (visual: VisualPayload) => {
    return (
      <div className="mt-3 p-3 bg-slate-900 rounded-xl text-white space-y-2 text-xs border border-slate-800">
        <div className="font-bold text-[11px] text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>{visual.title}</span>
          <span className="text-[10px] text-iceberg-400">Live Metric Chart</span>
        </div>

        <div className="space-y-2 pt-1">
          {visual.items.map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-200">{item.label}</span>
                <span className={`font-bold font-mono ${
                  item.isPositive === true ? 'text-emerald-400' :
                  item.isPositive === false ? 'text-rose-400' : 'text-slate-100'
                }`}>
                  {item.formattedValue}
                </span>
              </div>

              {item.sublabel && (
                <div className="text-[10px] text-slate-400">{item.sublabel}</div>
              )}

              {item.percentage !== undefined && (
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(5, item.percentage))}%`,
                      backgroundColor: item.color || '#0284C7'
                    }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating Action Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-iceberg-600 to-iceberg-500 hover:from-iceberg-500 hover:to-iceberg-400 text-white p-4 rounded-2xl shadow-xl shadow-iceberg-600/30 flex items-center gap-3 group transition-all transform hover:scale-105"
          title="Open Live AI Marketing Analyst"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold leading-tight">MarketingIQ Analyst</div>
            <div className="text-[10px] text-iceberg-100 font-medium">● Live Data Connected</div>
          </div>
        </button>
      )}

      {/* Slide-over Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full sm:w-[480px] h-[640px] max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-navy-950 text-white flex items-center justify-between border-b border-navy-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-iceberg-600 text-white flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">MarketingIQ Analyst</h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                    Analytics Mode
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Grounded in actual loaded dataset & ML models</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([
                  {
                    id: 'INIT-RST',
                    sender: 'assistant',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    text: `Conversation memory reset. How can I assist you with your marketing data?`,
                    explanationLevel: explanationLevel
                  }
                ])}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Explanation Level Selector Bar */}
          <div className="px-3 py-2 bg-navy-900 border-b border-navy-800/80 flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Explanation Level:</span>
            <div className="flex items-center gap-1">
              {(['Executive', 'Manager', 'Analyst', 'Beginner'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => handleLevelChange(lvl)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-all ${
                    explanationLevel === lvl
                      ? 'bg-iceberg-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-iceberg-50 hover:text-iceberg-700 hover:border-iceberg-200 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors shrink-0 shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-navy-900 text-iceberg-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 ${
                      isUser
                        ? 'bg-iceberg-600 text-white rounded-tr-none'
                        : 'bg-slate-100/90 text-slate-800 border border-slate-200/80 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line leading-relaxed font-sans">
                      {msg.text}
                    </div>

                    {/* Structured Answer Accordion */}
                    {!isUser && msg.structuredAnswer && (
                      <div className="mt-3 pt-2 border-t border-slate-200/80 space-y-2 text-[11px]">
                        {msg.structuredAnswer.whatHappened && (
                          <div>
                            <span className="font-bold text-slate-900 uppercase tracking-wider text-[9px] block">
                              What Happened?
                            </span>
                            <span className="text-slate-700">{msg.structuredAnswer.whatHappened}</span>
                          </div>
                        )}

                        {msg.structuredAnswer.why && (
                          <div>
                            <span className="font-bold text-slate-900 uppercase tracking-wider text-[9px] block">
                              Why Did It Happen?
                            </span>
                            <span className="text-slate-700">{msg.structuredAnswer.why}</span>
                          </div>
                        )}

                        {msg.structuredAnswer.recommendedActions && (
                          <div>
                            <span className="font-bold text-slate-900 uppercase tracking-wider text-[9px] block">
                              Recommended Actions
                            </span>
                            <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                              {msg.structuredAnswer.recommendedActions.map((act, aIdx) => (
                                <li key={aIdx}>{act}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {msg.structuredAnswer.expectedImpact && (
                          <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900">
                            <span className="font-bold uppercase tracking-wider text-[9px] block text-emerald-800">
                              Expected Business Impact
                            </span>
                            <span>{msg.structuredAnswer.expectedImpact}</span>
                          </div>
                        )}

                        {msg.structuredAnswer.dataUsed && (
                          <div className="text-[10px] text-slate-500 italic pt-1">
                            Data used: {msg.structuredAnswer.dataUsed}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mini Visual Chart */}
                    {!isUser && msg.visualPayload && renderVisualPayload(msg.visualPayload)}

                    {/* Suggested Action CTA */}
                    {!isUser && msg.suggestedAction && (
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            if (msg.suggestedAction?.targetTab) {
                              onNavigateTab(msg.suggestedAction.targetTab as NavigationTab);
                            }
                            if (msg.suggestedAction?.type === 'APPLY_SIMULATOR' && onApplySimulatorPayload && msg.suggestedAction?.payload) {
                              onApplySimulatorPayload(msg.suggestedAction.payload);
                            }
                            setIsOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-[11px] font-bold shadow-xs transition-colors"
                        >
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>{msg.suggestedAction.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="text-[9px] text-slate-400 text-right mt-1">
                      {msg.timestamp}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-iceberg-600 text-white flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about revenue, campaigns, bottlenecks, budget..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-iceberg-500 font-medium"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 rounded-xl bg-iceberg-600 hover:bg-iceberg-500 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
