/**
 * Retry utility with exponential backoff
 */

export interface RetryOptions {
  retries?: number;
  delay?: number;
  backoff?: number;
  maxDelay?: number;
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Retry a function with exponential backoff
 * @param fn - The function to retry
 * @param options - Retry options
 * @returns Promise that resolves with the function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2,
    maxDelay = 10000,
    onRetry
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === retries) {
        throw lastError;
      }
      
      const currentDelay = Math.min(delay * Math.pow(backoff, attempt), maxDelay);
      
      if (onRetry) {
        onRetry(lastError, attempt + 1);
      }
      
      await new Promise(resolve => setTimeout(resolve, currentDelay));
    }
  }
  
  throw lastError!;
}

/**
 * Retry with jitter to prevent thundering herd
 * @param fn - The function to retry
 * @param options - Retry options
 * @returns Promise that resolves with the function result
 */
export async function retryWithJitter<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2,
    maxDelay = 10000,
    onRetry
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === retries) {
        throw lastError;
      }
      
      const baseDelay = Math.min(delay * Math.pow(backoff, attempt), maxDelay);
      // Add jitter: random value between 0.5 and 1.5 times the base delay
      const jitter = 0.5 + Math.random();
      const currentDelay = Math.floor(baseDelay * jitter);
      
      if (onRetry) {
        onRetry(lastError, attempt + 1);
      }
      
      await new Promise(resolve => setTimeout(resolve, currentDelay));
    }
  }
  
  throw lastError!;
}

/**
 * Create a retryable version of any async function
 * @param fn - The function to make retryable
 * @param options - Default retry options
 * @returns A new function that retries on failure
 */
export function makeRetryable<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: Parameters<T>) => {
    return retryWithBackoff(() => fn(...args), options);
  }) as T;
}