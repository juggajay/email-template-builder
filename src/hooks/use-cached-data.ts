import { useState, useEffect, useCallback, useRef } from 'react';
import { cachedFetch, invalidateCache, invalidateCacheByTag, CacheOptions, CACHE_DURATIONS, cacheKeys, cacheTags } from '@/lib/api/cache';
import { createClient } from '@/lib/supabase/client';
import type { EmailTemplate } from '@/types';

// Hook options
interface UseCachedDataOptions<T> extends CacheOptions {
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  refetchInterval?: number;
  refetchOnWindowFocus?: boolean;
}

/**
 * Generic hook for cached data fetching
 */
export function useCachedData<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: UseCachedDataOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefetching, setIsRefetching] = useState(false);
  
  const {
    enabled = true,
    onSuccess,
    onError,
    refetchInterval,
    refetchOnWindowFocus = true,
    ...cacheOptions
  } = options;
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const fetcherRef = useRef(fetcher);
  
  // Update fetcher ref to avoid stale closures
  fetcherRef.current = fetcher;

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!key || !enabled) return;
    
    try {
      if (isRefetch) {
        setIsRefetching(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const result = await cachedFetch(key, fetcherRef.current, cacheOptions);
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  }, [key, enabled, cacheOptions, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [key, enabled]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;
    
    intervalRef.current = setInterval(() => {
      fetchData(true);
    }, refetchInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, enabled, fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) return;
    
    const handleFocus = () => {
      fetchData(true);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, enabled, fetchData]);

  const refetch = useCallback(() => {
    if (key) {
      invalidateCache(key);
      return fetchData();
    }
  }, [key, fetchData]);

  const mutate = useCallback((newData: T | ((prev: T | null) => T)) => {
    setData(prev => {
      const updated = typeof newData === 'function' 
        ? (newData as (prev: T | null) => T)(prev) 
        : newData;
      // Update cache with new data
      if (key && updated) {
        cachedFetch(key, async () => updated, { duration: cacheOptions.duration });
      }
      return updated;
    });
  }, [key, cacheOptions.duration]);

  return {
    data,
    loading,
    error,
    isRefetching,
    refetch,
    mutate,
  };
}

/**
 * Hook for fetching templates with caching
 */
export function useCachedTemplates(category?: string) {
  const supabase = createClient();
  const cacheKey = cacheKeys.templates(category);
  
  const fetcher = useCallback(async () => {
    let query = supabase
      .from('email_templates')
      .select('*')
      .eq('is_public', true)
      .order('usage_count', { ascending: false });
      
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data as EmailTemplate[];
  }, [category, supabase]);
  
  return useCachedData(cacheKey, fetcher, {
    duration: CACHE_DURATIONS.MEDIUM,
    staleWhileRevalidate: CACHE_DURATIONS.HOUR,
    tags: [cacheTags.TEMPLATES],
  });
}

/**
 * Hook for fetching a single template with caching
 */
export function useCachedTemplate(templateId: string | null) {
  const supabase = createClient();
  const cacheKey = templateId ? cacheKeys.template(templateId) : null;
  
  const fetcher = useCallback(async () => {
    if (!templateId) return null;
    
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();
      
    if (error) throw error;
    return data as EmailTemplate;
  }, [templateId, supabase]);
  
  return useCachedData(cacheKey, fetcher, {
    duration: CACHE_DURATIONS.LONG,
    staleWhileRevalidate: CACHE_DURATIONS.DAY,
    tags: [cacheTags.TEMPLATES],
    enabled: !!templateId,
  });
}

/**
 * Hook for fetching user templates with caching
 */
export function useCachedUserTemplates(userId: string | null) {
  const supabase = createClient();
  const cacheKey = userId ? cacheKeys.userTemplates(userId) : null;
  
  const fetcher = useCallback(async () => {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('user_templates')
      .select('*')
      .eq('user_id', userId)
      .order('last_modified', { ascending: false });
      
    if (error) throw error;
    return data;
  }, [userId, supabase]);
  
  return useCachedData(cacheKey, fetcher, {
    duration: CACHE_DURATIONS.SHORT,
    staleWhileRevalidate: CACHE_DURATIONS.MEDIUM,
    tags: [cacheTags.TEMPLATES, cacheTags.USERS],
    enabled: !!userId,
  });
}

/**
 * Hook for cache invalidation
 */
export function useCacheInvalidation() {
  const invalidateTemplates = useCallback(() => {
    return invalidateCacheByTag(cacheTags.TEMPLATES);
  }, []);
  
  const invalidateUsers = useCallback(() => {
    return invalidateCacheByTag(cacheTags.USERS);
  }, []);
  
  const invalidatePattern = useCallback((pattern: string | RegExp) => {
    return invalidateCache(pattern);
  }, []);
  
  const invalidateTemplate = useCallback((templateId: string) => {
    return invalidateCache(cacheKeys.template(templateId));
  }, []);
  
  const invalidateUserTemplates = useCallback((userId: string) => {
    return invalidateCache(cacheKeys.userTemplates(userId));
  }, []);
  
  return {
    invalidateTemplates,
    invalidateUsers,
    invalidatePattern,
    invalidateTemplate,
    invalidateUserTemplates,
  };
}

/**
 * Hook for preloading data into cache
 */
export function useCachePreload() {
  const supabase = createClient();
  
  const preloadTemplates = useCallback(async (templateIds: string[]) => {
    const items = templateIds.map(id => ({
      key: cacheKeys.template(id),
      fetcher: async () => {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data;
      },
      options: {
        duration: CACHE_DURATIONS.LONG,
        tags: [cacheTags.TEMPLATES],
      },
    }));
    
    await globalCache.preload(items);
  }, [supabase]);
  
  const preloadCategories = useCallback(async (categories: string[]) => {
    const items = categories.map(category => ({
      key: cacheKeys.templates(category),
      fetcher: async () => {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('is_public', true)
          .eq('category', category)
          .order('usage_count', { ascending: false });
          
        if (error) throw error;
        return data;
      },
      options: {
        duration: CACHE_DURATIONS.MEDIUM,
        tags: [cacheTags.TEMPLATES],
      },
    }));
    
    await globalCache.preload(items);
  }, [supabase]);
  
  return {
    preloadTemplates,
    preloadCategories,
  };
}

// Re-export for convenience
export { CACHE_DURATIONS, cacheKeys, cacheTags } from '@/lib/api/cache';
import { globalCache } from '@/lib/api/cache';