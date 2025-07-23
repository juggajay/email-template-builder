'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { perfMonitor } from '@/lib/monitoring/performance';
import type { MetricStats } from '@/lib/monitoring/performance';

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor(name: string) {
  const monitor = useRef(perfMonitor);
  
  const measure = useCallback((operation: () => void) => {
    monitor.current.measure(name, operation);
  }, [name]);
  
  const measureAsync = useCallback(async <T,>(operation: () => Promise<T>) => {
    return monitor.current.measureAsync(name, operation);
  }, [name]);
  
  const startTiming = useCallback(() => {
    monitor.current.startTiming(name);
  }, [name]);
  
  const endTiming = useCallback(() => {
    return monitor.current.endTiming(name);
  }, [name]);
  
  const [stats, setStats] = useState<MetricStats | null>(null);
  
  useEffect(() => {
    const unsubscribe = monitor.current.subscribe((metric) => {
      if (metric.name === name) {
        setStats(metric);
      }
    });
    
    // Get initial stats
    setStats(monitor.current.getMetric(name));
    
    return unsubscribe;
  }, [name]);
  
  return {
    measure,
    measureAsync,
    startTiming,
    endTiming,
    stats,
  };
}