// MoneyFlow Pro - High-Fidelity Stateful Mock Database
// Synchronizes with localStorage where available for persistence

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  currency: string;
  language: string;
  theme: string;
  avatar_url: string;
  is_admin: boolean;
  notification_email: boolean;
  notification_push: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price_cents: number;
  currency: string;
  billing_interval: string;
  business_limit: number;
  features: string[];
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface Business {
  id: string;
  user_id: string;
  name: string;
  logo_url?: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  timezone: string;
  status: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  business_id: string | null; // null = personal
  type: 'income' | 'expense';
  category_name: string;
  amount_cents: number;
  currency: string;
  description: string;
  transaction_date: string;
  receipt_url?: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount_cents: number;
  current_amount_cents: number;
  deadline: string;
  status: 'in_progress' | 'achieved' | 'paused';
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string;
  amount_cents: number;
  currency: string;
  provider: string;
  provider_payment_id: string;
  status: 'succeeded' | 'failed' | 'refunded';
  coupon_applied: string | null;
  created_at: string;
}

export interface Coupon {
  code: string;
  discount_percent: number; // e.g. 20 for 20%
  discount_flat_cents: number; // e.g. 500 for $5.00
  expiry_date: string;
  max_uses: number;
  uses_count: number;
  min_purchase_cents: number;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'payment' | 'goal' | 'alert';
  is_read: boolean;
  created_at: string;
}

// Preset Plans
export const PLANS: Plan[] = [
  {
    id: 'FREE',
    name: 'Free Starter',
    price_cents: 0,
    currency: 'USD',
    billing_interval: 'none',
    business_limit: 3,
    features: [
      'Maximum 3 Businesses',
      'Unlimited Personal Transactions',
      'Basic Dashboard',
      'Daily/Weekly/Monthly Reports',
      'Savings Goals',
      'Basic Analytics'
    ]
  },
  {
    id: 'PREMIUM_MONTHLY',
    name: 'Premium Monthly',
    price_cents: 999, // $9.99
    currency: 'USD',
    billing_interval: 'month',
    business_limit: 9999,
    features: [
      'Unlimited Businesses',
      'Advanced Analytics & PDF Export',
      'AI Financial Insights',
      'Business Comparison Dashboard',
      'Custom Categories',
      'Advanced Reports (CSV/Excel)',
      'Business Logo Upload & Invoices',
      'Priority Email Support',
      'Multiple Currency Support'
    ]
  },
  {
    id: 'PREMIUM_YEARLY',
    name: 'Premium Yearly',
    price_cents: 9990, // $99.90
    currency: 'USD',
    billing_interval: 'year',
    business_limit: 9999,
    features: [
      'Unlimited Businesses',
      'Advanced Analytics & PDF Export',
      'AI Financial Insights',
      'Business Comparison Dashboard',
      'Custom Categories',
      'Advanced Reports (CSV/Excel)',
      'Business Logo Upload & Invoices',
      'Priority Email Support',
      'Multiple Currency Support',
      'Save 20% over Monthly Plan'
    ]
  }
];

// Preset Coupons
const INITIAL_COUPONS: Coupon[] = [
  { code: 'SAVE20', discount_percent: 20, discount_flat_cents: 0, expiry_date: '2027-12-31', max_uses: 100, uses_count: 5, min_purchase_cents: 0 },
  { code: 'WELCOME50', discount_percent: 0, discount_flat_cents: 5000, expiry_date: '2027-12-31', max_uses: 50, uses_count: 12, min_purchase_cents: 8000 },
  { code: 'FLOWFREE', discount_percent: 100, discount_flat_cents: 0, expiry_date: '2028-01-01', max_uses: 10, uses_count: 2, min_purchase_cents: 0 }
];

// Preset Profile
const DEFAULT_PROFILE: Profile = {
  id: 'user-default-uuid',
  name: 'Alex Mercer',
  email: 'alex@moneyflowpro.io',
  phone: '+1 (555) 019-2834',
  country: 'United States',
  currency: 'USD',
  language: 'en',
  theme: 'dark',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop',
  is_admin: true,
  notification_email: true,
  notification_push: true
};

