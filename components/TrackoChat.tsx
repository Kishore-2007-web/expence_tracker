"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ChevronRight, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  ArrowRight,
  Maximize2,
  Minimize2,
  PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, formatCurrency, getCurrencySymbol } from '@/lib/AppContext';
import TrackoMascot, { MascotState } from './TrackoMascot';
import { 
  calculateCashflow, 
  getCategoryBreakdown, 
  comparePeriods, 
  getCurrentMonthRange, 
  getPreviousMonthRange, 
  filterTransactionsByWorkspace,
  filterTransactionsByDate,
  generateReportData,
  FinancialReportData,
  assessAffordability,
  forecastMonthEnd
} from '@/lib/tracko-engine';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  widget?: {
    type: 'cashflow' | 'categories' | 'comparison' | 'affordability' | 'forecast' | 'anomalies' | 'report';
    data: any;
  };
  provider?: string;
}

interface TrackoChatProps {
  isOpen: boolean;
  onClose: () => void;
  isFloating?: boolean;
}

export const TrackoChat: React.FC<TrackoChatProps> = ({
  isOpen,
  onClose,
  isFloating = false
}) => {
  const {
    currentBusiness,
    transactions,
    savingsGoals,
    profile,
    isOnline
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<'online' | 'local' | 'connecting'>('online');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeWorkspaceId = currentBusiness ? currentBusiness.id : null;
  const activeWorkspaceName = currentBusiness ? currentBusiness.name : 'Personal Workspace';
  const currency = profile?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  // Initialize or reload chat when workspace changes
  useEffect(() => {
    if (!isOpen) return;

    // Load cached workspace history or start fresh
    const cacheKey = `tracko_chat_${activeWorkspaceId || 'personal'}`;
    const stored = localStorage.getItem(cacheKey);

    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [isOpen, activeWorkspaceId]);

  // Persist conversation per workspace
  useEffect(() => {
    if (!isOpen) return;
    const cacheKey = `tracko_chat_${activeWorkspaceId || 'personal'}`;
    if (messages.length > 0) {
      localStorage.setItem(cacheKey, JSON.stringify(messages.slice(-25)));
    }
  }, [messages, isOpen, activeWorkspaceId]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (confirm('Start a new conversation with TRACKO? This will clear the chat history for this workspace.')) {
      setMessages([]);
      const cacheKey = `tracko_chat_${activeWorkspaceId || 'personal'}`;
      localStorage.removeItem(cacheKey);
      setMascotState('idle');
    }
  };

  // Primary messaging dispatch
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    setInput('');
    setMascotState('thinking');
    setIsTyping(true);

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // 1. Attempt Server-side AI endpoint
      if (navigator.onLine) {
        const response = await fetch('/api/tracko', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
            workspaceId: activeWorkspaceId,
            workspaceName: activeWorkspaceName,
            workspaceType: currentBusiness ? 'Business' : 'Personal',
            currency,
            transactions,
            savingsGoals
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (response.ok) {
          const data = await response.json();
          setServiceStatus(data.provider?.includes('Gemini') ? 'online' : 'local');
          setMascotState(data.mascotMood || 'responding');

          const botMessage: ChatMessage = {
            id: `trk_${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            widget: data.widget,
            provider: data.provider
          };

          setMessages(prev => [...prev, botMessage]);
          setIsTyping(false);

          // Reset to idle after a moment
          setTimeout(() => setMascotState('idle'), 3500);
          return;
        }
      }

      // 2. Client-Side Deterministic Fallback if network fails / offline
      throw new Error('Offline or Server Unavailable');

    } catch (err) {
      // Execute 100% deterministic local engine fallback
      setServiceStatus('local');
      const localResult = generateLocalDeterministicResponse(query);

      setMascotState(localResult.mood);

      const botMessage: ChatMessage = {
        id: `trk_${Date.now()}`,
        role: 'assistant',
        content: localResult.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        widget: localResult.widget,
        provider: 'TRACKO Local Deterministic Engine (Offline Resilient)'
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      setTimeout(() => setMascotState('idle'), 3500);
    }
  };

  // Local fallback response generator
  const generateLocalDeterministicResponse = (query: string) => {
    const q = query.toLowerCase();
    const wsTxs = filterTransactionsByWorkspace(transactions, activeWorkspaceId);
    const curMonth = getCurrentMonthRange();
    const prevMonth = getPreviousMonthRange();
    const monthTxs = filterTransactionsByDate(wsTxs, curMonth.startDate, curMonth.endDate);

    const cashflow = calculateCashflow(monthTxs, curMonth.label, currency);
    const categories = getCategoryBreakdown(monthTxs);

    if (q.includes('report') || q.includes('summary')) {
      const repData = generateReportData(transactions, savingsGoals, currentBusiness, profile);
      return {
        reply: `Generated full verified financial report for **${activeWorkspaceName}** (${curMonth.label}). Review summary below or export as PDF/CSV!`,
        mood: 'success' as MascotState,
        widget: { type: 'report' as const, data: repData }
      };
    }

    if (q.includes('compare') || q.includes('last month')) {
      const comparison = comparePeriods(wsTxs, curMonth, prevMonth, currency);
      return {
        reply: `Compared **${curMonth.label}** with **${prevMonth.label}** for **${activeWorkspaceName}**. Outflows shifted by ${Math.abs(comparison.expenseChangeCents / 100).toFixed(2)} ${currency} (${comparison.expenseChangePercent}%).`,
        mood: 'responding' as MascotState,
        widget: { type: 'comparison' as const, data: comparison }
      };
    }

    if (q.includes('can i afford') || q.includes('afford')) {
      let amount = 500000; // default 5,000 in cents
      const match = q.match(/(\d[\d,]*)/);
      if (match) amount = Math.round(parseFloat(match[1].replace(/,/g, '')) * 100);
      const afford = assessAffordability(wsTxs, amount, currency);
      return {
        reply: afford.recommendation,
        mood: afford.canAfford ? 'success' as MascotState : 'concern' as MascotState,
        widget: { type: 'affordability' as const, data: afford }
      };
    }

    if (q.includes('where did my money go') || q.includes('category') || q.includes('breakdown')) {
      return {
        reply: `Here is your categorized spending for **${activeWorkspaceName}** (${curMonth.label}): Total expenses are ${(cashflow.expenseCents / 100).toFixed(2)} ${currency} across ${categories.length} categories.`,
        mood: 'responding' as MascotState,
        widget: { type: 'categories' as const, data: categories.slice(0, 5) }
      };
    }

    // Default cashflow overview
    return {
      reply: `In **${activeWorkspaceName}** for ${curMonth.label}: Income is **${(cashflow.incomeCents / 100).toFixed(2)} ${currency}**, expenses are **${(cashflow.expenseCents / 100).toFixed(2)} ${currency}**, and net cashflow is **${(cashflow.netCashflowCents / 100).toFixed(2)} ${currency}**.`,
      mood: cashflow.netCashflowCents >= 0 ? 'success' as MascotState : 'concern' as MascotState,
      widget: { type: 'cashflow' as const, data: cashflow }
    };
  };

  // Export report to CSV
  const handleExportCSV = (reportData: FinancialReportData) => {
    const rows = [
      ['Report ID', reportData.reportId],
      ['Workspace', reportData.workspaceName],
      ['Period', reportData.periodLabel],
      ['Generated At', reportData.generatedAt],
      ['Currency', reportData.currency],
      [],
      ['Metric', 'Amount'],
      ['Total Income', (reportData.cashflow.incomeCents / 100).toFixed(2)],
      ['Total Expenses', (reportData.cashflow.expenseCents / 100).toFixed(2)],
      ['Net Cashflow', (reportData.cashflow.netCashflowCents / 100).toFixed(2)],
      ['Savings Rate (%)', `${reportData.cashflow.savingsRatePercent}%`],
      [],
      ['Category', 'Amount', 'Percentage (%)'],
      ...reportData.categories.map(c => [c.category, (c.amountCents / 100).toFixed(2), `${c.percentage}%`])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TRACKO_Report_${reportData.workspaceName.replace(/\s+/g, '_')}_${reportData.periodLabel.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print/Download PDF
  const handlePrintPDF = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className={`w-full bg-[#96DFCE] border border-black/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all ${
            isFullscreen 
              ? 'fixed inset-2 sm:inset-4 w-auto h-auto max-w-none' 
              : 'max-w-2xl h-[88vh] max-h-[760px]'
          }`}
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.55) 100%)',
            boxShadow: '0 16px 48px -8px rgba(7, 38, 32, 0.2), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)'
          }}
        >
          {/* ================================================================= */}
          {/* HEADER */}
          {/* ================================================================= */}
          <div className="px-4 sm:px-6 py-3.5 border-b border-black/10 flex items-center justify-between bg-white/40 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              <TrackoMascot 
                state={mascotState} 
                size={44} 
                interactive={false}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-sm sm:text-base tracking-tight text-black flex items-center gap-1.5">
                    <span>TRACKO</span>
                    <span className="text-[10px] uppercase font-black px-1.5 py-0.5 bg-sunshine rounded-md border border-black/15 text-black">AI</span>
                  </h2>

                  {/* Status Indicator Pill */}
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/70 border border-black/10 text-black">
                    {serviceStatus === 'online' ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Online AI</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>Local Engine</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Active Workspace Pill */}
                <div className="text-[11px] text-black/70 flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/40" />
                  <span className="truncate max-w-[180px] sm:max-w-[260px]">{activeWorkspaceName}</span>
                  <span className="text-black/40">•</span>
                  <span>{currency}</span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={handleClearChat}
                className="p-2 rounded-xl text-black/60 hover:text-black hover:bg-white/60 transition-colors"
                title="Start new conversation"
                aria-label="New Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl text-black/60 hover:text-black hover:bg-white/60 transition-colors hidden sm:block"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-black/60 hover:text-black hover:bg-white/60 transition-colors"
                title="Close TRACKO"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ================================================================= */}
          {/* MESSAGES STREAM / WELCOME SCREEN */}
          {/* ================================================================= */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center max-w-md mx-auto py-6">
                <TrackoMascot 
                  state={mascotState === 'idle' ? 'listening' : mascotState} 
                  size={76} 
                  className="mb-3"
                />

                <h3 className="text-lg font-black text-black tracking-tight mb-1">
                  Hey! I'm TRACKO 👋
                </h3>
                <p className="text-xs font-semibold text-black/80 mb-1">
                  Your money, understood.
                </p>
                <p className="text-[11px] text-black/70 leading-relaxed mb-6">
                  Ask me about your spending, savings, budgets, or business metrics in <strong className="text-black">{activeWorkspaceName}</strong>. All answers are grounded in your actual financial records.
                </p>

                {/* 4 Interactive Suggestion Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
                  {[
                    {
                      title: "Where did my money go this month?",
                      desc: "Category breakdown & major outflows",
                      prompt: "Where did my money go this month?"
                    },
                    {
                      title: "Compare this month with last month",
                      desc: "Cashflow shifts & accelerated expenses",
                      prompt: "Compare this month with last month."
                    },
                    {
                      title: `Can I afford a ${currencySymbol}5,000 purchase?`,
                      desc: "Affordability & runway assessment",
                      prompt: `Can I afford a ${currencySymbol}5,000 purchase?`
                    },
                    {
                      title: "Generate financial report",
                      desc: "Verified executive summary & PDF export",
                      prompt: "Generate my monthly financial report."
                    }
                  ].map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(card.prompt)}
                      className="p-3 bg-white/60 hover:bg-white/90 border border-black/10 rounded-2xl transition-all hover:scale-[1.01] hover:shadow-sm text-left group flex flex-col justify-between"
                    >
                      <div className="text-xs font-bold text-black mb-1 group-hover:text-black flex items-center justify-between">
                        <span>{card.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-black/40 group-hover:text-black group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <div className="text-[10px] text-black/60 font-medium">
                        {card.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-[92%] sm:max-w-[85%]">
                    {msg.role === 'assistant' && (
                      <TrackoMascot 
                        state="idle" 
                        size={32} 
                        interactive={false}
                        className="shrink-0 mb-1"
                      />
                    )}

                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl text-xs leading-relaxed text-black shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-white/90 border border-black/10 rounded-br-none'
                          : 'bg-white/70 border border-black/15 rounded-bl-none backdrop-blur-md'
                      }`}
                    >
                      {/* Message Content */}
                      <div className="whitespace-pre-wrap font-medium">
                        {msg.content}
                      </div>

                      {/* ===================================================== */}
                      {/* EMBEDDED RICH WIDGETS */}
                      {/* ===================================================== */}
                      {msg.widget && (
                        <div className="mt-3 pt-3 border-t border-black/10 space-y-2">
                          {/* Cashflow Widget */}
                          {msg.widget.type === 'cashflow' && (
                            <div className="grid grid-cols-3 gap-2 p-2.5 bg-black/5 rounded-xl text-center">
                              <div>
                                <div className="text-[10px] text-black/60 font-semibold">Income</div>
                                <div className="text-xs font-black text-black">
                                  {formatCurrency(msg.widget.data.incomeCents, currency)}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] text-black/60 font-semibold">Expenses</div>
                                <div className="text-xs font-black text-rose-600">
                                  {formatCurrency(msg.widget.data.expenseCents, currency)}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] text-black/60 font-semibold">Net Surplus</div>
                                <div className="text-xs font-black text-black">
                                  {formatCurrency(msg.widget.data.netCashflowCents, currency)}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Categories Widget */}
                          {msg.widget.type === 'categories' && (
                            <div className="space-y-1.5 p-2.5 bg-black/5 rounded-xl">
                              <div className="text-[10px] font-bold text-black uppercase tracking-wider mb-1">
                                Top Spending Categories
                              </div>
                              {msg.widget.data.map((cat: any, i: number) => (
                                <div key={i} className="space-y-0.5">
                                  <div className="flex justify-between text-[11px] font-bold text-black">
                                    <span>{cat.category}</span>
                                    <span>{formatCurrency(cat.amountCents, currency)} ({cat.percentage}%)</span>
                                  </div>
                                  <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-sunshine rounded-full" 
                                      style={{ width: `${Math.min(100, Math.max(5, cat.percentage))}%` }} 
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Affordability Widget */}
                          {msg.widget.type === 'affordability' && (
                            <div className={`p-3 rounded-xl border ${
                              msg.widget.data.canAfford 
                                ? 'bg-emerald-500/10 border-emerald-500/20' 
                                : 'bg-rose-500/10 border-rose-500/20'
                            }`}>
                              <div className="flex items-center gap-1.5 text-xs font-black text-black mb-1">
                                <span>{msg.widget.data.canAfford ? '✅ Feasible Purchase' : '⚠️ High Cash Pressure'}</span>
                              </div>
                              <div className="text-[11px] text-black/80 font-medium leading-relaxed">
                                {msg.widget.data.recommendation}
                              </div>
                              {msg.widget.data.cautions.length > 0 && (
                                <ul className="mt-2 space-y-0.5 text-[10px] text-black/70 list-disc list-inside">
                                  {msg.widget.data.cautions.map((c: string, ci: number) => (
                                    <li key={ci}>{c}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}

                          {/* Comparison Widget */}
                          {msg.widget.type === 'comparison' && (
                            <div className="p-2.5 bg-black/5 rounded-xl space-y-2">
                              <div className="grid grid-cols-2 gap-2 text-center">
                                <div className="p-2 bg-white/60 rounded-lg">
                                  <div className="text-[10px] text-black/60 font-semibold">{msg.widget.data.previousPeriod.periodLabel}</div>
                                  <div className="text-xs font-black text-black">
                                    {formatCurrency(msg.widget.data.previousPeriod.expenseCents, currency)}
                                  </div>
                                </div>
                                <div className="p-2 bg-white/60 rounded-lg">
                                  <div className="text-[10px] text-black/60 font-semibold">{msg.widget.data.currentPeriod.periodLabel}</div>
                                  <div className="text-xs font-black text-black">
                                    {formatCurrency(msg.widget.data.currentPeriod.expenseCents, currency)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Report Preview Widget */}
                          {msg.widget.type === 'report' && (
                            <div className="p-3 bg-white/80 border border-black/10 rounded-xl space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider text-black">
                                  Financial Report • {msg.widget.data.periodLabel}
                                </span>
                                <span className="text-[10px] font-bold text-black/60">
                                  {msg.widget.data.reportId}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-center p-2 bg-black/5 rounded-lg">
                                <div>
                                  <div className="text-[9px] text-black/60 font-semibold">Income</div>
                                  <div className="text-xs font-black text-black">
                                    {formatCurrency(msg.widget.data.cashflow.incomeCents, currency)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[9px] text-black/60 font-semibold">Expenses</div>
                                  <div className="text-xs font-black text-rose-600">
                                    {formatCurrency(msg.widget.data.cashflow.expenseCents, currency)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[9px] text-black/60 font-semibold">Net Surplus</div>
                                  <div className="text-xs font-black text-black">
                                    {formatCurrency(msg.widget.data.cashflow.netCashflowCents, currency)}
                                  </div>
                                </div>
                              </div>

                              {/* Report Actions */}
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={handlePrintPDF}
                                  className="flex-1 py-1.5 bg-sunshine hover:bg-sunshine-hover text-black text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1 shadow-sm"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download PDF</span>
                                </button>
                                <button
                                  onClick={() => handleExportCSV(msg.widget.data)}
                                  className="flex-1 py-1.5 bg-white/90 hover:bg-white text-black border border-black/15 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                                >
                                  <FileSpreadsheet className="w-3.5 h-3.5" />
                                  <span>Export CSV</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bubble Action Controls */}
                      {msg.role === 'assistant' && (
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-black/5 text-[10px] text-black/50">
                          <span>{msg.provider || 'TRACKO'} • {msg.timestamp}</span>
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="flex items-center gap-1 hover:text-black transition-colors"
                            title="Copy message"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700 font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-end gap-2">
                <TrackoMascot state="thinking" size={32} interactive={false} className="shrink-0 mb-1" />
                <div className="px-4 py-3 bg-white/70 border border-black/15 rounded-2xl rounded-bl-none flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-black/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-black/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-black/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ================================================================= */}
          {/* INPUT BAR */}
          {/* ================================================================= */}
          <div className="p-3 sm:p-4 border-t border-black/10 bg-white/50 backdrop-blur-md shrink-0">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2 bg-white/90 border border-black/15 rounded-2xl p-2 shadow-sm focus-within:border-black transition-all"
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onFocus={() => setMascotState('listening')}
                onBlur={() => setMascotState(isTyping ? 'thinking' : 'idle')}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Ask TRACKO about ${activeWorkspaceName}...`}
                className="flex-1 bg-transparent border-0 px-2.5 py-1.5 text-xs text-black placeholder:text-black/50 focus:outline-none resize-none max-h-28"
              />

              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 bg-sunshine hover:bg-sunshine-hover disabled:opacity-40 text-black font-black rounded-xl flex items-center justify-center transition-all shrink-0 shadow-sm"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-between px-1 pt-2 text-[10px] text-black/60">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-black" />
                <span>Isolated to {activeWorkspaceName}</span>
              </span>
              <span>Enter to send • Shift+Enter for new line</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TrackoChat;
