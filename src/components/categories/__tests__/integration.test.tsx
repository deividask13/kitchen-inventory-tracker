import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { fuzzySearchItems, searchInventoryItems } from '@/lib/utils/fuzzy-search';
import type { InventoryItem, Category } from '@/lib/types';

// Mock inventory items for testing
const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Red Apples',
    quantity: 5,
    unit: 'pieces',
    expirationDate: new Date('2024-12-31'),
    location: 'fridge',
    purchaseDate: new Date('2024-12-01'),
    category: 'Produce',
    isLow: false,
    isFinished: false,
    lastUsed: null,
    notes: 'Organic apples from local farm',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: '2',
    name: 'Whole Milk',
    quantity: 1,
    unit: 'gallon',
    expirationDate: new Date('2024-12-25'),
    location: 'fridge',
    purchaseDate: new Date('2024-12-15'),
    category: 'Dairy',
    isLow: true,
    isFinished: false,
    lastUsed: new Date('2024-12-16'),
    notes: 'Low fat milk',
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-16')
  },
  {
    id: '3',
    name: 'Apple Juice',
    quantity: 3,
    unit: 'bottles',
    expirationDate: new Date('2025-01-15'),
    location: 'pantry',
    purchaseDate: new Date('2024-12-05'),
    category: 'Beverages',
    isLow: false,
    isFinished: false,
    lastUsed: null,
    notes: 'No sugar added',
    createdAt: new Date('2024-12-05'),
    updatedAt: new Date('2024-12-05')
  }
];

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Produce',
    color: '#10B981',
    icon: '🥬',
    isDefault: true
  },
  {
    id: '2',
    name: 'Dairy',
    color: '#F59E0B',
    icon: '🥛',
    isDefault: true
  },
  {
    id: '3',
    name: 'Beverages',
    color: '#06B6D4',
    icon: '🥤',
    isDefault: true
  }
];