// Preset Businesses
const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'biz-1',
    user_id: 'user-default-uuid',
    name: 'Aether Software Studio',
    category: 'Technology & SaaS',
    description: 'Bespoke web development and UI/UX consulting firm.',
    address: '42 Wall Street, Floor 18, New York, NY',
    phone: '+1 (212) 555-0150',
    email: 'hello@aetherstudio.com',
    currency: 'USD',
    timezone: 'America/New_York',
    status: 'active',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'biz-2',
    user_id: 'user-default-uuid',
    name: 'Vanguard Cafe',
    category: 'Food & Beverage',
    description: 'Specialty coffee roastery and community workspace.',
    address: '89 Main St, Austin, TX',
    phone: '+1 (512) 555-3920',
    email: 'info@vanguardcafe.co',
    currency: 'USD',
    timezone: 'America/Chicago',
    status: 'active',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Preset Transactions (past 14 days)
const generatePresetTransactions = (): Transaction[] => {
  const list: Transaction[] = [];
  const now = new Date();
  
  // Personal transactions
  list.push(
    { id: 'tx-p1', user_id: 'user-default-uuid', business_id: null, type: 'income', category_name: 'Salary', amount_cents: 650000, currency: 'USD', description: 'Monthly Tech Lead Salary', transaction_date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'tx-p2', user_id: 'user-default-uuid', business_id: null, type: 'expense', category_name: 'Rent', amount_cents: 180000, currency: 'USD', description: 'Apartment Rental', transaction_date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'tx-p3', user_id: 'user-default-uuid', business_id: null, type: 'expense', category_name: 'Shopping', amount_cents: 45000, currency: 'USD', description: 'Ergonomic Desk Chair', transaction_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'tx-p4', user_id: 'user-default-uuid', business_id: null, type: 'expense', category_name: 'Food', amount_cents: 7850, currency: 'USD', description: 'Whole Foods Grocery', transaction_date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'tx-p5', user_id: 'user-default-uuid', business_id: null, type: 'income', category_name: 'Freelancing', amount_cents: 120000, currency: 'USD', description: 'Landing page design consulting', transaction_date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString() }
  );

  // Business 1 Transactions (Aether Software Studio)
  list.push(
    { id: 'tx-b1-1', user_id: 'user-default-uuid', business_id: 'biz-1', type: 'income', category_name: 'Services', amount_cents: 850000, currency: 'USD', description: 'Q2 Web Portal Retainer', transaction_date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'tx-b1-2', user_id: 'user-default-uuid', business_id: 'biz-1', type: 'expense', category_name: 'Rent', amount_cents: 250000, currency: 'USD', description: 'WeWork Office Space', transaction_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'tx-b1-3', user_id: 'user-default-uuid', business_id: 'biz-1', type: 'expense', category_name: 'Salary', amount_cents: 400000, currency: 'USD', description: 'Contractor Dev Payroll', transaction_date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'tx-b1-4', user_id: 'user-default-uuid', business_id: 'biz-1', type: 'income', category_name: 'Sales', amount_cents: 480000, currency: 'USD', description: 'Software license renewals', transaction_date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'tx-b1-5', user_id: 'user-default-uuid', business_id: 'biz-1', type: 'expense', category_name: 'Marketing', amount_cents: 80000, currency: 'USD', description: 'Google Search Ads campaign', transaction_date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString() }
  );

  // Business 2 Transactions (Vanguard Cafe)
  list.push(
    { id: 'tx-b2-1', user_id: 'user-default-uuid', business_id: 'biz-2', type: 'income', category_name: 'Sales', amount_cents: 345000, currency: 'USD', description: 'Weekly Counter Sales & Beans', transaction_date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'tx-b2-2', user_id: 'user-default-uuid', business_id: 'biz-2', type: 'expense', category_name: 'Inventory', amount_cents: 120000, currency: 'USD', description: 'Ethiopian & Colombian coffee bags', transaction_date: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'tx-b2-3', user_id: 'user-default-uuid', business_id: 'biz-2', type: 'expense', category_name: 'Utilities', amount_cents: 45000, currency: 'USD', description: 'Electric & Water billing', transaction_date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'tx-b2-4', user_id: 'user-default-uuid', business_id: 'biz-2', type: 'income', category_name: 'Sales', amount_cents: 290000, currency: 'USD', description: 'Catering event at Austin Tech Lab', transaction_date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString() }
  );

  return list;
};

