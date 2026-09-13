"use client";

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { ArrowRight, Check, Shield, Layers, Wallet, BarChart3, HelpCircle, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { openUpgradeModal } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', message: '' });
      setSubmitted(false);
      alert('Thank you! Your message has been received.');
    }, 1000);
  };

  return (
    <div className="bg-background text-foreground overflow-x-hidden min-h-screen">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-glow">
              M
            </div>
            <span className="font-bold text-lg tracking-tight">My Pocket <span className="text-primary font-black">Tracker</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#overview" className="hover:text-foreground transition-colors">Overview</a>
            <a href="#about" className="hover:text-foreground transition-colors">About Us</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={onEnterApp}
              className="px-4 py-2 text-sm font-semibold hover:text-primary transition-all"
            >
              Sign In
            </button>
            <button
              onClick={onEnterApp}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-all shadow-glow hover:-translate-y-0.5 hover:shadow-glow/15"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.06),transparent_45%)]"></div>
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Free & Open Platform — All Features Unlocked</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
              Manage personal wealth & <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">multiple businesses</span> in one app
            </h1>
            <p className="text-base md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Track salaries, investments, grocery expense lists, invoices, tax calculations, and profit forecasts together under a single, unified workspace with zero fees and no ads.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-glow hover:shadow-glow/15 hover:-translate-y-0.5 transition-all text-base"
            >
              <span>Launch My Pocket Tracker</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-card border border-border text-foreground font-semibold rounded-xl flex items-center justify-center hover:bg-accent transition-all text-base"
            >
              Explore Features
            </a>
          </motion.div>

          {/* Interactive Mock Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 border border-border rounded-2xl overflow-hidden shadow-2xl bg-card max-w-5xl mx-auto relative group cursor-pointer"
            onClick={onEnterApp}
          >
            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
              <span className="px-6 py-3 bg-white text-zinc-950 rounded-xl font-bold shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                Open Sandbox Demo
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&h=600&fit=crop"
              alt="My Pocket Tracker Dashboard Preview"
              className="w-full object-cover select-none group-hover:scale-[1.01] transition-transform duration-700"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-border bg-slate-50 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Core Ecosystem Modules</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
              Explore professional feature sets designed to simplify both personal budgeting and company-wide financial accounts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* feature card 1 */}
            <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-premium transition-all hover-lift">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-primary mb-6">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-3">Unified Finance Hub</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Log personal income sources (Salary, Freelance) alongside dedicated corporate ledgers. Filter by business or view a consolidated balance sheet.
              </p>
            </div>

            {/* feature card 2 */}
            <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-premium transition-all hover-lift">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-primary mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-3">Multi-Business Accounts</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Add, manage, and scale unlimited business profiles with individual custom settings, full currency support, and no artificial limits.
              </p>
            </div>

            {/* feature card 3 */}
            <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-premium transition-all hover-lift">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-primary mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-3">Forecasting & Invoices</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Generate professional Invoice PDFs, upload logos, inspect AI-driven growth charts, forecast quarterly earnings, and budget with precision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Pricing Plans built for all Builders</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xl mx-auto text-sm">
              Start for free, then choose a billing cycle that suits your scale. Support for credit cards, UPI, and global wire transfers.
            </p>

            <div className="inline-flex items-center gap-2 p-1 bg-accent rounded-lg">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  billingCycle === 'monthly' ? 'bg-card text-foreground shadow-sm' : 'text-slate-400'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly' ? 'bg-card text-foreground shadow-sm' : 'text-slate-400'
                }`}
              >
                Yearly Billing <span className="bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded font-black">SAVE 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free pricing card */}
            <div className="p-8 rounded-2xl bg-card border border-border flex flex-col justify-between hover:shadow-premium transition-all">
              <div>
                <h3 className="text-lg font-bold mb-2">Free Starter</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Perfect for freelancers and individual salary earners starting out.</p>
                <div className="text-3xl font-black mb-6">$0 <span className="text-xs font-normal text-slate-400">/ forever</span></div>
                
                <ul className="space-y-3 mb-8">
                  {['Up to 3 Business Profiles', 'Unlimited Personal Transactions', 'Basic Savings Goals', 'Daily / Weekly Reports', 'Consolidated Balance sheet', 'Sponsored Banners (With Ads)'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-success shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={onEnterApp}
                className="w-full py-3 bg-accent hover:bg-accent-hover text-foreground font-semibold rounded-xl transition-all"
              >
                Get Started Free
              </button>
            </div>

            {/* Premium pricing card */}
            <div className="p-8 rounded-2xl bg-card border-2 border-primary flex flex-col justify-between hover:shadow-premium transition-all relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">My Pocket Tracker Premium</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Built for expanding businesses, shop owners, and seasoned creators.</p>
                <div className="text-3xl font-black mb-6">
                  {billingCycle === 'monthly' ? '$9.99' : '$8.32'}{' '}
                  <span className="text-xs font-normal text-slate-400">/ month ({billingCycle === 'monthly' ? '$9.99/mo' : '$99.90/yr'})</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {['Unlimited Business Profiles', 'Everything in Free Starter', 'Zero Advertisements', 'AI Financial Insights', 'Invoice PDF Generator', 'Advanced analytics comparisons', 'Multi-currency support', 'Priority Customer Support'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-success shrink-0" />
                      <span className="font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={onEnterApp}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-glow hover:shadow-glow/15"
              >
                Unlock Premium Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 border-t border-border bg-slate-50 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Our Mission to Simplify Finances</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed mb-6">
              My Pocket Tracker was founded by team of engineers and accountants who were frustrated with using multiple web interfaces. Your payroll was on one service, personal coffee budgets on another, and side-hustle invoices on a third.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">
              We combined everything into one seamless dashboard with automated limits, secure local-storage syncing, and immediate Supabase configuration access, ensuring your private financial indicators remain reliable and scalable.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-premium">
            <img
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&h=500&fit=crop"
              alt="Team discussing finances"
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Contact Our Support Team</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              Got a question about subscription billing, enterprise solutions, or integrating custom banks? Reach out, and our team will get back to you within 24 hours.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm">100 Pine Street, San Francisco, CA 94111</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm">+1 (415) 555-0189</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm">support@mypockettracker.io</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="p-8 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Full Name</label>
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                placeholder="Alex Mercer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Email Address</label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
                placeholder="alex@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Message</label>
              <textarea
                rows={4}
                required
                value={contactForm.message}
                onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
                placeholder="How can we help?"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-all shadow-glow hover:shadow-glow/15"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-t border-border bg-slate-50 dark:bg-slate-900/20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 flex items-center justify-center gap-2">
              <HelpCircle className="w-8 h-8 text-primary" />
              <span>Frequently Asked Questions</span>
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'How does combining Personal and Business finance benefit me?',
                a: 'It gives you a complete overview of your true net worth. You can see how much revenue your businesses are bringing in while budgeting for personal living expenditures simultaneously without switching logins.'
              },
              {
                q: 'Are there any limits on how many businesses or transactions I can create?',
                a: 'No! My Pocket Tracker is 100% free with unlimited business profiles, unlimited transaction entries, and full access to AI insights and invoice generators.'
              },
              {
                q: 'How can I connect this application to my Supabase instance?',
                a: 'Simply fill in your Supabase variables in your `.env` configuration file. The code client checks for keys at startup and switches from mock local storage to Supabase dynamic queries automatically.'
              },
              {
                q: 'Is my financial data kept private?',
                a: 'Yes, your data is stored securely in your local environment or synced to your private Firebase / Supabase instance with end-to-end security.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-bold text-base mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-black text-lg">
              M
            </div>
            <span className="font-bold text-sm">My Pocket Tracker</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
            <span>&copy; {new Date().getFullYear()} My Pocket Tracker Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
