"use client";

import React, { useState } from 'react';
import TrackoMascot, { MascotState } from './TrackoMascot';
import { Sparkles, X } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

interface TrackoFloatingWidgetProps {
  onOpen: () => void;
  isOpen: boolean;
}

export const TrackoFloatingWidget: React.FC<TrackoFloatingWidgetProps> = ({
  onOpen,
  isOpen
}) => {
  const { currentBusiness } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  const [dismissedBubble, setDismissedBubble] = useState(false);

  // If chat modal is already open, hide the floating trigger to avoid clutter
  if (isOpen) return null;

  return (
    <div className="fixed bottom-14 md:bottom-6 right-3 sm:right-6 z-40 flex items-center gap-2">
      {/* Friendly Speech Bubble Tooltip */}
      {!dismissedBubble && (
        <div 
          onClick={onOpen}
          className="hidden sm:flex cursor-pointer bg-white/95 border border-black/15 shadow-premium px-3 py-1.5 rounded-2xl text-[11px] font-bold text-black items-center gap-2 animate-in fade-in slide-in-from-right duration-300 hover:scale-105 transition-transform shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-black animate-pulse" />
          <span>Ask TRACKO AI</span>
          <button
            onClick={e => {
              e.stopPropagation();
              setDismissedBubble(true);
            }}
            className="p-0.5 text-black/40 hover:text-black rounded"
            aria-label="Dismiss tooltip"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Mascot Button */}
      <button
        onClick={onOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group hover:scale-110 active:scale-95 transition-transform duration-300 focus:outline-none shrink-0"
        aria-label="Open TRACKO AI Financial Assistant"
        title={`Open TRACKO AI (${currentBusiness ? currentBusiness.name : 'Personal Workspace'})`}
      >
        <TrackoMascot
          state={isHovered ? 'listening' : 'idle'}
          size={50}
          interactive={false}
        />
      </button>
    </div>
  );
};

export default TrackoFloatingWidget;
