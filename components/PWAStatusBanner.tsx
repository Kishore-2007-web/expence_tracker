"use client";

import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, Database, Sparkles, HardDrive } from 'lucide-react';

interface PWAStatusIndicatorProps {
  isOnline: boolean;
  syncStatus: 'offline' | 'saved_locally' | 'syncing' | 'synced';
  isUpdateAvailable?: boolean;
  onApplyUpdate?: () => void;
  compact?: boolean;
}

export function PWAStatusIndicator({
  isOnline,
  syncStatus,
  isUpdateAvailable,
  onApplyUpdate,
  compact = false
}: PWAStatusIndicatorProps) {
  // Update available banner takes highest priority
  if (isUpdateAvailable) {
    return (
      <button
        onClick={onApplyUpdate}
        className="px-2.5 py-1 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 border border-violet-500/30 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all animate-pulse"
        title="New version available. Tap to reload."
      >
        <RefreshCw className="w-3 h-3 animate-spin" />
        <span>Update Available</span>
      </button>
    );
  }

  // Offline status
  if (!isOnline || syncStatus === 'offline') {
    return (
      <div 
        className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] font-semibold text-amber-500 flex items-center gap-1.5 shrink-0"
        title="Offline mode: Records saved to device IndexedDB"
      >
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="tracking-tight">{compact ? 'Offline' : 'Offline • Local Mode'}</span>
      </div>
    );
  }

  // Syncing status
  if (syncStatus === 'syncing') {
    return (
      <div className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[11px] font-semibold text-blue-400 flex items-center gap-1.5 shrink-0">
        <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
        <span className="tracking-tight">Syncing...</span>
      </div>
    );
  }

  // Saved Locally / Synced status
  return (
    <div 
      className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 shrink-0"
      title="Financial records saved locally and ready offline"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      <span className="tracking-tight">{compact ? 'Local Safe' : 'Saved Locally'}</span>
    </div>
  );
}

export function PWAOfflineBanner({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-amber-950/80 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-200 flex items-center justify-center gap-2 z-30 shadow-md">
      <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>
        You're offline. Your supported financial records remain available on this device.
      </span>
    </div>
  );
}
