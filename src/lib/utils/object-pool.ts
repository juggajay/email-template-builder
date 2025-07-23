/**
 * Object pool for efficient resource reuse
 * Reduces garbage collection pressure and improves performance
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private validateFn?: (obj: T) => boolean;
  private maxSize: number;
  private created: number = 0;
  private inUse: Set<T> = new Set();
  
  constructor(options: {
    create: () => T;
    reset: (obj: T) => void;
    validate?: (obj: T) => boolean;
    maxSize?: number;
    preAllocate?: number;
  }) {
    this.createFn = options.create;
    this.resetFn = options.reset;
    this.validateFn = options.validate;
    this.maxSize = options.maxSize ?? 100;
    
    // Pre-allocate objects if requested
    if (options.preAllocate) {
      const count = Math.min(options.preAllocate, this.maxSize);
      for (let i = 0; i < count; i++) {
        this.pool.push(this.createFn());
        this.created++;
      }
    }
  }
  
  /**
   * Acquire an object from the pool
   */
  acquire(): T {
    let obj: T | undefined;
    
    // Try to get a valid object from the pool
    while (this.pool.length > 0) {
      obj = this.pool.pop();
      if (obj && (!this.validateFn || this.validateFn(obj))) {
        break;
      }
      // Invalid object, discard it
      obj = undefined;
    }
    
    // Create new object if needed
    if (!obj) {
      obj = this.createFn();
      this.created++;
    }
    
    this.inUse.add(obj);
    return obj;
  }
  
  /**
   * Release an object back to the pool
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      console.warn('Attempting to release object not from this pool');
      return;
    }
    
    this.inUse.delete(obj);
    
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
  
  /**
   * Release all objects in use
   */
  releaseAll(): void {
    this.inUse.forEach(obj => {
      if (this.pool.length < this.maxSize) {
        this.resetFn(obj);
        this.pool.push(obj);
      }
    });
    this.inUse.clear();
  }
  
  /**
   * Clear the pool
   */
  clear(): void {
    this.pool = [];
    this.inUse.clear();
  }
  
  /**
   * Get pool statistics
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      inUse: this.inUse.size,
      created: this.created,
      maxSize: this.maxSize,
    };
  }
}

/**
 * React hook for using object pools
 */
export function useObjectPool<T>(options: {
  create: () => T;
  reset: (obj: T) => void;
  validate?: (obj: T) => boolean;
  maxSize?: number;
}) {
  const poolRef = useRef<ObjectPool<T>>();
  
  if (!poolRef.current) {
    poolRef.current = new ObjectPool(options);
  }
  
  useEffect(() => {
    return () => {
      poolRef.current?.clear();
    };
  }, []);
  
  return poolRef.current;
}

// Predefined pools for common use cases

/**
 * DOM element pool for template previews
 */
export const previewElementPool = new ObjectPool({
  create: () => {
    const div = document.createElement('div');
    div.style.position = 'relative';
    return div;
  },
  reset: (div) => {
    div.innerHTML = '';
    div.className = '';
    div.removeAttribute('style');
    div.style.position = 'relative';
    // Remove all event listeners
    const newDiv = div.cloneNode(false) as HTMLDivElement;
    div.parentNode?.replaceChild(newDiv, div);
  },
  validate: (div) => {
    // Check if element is still in DOM (might have been removed)
    return !div.parentNode;
  },
  maxSize: 50,
  preAllocate: 10,
});

/**
 * Canvas context pool for image processing
 */
export const canvasPool = new ObjectPool({
  create: () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    });
    return { canvas, ctx };
  },
  reset: ({ canvas, ctx }) => {
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    canvas.width = 0;
    canvas.height = 0;
  },
  maxSize: 20,
});

/**
 * Worker pool for parallel processing
 */
export class WorkerPool<T = any, R = any> {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: Array<{
    data: T;
    resolve: (result: R) => void;
    reject: (error: Error) => void;
  }> = [];
  
