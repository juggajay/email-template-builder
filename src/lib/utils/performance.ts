import { useCallback, useEffect, useRef } from 'react';

/**
 * Debounce function that delays execution until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function that limits execution to once per specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * React hook for debounced functions with automatic cleanup
 */
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(func);
  
  // Update callback ref when function changes
  useEffect(() => {
    callbackRef.current = func;
  }, [func]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, wait);
  }, [wait, ...deps]);
}

/**
 * React hook for throttled functions with automatic cleanup
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
  deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
  const inThrottleRef = useRef(false);
  const callbackRef = useRef(func);
  
  // Update callback ref when function changes
  useEffect(() => {
    callbackRef.current = func;
  }, [func]);
  
  return useCallback((...args: Parameters<T>) => {
    if (!inThrottleRef.current) {
      callbackRef.current(...args);
      inThrottleRef.current = true;
      setTimeout(() => {
        inThrottleRef.current = false;
      }, limit);
    }
  }, [limit, ...deps]);
}

/**
 * Advanced debounce with cancel and flush methods
 */
export function debounceWithControls<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): {
  debounced: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => void;
} {
  let timeout: NodeJS.Timeout | undefined;
  let lastArgs: Parameters<T> | undefined;
  
  const debounced = function(...args: Parameters<T>) {
    lastArgs = args;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      timeout = undefined;
      func(...args);
    }, wait);
  };
  
  const cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
  };
  
  const flush = () => {
    if (timeout && lastArgs) {
      clearTimeout(timeout);
      timeout = undefined;
      func(...lastArgs);
    }
  };
  
  return { debounced, cancel, flush };
}

/**
 * Advanced throttle with leading and trailing options
 */
export function throttleAdvanced<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
  const { leading = true, trailing = true } = options;
  let timeout: NodeJS.Timeout | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastCallTime: number | undefined;
  
  return function(...args: Parameters<T>) {
    const now = Date.now();
    
    if (!lastCallTime && !leading) {
      lastCallTime = now;
    }
    
    const remaining = limit - (now - (lastCallTime || 0));
    
    lastArgs = args;
    
    if (remaining <= 0 || remaining > limit) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
      }
      lastCallTime = now;
      func(...args);
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        lastCallTime = leading ? Date.now() : undefined;
        timeout = undefined;
        if (lastArgs) {
          func(...lastArgs);
        }
      }, remaining);
    }
  };
}