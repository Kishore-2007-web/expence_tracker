"use client";

import React, { useState } from 'react';
import { useApp, getCurrencySymbol, EXCHANGE_RATES } from '@/lib/AppContext';
import LandingPage from '@/components/LandingPage';
import AppWorkspace from '@/components/AppWorkspace';
import { UpgradeModal } from '@/components/UpgradeModal';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { 
    profile, 
    updateProfileDetails, 
    firebaseUser, 
    signUpWithEmail, 
    loginWithEmail, 
    loginWithGoogle, 
    logout, 
    resetPassword,
    isFirebaseBlocked,
    loginOffline,
    authLoading
  } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup' | 'forgot' | 'verify' | 'onboarding'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (firebaseUser) {
      setIsAuthenticated(true);
      // Only set to onboarding if the user profile specifically hasn't onboarded yet.
      // Defensively treat new/changed profiles as not onboarded, and fallback to checking the default profile ID.
      const isUserOnboarded = profile.onboarded !== undefined ? profile.onboarded : (profile.id !== 'user-default-uuid');
      if (!isUserOnboarded) {
        setAuthView('onboarding');
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [firebaseUser, profile]);

  if (!mounted || authLoading) {
    return (
      <div className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] -top-10 -left-10 animate-pulse duration-[4000ms]" />
        <div className="absolute w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] -bottom-10 -right-10 animate-pulse duration-[3000ms]" />

        <div className="flex flex-col items-center gap-4 relative z-10">
          {/* Logo container with custom ring spinner */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* outer spinning track */}
            <div className="absolute inset-0 rounded-2xl border-2 border-slate-800" />
            {/* outer spinning active border */}
            <div className="absolute inset-0 rounded-2xl border-2 border-t-primary border-r-primary animate-spin" />
            
            {/* logo mark in center */}
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-glow">
              M
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-sm tracking-tight text-white">My Pocket Tracker</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest animate-pulse">Initializing Session...</span>
          </div>
        </div>
      </div>
    );
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      alert(err.message || 'Login failed.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;
    try {
      await signUpWithEmail(email, password, name);
      setAuthView('onboarding');
    } catch (err: any) {
      alert(err.message || 'Signup failed.');
    }
  };

  const handleVerificationConfirm = () => {
    setAuthView('onboarding');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setAuthView('landing');
    } catch (err: any) {
      alert(err.message || 'Logout failed.');
    }
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileDetails(name || profile.name, profile.phone, profile.country, currency, profile.language);
    setAuthView('landing');
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await resetPassword(email);
      alert('Password reset instructions sent to ' + email);
      setAuthView('login');
    } catch (err: any) {
      alert(err.message || 'Failed to send reset email.');
    }
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
        {authView === 'login' && !isAuthenticated && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 bg-background"
          >
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-premium p-8 relative">
              <div className="flex items-center gap-2 justify-center mb-8">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-black text-lg">M</div>
                <span className="font-bold text-sm tracking-tight">My Pocket Tracker</span>
              </div>

              <h2 className="text-xl font-bold text-center mb-1">Welcome back</h2>
              <p className="text-xs text-slate-400 text-center mb-6">Enter your credentials to manage your workspaces.</p>

              {isFirebaseBlocked && (
                <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] rounded-xl text-center leading-relaxed">
                  ⚠️ Firebase Authentication is blocked (e.g. by an ad-blocker or offline).
                </div>
              )}

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
                      placeholder="alex@mypockettracker.io"
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
                onClick={async () => {
                  try {
                    await loginWithGoogle();
                  } catch (err: any) {
                    alert(err.message || 'Google sign in failed.');
                  }
                }}
                className="w-full py-2.5 bg-accent hover:bg-accent-hover text-foreground text-xs font-semibold rounded-xl border border-border transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                <span>Continue with Google</span>
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
        {authView === 'signup' && !isAuthenticated && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 bg-background"
          >
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-premium p-8">
              <div className="flex items-center gap-2 justify-center mb-8">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-black text-lg">M</div>
                <span className="font-bold text-sm tracking-tight">My Pocket Tracker</span>
              </div>

              <h2 className="text-xl font-bold text-center mb-1">Create Account</h2>
              <p className="text-xs text-slate-400 text-center mb-6">Unified dashboard for personal budgeting and company-wide accounting.</p>

              {isFirebaseBlocked && (
                <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] rounded-xl text-center leading-relaxed">
                  ⚠️ Firebase Authentication is blocked (e.g. by an ad-blocker or offline).
                </div>
              )}

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
                    placeholder="alex@mypockettracker.io"
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-slate-500">Or continue with</span></div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await loginWithGoogle();
                  } catch (err: any) {
                    alert(err.message || 'Google sign in failed.');
                  }
                }}
                className="w-full py-2.5 bg-accent hover:bg-accent-hover text-foreground text-xs font-semibold rounded-xl border border-border transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                <span>Continue with Google</span>
              </button>



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
        {authView === 'forgot' && !isAuthenticated && (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 bg-background"
          >
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-premium p-8">
              <h2 className="text-lg font-bold mb-1 text-center">Reset Password</h2>
              <p className="text-xs text-slate-400 text-center mb-6">Enter your registered email address to receive password reset link.</p>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-accent border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary"
                    placeholder="alex@mypockettracker.io"
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
        {authView === 'verify' && !isAuthenticated && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 bg-background"
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

        {/* ONBOARDING SCREEN */}
        {authView === 'onboarding' && isAuthenticated && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 bg-background"
          >
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-premium p-8 relative">
              <div className="flex items-center gap-2 justify-center mb-6">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-black text-lg shadow-glow">M</div>
                <span className="font-bold text-sm tracking-tight">My Pocket Tracker</span>
              </div>

              <h2 className="text-xl font-bold text-center mb-1">Set Up Your Account</h2>
              <p className="text-xs text-slate-400 text-center mb-6">Customize your profile name and select your default workspace currency.</p>

              <form onSubmit={handleOnboardingSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name || profile.name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-accent border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary"
                    placeholder="Alex Mercer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">Preferred Currency</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full bg-accent border border-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary"
                  >
                    {Object.keys(EXCHANGE_RATES).sort().map(cur => (
                      <option key={cur} value={cur}>
                        {cur} ({getCurrencySymbol(cur)})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-glow hover:shadow-glow/10 flex items-center justify-center gap-1.5"
                >
                  <span>Complete Onboarding</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* APPLICATION DASHBOARD WORKSPACE */}
        {isAuthenticated && authView !== 'onboarding' && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AppWorkspace onLogout={handleLogout} />
          </motion.div>
        )}

      </AnimatePresence>

      {/* Global Upgrade Subscription Modal Drawer */}
      <UpgradeModal />
    </div>
  );
}
