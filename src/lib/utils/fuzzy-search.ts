/**
 * Fuzzy search utility for inventory items
 * Provides intelligent search across multiple fields with scoring
 */

import type { InventoryItem } from '../types';

interface SearchResult<T> {
  item: T;
  score: number;
  matches: SearchMatch[];
}

interface SearchMatch {
  field: string;
  value: string;
  indices: number[];
}

interface SearchOptions {
  threshold?: number; // Minimum score to include in results (0-1)
  includeScore?: boolean;
  includeMatches?: boolean;
  keys?: SearchKey[];
}

interface SearchKey {
  name: string;
  weight?: number;
  getFn?: (item: any) => string;
}

// Default search configuration for inventory items
const DEFAULT_INVENTORY_KEYS: SearchKey[] = [
  { name: 'name', weight: 1.0 },
  { name: 'category', weight: 0.8 },
  { name: 'location', weight: 0.6 },
  { name: 'notes', weight: 0.4, getFn: (item) => item.notes || '' },
  { name: 'unit', weight: 0.3 }
];

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      if (b.charAt(j - 1) === a.charAt(i - 1)) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1, // substitution
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function calculateSimilarity(query: string, target: string): number {
  if (!query || !target) return 0;
  
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();
  
  // Exact match
  if (queryLower === targetLower) return 1.0;
  
  // Starts with match (high score)
  if (targetLower.startsWith(queryLower)) return 0.95;
  
  // Contains match (medium score)
  if (targetLower.includes(queryLower)) return 0.8;
  
  // Fuzzy match using Levenshtein distance
  const distance = levenshteinDistance(queryLower, targetLower);
  const maxLength = Math.max(queryLower.length, targetLower.length);
  const similarity = 1 - (distance / maxLength);
  
  // Only return fuzzy matches above a certain threshold
  return similarity > 0.6 ? similarity * 0.7 : 0;
}

/**
 * Find character indices that match the query in the target string
 */
function findMatchIndices(query: string, target: string): number[] {
  const indices: number[] = [];
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();
  
  let queryIndex = 0;
  
  for (let i = 0; i < targetLower.length && queryIndex < queryLower.length; i++) {
    if (targetLower[i] === queryLower[queryIndex]) {
      indices.push(i);
      queryIndex++;
    }
  }
  
  return indices;
}

/**
 * Search a single field and return score and matches
 */
function searchField(
  query: string, 
  value: string, 
  fieldName: string, 
  weight: number = 1
): { score: number; match?: SearchMatch } {
  if (!value) return { score: 0 };
  
  const similarity = calculateSimilarity(query, value);
  const score = similarity * weight;
  
  if (score > 0) {
    const indices = findMatchIndices(query, value);
    return {
      score,
      match: {
        field: fieldName,
        value,
        indices
      }
    };
  }
  
  return { score: 0 };
}

/**
 * Fuzzy search implementation
 */
export class FuzzySearch<T = any> {
  private keys: SearchKey[];
  private threshold: number;

  constructor(keys: SearchKey[] = [], options: Partial<SearchOptions> = {}) {
    this.keys = keys;
    this.threshold = options.threshold || 0.1;
  }

  search(items: T[], query: string, options: SearchOptions = {}): SearchResult<T>[] {
    if (!query.trim()) return items.map(item => ({ item, score: 1, matches: [] }));

    const searchKeys = options.keys || this.keys;
    const threshold = options.threshold || this.threshold;
    const results: SearchResult<T>[] = [];

    for (const item of items) {
      let totalScore = 0;
      let maxWeight = 0;
      const matches: SearchMatch[] = [];

      for (const key of searchKeys) {
        const weight = key.weight || 1;
        maxWeight += weight;

        let value: string;
        if (key.getFn) {
          value = key.getFn(item);
        } else {
          value = (item as any)[key.name];
        }

        if (typeof value === 'string') {
          const { score, match } = searchField(query, value, key.name, weight);
          totalScore += score;
          
          if (match && options.includeMatches) {
            matches.push(match);
          }
        }
      }

      // Normalize score
      const normalizedScore = maxWeight > 0 ? totalScore / maxWeight : 0;

      if (normalizedScore >= threshold) {
        results.push({
          item,
          score: normalizedScore,
          matches: options.includeMatches ? matches : []
        });
      }
    }

    // Sort by score (highest first)
    return results.sort((a, b) => b.score - a.score);
  }
}

/**
 * Pre-configured fuzzy search for inventory items
 */
export function searchInventoryItems(
  items: InventoryItem[], 
  query: string, 
  options: SearchOptions = {}
): SearchResult<InventoryItem>[] {
  const fuzzySearch = new FuzzySearch(DEFAULT_INVENTORY_KEYS, {
    threshold: 0.1,
    ...options
  });

  return fuzzySearch.search(items, query, {
    includeMatches: true,
    ...options
  });
}

/**
 * Simple search function that returns just the items (for backward compatibility)
 */
export function fuzzySearchItems(items: InventoryItem[], query: string): InventoryItem[] {
  const results = searchInventoryItems(items, query, { threshold: 0.1 });
  return results.map(result => result.item);
}

/**
 * Highlight matching characters in a string
 */
export function highlightMatches(text: string, indices: number[]): string {
  if (!indices.length) return text;

  let result = '';
  let lastIndex = 0;

  for (const index of indices) {
    if (index >= lastIndex) {
      result += text.slice(lastIndex, index);
      result += `<mark>${text[index]}</mark>`;
      lastIndex = index + 1;
    }
  }

  result += text.slice(lastIndex);
  return result;
}

/**
 * Get search suggestions based on existing items
 */
export function getSearchSuggestions(
  items: InventoryItem[], 
  query: string, 
  limit: number = 5
): string[] {
  if (!query.trim()) return [];

  const suggestions = new Set<string>();
  const queryLower = query.toLowerCase();

  // Collect suggestions from different fields
  for (const item of items) {
    const fields = [item.name, item.category, item.location, item.notes];
    
    for (const field of fields) {
      if (field && field.toLowerCase().includes(queryLower)) {
        suggestions.add(field);
      }
    }
  }

  return Array.from(suggestions)
    .sort((a, b) => {
      // Prioritize exact matches and starts-with matches
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      if (aLower.startsWith(queryLower) && !bLower.startsWith(queryLower)) return -1;
      if (!aLower.startsWith(queryLower) && bLower.startsWith(queryLower)) return 1;
      
      return a.length - b.length; // Shorter matches first
    })
    .slice(0, limit);
}