// Preset Savings Goals
const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  { id: 'goal-1', user_id: 'user-default-uuid', name: 'Emergency Fund', target_amount_cents: 2000000, current_amount_cents: 1550000, deadline: '2026-12-31T00:00:00.000Z', status: 'in_progress', created_at: new Date().toISOString() },
  { id: 'goal-2', user_id: 'user-default-uuid', name: 'MacBook Pro Setup', target_amount_cents: 350000, current_amount_cents: 350000, deadline: '2026-06-15T00:00:00.000Z', status: 'achieved', created_at: new Date().toISOString() },
  { id: 'goal-3', user_id: 'user-default-uuid', name: 'Eurotrip Summer 2027', target_amount_cents: 800000, current_amount_cents: 120000, deadline: '2027-07-01T00:00:00.000Z', status: 'in_progress', created_at: new Date().toISOString() }
];

// Preset Subscription
const DEFAULT_SUBSCRIPTION: Subscription = {
  id: 'sub-default-uuid',
  user_id: 'user-default-uuid',
  plan_id: 'FREE', // Start as FREE user to let them upgrade
  status: 'active',
  current_period_start: new Date().toISOString(),
  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  cancel_at_period_end: false
};

// Helper to interact with localstorage/memory database
class MockDBClass {
  private isLoaded = false;
  private data = {
    profile: DEFAULT_PROFILE,
    subscription: DEFAULT_SUBSCRIPTION,
    businesses: INITIAL_BUSINESSES,
    transactions: [] as Transaction[],
    goals: INITIAL_SAVINGS_GOALS,
    coupons: INITIAL_COUPONS,
    payments: [] as Payment[],
    notifications: [
      { id: 'notif-1', user_id: 'user-default-uuid', title: 'Welcome to MoneyFlow Pro', message: 'Set up your first business or log a personal transaction to get started.', type: 'info' as const, is_read: false, created_at: new Date().toISOString() }
    ] as Notification[]
  };

  constructor() {
    this.load();
  }

