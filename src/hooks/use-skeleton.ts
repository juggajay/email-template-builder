import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage skeleton loading states
 */
export function useSkeleton(initialLoading = true, minimumDuration = 0) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Start loading with minimum duration
  const startLoading = useCallback(() => {
    setIsLoading(true);
    setStartTime(Date.now());
  }, []);

  // Stop loading respecting minimum duration
  const stopLoading = useCallback(async () => {
    if (!startTime || minimumDuration === 0) {
      setIsLoading(false);
      return;
    }

    const elapsed = Date.now() - startTime;
    const remaining = minimumDuration - elapsed;

    if (remaining > 0) {
      // Wait for the remaining time
      await new Promise(resolve => setTimeout(resolve, remaining));
    }

    setIsLoading(false);
    setStartTime(null);
  }, [startTime, minimumDuration]);

  return {
    isLoading,
    startLoading,
    stopLoading,
  };
}

/**
 * Hook for progressive skeleton loading
 * Shows skeleton for initial load, then switches to actual content
 */
export function useProgressiveSkeleton<T>(
  fetchData: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { isLoading, startLoading, stopLoading } = useSkeleton(true, 300);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      startLoading();
      setError(null);

      try {
        const result = await fetchData();
        
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          await stopLoading();
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, deps);

  return { data, error, isLoading };
}

/**
 * Hook for staggered skeleton reveal
 * Useful for lists that should appear one by one
 */
export function useStaggeredSkeleton(itemCount: number, staggerDelay = 100) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (revealedCount >= itemCount) return;

    const timer = setTimeout(() => {
      setRevealedCount(prev => Math.min(prev + 1, itemCount));
    }, staggerDelay);

    return () => clearTimeout(timer);
  }, [revealedCount, itemCount, staggerDelay]);

  const isItemRevealed = useCallback((index: number) => {
    return index < revealedCount;
  }, [revealedCount]);

  const reset = useCallback(() => {
    setRevealedCount(0);
  }, []);

  return {
    revealedCount,
    isItemRevealed,
    reset,
  };
}

/**
 * Hook for skeleton timeout
 * Shows real content after a timeout even if still loading
 */
export function useSkeletonTimeout(loading: boolean, timeout = 5000) {
  const [showSkeleton, setShowSkeleton] = useState(loading);

  useEffect(() => {
    if (!loading) {
      setShowSkeleton(false);
      return;
    }

    setShowSkeleton(true);

    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, timeout);

    return () => clearTimeout(timer);
  }, [loading, timeout]);

  return showSkeleton;
}

/**
 * Hook for smart skeleton display
 * Only shows skeleton if loading takes longer than threshold
 */
export function useSmartSkeleton(loading: boolean, threshold = 200) {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowSkeleton(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, threshold);

    return () => {
      clearTimeout(timer);
    };
  }, [loading, threshold]);

  return showSkeleton;
}