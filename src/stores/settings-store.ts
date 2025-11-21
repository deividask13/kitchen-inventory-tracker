import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { SettingsService, CategoryService } from '../lib/db';
import type {
  UserSettings,
  Category,
  UpdateUserSettings,
  CreateCategory,
  UpdateCategory
} from '../lib/types';

interface SettingsStore {
  // State
  settings: UserSettings | null;
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  hasCompletedOnboarding: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  loadCategories: () => Promise<void>;
  updateSettings: (updates: UpdateUserSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
  setHasCompletedOnboarding: (completed: boolean) => void;
  
  // Category management
  addCategory: (category: CreateCategory) => Promise<void>;
  updateCategory: (id: string, updates: UpdateCategory) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  clearError: () => void;

  // Computed values (getters)
  getDefaultCategories: () => Category[];
  getCustomCategories: () => Category[];
  getCategoryById: (id: string) => Category | undefined;
  getCategoryByName: (name: string) => Category | undefined;
}

// Default categories that should be created on first run
const DEFAULT_CATEGORIES: CreateCategory[] = [
  { name: 'Produce', color: '#10B981', icon: '🥬', isDefault: true },
  { name: 'Dairy', color: '#F59E0B', icon: '🥛', isDefault: true },
  { name: 'Meat & Seafood', color: '#EF4444', icon: '🥩', isDefault: true },
  { name: 'Pantry Staples', color: '#8B5CF6', icon: '🥫', isDefault: true },
  { name: 'Frozen', color: '#06B6D4', icon: '🧊', isDefault: true },
  { name: 'Beverages', color: '#F97316', icon: '🥤', isDefault: true },
  { name: 'Snacks', color: '#84CC16', icon: '🍿', isDefault: true },
  { name: 'Condiments', color: '#6366F1', icon: '🍯', isDefault: true }
];

export const useSettingsStore = create<SettingsStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    settings: null,
    categories: [],
    isLoading: false,
    error: null,
    hasCompletedOnboarding: typeof window !== 'undefined' 
      ? localStorage.getItem('hasCompletedOnboarding') === 'true'
      : false,

    // Actions
    loadSettings: async () => {
      try {
        set({ isLoading: true, error: null });
        let settings = await SettingsService.get();
        
        // If no settings exist, create defaults
        if (!settings) {
          await SettingsService.update({
            lowStockThreshold: 5,
            expirationWarningDays: 7,
            defaultLocation: 'pantry',
            preferredUnits: ['pieces', 'lbs', 'oz', 'cups', 'liters', 'ml'],
            categories: [],
            theme: 'system',
            reducedMotion: false
          });
          settings = await SettingsService.get();
        }
        
        set({ settings, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to load settings',
          isLoading: false 
        });
      }
    },

    loadCategories: async () => {
      try {
        set({ error: null });
        let categories = await CategoryService.getAll();
        
        // If no categories exist, create defaults
        if (categories.length === 0) {
          for (const category of DEFAULT_CATEGORIES) {
            await CategoryService.create(category);
          }
          categories = await CategoryService.getAll();
        }
        
        set({ categories });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to load categories' });
      }
    },

    updateSettings: async (updates: UpdateUserSettings) => {
      try {
        set({ error: null });
        await SettingsService.update(updates);
        
        // Update local state optimistically
        set(state => ({
          settings: state.settings ? { ...state.settings, ...updates } : null
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to update settings' });
        // Reload settings to revert optimistic update
        await get().loadSettings();
        throw error;
      }
    },

    resetSettings: async () => {
      try {
        set({ error: null });
        await SettingsService.reset();
        await get().loadSettings();
        await get().loadCategories();
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to reset settings' });
        throw error;
      }
    },

    setHasCompletedOnboarding: (completed: boolean) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hasCompletedOnboarding', String(completed));
      }
      set({ hasCompletedOnboarding: completed });
    },

    // Category management
    addCategory: async (category: CreateCategory) => {
      try {
        set({ error: null });
        await CategoryService.create(category);
        // Reload categories to get the updated list
        await get().loadCategories();
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to add category' });
        throw error;
      }
    },

    updateCategory: async (id: string, updates: UpdateCategory) => {
      try {
        set({ error: null });
        await CategoryService.update(id, updates);
        
        // Update local state optimistically
        set(state => ({
          categories: state.categories.map(category => 
            category.id === id 
              ? { ...category, ...updates }
              : category
          )
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to update category' });
        // Reload categories to revert optimistic update
        await get().loadCategories();
        throw error;
      }
    },

    deleteCategory: async (id: string) => {
      try {
        set({ error: null });
        await CategoryService.delete(id);
        
        // Remove from local state
        set(state => ({
          categories: state.categories.filter(category => category.id !== id)
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to delete category' });
        throw error;
      }
    },

    clearError: () => set({ error: null }),

    // Computed values
    getDefaultCategories: () => {
      return get().categories.filter(category => category.isDefault);
    },

    getCustomCategories: () => {
      return get().categories.filter(category => !category.isDefault);
    },

    getCategoryById: (id: string) => {
      return get().categories.find(category => category.id === id);
    },

    getCategoryByName: (name: string) => {
      return get().categories.find(category => 
        category.name.toLowerCase() === name.toLowerCase()
      );
    }
  }))
);