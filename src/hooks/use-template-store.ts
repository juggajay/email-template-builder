import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { EmailTemplate, TemplateCategory } from '@/types';
import { createClient } from '@/lib/supabase/client';

// Enhanced template type with metadata
interface StoreTemplate extends EmailTemplate {
  localChanges?: boolean;
  lastSynced?: Date;
}

// Filter state
interface FilterState {
  category: TemplateCategory | 'all';
  sortBy: 'newest' | 'oldest' | 'popular' | 'revenue' | 'conversion';
  searchQuery: string;
  showUserTemplates: boolean;
}

// Store state interface
interface TemplateStore {
  // State
  templates: Map<string, StoreTemplate>;
  selectedId: string | null;
  filters: FilterState;
  loading: boolean;
  error: string | null;
  lastFetch: number;
  
  // Actions
  setTemplate: (id: string, template: StoreTemplate) => void;
  setTemplates: (templates: StoreTemplate[]) => void;
  updateTemplateField: (id: string, field: string, value: any) => void;
  deleteTemplate: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  updateFilters: (filters: Partial<FilterState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Async actions
  fetchTemplates: (force?: boolean) => Promise<void>;
  saveTemplate: (id: string) => Promise<void>;
  createTemplate: (template: Partial<EmailTemplate>) => Promise<string>;
  
  // Computed values (getters)
  getFilteredTemplates: () => StoreTemplate[];
  getSelectedTemplate: () => StoreTemplate | null;
  hasUnsavedChanges: () => boolean;
}

// Create the store
const useTemplateStore = create<TemplateStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial state
          templates: new Map(),
          selectedId: null,
          filters: {
            category: 'all',
            sortBy: 'newest',
            searchQuery: '',
            showUserTemplates: false,
          },
          loading: false,
          error: null,
          lastFetch: 0,
          
          // Actions
          setTemplate: (id, template) =>
            set((state) => {
              state.templates.set(id, template);
            }),
            
          setTemplates: (templates) =>
            set((state) => {
              state.templates.clear();
              templates.forEach(t => {
                state.templates.set(t.id, t);
              });
              state.lastFetch = Date.now();
            }),
            
          updateTemplateField: (id, field, value) =>
            set((state) => {
              const template = state.templates.get(id);
              if (template) {
                (template as any)[field] = value;
                template.localChanges = true;
              }
            }),
            
          deleteTemplate: (id) =>
            set((state) => {
              state.templates.delete(id);
              if (state.selectedId === id) {
                state.selectedId = null;
              }
            }),
            
          setSelectedId: (id) =>
            set((state) => {
              state.selectedId = id;
            }),
            
          updateFilters: (filters) =>
            set((state) => {
              Object.assign(state.filters, filters);
            }),
            
          setLoading: (loading) =>
            set((state) => {
              state.loading = loading;
            }),
            
          setError: (error) =>
            set((state) => {
              state.error = error;
            }),
            
