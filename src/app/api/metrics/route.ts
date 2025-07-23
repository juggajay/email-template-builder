import { NextRequest, NextResponse } from 'next/server';
import { perfMonitor } from '@/lib/monitoring/performance';

/**
 * Performance metrics collection
 */
const metricsStore = {
  webVitals: new Map<string, number[]>(),
  
  addWebVital(metric: string, value: number) {
    if (!this.webVitals.has(metric)) {
      this.webVitals.set(metric, []);
    }
    const values = this.webVitals.get(metric)!;
    values.push(value);
    
    // Keep only last 100 values
    if (values.length > 100) {
      values.shift();
    }
  },
  
  getWebVital(metric: string): { average: number; p75: number; p95: number } | null {
    const values = this.webVitals.get(metric);
    if (!values || values.length === 0) return null;
    
    const sorted = [...values].sort((a, b) => a - b);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    
    const p75Index = Math.ceil(0.75 * sorted.length) - 1;
    const p95Index = Math.ceil(0.95 * sorted.length) - 1;
    
    return {
      average,
      p75: sorted[p75Index] || 0,
      p95: sorted[p95Index] || 0,
    };
  }
};

/**
 * GET /api/metrics
 * Returns performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Get all performance metrics
    const allMetrics = perfMonitor.getAllMetrics();
    const report = perfMonitor.getReport();
    
    // Core Web Vitals
    const webVitals = {
      ttfb: metricsStore.getWebVital('time-to-first-byte'),
      fcp: metricsStore.getWebVital('first-contentful-paint'),
      lcp: metricsStore.getWebVital('largest-contentful-paint'),
      fid: metricsStore.getWebVital('first-input-delay'),
      cls: metricsStore.getWebVital('cumulative-layout-shift'),
      inp: metricsStore.getWebVital('interaction-to-next-paint'),
    };
    
    // Custom application metrics
    const customMetrics = {
      templateLoadTime: perfMonitor.getMetric('template-load'),
      templateRenderTime: perfMonitor.getMetric('template-render'),
      editorInitTime: perfMonitor.getMetric('editor-init'),
      apiResponseTime: perfMonitor.getMetric('api-response'),
      searchTime: perfMonitor.getMetric('search-templates'),
      cacheHitRate: perfMonitor.getMetric('cache-hit-rate'),
    };
    
    // Resource loading metrics
    const resourceMetrics = report.resources;
    
    // Memory usage (if available)
    const memoryMetrics = report.memory;
    
    // Build response
    const metrics = {
      timestamp: new Date().toISOString(),
      webVitals,
      custom: customMetrics,
      resources: resourceMetrics,
      memory: memoryMetrics,
      navigation: report.navigation,
      summary: {
        totalMetrics: allMetrics.size,
        performanceScore: calculatePerformanceScore(webVitals, customMetrics),
      },
    };
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/metrics
 * Records web vitals from client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metric, value } = body;
    
    if (!metric || typeof value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      );
    }
    
    // Store web vital
    metricsStore.addWebVital(metric, value);
    
    // Also record in performance monitor for detailed tracking
    perfMonitor.recordMetric(metric, value, 'ms');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording metric:', error);
    return NextResponse.json(
      { error: 'Failed to record metric' },
      { status: 500 }
    );
  }
}

/**
 * Calculate overall performance score
 */
function calculatePerformanceScore(
  webVitals: any,
  customMetrics: any
): number {
  let score = 100;
  
  // Web Vitals scoring (based on Google's thresholds)
  if (webVitals.lcp?.average) {
    if (webVitals.lcp.average > 4000) score -= 20;
    else if (webVitals.lcp.average > 2500) score -= 10;
  }
  
  if (webVitals.fid?.average) {
    if (webVitals.fid.average > 300) score -= 20;
    else if (webVitals.fid.average > 100) score -= 10;
  }
  
  if (webVitals.cls?.average) {
    if (webVitals.cls.average > 0.25) score -= 20;
    else if (webVitals.cls.average > 0.1) score -= 10;
  }
  
  // Custom metrics scoring
  if (customMetrics.templateLoadTime?.average) {
    if (customMetrics.templateLoadTime.average > 3000) score -= 10;
    else if (customMetrics.templateLoadTime.average > 1500) score -= 5;
  }
  
  if (customMetrics.apiResponseTime?.average) {
    if (customMetrics.apiResponseTime.average > 1000) score -= 10;
    else if (customMetrics.apiResponseTime.average > 500) score -= 5;
  }
  
  return Math.max(0, score);
}