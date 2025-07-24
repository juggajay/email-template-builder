'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Database, Trash2, BarChart3, CheckCircle2, XCircle, CheckSquare, Square } from 'lucide-react';
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
  const [selectedTemplates, setSelectedTemplates] = useState<Set<number>>(new Set());
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
    if (selectedTemplates.size === 0) {
      setResult({
        type: 'error',
        message: 'Please select at least one template to seed'
      });
      return;
    }
    
    setLoading(true);
    setResult({ type: null, message: '' });
    
    try {
      const response = await fetch('/api/seed-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'seed',
          templateIndices: Array.from(selectedTemplates)
        })
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
  
  const toggleTemplate = (index: number) => {
    const newSelected = new Set(selectedTemplates);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTemplates(newSelected);
  };
  
  const selectAll = () => {
    setSelectedTemplates(new Set(seedTemplates.map((_, index) => index)));
  };
  
  const deselectAll = () => {
    setSelectedTemplates(new Set());
  };
  
  const toggleCategory = (category: string) => {
    const categoryIndices = seedTemplates
      .map((template, index) => ({ template, index }))
      .filter(({ template }) => template.category === category)
      .map(({ index }) => index);
    
    const allSelected = categoryIndices.every(index => selectedTemplates.has(index));
    const newSelected = new Set(selectedTemplates);
    
    if (allSelected) {
      categoryIndices.forEach(index => newSelected.delete(index));
    } else {
      categoryIndices.forEach(index => newSelected.add(index));
    }
    
    setSelectedTemplates(newSelected);
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
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Available Templates
                </CardTitle>
                <CardDescription>
                  Select templates to seed ({selectedTemplates.size} of {seedTemplates.length} selected)
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  disabled={selectedTemplates.size === seedTemplates.length}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAll}
                  disabled={selectedTemplates.size === 0}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Deselect All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Templates by Category */}
              {Object.entries(
                seedTemplates.reduce((acc, template, index) => {
                  if (!acc[template.category]) {
                    acc[template.category] = [];
                  }
                  acc[template.category].push({ template, index });
                  return acc;
                }, {} as Record<string, Array<{ template: typeof seedTemplates[0], index: number }>>)
              ).map(([category, items]) => {
                const categorySelected = items.filter(({ index }) => selectedTemplates.has(index)).length;
                const allCategorySelected = categorySelected === items.length;
                
                return (
                  <div key={category} className="space-y-2">
                    <div 
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      onClick={() => toggleCategory(category)}
                    >
                      <Checkbox 
                        checked={allCategorySelected}
                        className="mr-2"
                      />
                      <span className="font-medium capitalize">{category.replace('-', ' ')}</span>
                      <Badge variant="secondary">{categorySelected}/{items.length}</Badge>
                    </div>
                    <div className="ml-8 space-y-2">
                      {items.map(({ template, index }) => (
                        <div 
                          key={index}
                          className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleTemplate(index)}
                        >
                          <Checkbox 
                            checked={selectedTemplates.has(index)}
                            className="mt-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{template.name}</span>
                              {template.is_premium && (
                                <Badge variant="secondary">Premium</Badge>
                              )}
                              <Badge variant="outline">
                                ⭐ {template.rating}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {template.tags.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {template.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{template.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <Button
                  onClick={handleSeed}
                  disabled={loading || selectedTemplates.size === 0}
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
                      Seed {selectedTemplates.size} Template{selectedTemplates.size !== 1 ? 's' : ''}
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