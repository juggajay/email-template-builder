'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type AnimationType = 'parallax' | 'hover' | 'success' | 'loading' | 'static';

interface StripePatternProps {
  animation?: AnimationType;
  speed?: 'slow' | 'normal' | 'fast';
  opacity?: number;
  className?: string;
  color?: string;
}

export function StripePattern({
  animation = 'static',
  speed = 'normal',
  opacity = 0.1,
  className,
  color = '#00d4aa',
}: StripePatternProps) {
  const speedDurations = {
    slow: '60s',
    normal: '30s',
    fast: '15s',
  };

  const getAnimationStyle = () => {
    const duration = speedDurations[speed];
    switch (animation) {
      case 'parallax':
        return `stripe-parallax ${duration} linear infinite`;
      case 'hover':
        return `stripe-hover ${duration} linear infinite`;
      case 'success':
        return `stripe-success 1s ease-out`;
      case 'loading':
        return `stripe-loading ${duration} linear infinite`;
      default:
        return 'none';
    }
  };

  // Convert opacity to hex
  const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');

  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none',
        className
      )}
    >
      <div 
        className="absolute inset-0 stripe-pattern"
        style={{
          backgroundImage: `repeating-linear-gradient(
            15deg,
            transparent,
            transparent 20px,
            ${color}${opacityHex} 20px,
            ${color}${opacityHex} 40px
          )`,
          width: '200%',
          height: '200%',
          transform: 'translateX(-50%) translateY(-50%)',
          animation: getAnimationStyle(),
        }}
      />
    </div>
  );
}

// Utility component for easy background application
export function StripeBackground({
  children,
  ...props
}: StripePatternProps & { children: React.ReactNode }) {
  return (
    <div className="relative">
      <StripePattern {...props} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}