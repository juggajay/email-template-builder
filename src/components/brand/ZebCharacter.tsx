'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type ZebVariant = 'default' | 'peek' | 'celebrate' | 'guide' | 'welcome' | 'thinking' | 'error' | 'loading';

interface ZebCharacterProps {
  variant?: ZebVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ZebCharacter({ variant = 'default', size = 'md', className }: ZebCharacterProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const getAnimation = () => {
    switch (variant) {
      case 'peek':
        return 'animate-peek';
      case 'celebrate':
        return 'animate-celebrate';
      case 'guide':
        return 'animate-guide';
      case 'welcome':
        return 'animate-welcome';
      case 'thinking':
        return 'animate-thinking';
      case 'loading':
        return 'animate-gallop';
      default:
        return '';
    }
  };

  return (
    <div className={cn(sizeClasses[size], getAnimation(), className)}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Base Zebra Shape - Geometric construction */}
        <g id="zeb-body">
          {/* Body - Triangle base */}
          <path
            d="M30 70 L50 30 L70 70 Z"
            fill="#0a0a0a"
            className={variant === 'error' ? 'fill-red-600' : ''}
          />
          
          {/* Head - Circle */}
          <circle
            cx="50"
            cy="30"
            r="15"
            fill="#0a0a0a"
            className={variant === 'error' ? 'fill-red-600' : ''}
          />
          
          {/* Stripes - The signature pattern */}
          <g id="stripes" className="fill-white">
            <rect x="35" y="40" width="4" height="20" transform="rotate(-15 37 50)" />
            <rect x="45" y="40" width="4" height="20" transform="rotate(-15 47 50)" />
            <rect x="55" y="40" width="4" height="20" transform="rotate(-15 57 50)" />
            
            {/* Head stripe creating implied smile */}
            <path d="M40 30 Q50 35 60 30" stroke="white" strokeWidth="3" fill="none" />
          </g>
          
          {/* Eyes */}
          <circle cx="44" cy="28" r="2" fill="white" />
          <circle cx="56" cy="28" r="2" fill="white" />
          
          {/* Variant-specific elements */}
          {variant === 'celebrate' && (
            <g id="confetti" className="animate-pulse">
              <circle cx="25" cy="20" r="2" fill="#00d4aa" />
              <circle cx="75" cy="20" r="2" fill="#6b5fd4" />
              <circle cx="30" cy="15" r="2" fill="#ffb800" />
              <circle cx="70" cy="15" r="2" fill="#00d4aa" />
            </g>
          )}
          
          {variant === 'guide' && (
            <g id="pointing-hoof">
              <path d="M70 65 L85 60 L85 65 L70 70 Z" fill="#0a0a0a" />
            </g>
          )}
          
          {variant === 'thinking' && (
            <g id="thought-dots" className="animate-pulse">
              <circle cx="70" cy="20" r="2" fill="#737373" opacity="0.8" />
              <circle cx="77" cy="15" r="3" fill="#737373" opacity="0.6" />
              <circle cx="85" cy="10" r="4" fill="#737373" opacity="0.4" />
            </g>
          )}
          
          {variant === 'welcome' && (
            <g id="waving-hoof">
              <path 
                d="M30 65 L15 55 L15 60 L30 70 Z" 
                fill="#0a0a0a"
                className="animate-wave origin-[30px_67px]"
              />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

// Add these animations to your CSS or Tailwind config
const animationStyles = `
@keyframes peek {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-10px); }
}

@keyframes celebrate {
  0%, 100% { transform: translateY(0) rotate(0); }
  25% { transform: translateY(-10px) rotate(-5deg); }
  75% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes guide {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}

@keyframes welcome {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

@keyframes thinking {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes gallop {
  0%, 100% { transform: translateX(0) scaleX(1); }
  25% { transform: translateX(10px) scaleX(0.95); }
  50% { transform: translateX(20px) scaleX(1.05); }
  75% { transform: translateX(10px) scaleX(0.95); }
}

@keyframes wave {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-20deg); }
  75% { transform: rotate(20deg); }
}

.animate-peek { animation: peek 2s ease-in-out infinite; }
.animate-celebrate { animation: celebrate 1s ease-in-out; }
.animate-guide { animation: guide 1.5s ease-in-out infinite; }
.animate-welcome { animation: welcome 0.5s ease-in-out 3; }
.animate-thinking { animation: thinking 2s ease-in-out infinite; }
.animate-gallop { animation: gallop 1s ease-in-out infinite; }
.animate-wave { animation: wave 0.5s ease-in-out 3; }
`;