'use client';

import React from 'react';
import { useCachedTemplates, useCacheInvalidation, useCachePreload, CACHE_DURATIONS } from '@/hooks/use-cached-data';
import { getCacheStats } from '@/lib/api/cache';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, Database, Zap } from 'lucide-react';

/**
 * Example component demonstrating cache usage
 */
export function CachedTemplateList() {
  const [category, setCategory] = React.useState<string>('all');
  const [showStats, setShowStats] = React.useState(false);
  
  // Fetch templates with caching
  const { 
    data: templates, 
    loading, 
    error, 
    isRefetching, 
    refetch 
  } = useCachedTemplates(category);
  
  // Cache invalidation hooks
  const { invalidateTemplates, invalidatePattern } = useCacheInvalidation();
  
  // Preload hooks
  const { preloadCategories } = useCachePreload();
  
  // Get cache statistics
  const stats = showStats ? getCacheStats() : null;
  
  // Preload other categories on hover
  const handleCategoryHover = async (hoveredCategory: string) => {
    if (hoveredCategory !== category) {
      await preloadCategories([hoveredCategory]);
    }
  };
  
  // Force refresh with cache invalidation
  const handleForceRefresh = async () => {
    invalidateTemplates();
    await refetch();
  };
  
  // Clear specific category cache
  const handleClearCategory = () => {
    invalidatePattern(`templates:${category}`);
    refetch();
  };
  
  return (
    <div className="space-y-4">
      {/* Cache Stats */}
      {showStats && stats && (
        <Card className="p-4 bg-gray-50">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Cache Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Hits:</span> {stats.hits}
            </div>
            <div>
              <span className="text-gray-600">Misses:</span> {stats.misses}
            </div>
            <div>
              <span className="text-gray-600">Stale Hits:</span> {stats.staleHits}
            </div>
            <div>
              <span className="text-gray-600">Size:</span> {stats.size}/{stats.maxSize}
            </div>
          </div>
        </Card>
      )}
      
      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        {/* Category selector */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Templates</option>
          <option value="abandoned-cart">Abandoned Cart</option>
          <option value="welcome">Welcome</option>
          <option value="promotional">Promotional</option>
        </select>
        
        {/* Refresh button */}
        <Button
          onClick={handleForceRefresh}
          disabled={loading || isRefetching}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          {isRefetching ? 'Refreshing...' : 'Force Refresh'}
        </Button>
        
        {/* Clear category cache */}
        <Button
          onClick={handleClearCategory}
          variant="outline"
          size="sm"
        >
          Clear Category Cache
        </Button>
        
        {/* Toggle stats */}
        <Button
          onClick={() => setShowStats(!showStats)}
          variant="outline"
          size="sm"
        >
          {showStats ? 'Hide' : 'Show'} Stats
        </Button>
      </div>
      
      {/* Loading state */}
      {loading && !isRefetching && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-gray-600">Loading templates...</p>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-600">Error loading templates: {error.message}</p>
          <Button onClick={refetch} size="sm" className="mt-2">
            Try Again
          </Button>
        </Card>
      )}
      
      {/* Templates list */}
      {templates && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            Loaded {templates.length} templates 
            {isRefetching && ' (updating in background...)'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className="p-4 hover:shadow-lg transition-shadow"
                onMouseEnter={() => {
                  // Preload template details on hover
                  if (template.category) {
                    handleCategoryHover(template.category);
                  }
                }}
              >
                <h4 className="font-semibold">{template.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{template.category}</span>
                  <span className="text-xs text-gray-500">
                    Used {template.usage_count} times
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Example of using cache in a form submission
 */
export function CachedTemplateForm() {
  const { invalidateTemplates, invalidateUserTemplates } = useCacheInvalidation();
  const [saving, setSaving] = React.useState(false);
  
  const handleSave = async (templateData: any) => {
    setSaving(true);
    
    try {
      // Save template to database
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
      const savedTemplate = await response.json();
      
      // Invalidate relevant caches
      invalidateTemplates(); // Clear all template caches
      invalidateUserTemplates(savedTemplate.user_id); // Clear user's templates
      
      // Optionally, prime the cache with the new data
      await cachedFetch(
        cacheKeys.template(savedTemplate.id),
        async () => savedTemplate,
        { duration: CACHE_DURATIONS.LONG }
      );
      
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSave({ /* template data */ });
    }}>
      {/* Form fields */}
      <Button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save Template'}
      </Button>
    </form>
  );
}

// Import for the example
import { cachedFetch, cacheKeys } from '@/lib/api/cache';