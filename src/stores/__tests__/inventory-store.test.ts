import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useInventoryStore } from '../inventory-store';
import { InventoryService, SettingsService } from '../../lib/db';
import type { InventoryItem, CreateInventoryItem } from '../../lib/types';

// Mock the InventoryService and SettingsService
vi.mock('../../lib/db', () => ({
  InventoryService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    markAsUsed: vi.fn(),
    markAsFinished: vi.fn()
  },
  SettingsService: {
    get: vi.fn()
  }
}));

const mockInventoryService = InventoryService as any;
const mockSettingsService = { get: vi.fn() };

describe('InventoryStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useInventoryStore.setState({
      items: [],
      filters: {},
      isLoading: false,
      error: null
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockItem: InventoryItem = {
    id: '1',
    name: 'Test Item',
    quantity: 10,
    unit: 'pieces',
    expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    location: 'pantry',
    purchaseDate: new Date('2024-01-01'),
    category: 'Test Category',
    isLow: false,
    isFinished: false,
    lastUsed: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockCreateItem: CreateInventoryItem = {
    name: 'New Item',
    quantity: 5,
    unit: 'pieces',
    expirationDate: new Date('2024-12-31'),
    location: 'fridge',
    purchaseDate: new Date(),
    category: 'Test Category',
    lastUsed: null
  };

  describe('loadItems', () => {
    it('should load items successfully', async () => {
      mockInventoryService.getAll.mockResolvedValue([mockItem]);

      const { loadItems } = useInventoryStore.getState();
      await loadItems();

      const state = useInventoryStore.getState();
      expect(state.items).toEqual([mockItem]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(mockInventoryService.getAll).toHaveBeenCalledWith();
    });

    it('should handle loading errors', async () => {
      const errorMessage = 'Failed to load';
      mockInventoryService.getAll.mockRejectedValue(new Error(errorMessage));

      const { loadItems } = useInventoryStore.getState();
      await loadItems();

      const state = useInventoryStore.getState();
      expect(state.items).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should set loading state during operation', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => { resolvePromise = resolve; });
      mockInventoryService.getAll.mockReturnValue(promise);

      const { loadItems } = useInventoryStore.getState();
      const loadPromise = loadItems();

      // Check loading state is true during operation
      expect(useInventoryStore.getState().isLoading).toBe(true);

      resolvePromise!([mockItem]);
      await loadPromise;

      // Check loading state is false after completion
      expect(useInventoryStore.getState().isLoading).toBe(false);
    });
  });

  describe('addItem', () => {
    it('should add item successfully', async () => {
      mockInventoryService.create.mockResolvedValue('new-id');
      (SettingsService.get as any).mockResolvedValue({ lowStockThreshold: 5 });

      const { addItem } = useInventoryStore.getState();
      await addItem(mockCreateItem);

      expect(mockInventoryService.create).toHaveBeenCalledWith(mockCreateItem);
      // Should NOT call getById anymore - optimistic update
      expect(mockInventoryService.getById).not.toHaveBeenCalled();
      
      const state = useInventoryStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe('new-id');
      expect(state.items[0].name).toBe('New Item');
    });

    it('should handle add errors', async () => {
      const errorMessage = 'Failed to add';
      mockInventoryService.create.mockRejectedValue(new Error(errorMessage));

      const { addItem } = useInventoryStore.getState();
      
      await expect(addItem(mockCreateItem)).rejects.toThrow();
      expect(useInventoryStore.getState().error).toBe(errorMessage);
    });
  });

  describe('updateItem', () => {
    it('should update item successfully', async () => {
      useInventoryStore.setState({ items: [mockItem] });
      mockInventoryService.update.mockResolvedValue(undefined);

      const updates = { quantity: 15 };
      const { updateItem } = useInventoryStore.getState();
      await updateItem('1', updates);

      expect(mockInventoryService.update).toHaveBeenCalledWith('1', updates);
      
      const state = useInventoryStore.getState();
      expect(state.items[0].quantity).toBe(15);
      expect(state.error).toBe(null);
    });

    it('should handle update errors and revert optimistic changes', async () => {
      const originalItem = { ...mockItem };
      useInventoryStore.setState({ items: [originalItem] });
      const errorMessage = 'Failed to update';
      mockInventoryService.update.mockRejectedValue(new Error(errorMessage));

      const { updateItem } = useInventoryStore.getState();
      
      await expect(updateItem('1', { quantity: 15 })).rejects.toThrow();
      
      // Should revert to original state
      const state = useInventoryStore.getState();
      expect(state.items[0].quantity).toBe(10); // Original quantity
      expect(state.error).toBe(errorMessage);
      // Should NOT reload from database
      expect(mockInventoryService.getAll).not.toHaveBeenCalled();
    });
  });

  describe('deleteItem', () => {
    it('should delete item successfully', async () => {
      useInventoryStore.setState({ items: [mockItem] });
      mockInventoryService.delete.mockResolvedValue(undefined);

      const { deleteItem } = useInventoryStore.getState();
      await deleteItem('1');

      expect(mockInventoryService.delete).toHaveBeenCalledWith('1');
      expect(useInventoryStore.getState().items).toEqual([]);
    });

    it('should handle delete errors', async () => {
      useInventoryStore.setState({ items: [mockItem] });
      const errorMessage = 'Failed to delete';
      mockInventoryService.delete.mockRejectedValue(new Error(errorMessage));

      const { deleteItem } = useInventoryStore.getState();
      
      await expect(deleteItem('1')).rejects.toThrow();
      expect(useInventoryStore.getState().error).toBe(errorMessage);
    });
  });

  describe('markAsUsed', () => {
    it('should mark item as used successfully', async () => {
      useInventoryStore.setState({ items: [mockItem] });
      mockInventoryService.markAsUsed.mockResolvedValue(undefined);
      (SettingsService.get as any).mockResolvedValue({ lowStockThreshold: 5 });

      const { markAsUsed } = useInventoryStore.getState();
      await markAsUsed('1', 2);

      expect(mockInventoryService.markAsUsed).toHaveBeenCalledWith('1', 2);
      // Should NOT call getById anymore - optimistic update
      expect(mockInventoryService.getById).not.toHaveBeenCalled();
      
      const state = useInventoryStore.getState();
      expect(state.items[0].quantity).toBe(8);
      expect(state.items[0].lastUsed).toBeDefined();
    });

    it('should handle markAsUsed errors and revert optimistic changes', async () => {
      const originalItem = { ...mockItem };
      useInventoryStore.setState({ items: [originalItem] });
      const errorMessage = 'Failed to mark as used';
      mockInventoryService.markAsUsed.mockRejectedValue(new Error(errorMessage));
      (SettingsService.get as any).mockResolvedValue({ lowStockThreshold: 5 });

      const { markAsUsed } = useInventoryStore.getState();
      
      await expect(markAsUsed('1', 2)).rejects.toThrow();
      
      // Should revert to original state
      const state = useInventoryStore.getState();
      expect(state.items[0].quantity).toBe(10); // Original quantity
      expect(state.items[0].lastUsed).toBe(null); // Original lastUsed
      expect(state.error).toBe(errorMessage);
      // Should NOT reload from database
      expect(mockInventoryService.getAll).not.toHaveBeenCalled();
    });

    it('should handle item not found error', async () => {
      useInventoryStore.setState({ items: [mockItem] });

      const { markAsUsed } = useInventoryStore.getState();
      
      await expect(markAsUsed('non-existent-id', 2)).rejects.toThrow('Item not found');
      expect(useInventoryStore.getState().error).toBe('Item not found');
    });
  });

  describe('markAsFinished', () => {
    it('should mark item as finished successfully', async () => {
      useInventoryStore.setState({ items: [mockItem] });
      mockInventoryService.markAsFinished.mockResolvedValue(undefined);

      const { markAsFinished } = useInventoryStore.getState();
      await markAsFinished('1');

      expect(mockInventoryService.markAsFinished).toHaveBeenCalledWith('1');
      // Should NOT call getById anymore - optimistic update
      expect(mockInventoryService.getById).not.toHaveBeenCalled();
      
      const state = useInventoryStore.getState();
      expect(state.items[0].isFinished).toBe(true);
      expect(state.items[0].quantity).toBe(0);
      expect(state.items[0].lastUsed).toBeDefined();
    });

    it('should handle markAsFinished errors and revert optimistic changes', async () => {
      const originalItem = { ...mockItem };
      useInventoryStore.setState({ items: [originalItem] });
      const errorMessage = 'Failed to mark as finished';
      mockInventoryService.markAsFinished.mockRejectedValue(new Error(errorMessage));

      const { markAsFinished } = useInventoryStore.getState();
      
      await expect(markAsFinished('1')).rejects.toThrow();
      
      // Should revert to original state
      const state = useInventoryStore.getState();
      expect(state.items[0].quantity).toBe(10); // Original quantity
      expect(state.items[0].isFinished).toBe(false); // Original isFinished
      expect(state.items[0].lastUsed).toBe(null); // Original lastUsed
      expect(state.error).toBe(errorMessage);
      // Should NOT reload from database
      expect(mockInventoryService.getAll).not.toHaveBeenCalled();
    });

    it('should handle item not found error', async () => {
      useInventoryStore.setState({ items: [mockItem] });

      const { markAsFinished } = useInventoryStore.getState();
      
      await expect(markAsFinished('non-existent-id')).rejects.toThrow('Item not found');
      expect(useInventoryStore.getState().error).toBe('Item not found');
    });
  });

  describe('setFilters', () => {
    it('should update filters without reloading items', async () => {
      const { setFilters } = useInventoryStore.getState();
      setFilters({ location: 'fridge' });

      const state = useInventoryStore.getState();
      expect(state.filters.location).toBe('fridge');
      // Should NOT call getAll when filters change
      expect(mockInventoryService.getAll).not.toHaveBeenCalled();
    });
  });

  describe('computed values', () => {
    const expiringItem: InventoryItem = {
      ...mockItem,
      id: '2',
      name: 'Expiring Item',
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      isFinished: false
    };

    const nonExpiringItem: InventoryItem = {
      ...mockItem,
      id: '6',
      name: 'Non-Expiring Item',
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isFinished: false
    };

    const lowStockItem: InventoryItem = {
      ...mockItem,
      id: '3',
      name: 'Low Stock Item',
      isLow: true,
      isFinished: false
    };

    const finishedItem: InventoryItem = {
      ...mockItem,
      id: '4',
      name: 'Finished Item',
      isFinished: true
    };

    beforeEach(() => {
      useInventoryStore.setState({
        items: [mockItem, expiringItem, lowStockItem, finishedItem, nonExpiringItem],
        filters: {},
        isLoading: false,
        error: null
      });
    });

    describe('getExpiringItems', () => {
      it('should return items expiring within 7 days', () => {
        const { getExpiringItems } = useInventoryStore.getState();
        const expiring = getExpiringItems();
        
        expect(expiring).toHaveLength(1);
        expect(expiring[0].id).toBe('2');
      });

      it('should sort by expiration date', () => {
        const soonExpiring: InventoryItem = {
          ...mockItem,
          id: '5',
          expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
          isFinished: false
        };

        useInventoryStore.setState({
          items: [mockItem, expiringItem, soonExpiring, lowStockItem, finishedItem, nonExpiringItem]
        });

        const { getExpiringItems } = useInventoryStore.getState();
        const expiring = getExpiringItems();
        
        expect(expiring).toHaveLength(2);
        expect(expiring[0].id).toBe('5'); // Should be first (expires sooner)
        expect(expiring[1].id).toBe('2');
      });
    });

    describe('getLowStockItems', () => {
      it('should return low stock items that are not finished', () => {
        const { getLowStockItems } = useInventoryStore.getState();
        const lowStock = getLowStockItems();
        
        expect(lowStock).toHaveLength(1);
        expect(lowStock[0].id).toBe('3');
      });
    });

    describe('getItemsByLocation', () => {
      it('should group items by location excluding finished items', () => {
        const fridgeItem: InventoryItem = {
          ...mockItem,
          id: '5',
          location: 'fridge',
          isFinished: false
        };

        useInventoryStore.setState({
          items: [mockItem, fridgeItem, finishedItem]
        });

        const { getItemsByLocation } = useInventoryStore.getState();
        const byLocation = getItemsByLocation();
        
        expect(byLocation.pantry).toHaveLength(1);
        expect(byLocation.fridge).toHaveLength(1);
        expect(byLocation.pantry[0].id).toBe('1');
        expect(byLocation.fridge[0].id).toBe('5');
      });
    });

    describe('getFilteredItems', () => {
      it('should filter by location', () => {
        useInventoryStore.setState({
          filters: { location: 'pantry' }
        });

        const { getFilteredItems } = useInventoryStore.getState();
        const filtered = getFilteredItems();
        
        expect(filtered.every(item => item.location === 'pantry')).toBe(true);
      });

      it('should filter by status', () => {
        useInventoryStore.setState({
          filters: { status: 'low' }
        });

        const { getFilteredItems } = useInventoryStore.getState();
        const filtered = getFilteredItems();
        
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('3');
      });

      it('should filter by search term', () => {
        // Create a unique item for search testing
        const searchableItem: InventoryItem = {
          ...mockItem,
          id: '7',
          name: 'Unique Searchable Item',
          isFinished: false
        };

        useInventoryStore.setState({
          items: [mockItem, expiringItem, lowStockItem, finishedItem, nonExpiringItem, searchableItem],
          filters: { search: 'Unique Searchable' }
        });

        const { getFilteredItems } = useInventoryStore.getState();
        const filtered = getFilteredItems();
        
        expect(filtered).toHaveLength(1);
        expect(filtered[0].id).toBe('7');
      });
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useInventoryStore.setState({ error: 'Some error' });

      const { clearError } = useInventoryStore.getState();
      clearError();

      expect(useInventoryStore.getState().error).toBe(null);
    });
  });
});