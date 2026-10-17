"use client";

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { ArrowRight, Check, Shield, Layers, Wallet, BarChart3, HelpCircle, Mail, MapPin, Phone, Sparkles, Download, CheckCircle2, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import PWAInstallModal from './PWAInstallModal';
import { PWAStatusIndicator } from './PWAStatusBanner';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { 
    isOnline, 
    syncStatus, 
    isInstallable, 
    isInstalled, 
    installApp, 
    showInstallModal, 
    setShowInstallModal,
    isUpdateAvailable,
    applyUpdate
  } = useApp();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleInstallClick = async () => {
    if (isInstalled) {
      onEnterApp();
      return;
    }
    await installApp();
  };

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
    <div className="bg-background text-[#072620] overflow-x-hidden min-h-screen">
      {/* Header */}
      <header className="border-b border-[#072620]/10 sticky top-0 bg-background/85 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-sunshine rounded-xl flex items-center justify-center text-black font-black text-xl shadow-sm">
              M
            </div>
            <span className="font-bold text-lg tracking-tight text-black">My Pocket <span className="text-black font-black">Tracker</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-black/80">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#overview" className="hover:text-black transition-colors">Overview</a>
            <a href="#about" className="hover:text-black transition-colors">About Us</a>
            <a href="#contact" className="hover:text-black transition-colors">Contact</a>
            <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Launch / Install App Button */}
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-sunshine/25 hover:bg-sunshine/35 text-black text-xs font-bold rounded-xl border border-sunshine/50 transition-all flex items-center gap-1.5 touch-target shadow-sm"
              title={isInstalled ? 'Launch installed application' : 'Install My Pocket Tracker on this device'}
            >
              {isInstalled ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                  <span>Launch App</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-black" />
                  <span>Install App</span>
                </>
              )}
            </button>

            <button
              onClick={onEnterApp}
              className="px-4 py-2.5 bg-sunshine hover:bg-sunshine-hover text-black text-xs font-black rounded-xl transition-all shadow-sm hover:-translate-y-0.5 touch-target"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,222,133,0.3),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.4),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sunshine/60 bg-sunshine text-black text-xs font-bold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>100% Free & Open Platform — All Features Unlocked</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6 text-black">
              Manage personal wealth & <span className="text-black font-black underline decoration-sunshine decoration-4 underline-offset-8">multiple businesses</span> in one app
            </h1>
            <p className="text-base md:text-xl text-black/80 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
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
              className="w-full sm:w-auto px-8 py-4 bg-sunshine hover:bg-sunshine-hover text-black font-black rounded-xl flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 transition-all text-base touch-target"
            >
              <span>Launch My Pocket Tracker</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
            <button
              onClick={handleInstallClick}
              className="w-full sm:w-auto px-8 py-4 bg-card border border-sunshine/40 text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-sunshine/15 transition-all text-base touch-target"
            >
              {isInstalled ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-black" />
                  <span>Open Installed App</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 text-black" />
                  <span>Install App (Offline Ready)</span>
                </>
              )}
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-4 text-[#072620] hover:text-black font-bold rounded-xl flex items-center justify-center transition-all text-base"
            >
              Explore Features
            </a>
          </motion.div>

          {/* Interactive Mock Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 border border-sunshine/30 rounded-2xl overflow-hidden shadow-2xl bg-card max-w-5xl mx-auto relative group cursor-pointer"
            onClick={onEnterApp}
          >
            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
              <span className="px-6 py-3 bg-sunshine text-[#072620] rounded-xl font-black shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
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
      <section id="features" className="py-20 border-t border-border bg-black/[0.03] dark:bg-black/10 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#072620]">Core Ecosystem Modules</h2>
            <p className="text-[#0d3b32] max-w-2xl mx-auto text-sm md:text-base font-medium">
              Explore professional feature sets designed to simplify both personal budgeting and company-wide financial accounts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* feature card 1 */}
            <div className="p-8 rounded-2xl bg-card border border-sunshine/25 hover:border-sunshine/50 shadow-sm transition-all hover-lift">
              <div className="w-12 h-12 bg-sunshine/20 rounded-xl flex items-center justify-center text-black border border-sunshine/40 mb-6 shadow-sm">
                <Wallet className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-black">Unified Finance Hub</h3>
              <p className="text-black/75 text-sm leading-relaxed">
                Log personal income sources (Salary, Freelance) alongside dedicated corporate ledgers. Filter by business or view a consolidated balance sheet.
              </p>
            </div>

            {/* feature card 2 */}
            <div className="p-8 rounded-2xl bg-card border border-sunshine/25 hover:border-sunshine/50 shadow-sm transition-all hover-lift">
              <div className="w-12 h-12 bg-sunshine/20 rounded-xl flex items-center justify-center text-black border border-sunshine/40 mb-6 shadow-sm">
                <Layers className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-black">Multi-Business Accounts</h3>
              <p className="text-black/75 text-sm leading-relaxed">
                Add, manage, and scale unlimited business profiles with individual custom settings, full currency support, and no artificial limits.
              </p>
            </div>

            {/* feature card 3 */}
            <div className="p-8 rounded-2xl bg-card border border-sunshine/25 hover:border-sunshine/50 shadow-sm transition-all hover-lift">
              <div className="w-12 h-12 bg-sunshine/20 rounded-xl flex items-center justify-center text-black border border-sunshine/40 mb-6 shadow-sm">
                <BarChart3 className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-black">Forecasting & Invoices</h3>
              <p className="text-black/75 text-sm leading-relaxed">
                Generate professional Invoice PDFs, upload logos, inspect AI-driven growth charts, forecast quarterly earnings, and budget with precision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free Platform Feature Showcase */}
      <section id="features-unlocked" className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sunshine/50 bg-sunshine text-black text-xs font-bold mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>100% Free Platform — Zero Paywalls</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-black">Every Feature Included. Completely Free.</h2>
            <p className="text-black/80 mb-6 max-w-xl mx-auto text-sm font-medium">
              No subscription tiers, no hidden charges, and zero advertisements. Manage personal wealth and multiple company books without restrictions.
            </p>
          </div>

          <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-card border border-sunshine/35 shadow-premium text-center">
            <div className="grid sm:grid-cols-2 gap-4 text-left mb-8">
              {[
                'Unlimited Business & Company Profiles',
                'Unlimited Personal & Business Transactions',
                'AI-Powered Financial Insights & Margins',
                'Invoice PDF Generator with Client Receipts',
                'Advanced Data Analytics & CSV/Excel Export',
                'Multi-Currency Conversion & Live Rates',
                'Savings Goals & Milestones Progress',
                '100% Ad-Free Clean Interface'
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-black">
                  <Check className="w-4 h-4 text-black shrink-0" />
                  <span className="font-semibold">{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-3.5 bg-sunshine hover:bg-sunshine-hover text-black text-sm font-black rounded-xl transition-all shadow-sm inline-flex items-center justify-center gap-2"
            >
              <span>Get Started Free — Open Tracker</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 border-t border-border bg-black/[0.03] dark:bg-black/10 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-black">Our Mission to Simplify Finances</h2>
            <p className="text-black/80 text-sm md:text-base leading-relaxed mb-6 font-medium">
              My Pocket Tracker was founded by team of engineers and accountants who were frustrated with using multiple web interfaces. Your payroll was on one service, personal coffee budgets on another, and side-hustle invoices on a third.
            </p>
            <p className="text-black/80 text-sm md:text-base leading-relaxed font-medium">
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
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-black">Contact Our Support Team</h2>
            <p className="text-black/80 text-sm mb-8 font-medium">
              Got a question about subscription billing, enterprise solutions, or integrating custom banks? Reach out, and our team will get back to you within 24 hours.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-black shrink-0" />
                <span className="text-sm font-semibold text-black">100 Pine Street, San Francisco, CA 94111</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-black shrink-0" />
                <span className="text-sm font-semibold text-black">+1 (415) 555-0189</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-black shrink-0" />
                <span className="text-sm font-semibold text-black">support@mypockettracker.io</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="p-8 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-black/70 mb-2 uppercase">Full Name</label>
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black"
                placeholder="Alex Mercer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black/70 mb-2 uppercase">Email Address</label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black"
                placeholder="alex@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black/70 mb-2 uppercase">Message</label>
              <textarea
                rows={4}
                required
                value={contactForm.message}
                onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full bg-accent border border-border rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black resize-none"
                placeholder="How can we help?"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-sunshine hover:bg-sunshine-hover text-black text-sm font-black rounded-xl transition-all shadow-sm"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-t border-border bg-black/[0.03] dark:bg-black/10 backdrop-blur-xs">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 flex items-center justify-center gap-2 text-black">
              <HelpCircle className="w-8 h-8 text-black" />
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
                <h3 className="font-bold text-base mb-2 text-black">{faq.q}</h3>
                <p className="text-sm text-black/75 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sunshine rounded-xl flex items-center justify-center text-black font-black text-lg shadow-sm">
              M
            </div>
            <span className="font-bold text-sm text-black">My Pocket Tracker</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-black/70">
            <a href="#" className="hover:text-black">Privacy Policy</a>
            <a href="#" className="hover:text-black">Terms of Service</a>
            <span>&copy; {new Date().getFullYear()} My Pocket Tracker Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* PWA Install Guide Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onInstallNative={installApp}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
      />
    </div>
  );
};
export default LandingPage;
