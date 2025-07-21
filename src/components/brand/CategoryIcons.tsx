'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface IconProps {
  className?: string;
  size?: number;
}

export function GeometricCartIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Cart with return arrow */}
      <path 
        d="M4 5H7L9 14H17L19 7H8M7 14H17M9 19C9 19.5523 8.55228 20 8 20C7.44772 20 7 19.5523 7 19C7 18.4477 7.44772 18 8 18C8.55228 18 9 18.4477 9 19ZM17 19C17 19.5523 16.5523 20 16 20C15.4477 20 15 19.5523 15 19C15 18.4477 15.4477 18 16 18C16.5523 18 17 18.4477 17 19Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Return arrow */}
      <path 
        d="M15 3L12 6L15 9M12 6H19" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GeometricRocketIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Geometric rocket */}
      <path 
        d="M12 2L19 9L12 22L5 9L12 2Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      {/* Rocket details */}
      <path 
        d="M12 9V15M9 12H15" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      {/* Exhaust */}
      <path 
        d="M8 16L6 20M16 16L18 20M12 16L12 20" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GeometricShieldIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Geometric shield */}
      <path 
        d="M12 2L4 7V12C4 16.5 7 20.26 12 21C17 20.26 20 16.5 20 12V7L12 2Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      {/* Checkmark */}
      <path 
        d="M9 12L11 14L15 10" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GeometricWaveIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Geometric hand/wave */}
      <path 
        d="M6 8L8 4L10 8L12 4L14 8L16 4L18 8" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      <path 
        d="M4 12H20M4 16H20M8 20H16" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      {/* Welcome gesture */}
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

export function GeometricMegaphoneIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Geometric megaphone */}
      <path 
        d="M4 8L8 8L16 4V20L8 16L4 16V8Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      {/* Sound waves */}
      <path 
        d="M19 8C19 8 20 10 20 12C20 14 19 16 19 16M21 5C21 5 23 8 23 12C23 16 21 19 21 19" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      {/* Handle */}
      <path 
        d="M6 16V20" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );
}