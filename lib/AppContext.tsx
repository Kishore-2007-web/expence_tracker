"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MockDB, Profile, Subscription, Business, Transaction, SavingsGoal, Notification, Coupon, PLANS } from './mock-db';

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

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
  firebaseUser: FirebaseUser | null;
  isFirebaseBlocked: boolean;
  authLoading: boolean;
  loginOffline: () => void;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(EXCHANGE_RATES);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseBlocked, setIsFirebaseBlocked] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const isPremium = true;
  const planFeatures = PLANS[0]?.features || [];

  const refreshData = () => {
    setProfile({ ...MockDB.getProfile() });
    const sub = MockDB.getSubscription();
    setSubscription({ ...sub });
    setBusinesses([...MockDB.getBusinesses()]);
    setTransactions([...MockDB.getTransactions()]);
    setSavingsGoals([...MockDB.getGoals()]);
    setNotifications([...MockDB.getNotifications()]);
    setCouponList([...MockDB.getCoupons()]);
  };

  const loginOffline = () => {
    const mockUid = 'mock-offline-uuid';
    const isNewUserLogin = MockDB.getProfile().id !== mockUid;
    const updatedProfile = MockDB.updateProfile({
      id: mockUid,
      name: 'Demo User',
      email: 'demo@mypockettracker.io',
      ...(isNewUserLogin ? { onboarded: false } : {})
    });
    setProfile(updatedProfile);
    localStorage.setItem('moneyflow_auth_mode', 'offline');
    setFirebaseUser({
      uid: mockUid,
      email: 'demo@mypockettracker.io',
      displayName: 'Demo User',
      photoURL: null
    } as any);
  };

  useEffect(() => {
    refreshData();
    // Load local storage theme if exists
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') || 'dark';
      setThemeState(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    }

    // Fetch real-time exchange rates
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          // Update global EXCHANGE_RATES object properties
          Object.keys(data.rates).forEach(key => {
            EXCHANGE_RATES[key] = data.rates[key];
          });
          // Update state to trigger re-render of components using the rates
          setExchangeRates({ ...EXCHANGE_RATES });
        }
      })
      .catch(err => console.error('Failed to fetch real-time currency exchange rates:', err));

    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    // 1. Synchronous initial check for offline mode to prevent ANY delay
    if (typeof window !== 'undefined') {
      const isOffline = localStorage.getItem('moneyflow_auth_mode') === 'offline';
      if (isOffline) {
        const offlineProfile = MockDB.getProfile();
        setProfile(offlineProfile);
        setFirebaseUser({
          uid: offlineProfile.id || 'mock-user-id',
          email: offlineProfile.email || 'demo@mypockettracker.io',
          displayName: offlineProfile.name || 'Demo User',
          photoURL: offlineProfile.avatar_url || null
        } as any);
        setAuthLoading(false);
      }
    }

    // 2. Register Firebase Auth state listener immediately in parallel (takes milliseconds)
    try {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!isMounted) return;
        if (user) {
          setIsFirebaseBlocked(false); // Self-healing
          setFirebaseUser(user);
          const isNewUserLogin = MockDB.getProfile().id !== user.uid;
          const updatedProfile = MockDB.updateProfile({
            id: user.uid,
            email: user.email || '',
            name: user.displayName || user.email?.split('@')[0] || 'Alex Mercer',
            avatar_url: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop',
            ...(isNewUserLogin ? { onboarded: false } : {})
          });
          setProfile(updatedProfile);
        } else {
          // Check if we are in local offline session
          const isOffline = localStorage.getItem('moneyflow_auth_mode') === 'offline';
          if (isOffline) {
            const offlineProfile = MockDB.getProfile();
            if (offlineProfile && offlineProfile.id !== 'user-default-uuid') {
              setFirebaseUser({
                uid: offlineProfile.id,
                email: offlineProfile.email,
                displayName: offlineProfile.name,
                photoURL: offlineProfile.avatar_url
              } as any);
            }
          } else {
            setFirebaseUser(null);
          }
        }
        setAuthLoading(false);
      });
    } catch (authError) {
      console.error("Failed to register onAuthStateChanged:", authError);
      setAuthLoading(false);
    }

    // 3. Run Firebase reachability check in the background without blocking the UI
    const checkFirebaseReachability = async () => {
      let reachable = false;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
        
        const res = await fetch('https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=AIzaSyCKhp7p_1dLtrLoy336AiXNAskpvrF2pto', {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          reachable = true;
        }
      } catch (e) {
        reachable = false;
      }

      if (!isMounted) return;

      if (!reachable) {
        console.warn("Firebase Auth is unreachable. Defaulting to Mock Auth Mode.");
        setIsFirebaseBlocked(true);
        
        const isOffline = localStorage.getItem('moneyflow_auth_mode') === 'offline';
        if (isOffline) {
          const offlineProfile = MockDB.getProfile();
          setFirebaseUser({
            uid: offlineProfile.id || 'mock-user-id',
            email: offlineProfile.email || 'demo@mypockettracker.io',
            displayName: offlineProfile.name || 'Demo User',
            photoURL: offlineProfile.avatar_url || null
          } as any);
        }
        setAuthLoading(false);
      }
    };

    checkFirebaseReachability();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (isFirebaseBlocked) {
      // Local/Offline SignUp
      const mockUid = 'mock-' + Math.random().toString(36).substr(2, 9);
      const updatedProfile = MockDB.updateProfile({
        id: mockUid,
        name: name,
        email: email,
        onboarded: false
      });
      setProfile(updatedProfile);
      localStorage.setItem('moneyflow_auth_mode', 'offline');
      setFirebaseUser({
        uid: mockUid,
        email: email,
        displayName: name,
        photoURL: null,
      } as any);
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await updateFirebaseProfile(userCredential.user, { displayName: name });
      const updatedProfile = MockDB.updateProfile({
        id: userCredential.user.uid,
        name: name,
        email: email,
        onboarded: false
      });
      setProfile(updatedProfile);
      localStorage.setItem('moneyflow_auth_mode', 'firebase');
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (isFirebaseBlocked) {
      // Local/Offline Login
      const mockUid = 'mock-' + Math.random().toString(36).substr(2, 9);
      const isNewUserLogin = MockDB.getProfile().id !== mockUid;
      const updatedProfile = MockDB.updateProfile({
        id: mockUid,
        name: email.split('@')[0],
        email: email,
        ...(isNewUserLogin ? { onboarded: false } : {})
      });
      setProfile(updatedProfile);
      localStorage.setItem('moneyflow_auth_mode', 'offline');
      setFirebaseUser({
        uid: mockUid,
        email: email,
        displayName: email.split('@')[0],
        photoURL: null,
      } as any);
      return;
    }

    await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem('moneyflow_auth_mode', 'firebase');
  };

  const loginWithGoogle = async () => {
    if (isFirebaseBlocked) {
      loginOfflineGoogle();
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
      localStorage.setItem('moneyflow_auth_mode', 'firebase');
    } catch (err: any) {
      console.warn("Firebase Google Sign-In error:", err);
      if (err?.code === 'auth/unauthorized-domain' || err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-allowed') {
        console.info("Switching to mock Google auth due to domain authorization or popup restriction.");
        loginOfflineGoogle();
      } else {
        throw err;
      }
    }
  };

  const loginOfflineGoogle = () => {
    const mockUid = 'mock-google-uid';
    const isNewUserLogin = MockDB.getProfile().id !== mockUid;
    const updatedProfile = MockDB.updateProfile({
      id: mockUid,
      name: 'Alex Mercer (Google)',
      email: 'alex.mercer@gmail.com',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop',
      ...(isNewUserLogin ? { onboarded: false } : {})
    });
    setProfile(updatedProfile);
    localStorage.setItem('moneyflow_auth_mode', 'offline');
    setFirebaseUser({
      uid: mockUid,
      email: 'alex.mercer@gmail.com',
      displayName: 'Alex Mercer (Google)',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop',
    } as any);
  };

  const logout = async () => {
    localStorage.removeItem('moneyflow_auth_mode');
    if (!isFirebaseBlocked) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn("Firebase signOut failed:", err);
      }
    }
    setFirebaseUser(null);
    MockDB.updateProfile({
      id: 'user-default-uuid',
      name: 'Alex Mercer',
      email: 'alex@mypockettracker.io',
      onboarded: true
    });
    refreshData();
  };

  const resetPassword = async (email: string) => {
    if (isFirebaseBlocked) {
      alert("Offline Mode: Password reset is simulated. In a production environment with Firebase working, a link will be sent to " + email);
      return;
    }
    await sendPasswordResetEmail(auth, email);
  };

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
    
    // Log expense under Savings in profile currency
    MockDB.addTransaction({
      business_id: null,
      type: 'expense',
      category_name: 'Savings Contribution',
      amount_cents: amountCents,
      currency: profile.currency,
      description: `Contributed to savings goal: ${goal.name}`
    });

    if (newAmt >= goal.target_amount_cents) {
      const formattedTarget = formatCurrency(goal.target_amount_cents, profile.currency);
      MockDB.addNotification('Savings Goal Achieved! 🏆', `Congratulations! You hit your target of ${formattedTarget} for "${goal.name}".`, 'goal');
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
    MockDB.updateProfile({ name, phone, country, currency, language, onboarded: true });
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
      firebaseUser,
      isFirebaseBlocked,
      authLoading,
      loginOffline,
      signUpWithEmail,
      loginWithEmail,
      loginWithGoogle,
      logout,
      resetPassword,
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
  if (from.toUpperCase() === to.toUpperCase()) {
    return cents;
  }
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

export const getCurrencySymbol = (currencyCode = 'USD'): string => {
  try {
    return (0).toLocaleString('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).replace(/\d/g, '').trim();
  } catch {
    return currencyCode;
  }
};
