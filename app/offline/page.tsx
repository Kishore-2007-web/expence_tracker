"use client";

import React from 'react';
import Link from 'next/link';
import { WifiOff, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] -bottom-20 -right-20 pointer-events-none" />

      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 text-center relative z-10 shadow-2xl">
        {/* Offline Badge */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-lg">
          <WifiOff className="w-8 h-8 animate-pulse" />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-2">
          You're Offline
        </h1>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Your supported financial records, ledger transactions, and company workspaces remain securely available on this device.
        </p>

        {/* Local Storage reassurance */}
        <div className="p-4 rounded-2xl bg-accent border border-border text-left mb-6 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-foreground">Local Persistence Active</div>
            <div className="text-[11px] text-slate-400 leading-normal mt-0.5">
              Transactions created offline are persisted immediately in your private local database.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-glow flex items-center justify-center gap-2"
          >
            <span>Open Cached Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={handleRetry}
            className="w-full py-2.5 bg-accent hover:bg-accent-hover text-slate-300 text-xs font-semibold rounded-xl border border-border transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Connection & Retry</span>
          </button>
        </div>
      </div>
    </div>
  );
}
