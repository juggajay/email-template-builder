import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createLoaders, type DataLoaders } from '@/lib/api/dataloader';
import type { EmailTemplate } from '@/types';

/**
 * Hook to use DataLoaders in React components
 * Creates request-scoped loaders that are cleared on unmount
 */
export function useDataLoaders() {
  const loadersRef = useRef<DataLoaders | null>(null);
  
  if (!loadersRef.current) {
    const supabase = createClient();
    loadersRef.current = createLoaders(supabase);
  }
  
  useEffect(() => {
    // Clear all caches on unmount
    return () => {
      if (loadersRef.current) {
        Object.values(loadersRef.current).forEach(loader => {
          loader.clearAll();
        });
      }
    };
  }, []);
  
  return loadersRef.current;
}

/**
 * Hook to batch load templates
 */
export function useBatchTemplates(templateIds: string[]) {
  const [templates, setTemplates] = useState<(EmailTemplate | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const loaders = useDataLoaders();
  
  useEffect(() => {
    if (templateIds.length === 0) {
      setTemplates([]);
      setLoading(false);
      return;
    }
    
    let cancelled = false;
    
    const loadTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Batch load all templates
        const results = await Promise.all(
          templateIds.map(id => loaders.templateLoader.load(id))
        );
        
        if (!cancelled) {
          // Filter out errors
          const validTemplates = results.map(r => 
            r instanceof Error ? null : r
          );
          setTemplates(validTemplates);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    loadTemplates();
    
    return () => {
      cancelled = true;
    };
  }, [templateIds.join(','), loaders]);
  
  return { templates, loading, error, refetch: () => {
    // Clear cache and reload
    templateIds.forEach(id => loaders.templateLoader.clear(id));
    setLoading(true);
  }};
}

/**
 * Hook to load templates by category with caching
 */
export function useTemplatesByCategory(category: string | null) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const loaders = useDataLoaders();
  
  useEffect(() => {
    if (!category) {
      setTemplates([]);
      setLoading(false);
      return;
    }
    
    let cancelled = false;
    
    const loadTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await loaders.templateByCategoryLoader.load(category as any);
        
        if (!cancelled) {
          if (result instanceof Error) {
            throw result;
          }
          setTemplates(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    loadTemplates();
    
    return () => {
      cancelled = true;
    };
  }, [category, loaders]);
  
  return { templates, loading, error };
}

/**
 * Example of using DataLoaders for efficient data fetching
 */
export function useTemplateWithCreator(templateId: string | null) {
  const [data, setData] = useState<{
    template: EmailTemplate | null;
    creator: any | null;
  }>({ template: null, creator: null });
  const [loading, setLoading] = useState(true);
  const loaders = useDataLoaders();
  
  useEffect(() => {
    if (!templateId) {
      setData({ template: null, creator: null });
      setLoading(false);
      return;
    }
    
    let cancelled = false;
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load template
        const template = await loaders.templateLoader.load(templateId);
        
        if (!template || template instanceof Error || !template.created_by) {
          if (!cancelled) {
            setData({ template: template instanceof Error ? null : template, creator: null });
          }
          return;
        }
        
        // Load creator (will be batched if multiple components request users)
        const creator = await loaders.userLoader.load(template.created_by);
        
        if (!cancelled) {
          setData({
            template,
            creator: creator instanceof Error ? null : creator,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      cancelled = true;
    };
  }, [templateId, loaders]);
  
  return { ...data, loading };
}