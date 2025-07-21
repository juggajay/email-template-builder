'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SystematicGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGrid?: boolean;
  animate?: boolean;
}

export function SystematicGrid({
  children,
  columns = 3,
  gap = 'md',
  className,
  showGrid = false,
  animate = false,
}: SystematicGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  };

  return (
    <div
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        {
          'relative': showGrid,
          'animate-grid-fade-in': animate,
        },
        className
      )}
    >
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 grid-pattern opacity-10" />
        </div>
      )}
      
      {React.Children.map(children, (child, index) => (
        <div
          className={cn({
            'animate-grid-item-fade-in': animate,
          })}
          style={{
            animationDelay: animate ? `${index * 100}ms` : undefined,
          }}
        >
          {child}
        </div>
      ))}

      <style jsx>{`
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(0, 212, 170, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 170, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        @keyframes grid-fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes grid-item-fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-grid-fade-in {
          animation: grid-fade-in 0.6s ease-out;
        }

        .animate-grid-item-fade-in {
          opacity: 0;
          animation: grid-item-fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Utility component for grid items with consistent styling
interface GridItemProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GridItem({ children, className, hover = true }: GridItemProps) {
  return (
    <div
      className={cn(
        'relative group',
        {
          'hover:scale-105 transition-transform duration-200': hover,
        },
        className
      )}
    >
      {children}
    </div>
  );
}