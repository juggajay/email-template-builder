import { LRUCache } from 'lru-cache';

// Cache entry interface
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  staleTimestamp?: number;
  tags?: string[];
  error?: Error;
}

// Cache options
export interface CacheOptions {
  duration?: number; // How long until cache expires (ms)
  staleWhileRevalidate?: number; // How long to serve stale data while revalidating (ms)
  tags?: string[]; // Tags for grouped invalidation
  throwOnError?: boolean; // Whether to throw errors or return cached data
}

// Default cache durations
export const CACHE_DURATIONS = {
  SHORT: 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
  HOUR: 60 * 60 * 1000, // 1 hour
  DAY: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Cache statistics
interface CacheStats {
  hits: number;
  misses: number;
  staleHits: number;
  errors: number;
  size: number;
  maxSize: number;
}

/**
 * Enhanced cache manager with LRU eviction and advanced features
 */
export class CacheManager {
  private cache: LRUCache<string, CacheEntry>;
  private tags: Map<string, Set<string>> = new Map();
  private revalidating: Map<string, Promise<any>> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    staleHits: 0,
    errors: 0,
    size: 0,
    maxSize: 0,
  };

  constructor(options?: {
    maxSize?: number; // Maximum number of items
    maxAge?: number; // Default max age in ms
    sizeCalculation?: (value: CacheEntry, key: string) => number;
  }) {
    this.cache = new LRUCache<string, CacheEntry>({
      max: options?.maxSize || 500,
      ttl: options?.maxAge || CACHE_DURATIONS.MEDIUM,
      updateAgeOnGet: false,
      updateAgeOnHas: false,
      sizeCalculation: options?.sizeCalculation || (() => 1),
      dispose: (value, key) => {
        // Clean up tags when entry is removed
        if (value.tags) {
          value.tags.forEach(tag => {
            const tagSet = this.tags.get(tag);
            if (tagSet) {
              tagSet.delete(key);
              if (tagSet.size === 0) {
                this.tags.delete(tag);
              }
            }
          });
        }
      },
    });
  }

  /**
   * Get or fetch data with caching
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const {
      duration = CACHE_DURATIONS.MEDIUM,
      staleWhileRevalidate = 0,
      tags = [],
      throwOnError = true,
    } = options;

    // Check if we have a cached entry
    const cached = this.cache.get(key);
    const now = Date.now();

    // Return fresh cached data
    if (cached && !cached.error && now - cached.timestamp < duration) {
      this.stats.hits++;
      return cached.data as T;
    }

    // Handle stale-while-revalidate
    if (
      cached &&
      !cached.error &&
      staleWhileRevalidate > 0 &&
      now - cached.timestamp < duration + staleWhileRevalidate
    ) {
      this.stats.staleHits++;
      
      // Check if we're already revalidating
      const existingRevalidation = this.revalidating.get(key);
      if (existingRevalidation) {
        return cached.data as T;
      }

      // Start background revalidation
      const revalidationPromise = this.revalidate(key, fetcher, { duration, tags });
      this.revalidating.set(key, revalidationPromise);
      
      // Clean up after revalidation
      revalidationPromise.finally(() => {
        this.revalidating.delete(key);
      });

      // Return stale data immediately
      return cached.data as T;
    }

    // Check if we're already fetching this key
    const existingFetch = this.revalidating.get(key);
    if (existingFetch) {
      return existingFetch;
    }

    // Fetch fresh data
    this.stats.misses++;
    
    try {
      const fetchPromise = fetcher();
      this.revalidating.set(key, fetchPromise);
      
      const data = await fetchPromise;
      
      // Cache the successful result
      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        staleTimestamp: now + duration + staleWhileRevalidate,
        tags,
      };
      
      this.cache.set(key, entry);
      
      // Update tags index
      tags.forEach(tag => {
        if (!this.tags.has(tag)) {
          this.tags.set(tag, new Set());
        }
        this.tags.get(tag)!.add(key);
      });
      
      this.updateStats();
      return data;
    } catch (error) {
      this.stats.errors++;
      
      // If we have cached data and errors shouldn't throw, return it
      if (cached && !throwOnError) {
        return cached.data as T;
      }
      
      // Cache the error for a short time to prevent hammering
      const errorEntry: CacheEntry = {
        data: null,
        timestamp: now,
        error: error as Error,
        tags,
      };
      
      this.cache.set(key, errorEntry, { ttl: CACHE_DURATIONS.SHORT });
      
      throw error;
    } finally {
      this.revalidating.delete(key);
    }
  }

  /**
   * Background revalidation for stale-while-revalidate
   */
  private async revalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { duration: number; tags: string[] }
  ): Promise<T> {
    try {
      const data = await fetcher();
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        tags: options.tags,
      };
      
      this.cache.set(key, entry);
      return data;
    } catch (error) {
      // Don't update cache on revalidation error
      throw error;
    }
  }

  /**
   * Invalidate cache entries by key pattern
   */
  invalidate(pattern: string | RegExp): number {
    let count = 0;
    const regex = typeof pattern === 'string' 
      ? new RegExp(pattern.replace(/\*/g, '.*'))
      : pattern;

    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    this.updateStats();
    return count;
  }

  /**
   * Invalidate all cache entries with a specific tag
   */
  invalidateByTag(tag: string): number {
    const keys = this.tags.get(tag);
    if (!keys) return 0;

    let count = 0;
    for (const key of Array.from(keys)) {
      this.cache.delete(key);
      count++;
    }

    this.tags.delete(tag);
    this.updateStats();
    return count;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.tags.clear();
    this.revalidating.clear();
    this.updateStats();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      ...this.stats,
      size: this.cache.size,
      maxSize: this.cache.max,
    };
  }

  /**
   * Update internal statistics
   */
  private updateStats(): void {
    this.stats.size = this.cache.size;
    this.stats.maxSize = this.cache.max;
  }

  /**
   * Preload multiple keys in parallel
   */
  async preload<T>(
    items: Array<{
      key: string;
      fetcher: () => Promise<T>;
      options?: CacheOptions;
    }>
  ): Promise<void> {
    await Promise.all(
      items.map(({ key, fetcher, options }) =>
        this.get(key, fetcher, options).catch(() => {
          // Ignore errors during preload
        })
      )
    );
  }
}

// Global cache instance
export const globalCache = new CacheManager({
  maxSize: 1000,
  maxAge: CACHE_DURATIONS.MEDIUM,
});

// Convenience functions using global cache
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  return globalCache.get(key, fetcher, options);
}

export function invalidateCache(pattern: string | RegExp): number {
  return globalCache.invalidate(pattern);
}

export function invalidateCacheByTag(tag: string): number {
  return globalCache.invalidateByTag(tag);
}

export function clearCache(): void {
  globalCache.clear();
}

export function getCacheStats(): CacheStats {
  return globalCache.getStats();
}

// Cache key generators for common patterns
export const cacheKeys = {
  template: (id: string) => `template:${id}`,
  templates: (category?: string) => category ? `templates:${category}` : 'templates:all',
  user: (id: string) => `user:${id}`,
  userTemplates: (userId: string) => `user-templates:${userId}`,
  shopifyStore: (domain: string) => `shopify:${domain}`,
  analytics: (templateId: string, period: string) => `analytics:${templateId}:${period}`,
};

// Cache tags for grouped invalidation
export const cacheTags = {
  TEMPLATES: 'templates',
  USERS: 'users',
  ANALYTICS: 'analytics',
  SHOPIFY: 'shopify',
};