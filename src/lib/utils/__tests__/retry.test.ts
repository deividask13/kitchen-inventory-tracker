import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  retry,
  retryLinear,
  retryOnError,
  retryNetworkError,
  makeRetryable,
  withTimeout,
  retryWithTimeout,
  RetryableError,
  NetworkError,
  TimeoutError,
} from '../retry';

describe('retry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should succeed on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    
    const result = await retry(fn);
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');
    
    const promise = retry(fn, { maxAttempts: 3, delayMs: 100 });
    
    // Fast-forward through delays
    await vi.runAllTimersAsync();
    
    const result = await promise;
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw error after max attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('persistent failure'));
    
    const promise = retry(fn, { maxAttempts: 3, delayMs: 100 });
    
    // Catch the promise to prevent unhandled rejection
    promise.catch(() => {});
    
    await vi.runAllTimersAsync();
    
    await expect(promise).rejects.toThrow('persistent failure');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    const onRetry = vi.fn();
    
    const promise = retry(fn, {
      maxAttempts: 3,
      delayMs: 100,
      backoffMultiplier: 2,
      onRetry,
    });
    
    // Catch the promise to prevent unhandled rejection
    promise.catch(() => {});
    
    await vi.runAllTimersAsync();
    
    await expect(promise).rejects.toThrow();
    
    // Should have called onRetry twice (after 1st and 2nd attempts)
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it('should respect maxDelayMs', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    
    const promise = retry(fn, {
      maxAttempts: 5,
      delayMs: 1000,
      backoffMultiplier: 10,
      maxDelayMs: 2000,
    });
    
    // Catch the promise to prevent unhandled rejection
    promise.catch(() => {});
    
    await vi.runAllTimersAsync();
    
    await expect(promise).rejects.toThrow();
  });

  it('should respect shouldRetry callback', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('non-retryable'));
    
    const promise = retry(fn, {
      maxAttempts: 3,
      shouldRetry: (error) => error.message !== 'non-retryable',
    });
    
    await expect(promise).rejects.toThrow('non-retryable');
    expect(fn).toHaveBeenCalledTimes(1); // Should not retry
  });
});

describe('retryLinear', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should use constant delay between attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    
    const promise = retryLinear(fn, { maxAttempts: 3, delayMs: 100 });
    
    // Catch the promise to prevent unhandled rejection
    promise.catch(() => {});
    
    await vi.runAllTimersAsync();
    
    await expect(promise).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe('retryOnError', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should retry only for specific error types', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new NetworkError())
      .mockResolvedValue('success');
    
    const promise = retryOnError(fn, [NetworkError], { maxAttempts: 3, delayMs: 100 });
    
    await vi.runAllTimersAsync();
    
    const result = await promise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not retry for non-matching error types', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('regular error'));
    
    const promise = retryOnError(fn, [NetworkError], { maxAttempts: 3 });
    
    await expect(promise).rejects.toThrow('regular error');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('retryNetworkError', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should retry on network errors', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValue('success');
    
    const promise = retryNetworkError(fn, { maxAttempts: 3, delayMs: 100 });
    
    await vi.runAllTimersAsync();
    
    const result = await promise;
    expect(result).toBe('success');
  });

  it('should not retry on non-network errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('validation error'));
    
    const promise = retryNetworkError(fn, { maxAttempts: 3 });
    
    await expect(promise).rejects.toThrow('validation error');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('makeRetryable', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create a retryable version of a function', async () => {
    const originalFn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    
    const retryableFn = makeRetryable(originalFn, { maxAttempts: 3, delayMs: 100 });
    
    const promise = retryableFn();
    
    await vi.runAllTimersAsync();
    
    const result = await promise;
    expect(result).toBe('success');
    expect(originalFn).toHaveBeenCalledTimes(2);
  });

  it('should preserve function arguments', async () => {
    const originalFn = vi.fn((a: number, b: number) => Promise.resolve(a + b));
    
    const retryableFn = makeRetryable(originalFn);
    
    const result = await retryableFn(2, 3);
    
    expect(result).toBe(5);
    expect(originalFn).toHaveBeenCalledWith(2, 3);
  });
});

describe('withTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve if promise completes before timeout', async () => {
    const promise = Promise.resolve('success');
    
    const result = await withTimeout(promise, 1000);
    
    expect(result).toBe('success');
  });

  it('should reject with TimeoutError if promise takes too long', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve('too late'), 2000);
    });
    
    const timeoutPromise = withTimeout(promise, 1000);
    
    // Catch the promise to prevent unhandled rejection
    timeoutPromise.catch(() => {});
    
    await vi.advanceTimersByTimeAsync(1000);
    
    await expect(timeoutPromise).rejects.toThrow(TimeoutError);
  });

  it('should use custom error message', async () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => resolve('too late'), 2000);
    });
    
    const timeoutPromise = withTimeout(promise, 1000, 'Custom timeout message');
    
    // Catch the promise to prevent unhandled rejection
    timeoutPromise.catch(() => {});
    
    await vi.advanceTimersByTimeAsync(1000);
    
    await expect(timeoutPromise).rejects.toThrow('Custom timeout message');
  });
});

describe('retryWithTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should retry with timeout for each attempt', async () => {
    let attemptCount = 0;
    const fn = vi.fn(() => {
      attemptCount++;
      if (attemptCount < 3) {
        return new Promise((resolve) => {
          setTimeout(() => resolve('too late'), 2000);
        });
      }
      return Promise.resolve('success');
    });
    
    const promise = retryWithTimeout(fn, 1000, { maxAttempts: 3, delayMs: 100 });
    
    await vi.runAllTimersAsync();
    
    const result = await promise;
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });
});

describe('Error classes', () => {
  it('should create RetryableError', () => {
    const error = new RetryableError('test error');
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RetryableError);
    expect(error.name).toBe('RetryableError');
    expect(error.message).toBe('test error');
  });

  it('should create NetworkError', () => {
    const error = new NetworkError();
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RetryableError);
    expect(error).toBeInstanceOf(NetworkError);
    expect(error.name).toBe('NetworkError');
  });

  it('should create TimeoutError', () => {
    const error = new TimeoutError();
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RetryableError);
    expect(error).toBeInstanceOf(TimeoutError);
    expect(error.name).toBe('TimeoutError');
  });
});
