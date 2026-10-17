"use client";

import React, { useState, useEffect } from 'react';

export type MascotState = 
  | 'idle' 
  | 'listening' 
  | 'thinking' 
  | 'responding' 
  | 'success' 
  | 'concern' 
  | 'error' 
  | 'sleeping';

interface TrackoMascotProps {
  state?: MascotState;
  size?: number;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const TrackoMascot: React.FC<TrackoMascotProps> = ({
  state = 'idle',
  size = 56,
  className = '',
  onClick,
  interactive = true,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Natural spontaneous blinking in idle/listening
  useEffect(() => {
    if (state === 'sleeping') return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3800 + Math.random() * 2500);

    return () => clearInterval(blinkInterval);
  }, [state]);

  const effectiveState = isHovered && state === 'idle' ? 'listening' : state;

  // Mascot dynamic head tilt and floating animations
  const getTransformClasses = () => {
    switch (effectiveState) {
      case 'listening':
        return 'rotate-[-6deg] translate-y-[-2px] transition-transform duration-300';
      case 'thinking':
        return 'rotate-[4deg] translate-y-[-3px] transition-transform duration-300';
      case 'responding':
        return 'animate-bounce-subtle';
      case 'success':
        return 'translate-y-[-6px] scale-105 transition-all duration-300';
      case 'concern':
        return 'rotate-[-3deg] transition-transform duration-300';
      case 'sleeping':
        return 'opacity-85 translate-y-[2px] transition-all duration-300';
      case 'idle':
      default:
        return 'animate-float';
    }
  };

  // Eyes rendering depending on state
  const renderEyes = () => {
    if (effectiveState === 'sleeping') {
      // Peaceful closed lines
      return (
        <g stroke="#000000" strokeWidth="2.5" strokeLinecap="round">
          <path d="M 18 29 Q 22 31 26 29" />
          <path d="M 38 29 Q 42 31 46 29" />
        </g>
      );
    }

    if (effectiveState === 'success') {
      // Cheerful happy curved arches (^ ^)
      return (
        <g stroke="#000000" strokeWidth="2.8" strokeLinecap="round" fill="none">
          <path d="M 18 30 Q 22 24 26 30" />
          <path d="M 38 30 Q 42 24 46 30" />
        </g>
      );
    }

    if (effectiveState === 'concern') {
      // Slightly wide eyes with subtle cautious eyebrows
      return (
        <g>
          {/* Eyebrows */}
          <path d="M 17 21 L 27 24" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          <path d="M 47 21 L 37 24" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          {/* Eyes */}
          <circle cx="22" cy="29" r="4.2" fill="#000000" />
          <circle cx="23.5" cy="27.5" r="1.4" fill="#ffffff" />
          <circle cx="42" cy="29" r="4.2" fill="#000000" />
          <circle cx="43.5" cy="27.5" r="1.4" fill="#ffffff" />
        </g>
      );
    }

    if (effectiveState === 'thinking') {
      // Eyes looking up and to the right thoughtfully
      return (
        <g>
          <circle cx="24" cy="26" r="4" fill="#000000" />
          <circle cx="25.5" cy="24.5" r="1.5" fill="#ffffff" />
          <circle cx="44" cy="26" r="4" fill="#000000" />
          <circle cx="45.5" cy="24.5" r="1.5" fill="#ffffff" />
        </g>
      );
    }

    if (isBlinking) {
      // Blink line
      return (
        <g stroke="#000000" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="28" x2="26" y2="28" />
          <line x1="38" y1="28" x2="46" y2="28" />
        </g>
      );
    }

    // Default open eyes with lively specular highlights
    return (
      <g>
        {/* Left eye */}
        <circle cx="22" cy="28" r="4.2" fill="#000000" />
        <circle cx="23.5" cy="26.5" r="1.5" fill="#ffffff" />
        {/* Right eye */}
        <circle cx="42" cy="28" r="4.2" fill="#000000" />
        <circle cx="43.5" cy="26.5" r="1.5" fill="#ffffff" />
      </g>
    );
  };

  // Mouth rendering depending on state
  const renderMouth = () => {
    switch (effectiveState) {
      case 'success':
        // Big happy open smile
        return (
          <path
            d="M 28 35 Q 32 40 36 35 Z"
            fill="#FADE85"
            stroke="#000000"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        );
      case 'concern':
        // Small neutral/wavy line
        return (
          <path
            d="M 29 37 Q 32 35 35 37"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        );
      case 'responding':
        // Small gentle talking circle
        return (
          <ellipse
            cx="32"
            cy="36"
            rx="2.5"
            ry="3.5"
            fill="#000000"
          />
        );
      case 'sleeping':
        // Tiny gentle dot
        return (
          <circle cx="32" cy="35" r="1" fill="#000000" />
        );
      case 'thinking':
        // Small pursed mouth to the side
        return (
          <circle cx="33" cy="36" r="1.8" fill="#000000" />
        );
      case 'idle':
      case 'listening':
      default:
        // Gentle warm smile
        return (
          <path
            d="M 29 34 Q 32 38 35 34"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        );
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex items-center justify-center select-none ${
        interactive ? 'cursor-pointer' : ''
      } ${className}`}
      style={{ width: size, height: size }}
      title={`TRACKO AI (${state})`}
      role="img"
      aria-label={`TRACKO AI Financial Companion - State: ${state}`}
    >
      <div className={`w-full h-full ${getTransformClasses()}`}>
        <svg
          viewBox="0 0 64 64"
          width="100%"
          height="100%"
          className="overflow-visible"
        >
          <defs>
            {/* Body gradient - Aquatic mint with soft light sheen */}
            <linearGradient id="trackoBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b4efe3" />
              <stop offset="50%" stopColor="#96DFCE" />
              <stop offset="100%" stopColor="#75ceba" />
            </linearGradient>

            {/* Belly badge gradient */}
            <linearGradient id="trackoBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.65" />
            </linearGradient>

            {/* Sunshine antenna bead */}
            <linearGradient id="trackoSunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff3bf" />
              <stop offset="100%" stopColor="#FADE85" />
            </linearGradient>
          </defs>

          {/* Little Antenna / Digital Sensor with Sunshine bead */}
          <line
            x1="32"
            y1="12"
            x2="32"
            y2="7"
            stroke="#000000"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle
            cx="32"
            cy="5"
            r="4.5"
            fill="url(#trackoSunGrad)"
            stroke="#000000"
            strokeWidth="2"
          />

          {/* Little side ear fins/antennae */}
          <ellipse
            cx="10"
            cy="30"
            rx="3"
            ry="6"
            fill="#FADE85"
            stroke="#000000"
            strokeWidth="2"
            transform="rotate(-15 10 30)"
          />
          <ellipse
            cx="54"
            cy="30"
            rx="3"
            ry="6"
            fill="#FADE85"
            stroke="#000000"
            strokeWidth="2"
            transform="rotate(15 54 30)"
          />

          {/* Main Rounded Mascot Body */}
          <rect
            x="11"
            y="12"
            width="42"
            height="44"
            rx="21"
            fill="url(#trackoBodyGrad)"
            stroke="#000000"
            strokeWidth="2.5"
          />

          {/* Soft Frosted Belly / Screen Plaque */}
          <rect
            x="16"
            y="18"
            width="32"
            height="32"
            rx="16"
            fill="url(#trackoBellyGrad)"
            stroke="#000000"
            strokeWidth="1.2"
            strokeOpacity="0.25"
          />

          {/* Cheeks - Warm Sunshine Blush */}
          <circle cx="16" cy="33" r="3.2" fill="#FADE85" opacity="0.8" />
          <circle cx="48" cy="33" r="3.2" fill="#FADE85" opacity="0.8" />

          {/* Expressive Eyes */}
          {renderEyes()}

          {/* Expressive Mouth */}
          {renderMouth()}

          {/* Small Fin Feet */}
          <ellipse cx="23" cy="56" rx="5" ry="3" fill="#FADE85" stroke="#000000" strokeWidth="2" />
          <ellipse cx="41" cy="56" rx="5" ry="3" fill="#FADE85" stroke="#000000" strokeWidth="2" />
        </svg>
      </div>

      {/* Reduced-motion CSS styles embedded */}
      <style jsx>{`
        @keyframes trackoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        @keyframes trackoBounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-2px) scale(1.02); }
        }
        .animate-float {
          animation: trackoFloat 3.2s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: trackoBounce 1.2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-float, .animate-bounce-subtle {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TrackoMascot;
