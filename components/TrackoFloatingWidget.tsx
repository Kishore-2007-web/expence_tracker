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
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2">
      {/* Friendly Speech Bubble Tooltip */}
      {!dismissedBubble && (
        <div 
          onClick={onOpen}
          className="cursor-pointer bg-white/95 border border-black/15 shadow-premium px-3 py-1.5 rounded-2xl text-[11px] font-bold text-black flex items-center gap-2 animate-in fade-in slide-in-from-right duration-300 hover:scale-105 transition-transform"
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
        className="relative group p-1.5 bg-[#96DFCE] border-2 border-black/15 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.45) 100%)',
          boxShadow: '0 10px 25px -4px rgba(7, 38, 32, 0.25), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)'
        }}
        aria-label="Open TRACKO AI Financial Assistant"
        title={`Open TRACKO AI (${currentBusiness ? currentBusiness.name : 'Personal Workspace'})`}
      >
        <TrackoMascot
          state={isHovered ? 'listening' : 'idle'}
          size={46}
          interactive={false}
        />

        {/* Small AI Pulse Bead */}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-sunshine border-2 border-black rounded-full flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-black rounded-full animate-ping" />
        </span>
      </button>
    </div>
  );
};

export default TrackoFloatingWidget;
