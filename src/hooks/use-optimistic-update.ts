import { useState, useCallback, useEffect } from 'react';

/**
 * Hook for optimistic updates with automatic rollback on error
 * 
 * @param actualData - The current server state
 * @param updateFn - Async function to update server state
 * @returns Object with optimistic data, update function, and loading state
 * 
 * @example
 * const { data, update, isUpdating } = useOptimisticUpdate(
 *   user,
 *   async (newUser) => {
 *     const response = await updateUser(newUser);
 *     return response.data;
 *   }
 * );
 */
export function useOptimisticUpdate<T>(
  actualData: T,
  updateFn: (data: T) => Promise<T>
) {
  const [optimisticData, setOptimisticData] = useState(actualData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Sync with actual data changes
  useEffect(() => {
    if (!isUpdating) {
      setOptimisticData(actualData);
    }
  }, [actualData, isUpdating]);
  
  const update = useCallback(async (newData: T) => {
    setOptimisticData(newData);
    setIsUpdating(true);
    setError(null);
    
    try {
      const result = await updateFn(newData);
      setOptimisticData(result);
      return result;
    } catch (error) {
      // Revert on error
      setOptimisticData(actualData);
      setError(error as Error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [actualData, updateFn]);
  
  return {
    data: optimisticData,
    update,
    isUpdating,
    error
  };
}

/**
 * Hook for optimistic updates with multiple operations
 */
export function useOptimisticUpdates<T extends { id: string | number }>(
  items: T[],
  handlers: {
    onCreate?: (item: Omit<T, 'id'>) => Promise<T>;
    onUpdate?: (id: T['id'], updates: Partial<T>) => Promise<T>;
    onDelete?: (id: T['id']) => Promise<void>;
  }
) {
  const [optimisticItems, setOptimisticItems] = useState(items);
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  
  // Sync with actual data changes
  useEffect(() => {
    if (pendingOperations.size === 0) {
      setOptimisticItems(items);
    }
  }, [items, pendingOperations.size]);
  
  const create = useCallback(async (newItem: Omit<T, 'id'>) => {
    if (!handlers.onCreate) {
      throw new Error('onCreate handler not provided');
    }
    
    const tempId = `temp-${Date.now()}`;
    const optimisticItem = { ...newItem, id: tempId } as T;
    
    // Add optimistically
    setOptimisticItems(prev => [...prev, optimisticItem]);
    setPendingOperations(prev => new Set(prev).add(tempId));
    
    try {
      const createdItem = await handlers.onCreate(newItem);
      
      // Replace temp item with real item
      setOptimisticItems(prev => 
        prev.map(item => item.id === tempId ? createdItem : item)
      );
      
      return createdItem;
    } catch (error) {
      // Remove on error
      setOptimisticItems(prev => prev.filter(item => item.id !== tempId));
      throw error;
    } finally {
      setPendingOperations(prev => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });
    }
  }, [handlers]);
  
  const update = useCallback(async (id: T['id'], updates: Partial<T>) => {
    if (!handlers.onUpdate) {
      throw new Error('onUpdate handler not provided');
    }
    
    const operationId = `update-${id}`;
    
    // Update optimistically
    setOptimisticItems(prev => 
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    );
    setPendingOperations(prev => new Set(prev).add(operationId));
    
    try {
      const updatedItem = await handlers.onUpdate(id, updates);
      
      // Update with server response
      setOptimisticItems(prev => 
        prev.map(item => item.id === id ? updatedItem : item)
      );
      
      return updatedItem;
    } catch (error) {
      // Revert on error
      setOptimisticItems(items);
      throw error;
    } finally {
      setPendingOperations(prev => {
        const next = new Set(prev);
        next.delete(operationId);
        return next;
      });
    }
  }, [items, handlers]);
  
  const remove = useCallback(async (id: T['id']) => {
    if (!handlers.onDelete) {
      throw new Error('onDelete handler not provided');
    }
    
    const operationId = `delete-${id}`;
    const itemToDelete = optimisticItems.find(item => item.id === id);
    
    if (!itemToDelete) return;
    
    // Remove optimistically
    setOptimisticItems(prev => prev.filter(item => item.id !== id));
    setPendingOperations(prev => new Set(prev).add(operationId));
    
    try {
      await handlers.onDelete(id);
    } catch (error) {
      // Restore on error
      setOptimisticItems(prev => [...prev, itemToDelete]);
      throw error;
    } finally {
      setPendingOperations(prev => {
        const next = new Set(prev);
        next.delete(operationId);
        return next;
      });
    }
  }, [optimisticItems, handlers]);
  
  return {
    items: optimisticItems,
    create,
    update,
    remove,
    isUpdating: pendingOperations.size > 0,
    pendingOperations: Array.from(pendingOperations)
  };
}

/**
 * Hook for optimistic form updates
 */
export function useOptimisticForm<T extends Record<string, any>>(
  initialData: T,
  onSubmit: (data: T) => Promise<T>
) {
  const [formData, setFormData] = useState(initialData);
  const [originalData, setOriginalData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const isDirty = JSON.stringify(formData) !== JSON.stringify(originalData);
  
  const updateField = useCallback(<K extends keyof T>(
    field: K,
    value: T[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const updateFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);
  
  const submit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await onSubmit(formData);
      setFormData(result);
      setOriginalData(result);
      return result;
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit]);
  
  const reset = useCallback(() => {
    setFormData(originalData);
    setError(null);
  }, [originalData]);
  
  return {
    data: formData,
    updateField,
    updateFields,
    submit,
    reset,
    isSubmitting,
    isDirty,
    error
  };
}