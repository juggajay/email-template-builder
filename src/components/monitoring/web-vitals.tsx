'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

/**
 * Component to collect and report Web Vitals
 */
export function WebVitalsReporter() {
  useEffect(() => {
    // Function to send metrics to our API
    const reportWebVital = async (metric: any) => {
      try {
        // Don't report in development to avoid noise
        if (process.env.NODE_ENV === 'development') {
          console.log('Web Vital:', metric);
          return;
        }
        
        await fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metric: metric.name,
            value: metric.value,
            rating: metric.rating,
            id: metric.id,
          }),
        });
      } catch (error) {
        console.error('Failed to report web vital:', error);
      }
    };
    
    // Report to both our API and Google Analytics
    const reportToAll = (metric: any) => {
      // Report to our API
      reportWebVital(metric);
      
      // Report to Google Analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
          metric_rating: metric.rating,
          event_category: 'Web Vitals',
          non_interaction: true,
        });
      }
    };
    
    // Collect all Web Vitals
    onCLS(reportToAll);
    onFCP(reportToAll);
    onLCP(reportToAll);
    onTTFB(reportToAll);
    onINP(reportToAll);
  }, []);
  
  return null;
}

/**
 * Hook to track custom performance metrics
 */
export function usePerformanceTracking(metricName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      
      // Report custom metric
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            metric: metricName,
            value: duration,
          }),
        }).catch(() => {
          // Silently fail
        });
      }
    };
  }, [metricName]);
}