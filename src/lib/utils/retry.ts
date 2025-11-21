/**
 * Retry mechanism for failed operations
 * Provides exponential backoff and configurable retry strategies
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
  shouldRetry: () => true,
  onRetry: () => {},
};

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we should retry
      const isLastAttempt = attempt === opts.maxAttempts;
      if (isLastAttempt || !opts.shouldRetry(lastError, attempt)) {
        throw lastError;
      }
      
      // Call retry callback
      opts.onRetry(lastError, attempt);
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.delayMs * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelayMs
      );
      
      // Wait before retrying
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

/**
 * Retry with linear backoff (constant delay between attempts)
 */
export async function retryLinear<T>(
  fn: () => Promise<T>,
  options: Omit<RetryOptions, 'backoffMultiplier'> = {}
): Promise<T> {
  return retry(fn, { ...options, backoffMultiplier: 1 });
}

/**
 * Retry only for specific error types
 */
export async function retryOnError<T>(
  fn: () => Promise<T>,
  errorTypes: (new (...args: any[]) => Error)[],
  options: RetryOptions = {}
): Promise<T> {
  return retry(fn, {
    ...options,
    shouldRetry: (error, attempt) => {
      const matchesType = errorTypes.some(ErrorType => error instanceof ErrorType);
      const shouldRetry = options.shouldRetry?.(error, attempt) ?? true;
      return matchesType && shouldRetry;
    },
  });
}

/**
 * Retry for network errors (useful for offline scenarios)
 */
export async function retryNetworkError<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return retry(fn, {
    ...options,
    shouldRetry: (error, attempt) => {
      const isNetworkError = 
        error.message.includes('network') ||
        error.message.includes('fetch') ||
        error.message.includes('offline') ||
        error.name === 'NetworkError';
      
      const shouldRetry = options.shouldRetry?.(error, attempt) ?? true;
      return isNetworkError && shouldRetry;
    },
  });
}

/**
 * Create a retryable version of a function
 */
export function makeRetryable<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: Parameters<T>) => {
    return retry(() => fn(...args), options);
  }) as T;
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Common error types for retry logic
 */
export class RetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetryableError';
  }
}

export class NetworkError extends RetryableError {
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends RetryableError {
  constructor(message: string = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Wrap a promise with a timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new TimeoutError(errorMessage || `Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

/**
 * Retry with timeout for each attempt
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOptions: RetryOptions = {}
): Promise<T> {
  return retry(() => withTimeout(fn(), timeoutMs), retryOptions);
}
