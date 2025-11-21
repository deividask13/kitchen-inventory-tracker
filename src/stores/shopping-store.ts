import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ShoppingService } from '../lib/db';
import type {
  ShoppingListItem,
  ShoppingFilters,
  CreateShoppingListItem,
  UpdateShoppingListItem,
  InventoryItem
} from '../lib/types';

interface ShoppingStore {
  // State
  items: ShoppingListItem[];
  filters: ShoppingFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadItems: () => Promise<void>;
  addItem: (item: CreateShoppingListItem) => Promise<void>;
  updateItem: (id: string, updates: UpdateShoppingListItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleCompleted: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  addFromInventory: (inventoryItems: InventoryItem[]) => Promise<void>;
  setFilters: (filters: Partial<ShoppingFilters>) => void;
  clearError: () => void;

  // Computed values (getters)
  getCompletedItems: () => ShoppingListItem[];
  getPendingItems: () => ShoppingListItem[];
  getItemsByCategory: () => Record<string, ShoppingListItem[]>;
  getFilteredItems: () => ShoppingListItem[];
  getCompletionStats: () => { completed: number; total: number; percentage: number };
}

export const useShoppingStore = create<ShoppingStore>()(
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
        const items = await ShoppingService.getAll(get().filters);
        set({ items, isLoading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to load shopping items',
          isLoading: false 
        });
      }
    },

    addItem: async (item: CreateShoppingListItem) => {
      try {
        set({ error: null });
        await ShoppingService.create(item);
        // Reload items to get the updated list
        await get().loadItems();
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to add shopping item' });
        throw error;
      }
    },

    updateItem: async (id: string, updates: UpdateShoppingListItem) => {
      try {
        set({ error: null });
        await ShoppingService.update(id, updates);
        // Update local state optimistically
        set(state => ({
          items: state.items.map(item => 
            item.id === id 
              ? { ...item, ...updates }
              : item
          )
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update shopping item';
        set({ error: errorMessage });
        // Reload items to revert optimistic update
        const items = await ShoppingService.getAll(get().filters);
        set({ items });
        throw error;
      }
    },

    deleteItem: async (id: string) => {
      try {
        set({ error: null });
        await ShoppingService.delete(id);
        // Remove from local state
        set(state => ({
          items: state.items.filter(item => item.id !== id)
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to delete shopping item' });
        throw error;
      }
    },

    toggleCompleted: async (id: string) => {
      try {
        set({ error: null });
        await ShoppingService.toggleCompleted(id);
        // Update local state optimistically
        set(state => ({
          items: state.items.map(item => 
            item.id === id 
              ? { 
                  ...item, 
                  isCompleted: !item.isCompleted,
                  completedAt: !item.isCompleted ? new Date() : undefined
                }
              : item
          )
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to toggle item completion';
        set({ error: errorMessage });
        // Reload items to revert optimistic update
        const items = await ShoppingService.getAll(get().filters);
        set({ items });
        throw error;
      }
    },

    clearCompleted: async () => {
      try {
        set({ error: null });
        await ShoppingService.clearCompleted();
        // Remove completed items from local state
        set(state => ({
          items: state.items.filter(item => !item.isCompleted)
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to clear completed items' });
        throw error;
      }
    },

    addFromInventory: async (inventoryItems: InventoryItem[]) => {
      try {
        set({ error: null });
        await ShoppingService.addFromInventory(inventoryItems);
        // Reload items to get the updated list
        await get().loadItems();
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to add items from inventory' });
        throw error;
      }
    },

    setFilters: (newFilters: Partial<ShoppingFilters>) => {
      set(state => ({
        filters: { ...state.filters, ...newFilters }
      }));
      // Reload items with new filters
      get().loadItems();
    },

    clearError: () => set({ error: null }),

    // Computed values
    getCompletedItems: () => {
      return get().items.filter(item => item.isCompleted);
    },

    getPendingItems: () => {
      return get().items.filter(item => !item.isCompleted);
    },

    getItemsByCategory: () => {
      const items = get().items;
      return items.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {} as Record<string, ShoppingListItem[]>);
    },

    getFilteredItems: () => {
      const { items, filters } = get();
      let filtered = items;

      if (filters.category) {
        filtered = filtered.filter(item => item.category === filters.category);
      }

      if (filters.completed !== undefined) {
        filtered = filtered.filter(item => item.isCompleted === filters.completed);
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm) ||
          item.notes?.toLowerCase().includes(searchTerm)
        );
      }

      return filtered;
    },

    getCompletionStats: () => {
      const items = get().items;
      const completed = items.filter(item => item.isCompleted).length;
      const total = items.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return { completed, total, percentage };
    }
  }))
);