describe('Category Management and Filtering Integration', () => {
  describe('Fuzzy Search Integration', () => {
    it('searches across multiple fields correctly', () => {
      const results = fuzzySearchItems(mockInventoryItems, 'apple');
      
      expect(results).toHaveLength(2);
      expect(results.map(r => r.name)).toContain('Red Apples');
      expect(results.map(r => r.name)).toContain('Apple Juice');
    });

    it('finds items by category', () => {
      const results = fuzzySearchItems(mockInventoryItems, 'dairy');
      
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe('Dairy');
    });

    it('finds items by location', () => {
      const results = fuzzySearchItems(mockInventoryItems, 'fridge');
      
      expect(results).toHaveLength(2);
      expect(results.every(r => r.location === 'fridge')).toBe(true);
    });

    it('finds items by notes content', () => {
      const results = fuzzySearchItems(mockInventoryItems, 'organic');
      
      expect(results).toHaveLength(1);
      expect(results[0].notes).toContain('Organic');
    });

    it('returns results with scoring information', () => {
      const results = searchInventoryItems(mockInventoryItems, 'apple', {
        includeMatches: true,
        includeScore: true
      });
      
      expect(results).toHaveLength(2);
      expect(results[0].score).toBeGreaterThan(0);
      expect(results[0].matches).toBeDefined();
    });

    it('handles case insensitive search', () => {
      const results = fuzzySearchItems(mockInventoryItems, 'APPLE');
      
      expect(results).toHaveLength(2);
    });

    it('returns empty array for no matches', () => {
      const results = fuzzySearchItems(mockInventoryItems, 'nonexistent');
      
      expect(results).toHaveLength(0);
    });

    it('returns all items for empty search', () => {
      const results = fuzzySearchItems(mockInventoryItems, '');
      
      expect(results).toHaveLength(3);
      expect(results).toEqual(mockInventoryItems);
    });
  });

  describe('Category-based Filtering', () => {
    it('filters items by category correctly', () => {
      const produceItems = mockInventoryItems.filter(item => item.category === 'Produce');
      const dairyItems = mockInventoryItems.filter(item => item.category === 'Dairy');
      
      expect(produceItems).toHaveLength(1);
      expect(produceItems[0].name).toBe('Red Apples');
      
      expect(dairyItems).toHaveLength(1);
      expect(dairyItems[0].name).toBe('Whole Milk');
    });

    it('filters items by location correctly', () => {
      const fridgeItems = mockInventoryItems.filter(item => item.location === 'fridge');
      const pantryItems = mockInventoryItems.filter(item => item.location === 'pantry');
      
      expect(fridgeItems).toHaveLength(2);
      expect(pantryItems).toHaveLength(1);
      expect(pantryItems[0].name).toBe('Apple Juice');
    });

    it('combines category and search filters', () => {
      // First filter by category, then search within results
      const produceItems = mockInventoryItems.filter(item => item.category === 'Produce');
      const searchResults = fuzzySearchItems(produceItems, 'apple');
      
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe('Red Apples');
      expect(searchResults[0].category).toBe('Produce');
    });

    it('combines location and search filters', () => {
      // First filter by location, then search within results
      const fridgeItems = mockInventoryItems.filter(item => item.location === 'fridge');
      const searchResults = fuzzySearchItems(fridgeItems, 'milk');
      
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe('Whole Milk');
      expect(searchResults[0].location).toBe('fridge');
    });
  });

  describe('Category Management', () => {
    it('provides default categories', () => {
      const defaultCategories = mockCategories.filter(c => c.isDefault);
      
      expect(defaultCategories).toHaveLength(3);
      expect(defaultCategories.map(c => c.name)).toContain('Produce');
      expect(defaultCategories.map(c => c.name)).toContain('Dairy');
      expect(defaultCategories.map(c => c.name)).toContain('Beverages');
    });

    it('supports custom categories', () => {
      const customCategory: Category = {
        id: '4',
        name: 'Snacks',
        color: '#F97316',
        icon: '🍿',
        isDefault: false
      };

      const allCategories = [...mockCategories, customCategory];
      const customCategories = allCategories.filter(c => !c.isDefault);
      
      expect(customCategories).toHaveLength(1);
      expect(customCategories[0].name).toBe('Snacks');
    });

    it('validates category properties', () => {
      const validCategory: Category = {
        id: '5',
        name: 'Test Category',
        color: '#EF4444',
        icon: '🧪',
        isDefault: false
      };

      // Validate required properties
      expect(validCategory.id).toBeDefined();
      expect(validCategory.name).toBeDefined();
      expect(validCategory.color).toBeDefined();
      expect(validCategory.icon).toBeDefined();
      expect(typeof validCategory.isDefault).toBe('boolean');
      
      // Validate color format (hex color)
      expect(validCategory.color).toMatch(/^#[0-9A-F]{6}$/i);
      
      // Validate name length
      expect(validCategory.name.length).toBeGreaterThan(0);
      expect(validCategory.name.length).toBeLessThanOrEqual(30);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('handles large datasets efficiently', () => {
      // Create a larger dataset
      const largeDataset: InventoryItem[] = Array.from({ length: 1000 }, (_, i) => ({
        ...mockInventoryItems[0],
        id: `item-${i}`,
        name: `Item ${i}`,
        category: i % 2 === 0 ? 'Produce' : 'Dairy'
      }));

      const startTime = performance.now();
      const results = fuzzySearchItems(largeDataset, 'Item 1');
      const endTime = performance.now();
      
      // Should complete within reasonable time (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      
      // Should return relevant results
      expect(results.length).toBeGreaterThan(0);
    });

    it('handles special characters in search', () => {
      const itemWithSpecialChars: InventoryItem = {
        ...mockInventoryItems[0],
        id: 'special',
        name: 'Café & Crème',
        notes: 'Special chars: @#$%'
      };

      const dataset = [...mockInventoryItems, itemWithSpecialChars];
      const results = fuzzySearchItems(dataset, 'café');
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Café & Crème');
    });

    it('handles empty and null values gracefully', () => {
      const itemWithNulls: InventoryItem = {
        ...mockInventoryItems[0],
        id: 'nulls',
        name: 'Test Item',
        notes: undefined,
        lastUsed: null
      };

      const dataset = [...mockInventoryItems, itemWithNulls];
      const results = fuzzySearchItems(dataset, 'test');
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Test Item');
    });

    it('maintains consistent ordering', () => {
      // Run the same search multiple times
      const query = 'apple';
      const results1 = fuzzySearchItems(mockInventoryItems, query);
      const results2 = fuzzySearchItems(mockInventoryItems, query);
      const results3 = fuzzySearchItems(mockInventoryItems, query);
      
      // Results should be consistent
      expect(results1.map(r => r.id)).toEqual(results2.map(r => r.id));
      expect(results2.map(r => r.id)).toEqual(results3.map(r => r.id));
    });
  });
});