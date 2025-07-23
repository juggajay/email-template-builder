/**
 * Performance monitoring and analytics
 */
export class PerformanceMonitor {
  private metrics: Map<string, Metric> = new Map();
  private observers: Set<PerformanceObserverCallback> = new Set();
  private resourceTimings: Map<string, ResourceTiming[]> = new Map();
  private markTimings: Map<string, number> = new Map();
  private config: PerformanceConfig;
  
  constructor(config: PerformanceConfig = {}) {
    this.config = {
      slowThreshold: 100,
      maxMetricsPerName: 1000,
      enableLogging: true,
      enableAnalytics: true,
      sampleRate: 1,
      ...config,
    };
    
    // Set up Performance Observer if available
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.setupPerformanceObserver();
    }
  }
  
  /**
   * Measure synchronous operation
   */
  measure(name: string, fn: () => void): void {
    const start = performance.now();
    
    try {
      fn();
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    }
  }
  
  /**
   * Measure async operation
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      return result;
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    }
  }
  
  /**
   * Start a manual timing measurement
   */
  startTiming(name: string): void {
    this.markTimings.set(name, performance.now());
    
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-start`);
    }
  }
  
  /**
   * End a manual timing measurement
   */
  endTiming(name: string): number {
    const startTime = this.markTimings.get(name);
    if (!startTime) {
      console.warn(`No start timing found for: ${name}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.markTimings.delete(name);
    this.recordMetric(name, duration);
    
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }
    
    return duration;
  }
  
  /**
   * Record a custom metric
   */
  recordMetric(name: string, value: number, unit: MetricUnit = 'ms'): void {
    // Apply sampling
    if (Math.random() > this.config.sampleRate!) {
      return;
    }
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        name,
        unit,
        values: [],
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        lastValue: 0,
        lastUpdated: Date.now(),
      });
    }
    
    const metric = this.metrics.get(name)!;
    
    // Update metric statistics
    metric.values.push(value);
    metric.count++;
    metric.sum += value;
    metric.min = Math.min(metric.min, value);
    metric.max = Math.max(metric.max, value);
    metric.lastValue = value;
    metric.lastUpdated = Date.now();
    
    // Limit stored values
    if (metric.values.length > this.config.maxMetricsPerName!) {
      metric.values.shift();
    }
    
    // Check for slow operations
    if (this.config.enableLogging && value > this.config.slowThreshold!) {
      console.warn(`Slow operation: ${name} took ${value}${unit}`);
    }
    
    // Send to analytics
    if (this.config.enableAnalytics) {
      this.sendToAnalytics(name, value, unit);
    }
    
    // Notify observers
    this.notifyObservers(metric);
  }
  
  /**
   * Get metric statistics
   */
  getMetric(name: string): MetricStats | null {
    const metric = this.metrics.get(name);
    if (!metric) return null;
    
    const average = metric.count > 0 ? metric.sum / metric.count : 0;
    const percentiles = this.calculatePercentiles(metric.values);
    
    return {
      name: metric.name,
      unit: metric.unit,
      count: metric.count,
      sum: metric.sum,
      average,
      min: metric.min,
      max: metric.max,
      lastValue: metric.lastValue,
      lastUpdated: metric.lastUpdated,
      percentiles,
    };
  }
  
  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, MetricStats> {
    const allMetrics = new Map<string, MetricStats>();
    
    this.metrics.forEach((metric, name) => {
      const stats = this.getMetric(name);
      if (stats) {
        allMetrics.set(name, stats);
      }
    });
    
    return allMetrics;
  }
  
  /**
   * Get resource timings
   */
  getResourceTimings(type?: string): PerformanceResourceTiming[] {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return [];
    }
    
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    if (type) {
      return entries.filter(entry => entry.initiatorType === type);
    }
    
    return entries;
  }
  
  /**
   * Clear metrics
   */
  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }
  
  /**
   * Subscribe to metric updates
   */
  subscribe(callback: PerformanceObserverCallback): () => void {
    this.observers.add(callback);
    
    return () => {
      this.observers.delete(callback);
    };
  }
  
  /**
   * Get performance report
   */
  getReport(): PerformanceReport {
    const metrics = this.getAllMetrics();
    const navigation = this.getNavigationTiming();
    const resources = this.getResourceTimings();
    
    return {
      timestamp: Date.now(),
      metrics: Array.from(metrics.values()),
      navigation,
      resources: {
        scripts: resources.filter(r => r.initiatorType === 'script').length,
        stylesheets: resources.filter(r => r.initiatorType === 'link').length,
        images: resources.filter(r => r.initiatorType === 'img').length,
        total: resources.length,
      },
      memory: this.getMemoryInfo(),
    };
  }
  
  /**
   * Setup Performance Observer
   */
  private setupPerformanceObserver(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure') {
            this.recordMetric(entry.name, entry.duration);
          } else if (entry.entryType === 'resource') {
            this.handleResourceTiming(entry as PerformanceResourceTiming);
          }
        }
      });
      
      observer.observe({ entryTypes: ['measure', 'resource'] });
    } catch (error) {
      console.warn('Failed to setup PerformanceObserver:', error);
    }
  }
  
  /**
   * Handle resource timing
   */
  private handleResourceTiming(entry: PerformanceResourceTiming): void {
    const type = entry.initiatorType;
    
    if (!this.resourceTimings.has(type)) {
      this.resourceTimings.set(type, []);
    }
    
    const timings = this.resourceTimings.get(type)!;
    timings.push({
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      timestamp: entry.startTime,
    });
    
    // Limit stored timings
    if (timings.length > 100) {
      timings.shift();
    }
  }
  
  /**
   * Calculate percentiles
   */
  private calculatePercentiles(values: number[]): Percentiles {
    if (values.length === 0) {
      return { p50: 0, p75: 0, p90: 0, p95: 0, p99: 0 };
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    
    const percentile = (p: number) => {
      const index = Math.ceil((p / 100) * sorted.length) - 1;
      return sorted[Math.max(0, index)];
    };
    
    return {
      p50: percentile(50),
      p75: percentile(75),
      p90: percentile(90),
      p95: percentile(95),
      p99: percentile(99),
    };
  }
  
  /**
   * Get navigation timing
   */
  private getNavigationTiming(): NavigationMetrics | null {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return null;
    }
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) return null;
    
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      domComplete: navigation.domComplete - navigation.domInteractive,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
      timeToInteractive: navigation.domInteractive - navigation.fetchStart,
    };
  }
  
  /**
   * Get memory info
   */
  private getMemoryInfo(): MemoryInfo | null {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return null;
    }
    
    const memory = (performance as any).memory;
    
    if (!memory) return null;
    
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }
  
  /**
   * Get first paint timing
   */
  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint?.startTime || 0;
  }
  
  /**
   * Get first contentful paint timing
   */
  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp?.startTime || 0;
  }
  
  /**
   * Send metrics to analytics
   */
  private sendToAnalytics(name: string, value: number, unit: string): void {
    if (typeof window === 'undefined') return;
    
    // Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name,
        value: Math.round(value),
        metric_unit: unit,
        event_category: 'Performance',
      });
    }
    
    // Custom analytics endpoint
    if (this.config.analyticsEndpoint) {
      fetch(this.config.analyticsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          value,
          unit,
          timestamp: Date.now(),
        }),
      }).catch(() => {
        // Silently fail analytics
      });
    }
  }
  
  /**
   * Notify observers of metric updates
   */
  private notifyObservers(metric: Metric): void {
    this.observers.forEach(callback => {
      try {
        callback(this.getMetric(metric.name)!);
      } catch (error) {
        console.error('Observer callback error:', error);
      }
    });
  }
}

// Types
interface PerformanceConfig {
  slowThreshold?: number;
  maxMetricsPerName?: number;
  enableLogging?: boolean;
  enableAnalytics?: boolean;
  sampleRate?: number;
  analyticsEndpoint?: string;
}

interface Metric {
  name: string;
  unit: MetricUnit;
  values: number[];
  count: number;
  sum: number;
  min: number;
  max: number;
  lastValue: number;
  lastUpdated: number;
}

export interface MetricStats extends Omit<Metric, 'values'> {
  average: number;
  percentiles: Percentiles;
}

interface Percentiles {
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
}

interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  timestamp: number;
}

interface NavigationMetrics {
  domContentLoaded: number;
  domComplete: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
  timeToInteractive: number;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceReport {
  timestamp: number;
  metrics: MetricStats[];
  navigation: NavigationMetrics | null;
  resources: {
    scripts: number;
    stylesheets: number;
    images: number;
    total: number;
  };
  memory: MemoryInfo | null;
}

type MetricUnit = 'ms' | 's' | 'bytes' | 'kb' | 'mb' | 'count' | 'percent';
type PerformanceObserverCallback = (metric: MetricStats) => void;


// Create global instance
export const perfMonitor = new PerformanceMonitor();