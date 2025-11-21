/**
 * Performance monitoring utilities
 */

export interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  private metrics: PerformanceMetrics[] = [];

  /**
   * Start measuring performance for a specific operation
   */
  start(name: string): void {
    if (typeof window === 'undefined') return;
    
    this.marks.set(name, performance.now());
  }

  /**
   * End measuring and record the metric
   */
  end(name: string): number | null {
    if (typeof window === 'undefined') return null;
    
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`Performance mark "${name}" not found`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Measure a function execution time
   */
  async measure<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific operation
   */
  getMetricsByName(name: string): PerformanceMetrics[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Get average duration for a specific operation
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.marks.clear();
    this.metrics = [];
  }

  /**
   * Report Web Vitals
   */
  reportWebVitals(metric: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vital:', metric);
    }

    // In production, you could send this to an analytics service
    // Example: sendToAnalytics(metric);
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for measuring component render performance
 */
export function usePerformanceMonitor(componentName: string) {
  if (typeof window === 'undefined') return;

  const markName = `${componentName}-render`;
  performanceMonitor.start(markName);

  // Cleanup on unmount
  return () => {
    performanceMonitor.end(markName);
  };
}

/**
 * Measure First Contentful Paint (FCP)
 */
export function measureFCP(): void {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        console.log('FCP:', entry.startTime);
        observer.disconnect();
      }
    }
  });

  observer.observe({ entryTypes: ['paint'] });
}

/**
 * Measure Largest Contentful Paint (LCP)
 */
export function measureLCP(): void {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('LCP:', lastEntry.startTime);
  });

  observer.observe({ entryTypes: ['largest-contentful-paint'] });
}

/**
 * Measure Cumulative Layout Shift (CLS)
 */
export function measureCLS(): void {
  if (typeof window === 'undefined') return;

  let clsScore = 0;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsScore += (entry as any).value;
        console.log('CLS:', clsScore);
      }
    }
  });

  observer.observe({ entryTypes: ['layout-shift'] });
}

/**
 * Initialize all performance monitoring
 */
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  measureFCP();
  measureLCP();
  measureCLS();
}
