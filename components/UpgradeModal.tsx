"use client";

import React, { useState } from 'react';
import { useApp, formatCurrency } from '@/lib/AppContext';
import { PLANS } from '@/lib/mock-db';
import { PaymentsManager } from '@/lib/payments';
import { X, Check, CreditCard, Sparkles, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UpgradeModal: React.FC = () => {
  const { isUpgradeModalOpen, closeUpgradeModal, upgradeToPremium, profile } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [gateway, setGateway] = useState<'stripe' | 'razorpay'>('stripe');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{ code: string; percent?: number; flat?: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isUpgradeModalOpen) return null;

  const currentPlanId = billingCycle === 'monthly' ? 'PREMIUM_MONTHLY' : 'PREMIUM_YEARLY';
  const plan = PLANS.find(p => p.id === currentPlanId)!;

  // Calculate prices
  const basePrice = plan.price_cents;
  let finalPrice = basePrice;
  if (couponApplied) {
    if (couponApplied.percent) {
      finalPrice = Math.round(basePrice * (1 - couponApplied.percent / 100));
    } else if (couponApplied.flat) {
      finalPrice = Math.max(0, basePrice - couponApplied.flat);
    }
  }

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    
    // Validate simulated coupons
    const code = couponCode.toUpperCase();
    if (code === 'SAVE20') {
      setCouponApplied({ code, percent: 20 });
    } else if (code === 'WELCOME50') {
      setCouponApplied({ code, flat: 5000 }); // $50 off
    } else if (code === 'FLOWFREE') {
      setCouponApplied({ code, percent: 100 });
    } else {
      setCouponError('Invalid or expired coupon code.');
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await PaymentsManager.checkout({
        planId: currentPlanId,
        gateway,
        couponCode: couponApplied?.code,
        email: profile.email
      });
      if (response.success) {
        await upgradeToPremium(currentPlanId, couponApplied?.code);
        alert(`Success! Upgraded to ${plan.name}.`);
      } else {
        alert(response.error || 'Payment failed. Please try again.');
      }
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-card border border-border rounded-2xl shadow-premium overflow-hidden flex flex-col md:flex-row"
      >
        {/* Features Comparison Side */}
        <div className="flex-1 p-8 bg-slate-50 dark:bg-slate-900/50 border-r border-border">
          <div className="flex items-center gap-2 text-primary font-semibold mb-4">
            <Sparkles className="w-5 h-5" />
            <span>MoneyFlow Pro Premium</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Supercharge your finances</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Get complete visibility into both personal budgeting and professional operations.
          </p>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">What's Included:</h3>
            <ul className="space-y-3">
              {[
                'Unlimited Business profiles (Create 4+ businesses)',
                'AI Financial Insights & Profit Forecasts',
                'Advanced comparison charts (Compare businesses on a single axis)',
                'Invoice PDF Generator & Business Logo custom uploads',
                'Export data instantly to PDF, Excel, and CSV',
                'Tax summary reports & Recurring transactions',
                'Priority email support'
              ].map((feat, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Checkout Billing Side */}
        <div className="flex-1 p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Choose Plan & Payment</h3>
              <button 
                onClick={closeUpgradeModal}
                className="p-1 hover:bg-accent rounded-full text-slate-400 hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle Billing Cycle */}
            <div className="grid grid-cols-2 p-1 bg-accent rounded-lg mb-6">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`py-1.5 text-sm font-medium rounded-md transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-slate-500 hover:text-foreground'
                }`}
              >
                Monthly Plan
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`py-1.5 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-slate-500 hover:text-foreground'
                }`}
              >
                Yearly Plan <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">Save 20%</span>
              </button>
            </div>

            {/* Pricing Summary */}
            <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm font-medium text-slate-500">Plan Total:</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(finalPrice, profile.currency)}
                  <span className="text-xs font-normal text-slate-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </span>
              </div>
              
              {couponApplied && (
                <div className="flex justify-between text-xs text-success font-medium">
                  <span>Discount Applied ({couponApplied.code}):</span>
                  <span>-{formatCurrency(basePrice - finalPrice, profile.currency)}</span>
                </div>
              )}
            </div>

            {/* Coupon Code Input */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-400 mb-2">APPLY COUPON CODE</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SAVE20, WELCOME50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-accent border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary uppercase placeholder:normal-case"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-xs text-danger mt-1.5">{couponError}</p>}
              {couponApplied && <p className="text-xs text-success mt-1.5">Coupon "{couponApplied.code}" successfully applied!</p>}
              <p className="text-[10px] text-slate-500 mt-1">Try coupon codes: <strong className="cursor-pointer hover:underline" onClick={() => setCouponCode('SAVE20')}>SAVE20</strong> or <strong className="cursor-pointer hover:underline" onClick={() => setCouponCode('WELCOME50')}>WELCOME50</strong></p>
            </div>

            {/* Select Gateway */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-400 mb-2">PAYMENT METHOD</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGateway('stripe')}
                  className={`flex items-center justify-center gap-2 p-3 border rounded-xl text-sm font-medium transition-all ${
                    gateway === 'stripe'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-card hover:bg-accent'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Stripe</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGateway('razorpay')}
                  className={`flex items-center justify-center gap-2 p-3 border rounded-xl text-sm font-medium transition-all ${
                    gateway === 'razorpay'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-card hover:bg-accent'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>Razorpay</span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleCheckout}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-all shadow-glow hover:shadow-glow/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Upgrade Now</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
