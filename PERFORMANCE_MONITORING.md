# Performance Monitoring Setup

## Overview

We've implemented a comprehensive performance monitoring system that tracks both Core Web Vitals and custom application metrics.

## Features Implemented

### 1. Performance Metrics API
- **Endpoint**: `/api/metrics`
- **GET**: Returns all performance metrics including Web Vitals, custom metrics, and resource usage
- **POST**: Records new metrics from client-side

### 2. Web Vitals Collection
- Automatic collection of Core Web Vitals (LCP, CLS, TTFB, INP)
- Client-side reporting via `WebVitalsReporter` component
- Integration with Google Analytics if available

### 3. Custom Performance Monitoring
- `PerformanceMonitor` class for tracking any custom metric
- Support for percentile calculations (P50, P75, P90, P95, P99)
- Memory usage tracking
- Resource loading monitoring

### 4. Performance Dashboard
- Visual dashboard at `/performance`
- Real-time metrics display
- Performance score calculation
- Resource usage visualization

### 5. React Hooks
- `usePerformanceMonitor`: Track component-level performance
- `usePerformanceTracking`: Automatic lifecycle performance tracking

## Usage Examples

### Track Custom Metrics
```typescript
import { perfMonitor } from '@/lib/monitoring/performance';

// Measure sync operation
perfMonitor.measure('template-render', () => {
  // Render logic
});

// Measure async operation
await perfMonitor.measureAsync('api-call', async () => {
  return await fetchData();
});

// Manual timing
perfMonitor.startTiming('complex-operation');
// ... do work
const duration = perfMonitor.endTiming('complex-operation');
```

### React Component Performance
```typescript
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor';

function MyComponent() {
  const { measure, stats } = usePerformanceMonitor('MyComponent');
  
  const handleClick = () => {
    measure(() => {
      // Expensive operation
    });
  };
  
  return (
    <div>
      {stats && <p>Average time: {stats.average}ms</p>}
    </div>
  );
}
```

### View Metrics
- Visit `/performance` to see the performance dashboard
- API endpoint: `GET /api/metrics` for programmatic access

## Bundle Analysis Results

### Current Bundle Size
- **Total JS**: 1.65 MB
- **Total CSS**: 71.41 KB
- **Largest chunk**: vendor bundle (1.46 MB)

### Analysis Tools Available
```bash
# Lighthouse CI
npm run lighthouse

# Bundle analyzer
npm run build:analyze

# Custom performance tests
npm run test:performance

# Bundle size report
node scripts/analyze-bundle.js
```

## Performance Optimizations Applied

1. **Code Splitting**
   - Dynamic imports for editor components
   - Route-based splitting
   - Lazy loading heavy components

2. **React Optimizations**
   - React.memo for expensive components
   - useCallback/useMemo throughout
   - Virtual scrolling for large lists

3. **Resource Management**
   - Object pooling for reusable elements
   - Web Workers for heavy computations
   - LRU cache with stale-while-revalidate

4. **Build Optimizations**
   - Tree shaking enabled
   - CSS optimization with Tailwind
   - Image optimization with Next.js

## Next Steps

1. **Set up monitoring alerts**
   - Configure thresholds for key metrics
   - Set up notifications for performance regressions

2. **Integrate with monitoring services**
   - Send metrics to external monitoring services
   - Set up dashboards in Grafana/Datadog

3. **Performance budgets**
   - Implement CI/CD checks for bundle size
   - Fail builds if performance budgets exceeded

4. **Regular performance audits**
   - Schedule weekly Lighthouse runs
   - Track performance trends over time