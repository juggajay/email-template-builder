import DataLoader from 'dataloader';
import { createClient } from '@/lib/supabase/client';
import type { EmailTemplate, TemplateCategory } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Extended types for database entities
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface UserTemplate {
  id: string;
  user_id: string;
  template_id?: string;
  name: string;
  description?: string;
  json_design?: any;
  html_content?: string;
  created_at: string;
  last_modified: string;
}

// Loader options
const defaultOptions: DataLoader.Options<string, any> = {
  cache: true,
  maxBatchSize: 100,
  batchScheduleFn: (callback) => setTimeout(callback, 10), // 10ms delay for batching
};

/**
 * Creates a DataLoader for email templates
 */
function createTemplateLoader(supabase: SupabaseClient) {
  return new DataLoader<string, EmailTemplate | null>(
    async (ids: readonly string[]) => {
      try {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .in('id', [...ids]);
          
        if (error) {
          console.error('Error loading templates:', error);
          throw error;
        }
        
        const templateMap = new Map<string, EmailTemplate>(
          (data || []).map(t => [t.id, t])
        );
        
        return ids.map(id => templateMap.get(id) || null);
      } catch (error) {
        // Return error for all requested IDs
        return ids.map(() => error as Error);
      }
    },
    defaultOptions
  );
}

/**
 * Creates a DataLoader for user profiles
 */
function createUserLoader(supabase: SupabaseClient) {
  return new DataLoader<string, UserProfile | null>(
    async (ids: readonly string[]) => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .in('id', [...ids]);
          
        if (error) {
          console.error('Error loading users:', error);
          throw error;
        }
        
        const userMap = new Map<string, UserProfile>(
          (data || []).map(u => [u.id, u])
        );
        
        return ids.map(id => userMap.get(id) || null);
      } catch (error) {
        return ids.map(() => error as Error);
      }
    },
    defaultOptions
  );
}

/**
 * Creates a DataLoader for user templates
 */
function createUserTemplateLoader(supabase: SupabaseClient) {
  return new DataLoader<string, UserTemplate | null>(
    async (ids: readonly string[]) => {
      try {
        const { data, error } = await supabase
          .from('user_templates')
          .select('*')
          .in('id', [...ids]);
          
        if (error) {
          console.error('Error loading user templates:', error);
          throw error;
        }
        
        const templateMap = new Map<string, UserTemplate>(
          (data || []).map(t => [t.id, t])
        );
        
        return ids.map(id => templateMap.get(id) || null);
      } catch (error) {
        return ids.map(() => error as Error);
      }
    },
    defaultOptions
  );
}

/**
 * Creates a DataLoader for templates by category
 * Note: This uses a composite key approach
 */
function createTemplateByCategoryLoader(supabase: SupabaseClient) {
  return new DataLoader<TemplateCategory, EmailTemplate[]>(
    async (categories: readonly TemplateCategory[]) => {
      try {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .in('category', [...categories])
          .eq('is_public', true);
          
        if (error) {
          console.error('Error loading templates by category:', error);
          throw error;
        }
        
        // Group templates by category
        const categoryMap = new Map<TemplateCategory, EmailTemplate[]>();
        
        (data || []).forEach(template => {
          const category = template.category as TemplateCategory;
          if (!categoryMap.has(category)) {
            categoryMap.set(category, []);
          }
          categoryMap.get(category)!.push(template);
        });
        
        return categories.map(cat => categoryMap.get(cat) || []);
      } catch (error) {
        return categories.map(() => error as Error);
      }
    },
    { 
      cache: false,
      batch: defaultOptions.batch,
      maxBatchSize: defaultOptions.maxBatchSize,
      batchScheduleFn: defaultOptions.batchScheduleFn,
      name: defaultOptions.name
    } // Disable cache for list queries
  );
}

// Loader context interface
export interface DataLoaders {
  templateLoader: DataLoader<string, EmailTemplate | null>;
  userLoader: DataLoader<string, UserProfile | null>;
  userTemplateLoader: DataLoader<string, UserTemplate | null>;
  templateByCategoryLoader: DataLoader<TemplateCategory, EmailTemplate[]>;
}

/**
 * Creates a new set of DataLoaders for a request
 * This should be called once per request to ensure fresh data
 */
export function createLoaders(supabase?: SupabaseClient): DataLoaders {
  const client = supabase || createClient();
  
  return {
    templateLoader: createTemplateLoader(client),
    userLoader: createUserLoader(client),
    userTemplateLoader: createUserTemplateLoader(client),
    templateByCategoryLoader: createTemplateByCategoryLoader(client),
  };
}

/**
 * Clears all caches for the given loaders
 * Useful when data has been mutated
 */
export function clearLoaderCaches(loaders: DataLoaders) {
  Object.values(loaders).forEach(loader => {
    loader.clearAll();
  });
}

/**
 * Prime loaders with known data
 * Useful after creating or updating entities
 */
export function primeLoaders(loaders: DataLoaders, data: {
  templates?: EmailTemplate[];
  users?: UserProfile[];
  userTemplates?: UserTemplate[];
}) {
  if (data.templates) {
    data.templates.forEach(template => {
      loaders.templateLoader.prime(template.id, template);
    });
  }
  
  if (data.users) {
    data.users.forEach(user => {
      loaders.userLoader.prime(user.id, user);
    });
  }
  
  if (data.userTemplates) {
    data.userTemplates.forEach(template => {
      loaders.userTemplateLoader.prime(template.id, template);
    });
  }
}