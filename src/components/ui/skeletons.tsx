import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from './card';

/**
 * Base Skeleton component
 * Provides the foundation for all skeleton variants
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'default',
  animation = 'pulse',
  width,
  height,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-muted',
        {
          'animate-pulse': animation === 'pulse',
          'animate-shimmer': animation === 'wave',
          'rounded-md': variant === 'default',
          'rounded-full': variant === 'circular',
          'rounded-none': variant === 'rectangular',
        },
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      role="status"
      aria-label="Loading..."
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Text skeleton with multiple lines
 */
export function SkeletonText({
  lines = 3,
  className,
  lastLineWidth = '80%',
  ...props
}: {
  lines?: number;
  lastLineWidth?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          width={i === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
}

/**
 * Avatar skeleton
 */
export function SkeletonAvatar({
  size = 'md',
  className,
  ...props
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
} & React.HTMLAttributes<HTMLDivElement>) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <Skeleton
      variant="circular"
      className={cn(sizes[size], className)}
      {...props}
    />
  );
}

/**
 * Button skeleton
 */
export function SkeletonButton({
  size = 'md',
  className,
  ...props
}: {
  size?: 'sm' | 'md' | 'lg';
} & React.HTMLAttributes<HTMLDivElement>) {
  const sizes = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  };

  return (
    <Skeleton
      className={cn(sizes[size], 'rounded-md', className)}
      {...props}
    />
  );
}

/**
 * Template card skeleton
 */
export function TemplateSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <SkeletonText lines={2} lastLineWidth="60%" className="text-sm" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Dashboard skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton variant="circular" className="h-12 w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>

      {/* Recent Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton variant="circular" className="h-10 w-10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Table skeleton
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
}: {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="w-full">
      {showHeader && (
        <div className="border-b p-4">
          <div className="flex space-x-4">
            {[...Array(columns)].map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      )}
      <div className="divide-y">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="flex space-x-4">
              {[...Array(columns)].map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className="h-4 flex-1"
                  width={colIndex === 0 ? '40%' : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Form skeleton
 */
export function FormSkeleton({
  fields = 4,
}: {
  fields?: number;
}) {
  return (
    <div className="space-y-4">
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" variant="rectangular" />
      </div>
    </div>
  );
}

/**
 * List skeleton
 */
export function ListSkeleton({
  items = 5,
  showAvatar = false,
  showActions = false,
}: {
  items?: number;
  showAvatar?: boolean;
  showActions?: boolean;
}) {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-3">
          {showAvatar && <SkeletonAvatar size="md" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          {showActions && (
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Navigation skeleton
 */
export function NavigationSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-32" />
        <div className="hidden md:flex space-x-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Skeleton className="h-8 w-20" />
        <SkeletonAvatar size="sm" />
      </div>
    </div>
  );
}

/**
 * Card grid skeleton
 */
export function CardGridSkeleton({
  cards = 6,
  columns = 3,
}: {
  cards?: number;
  columns?: number;
}) {
  return (
    <div className={cn(
      'grid gap-4',
      {
        'grid-cols-1': columns === 1,
        'grid-cols-1 md:grid-cols-2': columns === 2,
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': columns === 3,
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': columns === 4,
      }
    )}>
      {[...Array(cards)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton variant="circular" className="h-8 w-8" />
            </div>
            <SkeletonText lines={2} />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-4 w-16" />
              <SkeletonButton size="sm" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Profile skeleton
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <SkeletonAvatar size="xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2 pt-2">
            <SkeletonButton size="sm" />
            <SkeletonButton size="sm" />
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <SkeletonText lines={4} />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Shimmer animation for wave effect
 * Add this to your global CSS:
 * 
 * @keyframes shimmer {
 *   0% {
 *     background-position: -200% 0;
 *   }
 *   100% {
 *     background-position: 200% 0;
 *   }
 * }
 * 
 * .animate-shimmer {
 *   background: linear-gradient(
 *     90deg,
 *     theme('colors.muted'),
 *     theme('colors.muted-foreground/10'),
 *     theme('colors.muted')
 *   );
 *   background-size: 200% 100%;
 *   animation: shimmer 1.5s infinite;
 * }
 */