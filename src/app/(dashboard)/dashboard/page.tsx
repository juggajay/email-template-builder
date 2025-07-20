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
import { ZebCharacter, StripePattern, GrowthMetric } from '@/components/brand';
import { 
  TargetIcon,
  DollarSignIcon,
  TrendingUpIcon as GeometricTrendingUpIcon,
  ChartIcon
} from '@/components/brand/GeometricIcons';

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
      description: 'Ready to drive revenue',
      icon: TargetIcon,
      color: 'text-growth-green',
      valueColor: 'text-growth-green'
    },
    {
      title: 'Campaigns Sent',
      value: dashboardData.stats.totalExports,
      description: 'Campaigns sent this month',
      icon: GeometricTrendingUpIcon,
      color: 'text-growth-green',
      trend: '+23%',
      trendLabel: 'vs last month'
    },
    {
      title: 'Revenue Generated',
      value: '$12,847',
      description: 'From email campaigns',
      icon: DollarSignIcon,
      color: 'text-success-purple'
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      description: 'Above industry average',
      icon: ChartIcon,
      color: 'text-growth-green',
      trend: '↑'
    }
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zebra-black">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Let's grow your revenue today.</p>
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-zebra-black">Dashboard</h1>
              <ZebCharacter variant="welcome" size="sm" className="w-6 h-6" />
            </div>
            <p className="text-gray-700 mt-2 font-medium">
              Welcome back! Let's grow your revenue today.
            </p>
          </div>
          <Link href="/editor">
            <Button className="bg-growth-green hover:bg-growth-green-600 text-white">
              <TargetIcon className="w-4 h-4 mr-2" />
              Build Campaign
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className="relative overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-growth-green/20 hover:-translate-y-0.5 group"
              >
                {/* Stripe pattern overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <StripePattern 
                    animation="static" 
                    opacity={0.03} 
                    color="#00d4aa"
                    className="absolute inset-0"
                  />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-growth-green/10 ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className={`text-2xl font-bold ${stat.valueColor || 'text-zebra-black'}`}>
                    {stat.value}
                    {stat.trend && (
                      <span className="text-sm font-medium text-growth-green ml-2">
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {stat.description}
                  </p>
                  {stat.trendLabel && (
                    <p className="text-xs text-growth-green mt-0.5">
                      {stat.trendLabel}
                    </p>
                  )}
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
                  <ZebCharacter variant="guide" size="lg" className="mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-zebra-black mb-2">
                    Ready to create your first revenue-driving template?
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Start with our proven e-commerce templates
                  </p>
                  <Link href="/templates">
                    <Button className="bg-growth-green hover:bg-growth-green-600 text-white">
                      Browse Growth Templates
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
                {dashboardData.popularTemplates.map((template: any, idx: number) => {
                  // Simulated conversion rates for demo
                  const conversionRates = [4.2, 3.8, 2.1];
                  const conversionRate = conversionRates[idx] || 2.5;
                  const isHighPerformer = conversionRate > 3;
                  const performanceColor = isHighPerformer ? 'text-success-purple' : conversionRate > 1 ? 'text-growth-green' : 'text-gray-600';
                  const performanceBg = isHighPerformer ? 'bg-success-purple/10' : conversionRate > 1 ? 'bg-growth-green/10' : 'bg-gray-100';
                  
                  return (
                    <div 
                      key={template.id} 
                      className="group relative p-3 -mx-3 rounded-lg transition-all duration-200 hover:bg-gray-50"
                    >
                      {/* Hover stripe pattern */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg overflow-hidden">
                        <StripePattern 
                          animation="static" 
                          opacity={0.05} 
                          color={isHighPerformer ? '#6b5fd4' : '#00d4aa'}
                        />
                      </div>
                      
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-zebra-black">{template.name}</h4>
                            {isHighPerformer && (
                              <span className="text-xs px-2 py-0.5 bg-success-purple/10 text-success-purple rounded-full font-medium">
                                Top Performer
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className={`flex items-center gap-1 ${performanceColor}`}>
                              <div className={`w-2 h-2 rounded-full ${performanceBg}`} />
                              {conversionRate}% conversion
                            </span>
                            <span className="text-gray-600">
                              {template.usage_count} merchants
                            </span>
                          </div>
                        </div>
                        <Link href={`/editor?template=${template.id}`}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="group-hover:bg-white group-hover:shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6 relative overflow-hidden">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/editor">
                <Button 
                  variant="outline" 
                  className="w-full justify-start group bg-white hover:bg-growth-green hover:text-white hover:border-growth-green transition-all duration-200"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <StripePattern animation="static" opacity={0.1} />
                  </div>
                  <TargetIcon className="w-4 h-4 mr-2" />
                  <span className="relative z-10">Build Revenue Campaign</span>
                </Button>
              </Link>
              <Link href="/templates">
                <Button 
                  variant="outline" 
                  className="w-full justify-start group bg-white hover:bg-growth-green hover:text-white hover:border-growth-green transition-all duration-200"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <StripePattern animation="static" opacity={0.1} />
                  </div>
                  <ChartIcon className="w-4 h-4 mr-2" />
                  <span className="relative z-10">Explore Growth Templates</span>
                </Button>
              </Link>
              <Link href="/settings">
                <Button 
                  variant="outline" 
                  className="w-full justify-start group bg-white hover:bg-growth-green hover:text-white hover:border-growth-green transition-all duration-200"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <StripePattern animation="static" opacity={0.1} />
                  </div>
                  <GeometricTrendingUpIcon className="w-4 h-4 mr-2" />
                  <span className="relative z-10">Optimize Your Growth</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}