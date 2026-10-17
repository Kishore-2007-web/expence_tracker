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
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 text-center relative z-10 shadow-2xl backdrop-blur-xl">
        {/* Offline Badge */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-sunshine/20 border border-sunshine/40 flex items-center justify-center text-sunshine-700 dark:text-sunshine shadow-sm">
          <WifiOff className="w-8 h-8 animate-pulse text-amber-700 dark:text-sunshine" />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
          You're Offline
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Your supported financial records, ledger transactions, and company workspaces remain securely available on this device.
        </p>

        {/* Local Storage reassurance */}
        <div className="p-4 rounded-2xl bg-accent border border-border text-left mb-6 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-sunshine shrink-0 mt-0.5" />
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
            className="w-full py-3 bg-sunshine hover:bg-sunshine-hover text-[#072620] text-xs font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span>Open Cached Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={handleRetry}
            className="w-full py-2.5 bg-card hover:bg-sunshine/15 text-foreground text-xs font-bold rounded-xl border border-sunshine/30 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sunshine" />
            <span>Check Connection & Retry</span>
          </button>
        </div>
      </div>
    </div>
  );
}
