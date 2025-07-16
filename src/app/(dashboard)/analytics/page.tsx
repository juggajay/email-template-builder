'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { 
  TrendingUp, 
  Download, 
  Mail, 
  Users, 
  Eye, 
  BarChart3,
  Calendar,
  Filter,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AnalyticsData {
  totalExports: number;
  exportsThisMonth: number;
  exportsTrend: number;
  topTemplates: Array<{
    name: string;
    category: string;
    exports: number;
    trend: number;
  }>;
  exportsByMonth: Array<{
    month: string;
    exports: number;
  }>;
  exportsByType: Array<{
    type: string;
    count: number;
  }>;
}

export default function AnalyticsPage() {
  const { user, isPro, isAgency } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Loading size="lg" text="Loading..." />;
  }

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const supabase = createClient();
      const now = new Date();
      const startDate = new Date();
      
      // Calculate start date based on time range
      switch (timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Fetch total exports
      const { count: totalExports } = await supabase
        .from('template_exports')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id);

      // Fetch exports this month
      const currentMonth = now.toISOString().slice(0, 7);
      const { count: exportsThisMonth } = await supabase
        .from('template_exports')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id)
        .gte('created_at', `${currentMonth}-01`);

      // Fetch exports by type
      const { data: exportsByType } = await supabase
        .from('template_exports')
        .select('export_type')
        .eq('user_id', user!.id)
        .gte('created_at', startDate.toISOString());

      // Process export types
      const typeCount: Record<string, number> = {};
      exportsByType?.forEach(exp => {
        typeCount[exp.export_type] = (typeCount[exp.export_type] || 0) + 1;
      });

      const processedExportsByType = Object.entries(typeCount).map(([type, count]) => ({
        type,
        count,
      }));

      // Fetch top templates (simplified - would need joins for real data)
      const topTemplates = [
        { name: 'Abandoned Cart Recovery', category: 'abandoned-cart', exports: 45, trend: 12 },
        { name: 'Product Launch', category: 'product-launch', exports: 32, trend: -3 },
        { name: 'Welcome Email', category: 'welcome', exports: 28, trend: 8 },
        { name: 'Flash Sale', category: 'promotional', exports: 22, trend: 15 },
      ];

      // Generate exports by month (simplified)
      const exportsByMonth = [
        { month: 'Jan', exports: 25 },
        { month: 'Feb', exports: 32 },
        { month: 'Mar', exports: 28 },
        { month: 'Apr', exports: 41 },
        { month: 'May', exports: 38 },
        { month: 'Jun', exports: 45 },
      ];

      setData({
        totalExports: totalExports || 0,
        exportsThisMonth: exportsThisMonth || 0,
        exportsTrend: 15, // Simplified
        topTemplates,
        exportsByMonth,
        exportsByType: processedExportsByType,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isPro && !isAgency) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Analytics Available in Pro
          </h2>
          <p className="text-gray-600 mb-6">
            Upgrade to Pro or Agency plan to access detailed analytics and insights
          </p>
          <Button onClick={() => window.location.href = '/billing'}>
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading size="lg" text="Loading analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">
            Track your email template performance and usage
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center border rounded-lg">
            <Button
              variant={timeRange === '7d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              7D
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              30D
            </Button>
            <Button
              variant={timeRange === '90d' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('90d')}
            >
              90D
            </Button>
            <Button
              variant={timeRange === '1y' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange('1y')}
            >
              1Y
            </Button>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalExports}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
              {data?.exportsTrend}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.exportsThisMonth}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
              12% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Monthly</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((data?.totalExports || 0) / 6)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
              8% growth trend
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Format</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">HTML</div>
            <div className="text-xs text-muted-foreground">
              {data?.exportsByType.find(t => t.type === 'html')?.count || 0} exports
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exports over time */}
        <Card>
          <CardHeader>
            <CardTitle>Exports Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {data?.exportsByMonth.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(item.exports / 50) * 100}%` }}
                  />
                  <span className="text-xs text-gray-600 mt-2">{item.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export types */}
        <Card>
          <CardHeader>
            <CardTitle>Export Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.exportsByType.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="capitalize">{item.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{item.count}</div>
                    <div className="text-xs text-gray-600">
                      {Math.round((item.count / (data?.totalExports || 1)) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top templates */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.topTemplates.map((template, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center font-medium text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {template.category.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium">{template.exports} exports</div>
                  <div className="flex items-center text-xs">
                    {template.trend > 0 ? (
                      <ArrowUp className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1 text-red-500" />
                    )}
                    <span className={template.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(template.trend)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}