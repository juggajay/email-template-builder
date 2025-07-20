'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';

interface GrowthMetricProps {
  value: number;
  format?: 'currency' | 'percentage' | 'number';
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
  comparison?: {
    value: number;
    label: string;
    format?: 'percentage' | 'absolute';
  };
  trend?: 'up' | 'down' | 'neutral';
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPoweredBy?: boolean;
  className?: string;
  onComplete?: () => void;
}

export function GrowthMetric({
  value,
  format = 'number',
  prefix = '',
  suffix = '',
  duration = 2000,
  delay = 0,
  comparison,
  trend,
  label,
  size = 'md',
  showPoweredBy = false,
  className,
  onComplete,
}: GrowthMetricProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const sizeClasses = {
    sm: 'text-lg font-medium',
    md: 'text-2xl font-semibold',
    lg: 'text-4xl font-bold',
    xl: 'text-5xl font-bold',
  };

  const formatValue = (num: number): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(num);
      case 'percentage':
        return `${Math.round(num)}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(Math.round(num));
    }
  };

  const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4);
  };

  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      if (!startTimeRef.current) {
        startTimeRef.current = now;
      }

      const elapsed = now - startTimeRef.current - delay;
      
      if (elapsed < 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (!isAnimating && elapsed >= 0) {
        setIsAnimating(true);
      }

      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = easedProgress * value;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        if (onComplete) onComplete();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, delay, onComplete, isAnimating]);

  const getTrendIcon = () => {
    if (!trend) return null;
    
    const iconClass = cn('ml-1 inline-block', {
      'text-growth-green': trend === 'up',
      'text-red-500': trend === 'down',
      'text-gray-400': trend === 'neutral',
    });

    return trend === 'up' ? (
      <ArrowUp className={cn(iconClass, 'w-4 h-4')} />
    ) : trend === 'down' ? (
      <ArrowDown className={cn(iconClass, 'w-4 h-4')} />
    ) : (
      <TrendingUp className={cn(iconClass, 'w-4 h-4')} />
    );
  };

  const getComparisonText = () => {
    if (!comparison) return null;

    const diff = value - comparison.value;
    const percentChange = ((diff / comparison.value) * 100).toFixed(1);
    const isPositive = diff > 0;

    return (
      <span className={cn('text-sm font-normal ml-2', {
        'text-growth-green': isPositive,
        'text-red-500': !isPositive,
      })}>
        {isPositive ? '+' : ''}{comparison.format === 'percentage' ? `${percentChange}%` : formatValue(diff)}
        <span className="text-gray-500 ml-1">vs {comparison.label}</span>
      </span>
    );
  };

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setShowBadge(true)}
      onMouseLeave={() => setShowBadge(false)}
    >
      {label && (
        <div className="text-sm text-gray-600 mb-1">{label}</div>
      )}
      
      <div className={cn(sizeClasses[size], 'text-zebra-black leading-none')}>
        <span className={cn({ 'metric-animating': isAnimating })}>
          {prefix}{formatValue(displayValue)}{suffix}
        </span>
        {getTrendIcon()}
        {getComparisonText()}
      </div>

      {showPoweredBy && showBadge && (
        <div className="absolute -bottom-6 left-0 opacity-0 animate-fade-in">
          <div className="bg-zebra-black text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
            Powered by ZebaMail
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }

        .metric-animating {
          background: linear-gradient(
            90deg,
            #00d4aa 0%,
            #00aa88 50%,
            #00d4aa 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2s linear infinite;
        }

        @keyframes shimmer {
          to { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}

// Compound component for multiple metrics
export function GrowthMetricGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-6 md:gap-8', className)}>
      {children}
    </div>
  );
}