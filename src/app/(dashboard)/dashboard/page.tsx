'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { 
  Mail, 
  FileText, 
  Download, 
  TrendingUp, 
  Clock,
  Star,
  Eye,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { EmailTemplate, UserTemplate } from '@/types';

interface DashboardStats {
  totalTemplates: number;
  totalExports: number;
  exportsThisMonth: number;
  recentTemplates: UserTemplate[];
  popularTemplates: EmailTemplate[];
}

export default function DashboardPage() {
  const { user, profile, subscription, isAuthenticated, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardStats();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardStats = async () => {
    try {
      const supabase = createClient();
      
      // Fetch user templates count
      const { count: templatesCount } = await supabase
        .from('user_templates')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id);

      // Fetch total exports
      const { count: exportsCount } = await supabase
        .from('template_exports')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id);

      // Fetch exports this month
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { count: monthlyExports } = await supabase
        .from('template_exports')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id)
        .gte('created_at', `${currentMonth}-01`);

      // Fetch recent templates
      const { data: recentTemplates } = await supabase
        .from('user_templates')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch popular public templates
      const { data: popularTemplates } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false })
        .limit(6);

      setStats({
        totalTemplates: templatesCount || 0,
        totalExports: exportsCount || 0,
        exportsThisMonth: monthlyExports || 0,
        recentTemplates: recentTemplates || [],
        popularTemplates: popularTemplates || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return <Loading size="lg" text="Loading dashboard..." />;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access the dashboard.</div>;
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'abandoned-cart':
        return '🛒';
      case 'product-launch':
        return '🚀';
      case 'order-confirmation':
        return '✅';
      case 'welcome':
        return '👋';
      case 'promotional':
        return '🎯';
      default:
        return '📧';
    }
  };

  const getCategoryColor = (category: string): 'default' | 'secondary' | 'outline' => {
    switch (category) {
      case 'abandoned-cart':
        return 'default';
      case 'product-launch':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">
            {profile?.company_name ? `${profile.company_name} • ` : ''}
            {subscription?.plan === 'free' ? 'Free Plan' : subscription?.plan === 'pro' ? 'Pro Plan' : 'Agency Plan'}
          </p>
        </div>
        <Link href="/editor">
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            New FileText
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total FileTexts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loading size="sm" /> : stats?.totalTemplates}
            </div>
            <p className="text-xs text-muted-foreground">
              Your custom templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exports</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loading size="sm" /> : stats?.totalExports}
            </div>
            <p className="text-xs text-muted-foreground">
              All time exports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? <Loading size="sm" /> : stats?.exportsThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription?.plan === 'free' ? 'of 5 free exports' : 'exports this month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan Status</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription?.plan === 'free' ? 'Free' : subscription?.plan === 'pro' ? 'Pro' : 'Agency'}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription?.plan === 'free' ? (
                <Link href="/billing" className="text-primary hover:underline">
                  Upgrade for unlimited
                </Link>
              ) : (
                'Unlimited exports'
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent FileTexts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent FileTexts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loading size="sm" text="Loading templates..." />
            ) : stats?.recentTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No templates yet</p>
                <p className="text-sm mt-2">
                  <Link href="/templates" className="text-primary hover:underline">
                    Browse templates
                  </Link>{' '}
                  to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.recentTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{template.name}</p>
                        <p className="text-xs text-gray-500">
                          Modified {new Date(template.last_modified).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular FileTexts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Popular FileTexts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loading size="sm" text="Loading templates..." />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {stats?.popularTemplates.map((template) => (
                  <div key={template.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{getCategoryIcon(template.category)}</span>
                      <Badge variant={getCategoryColor(template.category)} className="text-xs">
                        {template.category.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm truncate">{template.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {template.usage_count} uses
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/editor">
              <Button variant="outline" className="w-full h-20 flex-col">
                <Plus className="w-6 h-6 mb-2" />
                Create New FileText
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="outline" className="w-full h-20 flex-col">
                <FileText className="w-6 h-6 mb-2" />
                Browse FileTexts
              </Button>
            </Link>
            <Link href="/billing">
              <Button variant="outline" className="w-full h-20 flex-col">
                <TrendingUp className="w-6 h-6 mb-2" />
                {subscription?.plan === 'free' ? 'Upgrade Plan' : 'Manage Billing'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}