          // Async actions
          fetchTemplates: async (force = false) => {
            const state = get();
            const now = Date.now();
            
            // Skip if recently fetched (5 minutes cache)
            if (!force && now - state.lastFetch < 5 * 60 * 1000) {
              return;
            }
            
            set((state) => {
              state.loading = true;
              state.error = null;
            });
            
            try {
              const supabase = createClient();
              let query = supabase.from('email_templates').select('*');
              
              // Apply filters
              if (state.filters.showUserTemplates) {
                // Fetch user templates instead
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  query = supabase.from('user_templates').select('*').eq('user_id', user.id);
                }
              } else {
                query = query.eq('is_public', true);
                
                if (state.filters.category !== 'all') {
                  query = query.eq('category', state.filters.category);
                }
              }
              
              // Apply search
              if (state.filters.searchQuery) {
                query = query.or(`name.ilike.%${state.filters.searchQuery}%,description.ilike.%${state.filters.searchQuery}%`);
              }
              
              // Apply sorting
              const sortMap = {
                newest: { column: 'created_at', ascending: false },
                oldest: { column: 'created_at', ascending: true },
                popular: { column: 'usage_count', ascending: false },
                revenue: { column: 'performance->monthlyRevenue', ascending: false },
                conversion: { column: 'performance->conversionRate', ascending: false },
              };
              
              const sort = sortMap[state.filters.sortBy];
              query = query.order(sort.column, { ascending: sort.ascending });
              
              const { data, error } = await query;
              
              if (error) throw error;
              
              set((state) => {
                state.templates.clear();
                (data || []).forEach((template: EmailTemplate) => {
                  state.templates.set(template.id, {
                    ...template,
                    lastSynced: new Date(),
                  });
                });
                state.lastFetch = now;
                state.loading = false;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to fetch templates';
                state.loading = false;
              });
            }
          },
          
          saveTemplate: async (id) => {
            const template = get().templates.get(id);
            if (!template || !template.localChanges) return;
            
            set((state) => {
              state.loading = true;
              state.error = null;
            });
            
            try {
              const supabase = createClient();
              const { data, error } = await supabase
                .from('email_templates')
                .update({
                  name: template.name,
                  description: template.description,
                  json_design: template.json_design,
                  html_content: template.html_content,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();
                
              if (error) throw error;
              
              set((state) => {
                state.templates.set(id, {
                  ...data,
                  localChanges: false,
                  lastSynced: new Date(),
                });
                state.loading = false;
              });
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to save template';
                state.loading = false;
              });
            }
          },
          
          createTemplate: async (template) => {
            set((state) => {
              state.loading = true;
              state.error = null;
            });
            
            try {
              const supabase = createClient();
              const { data: { user } } = await supabase.auth.getUser();
              
              if (!user) throw new Error('User not authenticated');
              
              const { data, error } = await supabase
                .from('user_templates')
                .insert({
                  ...template,
                  user_id: user.id,
                  created_at: new Date().toISOString(),
                  last_modified: new Date().toISOString(),
                })
                .select()
                .single();
                
              if (error) throw error;
              
              set((state) => {
                state.templates.set(data.id, {
                  ...data,
                  lastSynced: new Date(),
                });
                state.selectedId = data.id;
                state.loading = false;
              });
              
              return data.id;
            } catch (error) {
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to create template';
                state.loading = false;
              });
              throw error;
            }
          },
          
          // Computed values
          getFilteredTemplates: () => {
            const state = get();
            const templates = Array.from(state.templates.values());
            
            // The filtering and sorting is already done server-side
            // This is just for any additional client-side filtering
            return templates;
          },
          
          getSelectedTemplate: () => {
            const state = get();
            return state.selectedId ? state.templates.get(state.selectedId) || null : null;
          },
          
          hasUnsavedChanges: () => {
            const state = get();
            return Array.from(state.templates.values()).some(t => t.localChanges);
          },
        }))
      ),
      {
        name: 'template-store',
        partialize: (state) => ({
          filters: state.filters,
          selectedId: state.selectedId,
        }),
        version: 1,
      }
    ),
    {
      name: 'TemplateStore',
    }
  )
);

// Selectors for performance
export const useTemplates = () => useTemplateStore((state) => state.getFilteredTemplates());
export const useSelectedTemplate = () => useTemplateStore((state) => state.getSelectedTemplate());
export const useTemplateFilters = () => useTemplateStore((state) => state.filters);
export const useTemplateActions = () => useTemplateStore((state) => ({
  setTemplate: state.setTemplate,
  updateTemplateField: state.updateTemplateField,
  deleteTemplate: state.deleteTemplate,
  setSelectedId: state.setSelectedId,
  updateFilters: state.updateFilters,
  fetchTemplates: state.fetchTemplates,
  saveTemplate: state.saveTemplate,
  createTemplate: state.createTemplate,
}));

// Subscribe to specific changes (example)
if (typeof window !== 'undefined') {
  useTemplateStore.subscribe(
    (state) => state.selectedId,
    (selectedId) => {
      console.log('[TemplateStore] Selected template changed:', selectedId);
    }
  );
  
  // Auto-save unsaved changes every 30 seconds
  setInterval(() => {
    const state = useTemplateStore.getState();
    const unsavedTemplates = Array.from(state.templates.values()).filter(t => t.localChanges);
    
    unsavedTemplates.forEach(template => {
      state.saveTemplate(template.id).catch(console.error);
    });
  }, 30000);
}

export default useTemplateStore;