  constructor(
    workerScript: string | URL,
    maxWorkers = navigator.hardwareConcurrency || 4
  ) {
    for (let i = 0; i < maxWorkers; i++) {
      const worker = new Worker(workerScript);
      
      worker.onmessage = (e) => {
        const { resolve } = worker.currentTask || {};
        if (resolve) {
          resolve(e.data);
          delete worker.currentTask;
        }
        
        this.availableWorkers.push(worker);
        this.processNextTask();
      };
      
      worker.onerror = (error) => {
        const { reject } = worker.currentTask || {};
        if (reject) {
          reject(new Error(error.message));
          delete worker.currentTask;
        }
        
        this.availableWorkers.push(worker);
        this.processNextTask();
      };
      
      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }
  
  private processNextTask() {
    if (this.taskQueue.length === 0 || this.availableWorkers.length === 0) {
      return;
    }
    
    const worker = this.availableWorkers.pop()!;
    const task = this.taskQueue.shift()!;
    
    worker.currentTask = task;
    worker.postMessage(task.data);
  }
  
  execute(data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ data, resolve, reject });
      this.processNextTask();
    });
  }
  
  terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
  }
}

/**
 * Generic resource pool with lifecycle management
 */
export class ResourcePool<T> {
  private pool: T[] = [];
  private factory: ResourceFactory<T>;
  private config: ResourcePoolConfig;
  private lastCleanup = Date.now();
  private metrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };
  
  constructor(factory: ResourceFactory<T>, config: ResourcePoolConfig = {}) {
    this.factory = factory;
    this.config = {
      maxSize: 100,
      maxAge: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      ...config,
    };
  }
  
  async acquire(): Promise<PooledResource<T>> {
    this.cleanup();
    
    let resource = this.pool.pop();
    
    if (resource) {
      this.metrics.hits++;
    } else {
      this.metrics.misses++;
      resource = await this.factory.create();
    }
    
    const pooledResource: PooledResource<T> = {
      resource,
      acquired: Date.now(),
      release: () => this.release(pooledResource),
    };
    
    return pooledResource;
  }
  
  private release(pooled: PooledResource<T>): void {
    if (this.pool.length >= this.config.maxSize!) {
      this.metrics.evictions++;
      if (this.factory.destroy) {
        this.factory.destroy(pooled.resource);
      }
      return;
    }
    
    if (this.factory.reset) {
      this.factory.reset(pooled.resource);
    }
    
    this.pool.push(pooled.resource);
  }
  
  private cleanup(): void {
    const now = Date.now();
    
    if (now - this.lastCleanup < this.config.cleanupInterval!) {
      return;
    }
    
    this.lastCleanup = now;
    
    // Remove old resources
    const maxAge = this.config.maxAge!;
    let removed = 0;
    
    // Keep resources that are not too old
    this.pool = this.pool.filter(resource => {
      const age = now - (resource as any).__pooledAt;
      if (age > maxAge) {
        if (this.factory.destroy) {
          this.factory.destroy(resource);
        }
        removed++;
        return false;
      }
      return true;
    });
    
    this.metrics.evictions += removed;
  }
  
  getMetrics() {
    const total = this.metrics.hits + this.metrics.misses;
    return {
      ...this.metrics,
      hitRate: total > 0 ? this.metrics.hits / total : 0,
      poolSize: this.pool.length,
    };
  }
  
  clear(): void {
    this.pool.forEach(resource => {
      if (this.factory.destroy) {
        this.factory.destroy(resource);
      }
    });
    this.pool = [];
  }
}

// Types
interface ResourceFactory<T> {
  create: () => T | Promise<T>;
  reset?: (resource: T) => void;
  destroy?: (resource: T) => void;
}

interface ResourcePoolConfig {
  maxSize?: number;
  maxAge?: number;
  cleanupInterval?: number;
}

interface PooledResource<T> {
  resource: T;
  acquired: number;
  release: () => void;
}

// Extend Worker interface
declare global {
  interface Worker {
    currentTask?: any;
  }
}

// Import React hooks
import { useRef, useEffect } from 'react';