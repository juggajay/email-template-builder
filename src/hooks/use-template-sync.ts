import { useEffect, useCallback } from 'react';
import useTemplateStore from './use-template-store';
import { useCacheInvalidation } from './use-cached-data';

/**
 * Hook to sync Zustand store with cache
 */
export function useTemplateSync() {
  const { fetchTemplates, templates, filters } = useTemplateStore();
  const { invalidateTemplates } = useCacheInvalidation();
  
  // Initial fetch on mount
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  // Refetch when filters change
  useEffect(() => {
    fetchTemplates(true);
  }, [filters.category, filters.sortBy, filters.showUserTemplates]);
  
  // Sync with cache invalidation
  const refreshTemplates = useCallback(async () => {
    invalidateTemplates();
    await fetchTemplates(true);
  }, [fetchTemplates, invalidateTemplates]);
  
  return { refreshTemplates };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticTemplate(templateId: string) {
  const template = useTemplateStore(state => 
    state.templates.get(templateId)
  );
  const { updateTemplateField, saveTemplate } = useTemplateStore();
  const { invalidateTemplate } = useCacheInvalidation();
  
  const updateField = useCallback(async (field: string, value: any) => {
    // Optimistic update
    updateTemplateField(templateId, field, value);
    
    try {
      // Save to backend
      await saveTemplate(templateId);
      
      // Invalidate cache
      invalidateTemplate(templateId);
    } catch (error) {
      // Revert on error
      console.error('Failed to save template:', error);
      // You could implement a revert mechanism here
    }
  }, [templateId, updateTemplateField, saveTemplate, invalidateTemplate]);
  
  return {
    template,
    updateField,
    hasChanges: template?.localChanges || false,
  };
}

/**
 * Hook for template creation with store integration
 */
export function useCreateTemplate() {
  const { createTemplate, setSelectedId } = useTemplateStore();
  const { invalidateTemplates } = useCacheInvalidation();
  
  const create = useCallback(async (templateData: any) => {
    try {
      const newId = await createTemplate(templateData);
      
      // Invalidate templates cache
      invalidateTemplates();
      
      // Navigate to new template
      setSelectedId(newId);
      
      return newId;
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }, [createTemplate, setSelectedId, invalidateTemplates]);
  
  return { create };
}

/**
 * Hook for template deletion with confirmation
 */
export function useDeleteTemplate() {
  const { deleteTemplate } = useTemplateStore();
  const { invalidateTemplates } = useCacheInvalidation();
  
  const deleteWithConfirmation = useCallback(async (
    templateId: string,
    templateName?: string
  ) => {
    const message = templateName 
      ? `Are you sure you want to delete "${templateName}"?`
      : 'Are you sure you want to delete this template?';
      
    if (!window.confirm(message)) {
      return false;
    }
    
    try {
      deleteTemplate(templateId);
      invalidateTemplates();
      return true;
    } catch (error) {
      console.error('Failed to delete template:', error);
      return false;
    }
  }, [deleteTemplate, invalidateTemplates]);
  
  return { deleteTemplate: deleteWithConfirmation };
}

/**
 * Hook for template search with debouncing
 */
export function useTemplateSearch() {
  const { filters, updateFilters } = useTemplateStore();
  const [localSearch, setLocalSearch] = React.useState(filters.searchQuery);
  
  // Debounced search update
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.searchQuery) {
        updateFilters({ searchQuery: localSearch });
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [localSearch, filters.searchQuery, updateFilters]);
  
  return {
    searchQuery: localSearch,
    setSearchQuery: setLocalSearch,
  };
}

/**
 * Hook for undo/redo functionality
 */
export function useTemplateHistory(templateId: string) {
  const [history, setHistory] = React.useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(-1);
  
  const template = useTemplateStore(state => 
    state.templates.get(templateId)
  );
  const { setTemplate } = useTemplateStore();
  
  // Add to history on changes
  React.useEffect(() => {
    if (template && template.localChanges) {
      setHistory(prev => [...prev.slice(0, currentIndex + 1), template]);
      setCurrentIndex(prev => prev + 1);
    }
  }, [template?.json_design]); // Track specific fields
  
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const previousState = history[currentIndex - 1];
      setTemplate(templateId, previousState);
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex, history, setTemplate, templateId]);
  
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const nextState = history[currentIndex + 1];
      setTemplate(templateId, nextState);
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, history, setTemplate, templateId]);
  
  return {
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    undo,
    redo,
  };
}

// Import React for hooks
import React from 'react';