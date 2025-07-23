import { PerformanceDashboard } from '@/components/monitoring/performance-dashboard';

export default function PerformancePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Performance Monitoring</h1>
      <PerformanceDashboard />
    </div>
  );
}