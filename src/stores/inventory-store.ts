import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { InventoryService, SettingsService } from '../lib/db';
import { fuzzySearchItems } from '../lib/utils/fuzzy-search';
import type {
  InventoryItem,
  InventoryFilters,
  CreateInventoryItem,
  UpdateInventoryItem
} from '../lib/types';

interface InventoryStore {
  // State
  items: InventoryItem[];
  filters: InventoryFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadItems: () => Promise<void>;
  addItem: (item: CreateInventoryItem) => Promise<void>;
  updateItem: (id: string, updates: UpdateInventoryItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  markAsUsed: (id: string, quantityUsed: number) => Promise<void>;
  markAsFinished: (id: string) => Promise<void>;
  setFilters: (filters: Partial<InventoryFilters>) => void;
  clearError: () => void;

  // Computed values (getters)
  getExpiringItems: () => InventoryItem[];
  getLowStockItems: () => InventoryItem[];
  getItemsByLocation: () => Record<string, InventoryItem[]>;
  getFilteredItems: () => InventoryItem[];
}

export const useInventoryStore = create<InventoryStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    items: [],
    filters: {},
    isLoading: false,
    error: null,

    // Actions
    loadItems: async () => {
      try {
        set({ isLoading: true, error: null });
        const items = await InventoryService.getAll();
        set({ items, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to load items',
          isLoading: false 
        });
      }
    },

    addItem: async (item: CreateInventoryItem) => {
      try {
        set({ error: null });
        const id = await InventoryService.create(item);
        
        // Get settings for low stock threshold calculation
        const settings = await SettingsService.get();
        const threshold = settings?.lowStockThreshold || 5;
        
        // Create the new item locally with calculated fields
        const newItem: InventoryItem = {
          ...item,
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          isLow: item.quantity <= threshold,
          isFinished: item.quantity <= 0
        };
        
        // Add to local state immediately
        set(state => ({
          items: [...state.items, newItem]
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to add item' });
        throw error;
      }
    },

    updateItem: async (id: string, updates: UpdateInventoryItem) => {
      // Save previous state for rollback
      const previousItems = get().items;
      
      try {
        set({ error: null });
        
        // Apply optimistic update
        set(state => ({
          items: state.items.map(item => 
            item.id === id 
              ? { ...item, ...updates, updatedAt: new Date() }
              : item
          )
        }));
        
        // Perform database update
        await InventoryService.update(id, updates);
      } catch (error) {
        // Revert to previous state immediately
        set({ 
          items: previousItems,
          error: error instanceof Error ? error.message : 'Failed to update item' 
        });
        throw error;
      }
    },

    deleteItem: async (id: string) => {
      try {
        set({ error: null });
        await InventoryService.delete(id);
        // Remove from local state
        set(state => ({
          items: state.items.filter(item => item.id !== id)
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to delete item' });
        throw error;
      }
    },

    markAsUsed: async (id: string, quantityUsed: number) => {
      // Save previous state for rollback
      const previousItems = get().items;
      
      try {
        set({ error: null });
        
        // Get current item and settings for threshold calculation
        const currentItem = get().items.find(item => item.id === id);
        if (!currentItem) {
          throw new Error('Item not found');
        }
        
        const settings = await SettingsService.get();
        const threshold = settings?.lowStockThreshold || 5;
        
        // Calculate new quantity
        const newQuantity = Math.max(0, currentItem.quantity - quantityUsed);
        
        // Update local state immediately with calculated values
        set(state => ({
          items: state.items.map(item => 
            item.id === id 
              ? {
                  ...item,
                  quantity: newQuantity,
                  lastUsed: new Date(),
                  updatedAt: new Date(),
                  isLow: newQuantity <= threshold,
                  isFinished: newQuantity <= 0
                }
              : item
          )
        }));
        
        // Perform database update
        await InventoryService.markAsUsed(id, quantityUsed);
      } catch (error) {
        // Revert to previous state immediately
        set({ 
          items: previousItems,
          error: error instanceof Error ? error.message : 'Failed to mark item as used' 
        });
        throw error;
      }
    },

    markAsFinished: async (id: string) => {
      // Save previous state for rollback
      const previousItems = get().items;
      
      try {
        set({ error: null });
        
        // Get current item for validation
        const currentItem = get().items.find(item => item.id === id);
        if (!currentItem) {
          throw new Error('Item not found');
        }
        
        // Update local state immediately with calculated values
        set(state => ({
          items: state.items.map(item => 
            item.id === id 
              ? {
                  ...item,
                  quantity: 0,
                  lastUsed: new Date(),
                  updatedAt: new Date(),
                  isLow: true,
                  isFinished: true
                }
              : item
          )
        }));
        
        // Perform database update
        await InventoryService.markAsFinished(id);
      } catch (error) {
        // Revert to previous state immediately
        set({ 
          items: previousItems,
          error: error instanceof Error ? error.message : 'Failed to mark item as finished' 
        });
        throw error;
      }
    },

    setFilters: (newFilters: Partial<InventoryFilters>) => {
      set(state => ({
        filters: { ...state.filters, ...newFilters }
      }));
      // No longer reload items - filtering is done client-side in getFilteredItems()
    },

    clearError: () => set({ error: null }),

    // Computed values
    getExpiringItems: () => {
      const items = get().items;
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      
      return items
        .filter(item => 
          item.expirationDate !== null && 
          item.expirationDate <= weekFromNow && 
          !item.isFinished
        )
        .sort((a, b) => {
          if (!a.expirationDate || !b.expirationDate) return 0;
          return a.expirationDate.getTime() - b.expirationDate.getTime();
        });
    },

    getLowStockItems: () => {
      return get().items.filter(item => item.isLow && !item.isFinished);
    },

    getItemsByLocation: () => {
      const items = get().items.filter(item => !item.isFinished);
      return items.reduce((acc, item) => {
        if (!acc[item.location]) {
          acc[item.location] = [];
        }
        acc[item.location].push(item);
        return acc;
      }, {} as Record<string, InventoryItem[]>);
    },

    getFilteredItems: () => {
      const { items, filters } = get();
      let filtered = items;

      // Apply location filter
      if (filters.location) {
        filtered = filtered.filter(item => item.location === filters.location);
      }

      // Apply category filter
      if (filters.category) {
        filtered = filtered.filter(item => item.category === filters.category);
      }

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        
        switch (filters.status) {
          case 'expiring':
            filtered = filtered.filter(item => 
              item.expirationDate !== null && 
              item.expirationDate <= weekFromNow && 
              !item.isFinished
            );
            break;
          case 'low':
            filtered = filtered.filter(item => item.isLow && !item.isFinished);
            break;
          case 'finished':
            filtered = filtered.filter(item => item.isFinished);
            break;
        }
      }

      // Apply fuzzy search filter
      if (filters.search) {
        filtered = fuzzySearchItems(filtered, filters.search);
      }

      return filtered;
    }
  }))
);