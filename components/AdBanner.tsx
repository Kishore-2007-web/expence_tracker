"use client";

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { AdManager } from '@/lib/ads-manager';
import { Sparkles, Megaphone, Share2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdBannerProps {
  placementKey: 'dashboard' | 'reports' | 'settings';
}

export const AdBanner: React.FC<AdBannerProps> = ({ placementKey }) => {
  const { isPremium, openUpgradeModal } = useApp();
  const [closed, setClosed] = useState(false);

  if (isPremium || closed) return null;

  const placement = AdManager.getPlacement(placementKey);
  if (!placement) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full relative overflow-hidden rounded-xl border border-dashed border-emerald-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-4 md:p-5 flex items-center justify-between gap-4 mt-6 transition-all shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-primary shrink-0">
            {placementKey === 'settings' ? (
              <Share2 className="w-5 h-5 text-emerald-500" />
            ) : placementKey === 'reports' ? (
              <Megaphone className="w-5 h-5 text-emerald-500" />
            ) : (
              <Sparkles className="w-5 h-5 text-emerald-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded tracking-wide uppercase">
                Sponsored Sponsor
              </span>
              <span className="text-xs font-semibold text-slate-400">MoneyFlow Pro Ad System</span>
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {placement.fallbackText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openUpgradeModal}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            Upgrade Plan
          </button>
          <button
            onClick={() => setClosed(true)}
            className="p-1.5 hover:bg-accent rounded-full text-slate-400 hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
