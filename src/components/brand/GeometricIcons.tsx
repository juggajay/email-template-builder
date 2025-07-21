'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface IconProps {
  className?: string;
  size?: number;
}

export function TargetIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Geometric target with triangular segments */}
      <path d="M12 2L14.5 7L20 9.5L15 12L20 14.5L14.5 17L12 22L9.5 17L4 14.5L9 12L4 9.5L9.5 7L12 2Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

export function DollarSignIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Geometric dollar sign with diamond shape */}
      <path d="M12 2L21 12L12 22L3 12L12 2Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      <path d="M12 6V18M9 9H15M9 15H15" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CartIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Geometric cart with triangular body */}
      <path d="M4 4H7L10 16H18L21 7H8" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      <circle cx="11" cy="20" r="2" fill="currentColor" />
      <circle cx="17" cy="20" r="2" fill="currentColor" />
      <path d="M18 7L15 4L12 7" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrendingUpIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Geometric upward arrow with triangular segments */}
      <path d="M3 17L9 11L13 15L21 7" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      <path d="M15 7H21V13" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      <path d="M3 17L6 20L9 17" 
        fill="currentColor"
      />
    </svg>
  );
}

export function RefreshIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Geometric refresh with hexagon shape */}
      <path d="M12 2L19 6V12L16 14L19 16V18L12 22L5 18V12L8 10L5 8V6L12 2Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      <path d="M12 8V12L15 14" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChartIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Geometric bar chart with triangular tops */}
      <path d="M3 20H21" 
        stroke="currentColor" 
        strokeWidth="2"
      />
      <path d="M7 20V15L5 13L7 11V8" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 20V10L10 8L12 6V3" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M17 20V12L15 10L17 8V5" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}