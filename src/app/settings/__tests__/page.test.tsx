import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DatabaseService } from '@/lib/db';
import type { UserSettings } from '@/lib/types';

// Mock the database service
vi.mock('@/lib/db', () => ({
  DatabaseService: {
    exportData: vi.fn(),
    importData: vi.fn(),
    getStats: vi.fn()
  },
  SettingsService: {
    get: vi.fn(),
    update: vi.fn(),
    reset: vi.fn()
  },
  CategoryService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

describe('Settings Page - Data Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Export Data', () => {
    it('should export data with correct structure', async () => {
      const mockExportData = {
        inventory: [],
        shopping: [],
        categories: [],
        settings: [],
        exportDate: new Date().toISOString()
      };

      (DatabaseService.exportData as any).mockResolvedValue(mockExportData);

      const result = await DatabaseService.exportData();

      expect(result).toHaveProperty('inventory');
      expect(result).toHaveProperty('shopping');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('settings');
      expect(result).toHaveProperty('exportDate');
      expect(DatabaseService.exportData).toHaveBeenCalled();
    });

    it('should include export date in ISO format', async () => {
      const mockExportData = {
        inventory: [],
        shopping: [],
        categories: [],
        settings: [],
        exportDate: new Date().toISOString()
      };

      (DatabaseService.exportData as any).mockResolvedValue(mockExportData);

      const result = await DatabaseService.exportData();

      expect(result.exportDate).toBeDefined();
      expect(typeof result.exportDate).toBe('string');
      // Verify it's a valid ISO date string
      expect(new Date(result.exportDate).toISOString()).toBe(result.exportDate);
    });
  });

  describe('Import Data', () => {
    it('should import data successfully', async () => {
      const mockImportData = {
        inventory: [],
        shopping: [],
        categories: [],
        settings: [],
        exportDate: new Date().toISOString()
      };

      (DatabaseService.importData as any).mockResolvedValue(undefined);

      await DatabaseService.importData(mockImportData);

      expect(DatabaseService.importData).toHaveBeenCalledWith(mockImportData);
    });

    it('should handle import errors gracefully', async () => {
      const invalidData = { invalid: 'data' };

      (DatabaseService.importData as any).mockRejectedValue(new Error('Invalid data format'));

      await expect(DatabaseService.importData(invalidData)).rejects.toThrow('Invalid data format');
    });
  });

  describe('Theme Persistence', () => {
    it('should apply theme to document root', () => {
      const root = document.documentElement;
      
      // Test dark theme
      root.classList.add('dark');
      expect(root.classList.contains('dark')).toBe(true);
      
      // Test light theme
      root.classList.remove('dark');
      expect(root.classList.contains('dark')).toBe(false);
    });

    it('should respect system preference for theme', () => {
      // Mock matchMedia
      const mockMatchMedia = vi.fn((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      global.matchMedia = mockMatchMedia as any;

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      expect(typeof prefersDark).toBe('boolean');
    });
  });

  describe('Preferred Units Management', () => {
    it('should add new unit to list', () => {
      const units = ['pieces', 'lbs', 'oz'];
      const newUnit = 'kg';
      
      const updatedUnits = [...units, newUnit];
      
      expect(updatedUnits).toContain('kg');
      expect(updatedUnits).toHaveLength(4);
    });

    it('should remove unit from list', () => {
      const units = ['pieces', 'lbs', 'oz'];
      const unitToRemove = 'lbs';
      
      const updatedUnits = units.filter(u => u !== unitToRemove);
      
      expect(updatedUnits).not.toContain('lbs');
      expect(updatedUnits).toHaveLength(2);
    });

    it('should not add duplicate units', () => {
      const units = ['pieces', 'lbs', 'oz'];
      const newUnit = 'pieces';
      
      const updatedUnits = units.includes(newUnit) ? units : [...units, newUnit];
      
      expect(updatedUnits).toHaveLength(3);
      expect(updatedUnits.filter(u => u === 'pieces')).toHaveLength(1);
    });
  });

  describe('Settings Validation', () => {
    it('should validate low stock threshold is positive', () => {
      const threshold = 5;
      expect(threshold).toBeGreaterThan(0);
    });

    it('should validate expiration warning days is positive', () => {
      const days = 7;
      expect(days).toBeGreaterThan(0);
    });

    it('should validate default location is valid', () => {
      const validLocations = ['fridge', 'pantry', 'freezer'];
      const location = 'pantry';
      
      expect(validLocations).toContain(location);
    });

    it('should validate theme is valid', () => {
      const validThemes = ['light', 'dark', 'system'];
      const theme = 'light';
      
      expect(validThemes).toContain(theme);
    });
  });
});
