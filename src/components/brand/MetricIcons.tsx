'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface IconProps {
  className?: string;
  size?: number;
}

export function GeometricLightningIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Geometric lightning bolt */}
      <path 
        d="M13 2L4 14H11L10 22L20 10H13L13 2Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

export function GeometricTrophyIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Geometric trophy */}
      <path 
        d="M12 2L8 8V14L10 16V20H14V16L16 14V8L12 2Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      {/* Handles */}
      <path 
        d="M8 6H4V10L6 12M16 6H20V10L18 12" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      {/* Star */}
      <path 
        d="M12 9L13 11H15L13.5 12.5L14 14.5L12 13L10 14.5L10.5 12.5L9 11H11L12 9Z" 
        fill="currentColor"
      />
    </svg>
  );
}

export function GeometricBeakerIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Geometric beaker */}
      <path 
        d="M8 3V8L4 18V20H20V18L16 8V3M8 3H16" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      {/* Liquid */}
      <path 
        d="M6 15H18L15 10H9L6 15Z" 
        fill="currentColor" 
        opacity="0.3"
      />
      {/* Bubbles */}
      <circle cx="10" cy="13" r="1" fill="currentColor" />
      <circle cx="14" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function GeometricGearIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Geometric gear */}
      <path 
        d="M12 2L14 6L18 4L18 8L22 10L20 12L22 14L18 16L18 20L14 18L12 22L10 18L6 20L6 16L2 14L4 12L2 10L6 8L6 4L10 6L12 2Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

export function GeometricPlayIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Geometric play button */}
      <path 
        d="M8 5L19 12L8 19V5Z" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.2"
      />
    </svg>
  );
}

export function GeometricPauseIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn('transition-all', className)}
    >
      {/* Geometric pause */}
      <rect x="6" y="4" width="4" height="16" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
      <rect x="14" y="4" width="4" height="16" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}