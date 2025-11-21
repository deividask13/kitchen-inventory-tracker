import { describe, it, expect, beforeEach, vi } from 'vitest';
import { performanceMonitor } from '../performance';

describe('Performance Monitor', () => {
  beforeEach(() => {
    performanceMonitor.clear();
  });

  it('should measure operation duration', () => {
    performanceMonitor.start('test-operation');
    
    // Simulate some work
    const start = Date.now();
    while (Date.now() - start < 10) {
      // Wait 10ms
    }
    
    const duration = performanceMonitor.end('test-operation');
    
    expect(duration).toBeGreaterThan(0);
    // Allow for timing precision issues
    expect(duration).toBeGreaterThanOrEqual(5);
  });

  it('should record metrics', () => {
    performanceMonitor.start('operation-1');
    performanceMonitor.end('operation-1');
    
    performanceMonitor.start('operation-2');
    performanceMonitor.end('operation-2');
    
    const metrics = performanceMonitor.getMetrics();
    
    expect(metrics).toHaveLength(2);
    expect(metrics[0].name).toBe('operation-1');
    expect(metrics[1].name).toBe('operation-2');
  });

  it('should get metrics by name', () => {
    performanceMonitor.start('test');
    performanceMonitor.end('test');
    
    performanceMonitor.start('test');
    performanceMonitor.end('test');
    
    performanceMonitor.start('other');
    performanceMonitor.end('other');
    
    const testMetrics = performanceMonitor.getMetricsByName('test');
    
    expect(testMetrics).toHaveLength(2);
    expect(testMetrics.every(m => m.name === 'test')).toBe(true);
  });

  it('should calculate average duration', () => {
    // Record multiple measurements
    for (let i = 0; i < 3; i++) {
      performanceMonitor.start('avg-test');
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Wait 10ms
      }
      performanceMonitor.end('avg-test');
    }
    
    const average = performanceMonitor.getAverageDuration('avg-test');
    
    expect(average).toBeGreaterThan(0);
    // Allow for timing precision issues
    expect(average).toBeGreaterThanOrEqual(5);
  });

  it('should handle missing marks gracefully', () => {
    const duration = performanceMonitor.end('non-existent');
    
    expect(duration).toBeNull();
  });

  it('should clear all metrics', () => {
    performanceMonitor.start('test');
    performanceMonitor.end('test');
    
    expect(performanceMonitor.getMetrics()).toHaveLength(1);
    
    performanceMonitor.clear();
    
    expect(performanceMonitor.getMetrics()).toHaveLength(0);
  });

  it('should measure async functions', async () => {
    const asyncOperation = async () => {
      return new Promise(resolve => setTimeout(resolve, 10));
    };
    
    const result = await performanceMonitor.measure('async-test', asyncOperation);
    
    expect(result).toBeUndefined();
    
    const metrics = performanceMonitor.getMetricsByName('async-test');
    expect(metrics).toHaveLength(1);
    // Allow for slight timing variations (9ms instead of 10ms due to timer precision)
    expect(metrics[0].duration).toBeGreaterThanOrEqual(9);
  });

  it('should measure functions that return values', async () => {
    const operation = async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'result';
    };
    
    const result = await performanceMonitor.measure('value-test', operation);
    
    expect(result).toBe('result');
  });

  it('should handle errors in measured functions', async () => {
    const errorOperation = async () => {
      throw new Error('Test error');
    };
    
    await expect(
      performanceMonitor.measure('error-test', errorOperation)
    ).rejects.toThrow('Test error');
    
    // Should still record the metric
    const metrics = performanceMonitor.getMetricsByName('error-test');
    expect(metrics).toHaveLength(1);
  });

  it('should return 0 for average of non-existent operation', () => {
    const average = performanceMonitor.getAverageDuration('non-existent');
    
    expect(average).toBe(0);
  });
});