  private load() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('moneyflow_mock_db');
      if (stored) {
        this.data = JSON.parse(stored);
      } else {
        this.data.transactions = generatePresetTransactions();
        this.save();
      }
      this.isLoaded = true;
    } catch (e) {
      console.warn("Could not load from localStorage, fallback to memory", e);
      this.data.transactions = generatePresetTransactions();
    }
  }

  save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('moneyflow_mock_db', JSON.stringify(this.data));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  }

  getProfile() {
    return this.data.profile;
  }

  updateProfile(profile: Partial<Profile>) {
    this.data.profile = { ...this.data.profile, ...profile };
    this.save();
    return this.data.profile;
  }

  getSubscription() {
    return this.data.subscription;
  }

  getPlan() {
    return PLANS.find(p => p.id === this.data.subscription.plan_id) || PLANS[0];
  }

  upgradeSubscription(planId: string, couponApplied: string | null = null) {
    const isYearly = planId.includes('YEARLY');
    const intervalDays = isYearly ? 365 : 30;
    
    this.data.subscription = {
      ...this.data.subscription,
      plan_id: planId,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Log the mock payment
    const plan = PLANS.find(p => p.id === planId) || PLANS[1];
    let price = plan.price_cents;
    if (couponApplied) {
      const coupon = this.data.coupons.find(c => c.code.toUpperCase() === couponApplied.toUpperCase());
      if (coupon) {
        if (coupon.discount_percent > 0) {
          price = Math.round(price * (1 - coupon.discount_percent / 100));
        } else if (coupon.discount_flat_cents > 0) {
          price = Math.max(0, price - coupon.discount_flat_cents);
        }
      }
    }

    const payment: Payment = {
      id: 'pay-' + Math.random().toString(36).substr(2, 9),
      user_id: this.data.profile.id,
      subscription_id: this.data.subscription.id,
      amount_cents: price,
      currency: plan.currency,
      provider: 'stripe',
      provider_payment_id: 'ch_' + Math.random().toString(36).substr(2, 14),
      status: 'succeeded',
      coupon_applied: couponApplied,
      created_at: new Date().toISOString()
    };

    this.data.payments.push(payment);

    // Notify user
    this.addNotification(
      'Subscription Activated',
      `Welcome to MoneyFlow Pro ${plan.name}! Your account has been upgraded successfully.`,
      'payment'
    );

    this.save();
    return this.data.subscription;
  }

  downgradeSubscription() {
    this.data.subscription = {
      ...this.data.subscription,
      plan_id: 'FREE',
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };
    this.addNotification('Subscription Downgraded', 'Your profile is now back to the Free tier. Plan limits are active.', 'payment');
    this.save();
  }

  getBusinesses() {
    return this.data.businesses;
  }

  addBusiness(biz: Omit<Business, 'id' | 'user_id' | 'created_at'>) {
    const activePlan = this.getPlan();
    const currentCount = this.data.businesses.length;
    
    if (activePlan.business_limit > 0 && currentCount >= activePlan.business_limit) {
      throw new Error(`LimitReached: You can create a maximum of ${activePlan.business_limit} businesses under the Free tier. Upgrade to Premium for unlimited businesses.`);
    }

    const newBiz: Business = {
      ...biz,
      id: 'biz-' + Math.random().toString(36).substr(2, 9),
      user_id: this.data.profile.id,
      created_at: new Date().toISOString()
    };
    this.data.businesses.push(newBiz);
    this.addNotification('Business Created', `Business "${newBiz.name}" has been registered successfully.`, 'info');
    this.save();
    return newBiz;
  }

  updateBusiness(id: string, updates: Partial<Business>) {
    this.data.businesses = this.data.businesses.map(b => b.id === id ? { ...b, ...updates } : b);
    this.save();
    return this.data.businesses.find(b => b.id === id);
  }

  deleteBusiness(id: string) {
    this.data.businesses = this.data.businesses.filter(b => b.id !== id);
    // Remove transactions for that business
    this.data.transactions = this.data.transactions.filter(t => t.business_id !== id);
    this.save();
  }

  getTransactions(filter?: { businessId?: string | null }) {
    if (filter?.businessId !== undefined) {
      return this.data.transactions.filter(t => t.business_id === filter.businessId);
    }
    return this.data.transactions;
  }

  addTransaction(tx: Omit<Transaction, 'id' | 'user_id' | 'transaction_date'> & { transaction_date?: string }) {
    const newTx: Transaction = {
      ...tx,
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      user_id: this.data.profile.id,
      transaction_date: tx.transaction_date || new Date().toISOString()
    };
    this.data.transactions.push(newTx);
    this.save();
    return newTx;
  }

  deleteTransaction(id: string) {
    this.data.transactions = this.data.transactions.filter(t => t.id !== id);
    this.save();
  }

  getGoals() {
    return this.data.goals;
  }

  addGoal(goal: Omit<SavingsGoal, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) {
    const newGoal: SavingsGoal = {
      ...goal,
      id: 'goal-' + Math.random().toString(36).substr(2, 9),
      user_id: this.data.profile.id,
      status: 'in_progress',
      created_at: new Date().toISOString()
    };
    this.data.goals.push(newGoal);
    this.save();
    return newGoal;
  }

  updateGoal(id: string, updates: Partial<SavingsGoal>) {
    this.data.goals = this.data.goals.map(g => {
      if (g.id === id) {
        const merged = { ...g, ...updates };
        if (merged.current_amount_cents >= merged.target_amount_cents) {
          merged.status = 'achieved';
        }
        return merged;
      }
      return g;
    });
    this.save();
    return this.data.goals.find(g => g.id === id);
  }

  getCoupons() {
    return this.data.coupons;
  }

  validateCoupon(code: string) {
    const coupon = this.data.coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) return null;
    if (new Date(coupon.expiry_date) < new Date()) return null;
    if (coupon.uses_count >= coupon.max_uses) return null;
    return coupon;
  }

  addNotification(title: string, message: string, type: 'info' | 'payment' | 'goal' | 'alert' = 'info') {
    const newNotif: Notification = {
      id: 'notif-' + Math.random().toString(36).substr(2, 9),
      user_id: this.data.profile.id,
      title,
      message,
      type,
      is_read: false,
      created_at: new Date().toISOString()
    };
    this.data.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  getNotifications() {
    return this.data.notifications;
  }

  markNotificationsRead() {
    this.data.notifications = this.data.notifications.map(n => ({ ...n, is_read: true }));
    this.save();
  }

  getPayments() {
    return this.data.payments;
  }
}

export const MockDB = new MockDBClass();
export default MockDB;
