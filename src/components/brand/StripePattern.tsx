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

  const getAnimationClass = () => {
    switch (animation) {
      case 'parallax':
        return 'animate-stripe-parallax';
      case 'hover':
        return 'animate-stripe-hover';
      case 'success':
        return 'animate-stripe-success';
      case 'loading':
        return 'animate-stripe-loading';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none',
        getAnimationClass(),
        className
      )}
      style={{
        '--stripe-color': color,
        '--stripe-opacity': opacity,
        '--animation-duration': speedDurations[speed],
      } as React.CSSProperties}
    >
      <div className="absolute inset-0 stripe-pattern" />
      
      <style jsx>{`
        .stripe-pattern {
          background-image: repeating-linear-gradient(
            15deg,
            transparent,
            transparent 20px,
            var(--stripe-color) 20px,
            var(--stripe-color) 40px
          );
          opacity: var(--stripe-opacity);
          width: 200%;
          height: 200%;
          transform: translateX(-50%) translateY(-50%);
        }

        @keyframes stripe-parallax {
          0% { transform: translateX(-50%) translateY(-50%); }
          100% { transform: translateX(-30%) translateY(-30%); }
        }

        @keyframes stripe-hover {
          0% { transform: translateX(-50%) translateY(-50%); }
          100% { transform: translateX(-40%) translateY(-40%); }
        }

        @keyframes stripe-success {
          0% { 
            transform: translateX(-50%) translateY(-50%) scale(1);
            opacity: var(--stripe-opacity);
          }
          50% { 
            transform: translateX(-50%) translateY(-50%) scale(1.1);
            opacity: calc(var(--stripe-opacity) * 2);
          }
          100% { 
            transform: translateX(-50%) translateY(-50%) scale(1);
            opacity: var(--stripe-opacity);
          }
        }

        @keyframes stripe-loading {
          0% { transform: translateX(-50%) translateY(-50%); }
          100% { transform: translateX(0%) translateY(0%); }
        }

        .animate-stripe-parallax .stripe-pattern {
          animation: stripe-parallax var(--animation-duration) linear infinite;
        }

        .animate-stripe-hover:hover .stripe-pattern {
          animation: stripe-hover calc(var(--animation-duration) / 2) linear infinite;
        }

        .animate-stripe-success .stripe-pattern {
          animation: stripe-success 1s ease-out;
        }

        .animate-stripe-loading .stripe-pattern {
          animation: stripe-loading var(--animation-duration) linear infinite;
        }
      `}</style>
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