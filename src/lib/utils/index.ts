import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper functions exports
// This file will export all utility functions

// Re-export fuzzy search utilities
export * from './fuzzy-search';

// Re-export retry utilities
export * from './retry';

// Re-export form validation utilities
export * from './form-validation';

// Re-export performance utilities
export * from './performance';