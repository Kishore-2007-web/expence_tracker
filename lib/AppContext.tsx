"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MockDB, Profile, Subscription, Business, Transaction, SavingsGoal, Notification, Coupon, PLANS } from './mock-db';
import AdManager from './ads-manager';

interface AppContextType {
  profile: Profile;
  subscription: Subscription;
  planFeatures: string[];
  isPremium: boolean;
  businesses: Business[];
  currentBusiness: Business | null; // null = Personal Finance mode
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  notifications: Notification[];
  unreadNotificationCount: number;
  couponList: Coupon[];
  isUpgradeModalOpen: boolean;
  activeTab: string;
  theme: string;
  setTheme: (theme: string) => void;
  setCurrentBusiness: (biz: Business | null) => void;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  refreshData: () => void;
  addBusiness: (name: string, category: string, description: string, phone: string, email: string) => void;
  addTransaction: (type: 'income' | 'expense', category: string, amountCents: number, description: string, date?: string) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (name: string, targetCents: number, deadline: string) => void;
  contributeToGoal: (id: string, amountCents: number) => void;
  applyCoupon: (code: string) => Coupon | null;
  upgradeToPremium: (planId: string, couponApplied?: string) => Promise<boolean>;
  downgradeToFree: () => void;
  markNotificationsRead: () => void;
  updateProfileDetails: (name: string, phone: string, country: string, currency: string, language: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>(MockDB.getProfile());
  const [subscription, setSubscription] = useState<Subscription>(MockDB.getSubscription());
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusinessState] = useState<Business | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [couponList, setCouponList] = useState<Coupon[]>([]);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setThemeState] = useState('dark');

  const isPremium = subscription.plan_id !== 'FREE';
  const planFeatures = PLANS.find(p => p.id === subscription.plan_id)?.features || [];

  const refreshData = () => {
    setProfile({ ...MockDB.getProfile() });
    const sub = MockDB.getSubscription();
    setSubscription({ ...sub });
    setBusinesses([...MockDB.getBusinesses()]);
    setTransactions([...MockDB.getTransactions()]);
    setSavingsGoals([...MockDB.getGoals()]);
    setNotifications([...MockDB.getNotifications()]);
    setCouponList([...MockDB.getCoupons()]);
    
    // Set ad tier
    AdManager.setTier(sub.plan_id !== 'FREE' ? 'premium' : 'free');
  };

  useEffect(() => {
    refreshData();
    // Load local storage theme if exists
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') || 'dark';
      setThemeState(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    }
  }, []);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      MockDB.updateProfile({ theme: newTheme });
    }
  };

  const setCurrentBusiness = (biz: Business | null) => {
    setCurrentBusinessState(biz);
  };

  const openUpgradeModal = () => setIsUpgradeModalOpen(true);
  const closeUpgradeModal = () => setIsUpgradeModalOpen(false);

  const addBusiness = (name: string, category: string, description: string, phone: string, email: string) => {
    try {
      const newBiz = MockDB.addBusiness({
        name,
        category,
        description,
        address: 'HQ Office',
        phone,
        email,
        currency: profile.currency,
        timezone: 'UTC',
        status: 'active'
      });
      refreshData();
      setCurrentBusinessState(newBiz);
    } catch (e: any) {
      if (e.message.includes('LimitReached')) {
        openUpgradeModal();
      } else {
        alert(e.message);
      }
    }
  };

  const addTransaction = (type: 'income' | 'expense', category: string, amountCents: number, description: string, date?: string) => {
    MockDB.addTransaction({
      business_id: currentBusiness ? currentBusiness.id : null,
      type,
      category_name: category,
      amount_cents: amountCents,
      currency: profile.currency,
      description,
      transaction_date: date || new Date().toISOString()
    });
    refreshData();
  };

  const deleteTransaction = (id: string) => {
    MockDB.deleteTransaction(id);
    refreshData();
  };

  const addGoal = (name: string, targetCents: number, deadline: string) => {
    MockDB.addGoal({
      name,
      target_amount_cents: targetCents,
      current_amount_cents: 0,
      deadline
    });
    refreshData();
  };

  const contributeToGoal = (id: string, amountCents: number) => {
    const goal = savingsGoals.find(g => g.id === id);
    if (!goal) return;
    const newAmt = goal.current_amount_cents + amountCents;
    MockDB.updateGoal(id, { current_amount_cents: newAmt });
    
    // Log expense under Savings
    MockDB.addTransaction({
      business_id: null,
      type: 'expense',
      category_name: 'Savings Contribution',
      amount_cents: amountCents,
      currency: profile.currency,
      description: `Contributed to savings goal: ${goal.name}`
    });

    if (newAmt >= goal.target_amount_cents) {
      MockDB.addNotification('Savings Goal Achieved! 🏆', `Congratulations! You hit your target of ${formatCurrency(goal.target_amount_cents, profile.currency)} for "${goal.name}".`, 'goal');
    }
    
    refreshData();
  };

  const applyCoupon = (code: string) => {
    return MockDB.validateCoupon(code);
  };

  const upgradeToPremium = async (planId: string, couponApplied?: string) => {
    // Upgrades
    MockDB.upgradeSubscription(planId, couponApplied || null);
    refreshData();
    closeUpgradeModal();
    return true;
  };

  const downgradeToFree = () => {
    MockDB.downgradeSubscription();
    refreshData();
  };

  const markNotificationsRead = () => {
    MockDB.markNotificationsRead();
    refreshData();
  };

  const updateProfileDetails = (name: string, phone: string, country: string, currency: string, language: string) => {
    MockDB.updateProfile({ name, phone, country, currency, language });
    refreshData();
  };

  const unreadNotificationCount = notifications.filter(n => !n.is_read).length;

  return (
    <AppContext.Provider value={{
      profile,
      subscription,
      planFeatures,
      isPremium,
      businesses,
      currentBusiness,
      transactions,
      savingsGoals,
      notifications,
      unreadNotificationCount,
      couponList,
      isUpgradeModalOpen,
      activeTab,
      theme,
      setTheme,
      setCurrentBusiness,
      openUpgradeModal,
      closeUpgradeModal,
      refreshData,
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
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  INR: 83.5,
  GBP: 0.78
};

export const convertCurrency = (cents: number, from = 'USD', to = 'USD'): number => {
  const fromRate = EXCHANGE_RATES[from.toUpperCase()] || 1.0;
  const toRate = EXCHANGE_RATES[to.toUpperCase()] || 1.0;
  return Math.round((cents / fromRate) * toRate);
};

// Global format currency helper
export const formatCurrency = (cents: number, currencyCode = 'USD') => {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2
  }).format(amount);
};
