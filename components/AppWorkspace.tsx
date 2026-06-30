"use client";

import React, { useState, useMemo } from 'react';
import { useApp, formatCurrency, convertCurrency } from '@/lib/AppContext';
import { AdBanner } from './AdBanner';
import {
  LayoutDashboard,
  Wallet,
  Briefcase,
  PiggyBank,
  FileSpreadsheet,
  BarChart3,
  Settings as SettingsIcon,
  Users,
  LogOut,
  ChevronDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  TrendingUp,
  Download,
  Trash2,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  Sun,
  Moon,
  Upload,
  User,
  Ticket
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface AppWorkspaceProps {
  onLogout: () => void;
}

export const AppWorkspace: React.FC<AppWorkspaceProps> = ({ onLogout }) => {
  const {
    profile,
    subscription,
    isPremium,
    businesses,
    currentBusiness,
    setCurrentBusiness,
    transactions,
    savingsGoals,
    notifications,
    unreadNotificationCount,
    couponList,
    theme,
    setTheme,
    openUpgradeModal,
    addBusiness,
    addTransaction,
    deleteTransaction,
    addGoal,
    contributeToGoal,
    applyCoupon,
    upgradeToPremium,
    downgradeToFree,
    markNotificationsRead,
    updateProfileDetails
  } = useApp();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showBusinessDropdown, setShowBusinessDropdown] = useState(false);
  const [showAddBizModal, setShowAddBizModal] = useState(false);
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [activeGoalInput, setActiveGoalInput] = useState<string | null>(null);

  // Form states
  const [bizForm, setBizForm] = useState({ name: '', category: '', description: '', phone: '', email: '' });
  const [txForm, setTxForm] = useState({ type: 'expense' as 'income' | 'expense', category: 'Food', amount: '', description: '', date: '' });
  const [goalForm, setGoalForm] = useState({ name: '', target: '', deadline: '' });

  // Filtering & Search
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('all');
  const [txCategoryFilter, setTxCategoryFilter] = useState('all');

  // Reports Date range
  const [reportRange, setReportRange] = useState('monthly');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Invoice Simulator
  const [invoiceForm, setInvoiceForm] = useState({ clientName: '', email: '', itemDescription: '', amount: '', invoiceNumber: 'INV-1002' });
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

  // Settings
  const [profileForm, setProfileForm] = useState({ name: profile.name, phone: profile.phone, country: profile.country, currency: profile.currency, language: profile.language });

  // Admin Panels
  const [adminCoupons, setAdminCoupons] = useState(couponList);
  const [newCouponForm, setNewCouponForm] = useState({ code: '', discountPercent: '', discountFlat: '', expiry: '' });

  // Auto transition to correct category depending on selection
  const handleTxTypeChange = (type: 'income' | 'expense') => {
    setTxForm(prev => ({
      ...prev,
      type,
      category: type === 'income' ? 'Salary' : 'Food'
    }));
  };

  // Calculations for current workspace selection (Personal vs Selected Business)
  const currentTransactions = useMemo(() => {
    if (currentBusiness === null) {
      // Personal mode
      return transactions.filter(t => t.business_id === null);
    } else {
      // Specific business mode
      return transactions.filter(t => t.business_id === currentBusiness.id);
    }
  }, [transactions, currentBusiness]);

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    
    currentTransactions.forEach(t => {
      const converted = convertCurrency(t.amount_cents, t.currency || 'USD', profile.currency);
      if (t.type === 'income') {
        income += converted;
      } else {
        expense += converted;
      }
    });

    const balance = income - expense;
    const savingsTotal = currentBusiness === null 
      ? savingsGoals.reduce((sum, g) => sum + convertCurrency(g.current_amount_cents, 'USD', profile.currency), 0)
      : 0;

    return {
      income,
      expense,
      balance,
      savings: savingsTotal,
      netWorth: balance + savingsTotal
    };
  }, [currentTransactions, savingsGoals, currentBusiness, profile.currency]);

  // AI Financial Insights Generator
  const aiInsights = useMemo(() => {
    if (!isPremium) {
      return [
        { title: 'Unlock AI Financial Insights', desc: 'Upgrade to Premium to get tailormade recommendations based on your spending history.', isLocked: true }
      ];
    }
    
    const insights = [];
    const ratio = stats.income > 0 ? (stats.expense / stats.income) : 1;
    
    if (ratio > 0.7) {
      insights.push({
        title: 'High Burn Rate Detected',
        desc: `Your expenses represent ${Math.round(ratio * 100)}% of your earnings. Consider reviewing your top categories to optimize utility costs.`,
        isLocked: false
      });
    } else {
      insights.push({
        title: 'Healthy Savings Rate',
        desc: `Great job! You are saving ${Math.round((1 - ratio) * 100)}% of your cashflow. This is ideal for compounding investments.`,
        isLocked: false
      });
    }

    if (currentBusiness) {
      insights.push({
        title: 'Business Profit Margin Analysis',
        desc: `Profit margins for "${currentBusiness.name}" are currently sitting at ${stats.income > 0 ? Math.round((stats.balance / stats.income) * 100) : 0}%. A standard healthy margin for ${currentBusiness.category} is 25%.`,
        isLocked: false
      });
    } else {
      insights.push({
        title: 'Savings Goal Deadline Approaching',
        desc: 'Emergency Fund savings are currently 77% complete. You need $45.00 more per month to achieve it before your target date.',
        isLocked: false
      });
    }

    return insights;
  }, [isPremium, stats, currentBusiness, savingsGoals]);

  // Chart Data preparation
  const monthlyChartData = useMemo(() => {
    // Group transactions by simple labels (Week 1, Week 2 etc.)
    return [
      { name: 'Week 1', Income: stats.income * 0.25 / 100, Expense: stats.expense * 0.22 / 100 },
      { name: 'Week 2', Income: stats.income * 0.35 / 100, Expense: stats.expense * 0.38 / 100 },
      { name: 'Week 3', Income: stats.income * 0.20 / 100, Expense: stats.expense * 0.18 / 100 },
      { name: 'Week 4', Income: stats.income * 0.20 / 100, Expense: stats.expense * 0.22 / 100 }
    ];
  }, [stats]);

  const categoryChartData = useMemo(() => {
    const cats: Record<string, number> = {};
    currentTransactions.forEach(t => {
      if (t.type === 'expense') {
        cats[t.category_name] = (cats[t.category_name] || 0) + t.amount_cents / 100;
      }
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [currentTransactions]);

  const CATEGORY_COLORS: Record<string, string> = {
    Food: '#f97316',      // Orange
    Travel: '#06b6d4',    // Cyan
    Shopping: '#ec4899',  // Pink
    Bills: '#ef4444',     // Red
    Salary: '#10b981',    // Emerald
    Rent: '#a855f7',      // Purple
    Marketing: '#6366f1', // Indigo
    Utilities: '#eab308', // Yellow
    Inventory: '#f59e0b', // Amber
    'Savings Contribution': '#3b82f6', // Blue
  };

  const filteredTransactions = useMemo(() => {
    return currentTransactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(txSearch.toLowerCase()) ||
                            t.category_name.toLowerCase().includes(txSearch.toLowerCase());
      const matchesType = txTypeFilter === 'all' || t.type === txTypeFilter;
      const matchesCategory = txCategoryFilter === 'all' || t.category_name === txCategoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [currentTransactions, txSearch, txTypeFilter, txCategoryFilter]);

  // Export handlers (CSV, Excel, PDF simulation)
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    if (!isPremium && format !== 'csv') {
      openUpgradeModal();
      return;
    }

    const headers = 'ID,Date,Type,Category,Description,Amount,Currency\n';
    const rows = currentTransactions.map(t => 
      `"${t.id}","${t.transaction_date.substring(0, 10)}","${t.type}","${t.category_name}","${t.description.replace(/"/g, '""')}",${(t.amount_cents / 100).toFixed(2)},"${t.currency}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `moneyflow_report_${currentBusiness ? currentBusiness.name.replace(/\s+/g, '_') : 'personal'}_${new Date().toISOString().substring(0, 10)}.${format === 'excel' ? 'xlsx' : format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInvoiceGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.clientName || !invoiceForm.amount) return;
    setGeneratedInvoice({
      ...invoiceForm,
      id: 'INV-' + Math.floor(1000 + Math.random() * 9000),
      businessName: currentBusiness ? currentBusiness.name : 'Personal Consulting',
      logo: currentBusiness?.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=128&h=128&fit=crop',
      issuedDate: new Date().toLocaleDateString(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()
    });
  };

  const handleAddBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizForm.name || !bizForm.category) return;
    addBusiness(bizForm.name, bizForm.category, bizForm.description, bizForm.phone, bizForm.email);
    setBizForm({ name: '', category: '', description: '', phone: '', email: '' });
    setShowAddBizModal(false);
  };

  const handleAddTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.amount) return;
    const cents = Math.round(parseFloat(txForm.amount) * 100);
    addTransaction(txForm.type, txForm.category, cents, txForm.description, txForm.date);
    setTxForm({ type: 'expense', category: 'Food', amount: '', description: '', date: '' });
    setShowAddTxModal(false);
  };

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.name || !goalForm.target) return;
    const cents = Math.round(parseFloat(goalForm.target) * 100);
    addGoal(goalForm.name, cents, goalForm.deadline);
    setGoalForm({ name: '', target: '', deadline: '' });
    setShowAddGoalModal(false);
  };

  const handleAddCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponForm.code) return;
    const newCoupon = {
      code: newCouponForm.code.toUpperCase(),
      discount_percent: newCouponForm.discountPercent ? parseInt(newCouponForm.discountPercent) : 0,
      discount_flat_cents: newCouponForm.discountFlat ? Math.round(parseFloat(newCouponForm.discountFlat) * 100) : 0,
      expiry_date: newCouponForm.expiry || '2028-12-31',
      max_uses: 100,
      uses_count: 0,
      min_purchase_cents: 0
    };
    setAdminCoupons([...adminCoupons, newCoupon]);
    setNewCouponForm({ code: '', discountPercent: '', discountFlat: '', expiry: '' });
    alert('Coupon code added successfully!');
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-card p-6 flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-black text-lg shadow-glow">
              M
            </div>
            <span className="font-bold text-sm tracking-tight">MoneyFlow <span className="text-primary font-black">Pro</span></span>
          </div>

          {/* Account/Business Switcher */}
          <div className="relative mb-6">
            <button
              onClick={() => setShowBusinessDropdown(!showBusinessDropdown)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-accent hover:bg-accent-hover transition-all text-left text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0">
                  {currentBusiness ? currentBusiness.name[0] : 'P'}
                </div>
                <div className="truncate max-w-[120px]">
                  {currentBusiness ? currentBusiness.name : 'Personal Finance'}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showBusinessDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 p-1.5 space-y-1">
                <button
                  onClick={() => {
                    setCurrentBusiness(null);
                    setShowBusinessDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-accent transition-colors flex items-center gap-2 ${
                    currentBusiness === null ? 'bg-primary/5 text-primary' : ''
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Personal Account</span>
                </button>

                {businesses.map(biz => (
                  <button
                    key={biz.id}
                    onClick={() => {
                      setCurrentBusiness(biz);
                      setShowBusinessDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-accent transition-colors flex items-center gap-2 truncate ${
                      currentBusiness?.id === biz.id ? 'bg-primary/5 text-primary' : ''
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{biz.name}</span>
                  </button>
                ))}

                <div className="h-px bg-border my-1"></div>

                <button
                  onClick={() => {
                    setShowBusinessDropdown(false);
                    setShowAddBizModal(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Business</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'transactions', label: 'Transactions', icon: Wallet },
              { id: 'business', label: 'Business Settings', icon: Briefcase, businessOnly: true },
              { id: 'savings', label: 'Savings Goals', icon: PiggyBank, personalOnly: true },
              { id: 'reports', label: 'Reports Manager', icon: FileSpreadsheet },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings & Profile', icon: SettingsIcon }
            ].map(item => {
              if (item.businessOnly && currentBusiness === null) return null;
              if (item.personalOnly && currentBusiness !== null) return null;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-primary text-white shadow-glow'
                      : 'text-slate-500 hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}


          </nav>
        </div>

        {/* Footer info */}
        <div className="space-y-4">
          {/* User Profile */}
          <div className="flex items-center gap-2 p-1.5 bg-accent/40 rounded-xl">
            <div className="w-9 h-9 bg-accent border border-border rounded-full flex items-center justify-center text-slate-400 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="truncate max-w-[120px]">
              <div className="text-xs font-bold">{profile.name}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                {isPremium ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[8px] bg-emerald-50 dark:bg-emerald-950/50 px-1 rounded">PRO</span>
                ) : (
                  <span className="text-slate-400">Free Tier</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-accent rounded-xl text-slate-400 hover:text-foreground transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs text-danger font-medium hover:underline p-2 hover:bg-danger/5 rounded-xl"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar header */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Switcher placeholder */}
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-black text-lg">M</div>
            </div>
            
            <h1 className="text-base font-bold tracking-tight">
              {currentBusiness ? `Business Workspace: ${currentBusiness.name}` : 'Personal Wealth Workspace'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {!isPremium && (
              <button
                onClick={openUpgradeModal}
                className="px-4 py-2 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary-hover hover:to-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-glow hover:shadow-glow/15 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade Pro</span>
              </button>
            )}

            <button
              onClick={() => setShowAddTxModal(true)}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white dark:hover:bg-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Transaction</span>
            </button>
          </div>
        </header>

        {/* Dynamic Inner Page Viewer */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (currentBusiness ? currentBusiness.id : 'personal')}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* DASHBOARD TAB VIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="p-6 bg-card border border-border rounded-2xl shadow-premium">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Net Worth Cashflow</div>
                      <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                        {formatCurrency(stats.netWorth, profile.currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-success" />
                        <span>Calculated including savings targets</span>
                      </div>
                    </div>

                    <div className="p-6 bg-card border border-border rounded-2xl shadow-premium">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Workspace Incomes</div>
                      <div className="text-xl md:text-2xl font-black text-success">
                        {formatCurrency(stats.income, profile.currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-success" />
                        <span>Aggregated ledger transactions</span>
                      </div>
                    </div>

                    <div className="p-6 bg-card border border-border rounded-2xl shadow-premium">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Workspace Expenses</div>
                      <div className="text-xl md:text-2xl font-black text-danger">
                        {formatCurrency(stats.expense, profile.currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3 text-danger" />
                        <span>Outflow costs list</span>
                      </div>
                    </div>

                    <div className="p-6 bg-card border border-border rounded-2xl shadow-premium">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Net Balance</div>
                      <div className={`text-xl md:text-2xl font-black ${stats.balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-danger'}`}>
                        {formatCurrency(stats.balance, profile.currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Total profit margin: {stats.income > 0 ? Math.round((stats.balance / stats.income) * 100) : 0}%
                      </div>
                    </div>
                  </div>

                  {/* First Time Entry / Quick Start Guide */}
                  {transactions.length === 0 && (
                    <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl shadow-premium relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Welcome to MoneyFlow Pro!</h3>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                            It looks like you're setting up your workspace for the first time. Follow these simple steps to start tracking your finances and personal wealth:
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => setShowAddTxModal(true)}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-glow flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>1. Add First Transaction</span>
                          </button>
                          <button
                            onClick={() => {
                              setCurrentBusiness(null);
                              setActiveTab('savings');
                            }}
                            className="px-4 py-2 bg-success hover:bg-success/90 text-white text-xs font-bold rounded-xl transition-all shadow-glow flex items-center gap-1.5"
                          >
                            <PiggyBank className="w-3.5 h-3.5" />
                            <span>2. Create Savings Goal</span>
                          </button>
                          <button
                            onClick={() => setShowAddBizModal(true)}
                            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                          >
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>3. Register a Business</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recharts Graphical Visuals */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="p-6 bg-card border border-border rounded-2xl shadow-premium lg:col-span-2">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-sm">Income vs Expense Flow</h3>
                        <span className="text-xs text-slate-400">Weekly breakdown</span>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={monthlyChartData}>
                            <defs>
                              <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="name" stroke="var(--foreground)" fontSize={11} />
                            <YAxis stroke="var(--foreground)" fontSize={11} />
                            <Tooltip />
                            <Area type="monotone" dataKey="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" />
                            <Area type="monotone" dataKey="Expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExp)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="p-6 bg-card border border-border rounded-2xl shadow-premium">
                      <h3 className="font-bold text-sm mb-6">Expenses Categories</h3>
                      {categoryChartData.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center text-xs text-slate-400">
                          <AlertCircle className="w-8 h-8 mb-2" />
                          <span>No expenses recorded yet.</span>
                        </div>
                      ) : (
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {categoryChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#64748b'} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Ledger List */}
                  <div className="p-6 bg-card border border-border rounded-2xl shadow-premium">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-sm">Recent Ledger Entries</h3>
                      <button onClick={() => setActiveTab('transactions')} className="text-xs text-primary font-semibold hover:underline">
                        View All
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {currentTransactions.slice(-5).reverse().map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-border">
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg font-bold text-xs shrink-0 ${
                              tx.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                            }`}>
                              {tx.type === 'income' ? '+' : '-'}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{tx.description}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{tx.category_name} &bull; {tx.transaction_date.substring(0, 10)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold ${tx.type === 'income' ? 'text-success' : 'text-slate-700 dark:text-slate-200'}`}>
                              {formatCurrency(convertCurrency(tx.amount_cents, tx.currency || 'USD', profile.currency), profile.currency)}
                            </span>
                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              className="p-1 text-slate-400 hover:text-danger rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {currentTransactions.length === 0 && (
                        <div className="py-12 text-center text-xs text-slate-400">
                          No transactions found in this workspace. Click "Add Transaction" to create one.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Advertisement system banner for free tier */}
                  <AdBanner placementKey="dashboard" />
                </div>
              )}

              {/* TRANSACTIONS TAB VIEW */}
              {activeTab === 'transactions' && (
                <div className="space-y-6">
                  {/* Filters / Search Bar */}
                  <div className="p-5 bg-card border border-border rounded-2xl shadow-premium flex flex-col md:flex-row gap-4 justify-between items-center">
                    <input
                      type="text"
                      placeholder="Search description, category..."
                      value={txSearch}
                      onChange={e => setTxSearch(e.target.value)}
                      className="w-full md:w-72 bg-accent border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary"
                    />

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <select
                        value={txTypeFilter}
                        onChange={e => setTxTypeFilter(e.target.value)}
                        className="flex-1 md:flex-none bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="all">All Types</option>
                        <option value="income">Income Only</option>
                        <option value="expense">Expenses Only</option>
                      </select>

                      <select
                        value={txCategoryFilter}
                        onChange={e => setTxCategoryFilter(e.target.value)}
                        className="flex-1 md:flex-none bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="all">All Categories</option>
                        {Array.from(new Set(currentTransactions.map(t => t.category_name))).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Transactions Table Ledger */}
                  <div className="bg-card border border-border rounded-2xl shadow-premium overflow-hidden">
                    <div className="p-6 border-b border-border flex justify-between items-center">
                      <h3 className="font-bold text-sm">Ledger Entries ({filteredTransactions.length})</h3>
                      <button
                        onClick={() => handleExport('csv')}
                        className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-foreground text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>

                    <div className="divide-y divide-border">
                      {filteredTransactions.map(tx => (
                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                              tx.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                            }`}>
                              {tx.type === 'income' ? 'IN' : 'OUT'}
                            </div>
                            <div>
                              <div className="text-xs font-bold">{tx.description}</div>
                              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                                <span className="bg-accent px-1.5 py-0.5 rounded">{tx.category_name}</span>
                                <span>&bull;</span>
                                <span>{tx.transaction_date.substring(0, 10)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className={`text-xs font-bold ${tx.type === 'income' ? 'text-success' : 'text-slate-700 dark:text-slate-200'}`}>
                              {formatCurrency(convertCurrency(tx.amount_cents, tx.currency || 'USD', profile.currency), profile.currency)}
                            </span>
                            <button
                              onClick={() => deleteTransaction(tx.id)}
                              className="p-1.5 text-slate-400 hover:text-danger hover:bg-accent rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {filteredTransactions.length === 0 && (
                        <div className="p-12 text-center text-xs text-slate-400">
                          No matching ledger items found.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* BUSINESS TAB VIEW (ONLY SHOWN FOR SELECTED BUSINESS) */}
              {activeTab === 'business' && currentBusiness && (
                <div className="space-y-6">
                  <div className="p-6 bg-card border border-border rounded-2xl shadow-premium">
                    <h3 className="font-bold text-sm mb-4">Business Parameters</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-xs font-semibold text-slate-400 uppercase">Company Name</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{currentBusiness.name}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-400 uppercase">Sector Category</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{currentBusiness.category}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-400 uppercase">Workspace Email</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{currentBusiness.email}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-400 uppercase">Description</span>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{currentBusiness.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Generator */}
                  <div className="p-6 bg-card border border-border rounded-2xl shadow-premium">
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      <span>Invoice PDF Generator</span>
                    </h3>

                    {!isPremium ? (
                      <div className="p-6 rounded-xl border border-dashed border-border bg-slate-50 dark:bg-slate-900/20 text-center">
                        <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                        <h4 className="font-bold text-xs mb-1">Invoice Generation is a Premium Feature</h4>
                        <p className="text-[11px] text-slate-400 mb-4 max-w-md mx-auto">
                          Upload custom logos, generate branded client receipts, and track payment milestones.
                        </p>
                        <button
                          onClick={openUpgradeModal}
                          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl transition-all"
                        >
                          Upgrade Now
                        </button>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Invoice Form */}
                        <form onSubmit={handleInvoiceGenerate} className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">Invoice Number</label>
                            <input
                              type="text"
                              value={invoiceForm.invoiceNumber}
                              onChange={e => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                              className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">Client Full Name</label>
                            <input
                              type="text"
                              required
                              placeholder="Acme Corp LLC"
                              value={invoiceForm.clientName}
                              onChange={e => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })}
                              className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">Client Email</label>
                            <input
                              type="email"
                              placeholder="billing@acme.com"
                              value={invoiceForm.email}
                              onChange={e => setInvoiceForm({ ...invoiceForm, email: e.target.value })}
                              className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">Services / Goods Description</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Q2 consulting, Software licensing"
                              value={invoiceForm.itemDescription}
                              onChange={e => setInvoiceForm({ ...invoiceForm, itemDescription: e.target.value })}
                              className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">Amount ({profile.currency})</label>
                            <input
                              type="number"
                              required
                              placeholder="1200.00"
                              value={invoiceForm.amount}
                              onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                              className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all"
                          >
                            Generate Invoice
                          </button>
                        </form>

                        {/* Invoice Preview */}
                        <div className="border border-border rounded-xl p-5 bg-slate-50 dark:bg-slate-900/30 flex flex-col justify-between">
                          {generatedInvoice ? (
                            <div className="space-y-4">
                              <div className="flex justify-between items-start border-b border-border pb-4">
                                <div>
                                  <h4 className="font-black text-sm">{generatedInvoice.businessName}</h4>
                                  <span className="text-[10px] text-slate-400">Invoice Draft</span>
                                </div>
                                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                                  {generatedInvoice.invoiceNumber}
                                </span>
                              </div>

                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Client:</span>
                                  <span className="font-semibold">{generatedInvoice.clientName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Service:</span>
                                  <span className="font-semibold truncate max-w-[150px]">{generatedInvoice.itemDescription}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Issued:</span>
                                  <span>{generatedInvoice.issuedDate}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Due Date:</span>
                                  <span>{generatedInvoice.dueDate}</span>
                                </div>
                              </div>

                              <div className="border-t border-border pt-4 flex justify-between items-baseline">
                                <span className="text-xs font-medium text-slate-400">Total Charged:</span>
                                <span className="text-lg font-black text-primary">
                                  {formatCurrency(parseFloat(generatedInvoice.amount) * 100, profile.currency)}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => alert('PDF report downloaded successfully!')}
                                className="w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download PDF</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-slate-400 py-12">
                              <FileText className="w-8 h-8 mb-2" />
                              <span>Fill form to preview invoice</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SAVINGS TAB VIEW (ONLY PERSONAL ACCOUNT) */}
              {activeTab === 'savings' && currentBusiness === null && (
                <div className="space-y-6">
                  {/* Goals Header */}
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm">Target Savings Goals</h3>
                    <button
                      onClick={() => setShowAddGoalModal(true)}
                      className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-glow hover:shadow-glow/10"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Target Goal</span>
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savingsGoals.map(goal => {
                      const progress = Math.min(100, Math.round((goal.current_amount_cents / goal.target_amount_cents) * 100));
                      
                      return (
                        <div key={goal.id} className="p-6 bg-card border border-border rounded-2xl shadow-premium flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-bold text-sm">{goal.name}</h4>
                                <span className="text-[10px] text-slate-400 uppercase font-medium">Deadline: {goal.deadline.substring(0, 10)}</span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                goal.status === 'achieved' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                              }`}>
                                {goal.status === 'achieved' ? 'Achieved 🏆' : `${progress}%`}
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-2 bg-accent rounded-full mb-4 overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>

                            <div className="flex justify-between text-xs mb-6">
                              <span className="text-slate-400">Current: {formatCurrency(convertCurrency(goal.current_amount_cents, 'USD', profile.currency), profile.currency)}</span>
                              <span className="font-bold">Target: {formatCurrency(convertCurrency(goal.target_amount_cents, 'USD', profile.currency), profile.currency)}</span>
                            </div>
                          </div>

                          {goal.status !== 'achieved' && (
                            activeGoalInput === goal.id ? (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                                      {profile.currency === 'INR' ? '₹' : profile.currency === 'EUR' ? '€' : profile.currency === 'GBP' ? '£' : '$'}
                                    </span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0.01"
                                      placeholder="0.00"
                                      autoFocus
                                      id={`input-goal-${goal.id}`}
                                      className="w-full pl-6 pr-2 py-1.5 bg-accent border border-border rounded-lg text-xs focus:outline-none focus:border-primary text-slate-800 dark:text-slate-100"
                                    />
                                  </div>
                                  <button
                                    onClick={() => {
                                      const inputEl = document.getElementById(`input-goal-${goal.id}`) as HTMLInputElement;
                                      const amt = inputEl?.value;
                                      if (amt && parseFloat(amt) > 0) {
                                        const cents = Math.round(parseFloat(amt) * 100);
                                        contributeToGoal(goal.id, cents);
                                        setActiveGoalInput(null);
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-success hover:bg-success/90 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-glow"
                                  >
                                    Add
                                  </button>
                                  <button
                                    onClick={() => setActiveGoalInput(null)}
                                    className="px-2 py-1.5 bg-accent hover:bg-accent-hover text-slate-500 hover:text-foreground text-xs font-semibold rounded-lg border border-border transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setActiveGoalInput(goal.id)}
                                className="w-full py-2 bg-success hover:bg-success/90 text-white text-xs font-semibold rounded-lg transition-colors shadow-glow"
                              >
                                Today's contribution
                              </button>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* REPORTS MANAGER TAB VIEW */}
              {activeTab === 'reports' && (
                <div className="space-y-6">
                  {/* Select Range & Targets */}
                  <div className="p-6 bg-card border border-border rounded-2xl shadow-premium">
                    <h3 className="font-bold text-sm mb-4">Configure Financial Report</h3>
                    
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2">Report Interval</label>
                        <select
                          value={reportRange}
                          onChange={e => setReportRange(e.target.value)}
                          className="w-full bg-accent border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                        >
                          <option value="daily">Daily Report</option>
                          <option value="weekly">Weekly Report</option>
                          <option value="monthly">Monthly Report</option>
                          <option value="yearly">Yearly Report</option>
                          <option value="custom">Custom Date Range</option>
                        </select>
                      </div>

                      {reportRange === 'custom' && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">Start Date</label>
                            <input
                              type="date"
                              value={customStartDate}
                              onChange={e => setCustomStartDate(e.target.value)}
                              className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">End Date</label>
                            <input
                              type="date"
                              value={customEndDate}
                              onChange={e => setCustomEndDate(e.target.value)}
                              className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleExport('csv')}
                        className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        onClick={() => handleExport('excel')}
                        className="px-4 py-2 bg-accent hover:bg-accent-hover text-foreground text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Excel</span>
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="px-4 py-2 bg-accent hover:bg-accent-hover text-foreground text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export PDF</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Preview list */}
                  <div className="bg-card border border-border rounded-2xl shadow-premium p-6">
                    <h4 className="font-bold text-sm mb-4">Report Ledger Preview ({currentTransactions.length} lines)</h4>
                    <div className="max-h-96 overflow-y-auto divide-y divide-border">
                      {currentTransactions.map(tx => (
                        <div key={tx.id} className="py-3 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{tx.description}</span>
                            <span className="ml-2 text-slate-400">({tx.category_name})</span>
                          </div>
                          <span className={`font-bold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(convertCurrency(tx.amount_cents, tx.currency || 'USD', profile.currency), profile.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <AdBanner placementKey="reports" />
                </div>
              )}

              {/* ANALYTICS TAB VIEW */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* AI Financial insights summary */}
                  <div className="p-6 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200 dark:border-emerald-950/60 rounded-2xl shadow-premium">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
                      <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-400">AI-Powered Financial Insights</h3>
                    </div>

                    <div className="space-y-3">
                      {aiInsights.map((insight, index) => (
                        <div key={index} className="p-4 bg-white/50 dark:bg-slate-900/60 border border-border rounded-xl">
                          <h4 className="font-bold text-xs mb-1">{insight.title}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{insight.desc}</p>
                          {insight.isLocked && (
                            <button
                              type="button"
                              onClick={openUpgradeModal}
                              className="mt-3 text-xs font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              <span>Upgrade to unlock</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Growth & comparison charts */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="p-6 bg-card border border-border rounded-2xl shadow-premium">
                      <h4 className="font-bold text-xs mb-6">Revenue Profit Margin Distribution</h4>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="name" stroke="var(--foreground)" fontSize={11} />
                            <YAxis stroke="var(--foreground)" fontSize={11} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="p-6 bg-card border border-border rounded-2xl shadow-premium">
                      <h4 className="font-bold text-xs mb-6">Cashflow Accumulations</h4>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={monthlyChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="name" stroke="var(--foreground)" fontSize={11} />
                            <YAxis stroke="var(--foreground)" fontSize={11} />
                            <Tooltip />
                            <Area type="monotone" dataKey="Income" stroke="#6366f1" fill="#6366f1" fillOpacity={0.05} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SETTINGS & PROFILE TAB VIEW */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Profile form card */}
                  <div className="p-6 bg-card border border-border rounded-2xl shadow-premium">
                    <h3 className="font-bold text-sm mb-6 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-primary" />
                      <span>Profile Configurations</span>
                    </h3>

                    <form onSubmit={e => {
                      e.preventDefault();
                      updateProfileDetails(profileForm.name, profileForm.phone, profileForm.country, profileForm.currency, profileForm.language);
                      alert('Profile changes saved successfully!');
                    }} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2">Display Name</label>
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2">Contact Phone</label>
                          <input
                            type="text"
                            value={profileForm.phone}
                            onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2">Country Code</label>
                          <input
                            type="text"
                            value={profileForm.country}
                            onChange={e => setProfileForm({ ...profileForm, country: e.target.value })}
                            className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2">Base Currency</label>
                          <select
                            value={profileForm.currency}
                            onChange={e => setProfileForm({ ...profileForm, currency: e.target.value })}
                            className="w-full bg-accent border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                          >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (&euro;)</option>
                            <option value="INR">INR (&#8377;)</option>
                            <option value="GBP">GBP (&pound;)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2">Theme Mode</label>
                          <select
                            value={theme}
                            onChange={e => setTheme(e.target.value)}
                            className="w-full bg-accent border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                          >
                            <option value="light">Light Mode ☀️</option>
                            <option value="dark">Dark Mode 🌙</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all"
                      >
                        Save Configurations
                      </button>
                    </form>
                  </div>

                  {/* Subscriptions info */}
                  <div className="p-6 bg-card border border-border rounded-2xl shadow-premium">
                    <h3 className="font-bold text-sm mb-4">Subscription Billing Details</h3>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-border rounded-xl mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-500">Current Plan Status:</span>
                        <span className="text-xs font-bold uppercase text-primary">{subscription.plan_id}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Next Renewal Period:</span>
                        <span className="text-xs font-medium">{subscription.current_period_end.substring(0, 10)}</span>
                      </div>
                    </div>

                    {isPremium ? (
                      <button
                        type="button"
                        onClick={downgradeToFree}
                        className="px-4 py-2 border border-danger text-danger hover:bg-danger/5 text-xs font-semibold rounded-xl transition-all"
                      >
                        Cancel Auto Renewal
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={openUpgradeModal}
                        className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl transition-all shadow-glow hover:shadow-glow/10"
                      >
                        Upgrade Subscription
                      </button>
                    )}
                  </div>

                  <AdBanner placementKey="settings" />
                </div>
              )}



            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* DIALOG FORM MODALS */}
      {/* ========================================================================= */}

      {/* Add Business Modal */}
      {showAddBizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-premium p-6">
            <h3 className="font-bold text-base mb-4">Register Business</h3>
            
            <form onSubmit={handleAddBusinessSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Business Name</label>
                <input
                  type="text"
                  required
                  value={bizForm.name}
                  onChange={e => setBizForm({ ...bizForm, name: e.target.value })}
                  className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Industry Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Retail, Consulting"
                  value={bizForm.category}
                  onChange={e => setBizForm({ ...bizForm, category: e.target.value })}
                  className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Workspace Email</label>
                <input
                  type="email"
                  value={bizForm.email}
                  onChange={e => setBizForm({ ...bizForm, email: e.target.value })}
                  className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={bizForm.phone}
                  onChange={e => setBizForm({ ...bizForm, phone: e.target.value })}
                  className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Short Description</label>
                <textarea
                  rows={2}
                  value={bizForm.description}
                  onChange={e => setBizForm({ ...bizForm, description: e.target.value })}
                  className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBizModal(false)}
                  className="px-4 py-2 border border-border text-slate-400 hover:text-foreground text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-all"
                >
                  Add Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-premium p-6">
            <h3 className="font-bold text-base mb-4">Add Transaction</h3>
            
            <form onSubmit={handleAddTransactionSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-1 bg-accent rounded-lg mb-2">
                <button
                  type="button"
                  onClick={() => handleTxTypeChange('expense')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                    txForm.type === 'expense' ? 'bg-card text-foreground shadow-sm' : 'text-slate-400'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => handleTxTypeChange('income')}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                    txForm.type === 'income' ? 'bg-card text-foreground shadow-sm' : 'text-slate-400'
                  }`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Billing, Client payment"
                  value={txForm.description}
                  onChange={e => setTxForm({ ...txForm, description: e.target.value })}
                  className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Amount ({profile.currency === 'INR' ? '₹' : profile.currency === 'EUR' ? '€' : profile.currency === 'GBP' ? '£' : '$'})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={txForm.amount}
                  onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
                  className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
                <select
                  value={txForm.category}
                  onChange={e => setTxForm({ ...txForm, category: e.target.value })}
                  className="w-full bg-accent border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                >
                  {txForm.type === 'expense' ? (
                    <>
                      <option value="Food">Food</option>
                      <option value="Travel">Travel</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Bills">Bills</option>
                      <option value="Salary">Salary (Payroll)</option>
                      <option value="Rent">Rent</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Inventory">Inventory</option>
                    </>
                  ) : (
                    <>
                      <option value="Salary">Salary</option>
                      <option value="Freelancing">Freelancing</option>
                      <option value="Sales">Sales</option>
                      <option value="Services">Services</option>
                      <option value="Investments">Investments</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
                <input
                  type="date"
                  value={txForm.date}
                  onChange={e => setTxForm({ ...txForm, date: e.target.value })}
                  className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="px-4 py-2 border border-border text-slate-400 hover:text-foreground text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-all"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-premium p-6">
            <h3 className="font-bold text-base mb-4">Set Savings Target Goal</h3>
            
            <form onSubmit={handleAddGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Goal Target Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vacation, Emergency Fund"
                  value={goalForm.name}
                  onChange={e => setGoalForm({ ...goalForm, name: e.target.value })}
                  className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Target Amount ({profile.currency === 'INR' ? '₹' : profile.currency === 'EUR' ? '€' : profile.currency === 'GBP' ? '£' : '$'})
                </label>
                <input
                  type="number"
                  required
                  placeholder="5000"
                  value={goalForm.target}
                  onChange={e => setGoalForm({ ...goalForm, target: e.target.value })}
                  className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Deadline</label>
                <input
                  type="date"
                  required
                  value={goalForm.deadline}
                  onChange={e => setGoalForm({ ...goalForm, deadline: e.target.value })}
                  className="w-full bg-accent border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-4 py-2 border border-border text-slate-400 hover:text-foreground text-xs font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-all"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default AppWorkspace;
