'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, Clock, Database } from 'lucide-react';

interface Metrics {
  webVitals: Record<string, any>;
  custom: Record<string, any>;
  resources: any;
  memory: any;
  summary: {
    totalMetrics: number;
    performanceScore: number;
  };
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);
  
  if (loading) {
    return <div>Loading performance metrics...</div>;
  }
  
  if (!metrics) {
    return <div>No metrics available</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Performance Score */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Performance Score</h2>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                Score
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-green-600">
                {metrics.summary.performanceScore}%
              </span>
            </div>
          </div>
          <Progress value={metrics.summary.performanceScore} className="h-2" />
        </div>
      </Card>
      
      {/* Web Vitals */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          Core Web Vitals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Largest Contentful Paint"
            metric={metrics.webVitals.lcp}
            unit="ms"
            thresholds={{ good: 2500, needs: 4000 }}
          />
          <MetricCard
            title="First Input Delay"
            metric={metrics.webVitals.fid}
            unit="ms"
            thresholds={{ good: 100, needs: 300 }}
          />
          <MetricCard
            title="Cumulative Layout Shift"
            metric={metrics.webVitals.cls}
            unit=""
            thresholds={{ good: 0.1, needs: 0.25 }}
            decimals={3}
          />
        </div>
      </Card>
      
      {/* Custom Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Zap className="mr-2 h-5 w-5" />
          Application Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Template Load Time"
            metric={metrics.custom.templateLoadTime}
            unit="ms"
            thresholds={{ good: 1000, needs: 2000 }}
          />
          <MetricCard
            title="Editor Init Time"
            metric={metrics.custom.editorInitTime}
            unit="ms"
            thresholds={{ good: 2000, needs: 4000 }}
          />
          <MetricCard
            title="API Response Time"
            metric={metrics.custom.apiResponseTime}
            unit="ms"
            thresholds={{ good: 300, needs: 1000 }}
          />
        </div>
      </Card>
      
      {/* Resource Usage */}
      {metrics.resources && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Resource Usage
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.resources.scripts}</div>
              <div className="text-sm text-gray-600">Scripts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.resources.stylesheets}</div>
              <div className="text-sm text-gray-600">Stylesheets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.resources.images}</div>
              <div className="text-sm text-gray-600">Images</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{metrics.resources.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Memory Usage */}
      {metrics.memory && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Memory Usage
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Used JS Heap</span>
              <span>{formatBytes(metrics.memory.usedJSHeapSize)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total JS Heap</span>
              <span>{formatBytes(metrics.memory.totalJSHeapSize)}</span>
            </div>
            <div className="flex justify-between">
              <span>Heap Limit</span>
              <span>{formatBytes(metrics.memory.jsHeapSizeLimit)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ 
  title, 
  metric, 
  unit, 
  thresholds,
  decimals = 0 
}: {
  title: string;
  metric: any;
  unit: string;
  thresholds: { good: number; needs: number };
  decimals?: number;
}) {
  if (!metric) {
    return (
      <div className="bg-gray-50 p-4 rounded">
        <h4 className="font-medium text-sm text-gray-600">{title}</h4>
        <p className="text-2xl font-bold text-gray-400">--</p>
      </div>
    );
  }
  
  const value = metric.average || 0;
  const rating = value <= thresholds.good ? 'good' : value <= thresholds.needs ? 'needs-improvement' : 'poor';
  
  const colors = {
    good: 'text-green-600 bg-green-50',
    'needs-improvement': 'text-yellow-600 bg-yellow-50',
    poor: 'text-red-600 bg-red-50',
  };
  
  return (
    <div className={`p-4 rounded ${colors[rating]}`}>
      <h4 className="font-medium text-sm opacity-80">{title}</h4>
      <p className="text-2xl font-bold">
        {value.toFixed(decimals)}{unit && <span className="text-lg">{unit}</span>}
      </p>
      {metric.p75 && (
        <p className="text-xs opacity-60 mt-1">
          P75: {metric.p75.toFixed(decimals)}{unit}
        </p>
      )}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}