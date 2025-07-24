'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Trash2, BarChart3, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { seedTemplates } from '@/lib/email-templates';

interface TemplateStats {
  totalTemplates: number;
  categoryCounts: Record<string, number>;
  premiumCount: number;
}

export default function SeedTemplatesPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<TemplateStats | null>(null);
  const [result, setResult] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    details?: string[];
  }>({ type: null, message: '' });
  
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (profile?.role === 'admin') {
        fetchStats();
      }
    }
  }, [user, profile, authLoading, router]);
  
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/seed-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stats' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };
  
  const handleSeed = async () => {
    setLoading(true);
    setResult({ type: null, message: '' });
    
    try {
      const response = await fetch('/api/seed-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setResult({
          type: 'success',
          message: `Successfully created ${data.templatesCreated} templates!`,
          details: data.errors.length > 0 ? data.errors : undefined
        });
        fetchStats(); // Refresh stats
      } else {
        setResult({
          type: 'error',
          message: 'Failed to seed templates',
          details: data.errors || [data.error]
        });
      }
    } catch (error: any) {
      setResult({
        type: 'error',
        message: 'An unexpected error occurred',
        details: [error.message]
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to delete ALL templates? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setResult({ type: null, message: '' });
    
    try {
      const response = await fetch('/api/seed-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setResult({
          type: 'success',
          message: 'All templates have been cleared successfully!'
        });
        fetchStats(); // Refresh stats
      } else {
        setResult({
          type: 'error',
          message: 'Failed to clear templates',
          details: [data.error]
        });
      }
    } catch (error: any) {
      setResult({
        type: 'error',
        message: 'An unexpected error occurred',
        details: [error.message]
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  // Check admin access
  if (profile?.role !== 'admin') {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              This page is restricted to administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you believe you should have access to this page, please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Template Seeder</h1>
          <p className="text-muted-foreground mt-2">
            Manage email templates in your database
          </p>
        </div>
        
        {/* Current Stats */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Current Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Templates</p>
                  <p className="text-2xl font-bold">{stats.totalTemplates}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Premium Templates</p>
                  <p className="text-2xl font-bold">{stats.premiumCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(stats.categoryCounts).map(([category, count]) => (
                      <Badge key={category} variant="secondary">
                        {category}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Available Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Available Templates
            </CardTitle>
            <CardDescription>
              {seedTemplates.length} templates ready to be seeded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(
                  seedTemplates.reduce((acc, template) => {
                    acc[template.category] = (acc[template.category] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([category, count]) => (
                  <div key={category} className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="capitalize">{category.replace('-', ' ')}</span>
                    <Badge>{count} templates</Badge>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4">
                <Button
                  onClick={handleSeed}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Seeding...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Seed Templates
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleClear}
                  disabled={loading || !stats || stats.totalTemplates === 0}
                  variant="destructive"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Result Alert */}
        {result.type && (
          <Alert variant={result.type === 'error' ? 'destructive' : 'default'}>
            {result.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>{result.message}</AlertTitle>
            {result.details && result.details.length > 0 && (
              <AlertDescription>
                <ul className="list-disc list-inside mt-2">
                  {result.details.map((detail, index) => (
                    <li key={index} className="text-sm">{detail}</li>
                  ))}
                </ul>
              </AlertDescription>
            )}
          </Alert>
        )}
      </div>
    </div>
  );
}