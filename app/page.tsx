"use client";

import React, { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import AppWorkspace from '@/components/AppWorkspace';
import { UpgradeModal } from '@/components/UpgradeModal';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup' | 'forgot' | 'verify'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsAuthenticated(true);
    setAuthView('landing');
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;
    setAuthView('verify');
  };

  const handleVerificationConfirm = () => {
    setIsAuthenticated(true);
    setAuthView('landing');
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <AnimatePresence mode="wait">
        
        {/* LANDING PAGE ROUTE */}
        {authView === 'landing' && !isAuthenticated && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingPage onEnterApp={() => setAuthView('login')} />
          </motion.div>
        )}

        {/* LOGIN SCREEN */}
        {authView === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 bg-slate-900/10"
          >
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-premium p-8 relative">
              <div className="flex items-center gap-2 justify-center mb-8">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-black text-lg">M</div>
                <span className="font-bold text-sm tracking-tight">MoneyFlow Pro</span>
              </div>

              <h2 className="text-xl font-bold text-center mb-1">Welcome back</h2>
              <p className="text-xs text-slate-400 text-center mb-6">Enter your credentials to manage your workspaces.</p>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-accent border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary"
                      placeholder="alex@moneyflowpro.io"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Password</label>
                    <button
                      type="button"
                      onClick={() => setAuthView('forgot')}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-accent border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                    <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
                    <span>Remember this session</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-glow hover:shadow-glow/10 flex items-center justify-center gap-1.5"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-slate-500">Or continue with</span></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsAuthenticated(true);
                  setAuthView('landing');
                }}
                className="w-full py-2.5 bg-accent hover:bg-accent-hover text-foreground text-xs font-semibold rounded-xl border border-border transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                <span>Google Sandbox Account</span>
              </button>

              <p className="text-xs text-slate-500 text-center mt-6">
                Don't have an account?{' '}
                <button onClick={() => setAuthView('signup')} className="text-primary font-bold hover:underline">
                  Sign up
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* SIGN UP SCREEN */}
        {authView === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 bg-slate-900/10"
          >
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-premium p-8">
              <div className="flex items-center gap-2 justify-center mb-8">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-black text-lg">M</div>
                <span className="font-bold text-sm tracking-tight">MoneyFlow Pro</span>
              </div>

              <h2 className="text-xl font-bold text-center mb-1">Create Account</h2>
              <p className="text-xs text-slate-400 text-center mb-6">Unified dashboard for personal budgeting and company-wide accounting.</p>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-accent border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary"
                    placeholder="Alex Mercer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-accent border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary"
                    placeholder="alex@moneyflowpro.io"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-accent border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary"
                    placeholder="Minimum 8 characters"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-glow hover:shadow-glow/10 flex items-center justify-center gap-1.5"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <p className="text-xs text-slate-500 text-center mt-6">
                Already have an account?{' '}
                <button onClick={() => setAuthView('login')} className="text-primary font-bold hover:underline">
                  Log in
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* FORGOT PASSWORD SCREEN */}
        {authView === 'forgot' && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 bg-slate-900/10"
          >
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-premium p-8">
              <h2 className="text-lg font-bold mb-1 text-center">Reset Password</h2>
              <p className="text-xs text-slate-400 text-center mb-6">Enter your registered email address to receive password reset link.</p>

              <form onSubmit={e => {
                e.preventDefault();
                alert('Reset instructions sent to ' + email);
                setAuthView('login');
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-accent border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary"
                    placeholder="alex@moneyflowpro.io"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary text-white text-xs font-semibold rounded-xl"
                >
                  Send Reset Link
                </button>

                <button
                  type="button"
                  onClick={() => setAuthView('login')}
                  className="w-full py-2 text-xs text-slate-400 hover:text-foreground"
                >
                  Back to login
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* EMAIL VERIFICATION SCREEN */}
        {authView === 'verify' && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 bg-slate-900/10"
          >
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-premium p-8 text-center space-y-6">
              <ShieldCheck className="w-12 h-12 text-primary mx-auto" />
              <div>
                <h2 className="text-lg font-bold mb-1">Verify Your Email</h2>
                <p className="text-xs text-slate-400">We have sent a verification code to your email.</p>
              </div>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4].map(idx => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 bg-accent border border-border rounded-xl text-center font-bold text-lg focus:outline-none focus:border-primary"
                    defaultValue={idx * 2 - 1}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleVerificationConfirm}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-glow"
              >
                Confirm Verification
              </button>
            </div>
          </motion.div>
        )}

        {/* APPLICATION DASHBOARD WORKSPACE */}
        {isAuthenticated && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AppWorkspace onLogout={() => setIsAuthenticated(false)} />
          </motion.div>
        )}

      </AnimatePresence>

      {/* Global Upgrade Subscription Modal Drawer */}
      <UpgradeModal />
    </div>
  );
}
