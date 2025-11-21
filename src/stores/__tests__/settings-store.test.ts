import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useSettingsStore } from '../settings-store';
import { SettingsService, CategoryService } from '../../lib/db';
import type { UserSettings, Category, CreateCategory } from '../../lib/types';

// Mock the services
vi.mock('../../lib/db', () => ({
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

const mockSettingsService = SettingsService as any;
const mockCategoryService = CategoryService as any;

describe('SettingsStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSettingsStore.setState({
      settings: null,
      categories: [],
      isLoading: false,
      error: null
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockSettings: UserSettings = {
    id: 'default',
    lowStockThreshold: 5,
    expirationWarningDays: 7,
    defaultLocation: 'pantry',
    preferredUnits: ['pieces', 'lbs', 'oz'],
    categories: [],
    theme: 'light',
    reducedMotion: false
  };

  const mockCategory: Category = {
    id: '1',
    name: 'Test Category',
    color: '#10B981',
    icon: '🥬',
    isDefault: true
  };

  const mockCustomCategory: Category = {
    id: '2',
    name: 'Custom Category',
    color: '#F59E0B',
    icon: '🏷️',
    isDefault: false
  };

  describe('loadSettings', () => {
    it('should load existing settings successfully', async () => {
      mockSettingsService.get.mockResolvedValue(mockSettings);

      const { loadSettings } = useSettingsStore.getState();
      await loadSettings();

      const state = useSettingsStore.getState();
      expect(state.settings).toEqual(mockSettings);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should create default settings if none exist', async () => {
      mockSettingsService.get.mockResolvedValueOnce(null);
      mockSettingsService.update.mockResolvedValue(undefined);
      mockSettingsService.get.mockResolvedValueOnce(mockSettings);

      const { loadSettings } = useSettingsStore.getState();
      await loadSettings();

      expect(mockSettingsService.update).toHaveBeenCalledWith({
        lowStockThreshold: 5,
        expirationWarningDays: 7,
        defaultLocation: 'pantry',
        preferredUnits: ['pieces', 'lbs', 'oz', 'cups', 'liters', 'ml'],
        categories: [],
        theme: 'system',
        reducedMotion: false
      });
      expect(mockSettingsService.get).toHaveBeenCalledTimes(2);
    });

    it('should handle loading errors', async () => {
      const errorMessage = 'Failed to load settings';
      mockSettingsService.get.mockRejectedValue(new Error(errorMessage));

      const { loadSettings } = useSettingsStore.getState();
      await loadSettings();

      const state = useSettingsStore.getState();
      expect(state.settings).toBe(null);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('loadCategories', () => {
    it('should load existing categories successfully', async () => {
      mockCategoryService.getAll.mockResolvedValue([mockCategory]);

      const { loadCategories } = useSettingsStore.getState();
      await loadCategories();

      const state = useSettingsStore.getState();
      expect(state.categories).toEqual([mockCategory]);
      expect(state.error).toBe(null);
    });

    it('should create default categories if none exist', async () => {
      mockCategoryService.getAll.mockResolvedValueOnce([]);
      mockCategoryService.create.mockResolvedValue('new-id');
      mockCategoryService.getAll.mockResolvedValueOnce([mockCategory]);

      const { loadCategories } = useSettingsStore.getState();
      await loadCategories();

      // Should create 8 default categories
      expect(mockCategoryService.create).toHaveBeenCalledTimes(8);
      expect(mockCategoryService.getAll).toHaveBeenCalledTimes(2);
    });

    it('should handle loading errors', async () => {
      const errorMessage = 'Failed to load categories';
      mockCategoryService.getAll.mockRejectedValue(new Error(errorMessage));

      const { loadCategories } = useSettingsStore.getState();
      await loadCategories();

      const state = useSettingsStore.getState();
      expect(state.categories).toEqual([]);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('updateSettings', () => {
    it('should update settings successfully', async () => {
      useSettingsStore.setState({ settings: mockSettings });
      mockSettingsService.update.mockResolvedValue(undefined);

      const updates = { lowStockThreshold: 10 };
      const { updateSettings } = useSettingsStore.getState();
      await updateSettings(updates);

      expect(mockSettingsService.update).toHaveBeenCalledWith(updates);
      
      const state = useSettingsStore.getState();
      expect(state.settings?.lowStockThreshold).toBe(10);
      expect(state.error).toBe(null);
    });

    it('should handle update errors and reload settings', async () => {
      useSettingsStore.setState({ settings: mockSettings });
      const errorMessage = 'Failed to update settings';
      mockSettingsService.update.mockRejectedValue(new Error(errorMessage));
      mockSettingsService.get.mockResolvedValue(mockSettings);

      const { updateSettings } = useSettingsStore.getState();
      
      await expect(updateSettings({ lowStockThreshold: 10 })).rejects.toThrow();
      expect(mockSettingsService.get).toHaveBeenCalled();
    });
  });

  describe('resetSettings', () => {
    it('should reset settings successfully', async () => {
      mockSettingsService.reset.mockResolvedValue(undefined);
      mockSettingsService.get.mockResolvedValue(mockSettings);
      mockCategoryService.getAll.mockResolvedValue([mockCategory]);

      const { resetSettings } = useSettingsStore.getState();
      await resetSettings();

      expect(mockSettingsService.reset).toHaveBeenCalled();
      expect(mockSettingsService.get).toHaveBeenCalled();
      expect(mockCategoryService.getAll).toHaveBeenCalled();
    });

    it('should handle reset errors', async () => {
      const errorMessage = 'Failed to reset settings';
      mockSettingsService.reset.mockRejectedValue(new Error(errorMessage));

      const { resetSettings } = useSettingsStore.getState();
      
      await expect(resetSettings()).rejects.toThrow();
      expect(useSettingsStore.getState().error).toBe(errorMessage);
    });
  });

  describe('category management', () => {
    describe('addCategory', () => {
      it('should add category successfully', async () => {
        const newCategory: CreateCategory = {
          name: 'New Category',
          color: '#FF0000',
          icon: '🆕',
          isDefault: false
        };

        mockCategoryService.create.mockResolvedValue('new-id');
        mockCategoryService.getAll.mockResolvedValue([mockCategory]);

        const { addCategory } = useSettingsStore.getState();
        await addCategory(newCategory);

        expect(mockCategoryService.create).toHaveBeenCalledWith(newCategory);
        expect(mockCategoryService.getAll).toHaveBeenCalled();
      });

      it('should handle add category errors', async () => {
        const errorMessage = 'Failed to add category';
        mockCategoryService.create.mockRejectedValue(new Error(errorMessage));

        const { addCategory } = useSettingsStore.getState();
        
        await expect(addCategory({
          name: 'New Category',
          color: '#FF0000',
          icon: '🆕',
          isDefault: false
        })).rejects.toThrow();
        expect(useSettingsStore.getState().error).toBe(errorMessage);
      });
    });

    describe('updateCategory', () => {
      it('should update category successfully', async () => {
        useSettingsStore.setState({ categories: [mockCategory] });
        mockCategoryService.update.mockResolvedValue(undefined);

        const updates = { name: 'Updated Category' };
        const { updateCategory } = useSettingsStore.getState();
        await updateCategory('1', updates);

        expect(mockCategoryService.update).toHaveBeenCalledWith('1', updates);
        
        const state = useSettingsStore.getState();
        expect(state.categories[0].name).toBe('Updated Category');
      });

      it('should handle update category errors', async () => {
        useSettingsStore.setState({ categories: [mockCategory] });
        const errorMessage = 'Failed to update category';
        mockCategoryService.update.mockRejectedValue(new Error(errorMessage));
        mockCategoryService.getAll.mockResolvedValue([mockCategory]);

        const { updateCategory } = useSettingsStore.getState();
        
        await expect(updateCategory('1', { name: 'Updated' })).rejects.toThrow();
        expect(mockCategoryService.getAll).toHaveBeenCalled();
      });
    });

    describe('deleteCategory', () => {
      it('should delete category successfully', async () => {
        useSettingsStore.setState({ categories: [mockCustomCategory] });
        mockCategoryService.delete.mockResolvedValue(undefined);

        const { deleteCategory } = useSettingsStore.getState();
        await deleteCategory('2');

        expect(mockCategoryService.delete).toHaveBeenCalledWith('2');
        expect(useSettingsStore.getState().categories).toEqual([]);
      });

      it('should handle delete category errors', async () => {
        const errorMessage = 'Failed to delete category';
        mockCategoryService.delete.mockRejectedValue(new Error(errorMessage));

        const { deleteCategory } = useSettingsStore.getState();
        
        await expect(deleteCategory('2')).rejects.toThrow();
        expect(useSettingsStore.getState().error).toBe(errorMessage);
      });
    });
  });

  describe('computed values', () => {
    beforeEach(() => {
      useSettingsStore.setState({
        categories: [mockCategory, mockCustomCategory],
        settings: mockSettings,
        isLoading: false,
        error: null
      });
    });

    describe('getDefaultCategories', () => {
      it('should return only default categories', () => {
        const { getDefaultCategories } = useSettingsStore.getState();
        const defaults = getDefaultCategories();
        
        expect(defaults).toHaveLength(1);
        expect(defaults[0].id).toBe('1');
        expect(defaults[0].isDefault).toBe(true);
      });
    });

    describe('getCustomCategories', () => {
      it('should return only custom categories', () => {
        const { getCustomCategories } = useSettingsStore.getState();
        const custom = getCustomCategories();
        
        expect(custom).toHaveLength(1);
        expect(custom[0].id).toBe('2');
        expect(custom[0].isDefault).toBe(false);
      });
    });

    describe('getCategoryById', () => {
      it('should return category by ID', () => {
        const { getCategoryById } = useSettingsStore.getState();
        const category = getCategoryById('1');
        
        expect(category).toEqual(mockCategory);
      });

      it('should return undefined for non-existent ID', () => {
        const { getCategoryById } = useSettingsStore.getState();
        const category = getCategoryById('999');
        
        expect(category).toBeUndefined();
      });
    });

    describe('getCategoryByName', () => {
      it('should return category by name (case insensitive)', () => {
        const { getCategoryByName } = useSettingsStore.getState();
        const category = getCategoryByName('test category');
        
        expect(category).toEqual(mockCategory);
      });

      it('should return undefined for non-existent name', () => {
        const { getCategoryByName } = useSettingsStore.getState();
        const category = getCategoryByName('Non-existent');
        
        expect(category).toBeUndefined();
      });
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useSettingsStore.setState({ error: 'Some error' });

      const { clearError } = useSettingsStore.getState();
      clearError();

      expect(useSettingsStore.getState().error).toBe(null);
    });
  });
});