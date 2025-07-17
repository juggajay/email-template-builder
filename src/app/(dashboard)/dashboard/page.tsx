'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Users, 
  Download, 
  Star, 
  TrendingUp,
  Clock,
  Plus,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// Dashboard skeleton component
function DashboardSkeleton() {
  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Templates */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Templates */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { user, isPro, isAgency } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    stats: {
      totalTemplates: number;
      totalExports: number;
      savedThisMonth: number;
      averageRating: number;
    };
    recentTemplates: any[];
    popularTemplates: any[];
  }>({
    stats: {
      totalTemplates: 0,
      totalExports: 0,
      savedThisMonth: 0,
      averageRating: 0
    },
    recentTemplates: [],
    popularTemplates: []
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      // Show default data for non-authenticated users
      setDashboardData({
        stats: {
          totalTemplates: 5,
          totalExports: 0,
          savedThisMonth: 0,
          averageRating: 4.8
        },
        recentTemplates: [],
        popularTemplates: [
          { id: '1', name: 'Welcome Series', usage_count: 1250, rating: 4.9 },
          { id: '2', name: 'Abandoned Cart', usage_count: 980, rating: 4.8 },
          { id: '3', name: 'Order Confirmation', usage_count: 750, rating: 4.7 }
        ]
      });
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient();
      
      // Fetch all data in parallel for better performance
      const [templatesRes, exportsRes, recentRes, popularRes] = await Promise.all([
        // User's total templates
        supabase
          .from('user_templates')
          .select('id', { count: 'exact' })
          .eq('user_id', user!.id),
        
        // User's total exports
        supabase
          .from('template_exports')
          .select('id', { count: 'exact' })
          .eq('user_id', user!.id),
        
        // Recent templates
        supabase
          .from('user_templates')
          .select('id, name, created_at, last_modified')
          .eq('user_id', user!.id)
          .order('last_modified', { ascending: false })
          .limit(5),
        
        // Popular templates
        supabase
          .from('email_templates')
          .select('id, name, usage_count, rating')
          .eq('is_public', true)
          .order('usage_count', { ascending: false })
          .limit(5)
      ]);

      // Calculate saved this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const savedRes = await supabase
        .from('user_templates')
        .select('id', { count: 'exact' })
        .eq('user_id', user!.id)
        .gte('created_at', startOfMonth.toISOString());

      setDashboardData({
        stats: {
          totalTemplates: templatesRes.count || 0,
          totalExports: exportsRes.count || 0,
          savedThisMonth: savedRes.count || 0,
          averageRating: 4.7 // This would come from analytics
        },
        recentTemplates: recentRes.data || [],
        popularTemplates: popularRes.data || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use fallback data on error
      setDashboardData({
        stats: {
          totalTemplates: 0,
          totalExports: 0,
          savedThisMonth: 0,
          averageRating: 0
        },
        recentTemplates: [],
        popularTemplates: []
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Templates',
      value: dashboardData.stats.totalTemplates,
      description: 'Templates in your library',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Total Exports',
      value: dashboardData.stats.totalExports,
      description: 'HTML exports this month',
      icon: Download,
      color: 'text-green-600'
    },
    {
      title: 'Saved This Month',
      value: dashboardData.stats.savedThisMonth,
      description: 'New templates created',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Average Rating',
      value: dashboardData.stats.averageRating.toFixed(1),
      description: 'Community rating',
      icon: Star,
      color: 'text-yellow-600'
    }
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's your template activity.</p>
          </div>
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back! Here's your template activity.
            </p>
          </div>
          <Link href="/editor">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Templates */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Templates</CardTitle>
              <Link href="/templates?view=user">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {dashboardData.recentTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No templates yet</p>
                  <Link href="/templates">
                    <Button variant="outline" size="sm" className="mt-4">
                      Browse Templates
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentTemplates.map((template: any) => (
                    <div key={template.id} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(template.last_modified || template.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/editor?template=${template.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Popular Templates */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Popular Templates</CardTitle>
              <Link href="/templates">
                <Button variant="ghost" size="sm">Browse All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.popularTemplates.map((template: any) => (
                  <div key={template.id} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          <Download className="w-3 h-3 inline mr-1" />
                          {template.usage_count} uses
                        </span>
                        {template.rating > 0 && (
                          <span>
                            <Star className="w-3 h-3 inline mr-1 fill-yellow-400 text-yellow-400" />
                            {template.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link href={`/editor?template=${template.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/editor">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Template
                </Button>
              </Link>
              <Link href="/templates">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Browse Templates
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}