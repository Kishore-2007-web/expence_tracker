"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  CheckCircle2, 
  Monitor, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallNative?: () => Promise<boolean>;
  isInstallable: boolean;
  isInstalled: boolean;
}

export default function PWAInstallModal({
  isOpen,
  onClose,
  onInstallNative,
  isInstallable,
  isInstalled,
}: PWAInstallModalProps) {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('android');
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }
  }, []);

  if (!isOpen) return null;

  const handleNativeClick = async () => {
    if (onInstallNative) {
      const outcome = await onInstallNative();
      if (outcome) {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Glow ambient decoration */}
        <div className="absolute w-[250px] h-[250px] bg-primary/10 rounded-full blur-[80px] -top-10 -right-10 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Close installation modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-glow shrink-0">
            M
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground tracking-tight">
              {isInstalled ? 'My Pocket Tracker is Installed' : 'Install My Pocket Tracker'}
            </h2>
            <p className="text-xs text-slate-400">
              Offline-ready personal wealth and business tracker
            </p>
          </div>
        </div>

        {/* Native 1-Click Install Button if supported */}
        {isInstallable && !isInstalled && (
          <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Installation Available</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Your browser supports direct 1-tap installation.
              </div>
            </div>
            <button
              onClick={handleNativeClick}
              className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary-hover active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Install Now</span>
            </button>
          </div>
        )}

        {/* Success Notice */}
        {installSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-aquatic/15 border border-aquatic/30 flex items-center gap-3 text-aquatic text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Installation accepted! Launching app icon...</span>
          </div>
        )}

        {/* Already Installed View */}
        {isInstalled ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-aquatic/10 border border-aquatic/20 text-center">
              <CheckCircle2 className="w-8 h-8 text-aquatic mx-auto mb-2" />
              <div className="text-sm font-bold text-foreground">App Already Active</div>
              <div className="text-xs text-slate-400 mt-1">
                My Pocket Tracker is already installed on your device with full offline financial capabilities.
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-glow"
            >
              Open Dashboard
            </button>
          </div>
        ) : (
          <div>
            {/* Platform Selector Tabs */}
            <div className="flex rounded-xl bg-accent p-1 mb-5 border border-border">
              <button
                onClick={() => setPlatform('android')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  platform === 'android' ? 'bg-card text-foreground shadow-sm' : 'text-slate-400 hover:text-foreground'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
              <button
                onClick={() => setPlatform('ios')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  platform === 'ios' ? 'bg-card text-foreground shadow-sm' : 'text-slate-400 hover:text-foreground'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>
              <button
                onClick={() => setPlatform('desktop')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  platform === 'desktop' ? 'bg-card text-foreground shadow-sm' : 'text-slate-400 hover:text-foreground'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
            </div>

            {/* Platform Step-by-Step Instructions */}
            <div className="space-y-3.5 text-xs">
              {platform === 'android' && (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50 border border-border">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">1</div>
                    <div className="text-slate-300">
                      Open this page in <strong>Google Chrome</strong> or your default Android browser.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50 border border-border">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">2</div>
                    <div className="text-slate-300">
                      Tap the <strong>three vertical dots menu (⋮)</strong> in the upper right corner of Chrome.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50 border border-border">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">3</div>
                    <div className="text-slate-300">
                      Select <strong>Install app</strong> or <strong>Add to Home screen</strong> and confirm.
                    </div>
                  </div>
                </>
              )}

              {platform === 'ios' && (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50 border border-border">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">1</div>
                    <div className="text-slate-300">
                      Open this page in <strong>Safari</strong> on your iPhone or iPad.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50 border border-border">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">2</div>
                    <div className="text-slate-300 flex items-center gap-1.5 flex-wrap">
                      <span>Tap the <strong>Share button</strong></span>
                      <Share2 className="w-3.5 h-3.5 text-primary inline" />
                      <span>at the bottom of your screen.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50 border border-border">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">3</div>
                    <div className="text-slate-300 flex items-center gap-1.5 flex-wrap">
                      <span>Scroll down and tap <strong>Add to Home Screen</strong></span>
                      <PlusSquare className="w-3.5 h-3.5 text-primary inline" />
                      <span>, then tap <strong>Add</strong> in the top-right.</span>
                    </div>
                  </div>
                </>
              )}

              {platform === 'desktop' && (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50 border border-border">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">1</div>
                    <div className="text-slate-300">
                      In Chrome, Edge, or Brave, look for the <strong>Install Icon</strong> <Download className="w-3 h-3 text-primary inline" /> on the right side of the address bar.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50 border border-border">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">2</div>
                    <div className="text-slate-300">
                      Click <strong>Install</strong> to launch Pocket Tracker as a standalone window.
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Offline Capability Reassurance */}
            <div className="mt-5 p-3 rounded-xl bg-aquatic/10 border border-aquatic/20 flex items-center gap-2.5 text-[11px] text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-aquatic shrink-0" />
              <span>Full standalone window, faster startup, and seamless offline data tracking.</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
