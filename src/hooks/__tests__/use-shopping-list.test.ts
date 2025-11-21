import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useShoppingList } from '../use-shopping-list';
import { useShoppingStore } from '@/stores/shopping-store';
import { useInventoryStore } from '@/stores/inventory-store';

// Mock the stores
vi.mock('@/stores/shopping-store');
vi.mock('@/stores/inventory-store');

const mockShoppingStore = {
  items: [],
  isLoading: false,
  error: null,
  loadItems: vi.fn(),
  addItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  toggleCompleted: vi.fn(),
  clearCompleted: vi.fn(),
  addFromInventory: vi.fn(),
  clearError: vi.fn(),
  getCompletedItems: vi.fn(() => []),
  getPendingItems: vi.fn(() => []),
  getItemsByCategory: vi.fn(() => ({})),
  getFilteredItems: vi.fn(() => []),
  getCompletionStats: vi.fn(() => ({ completed: 0, total: 0, percentage: 0 })),
};

const mockInventoryStore = {
  items: [],
  loadItems: vi.fn(),
  getLowStockItems: vi.fn(() => []),
};

const mockShoppingItems = [
  {
    id: '1',
    name: 'Milk',
    quantity: 2,
    unit: 'liters',
    category: 'Dairy',
    isCompleted: false,
    addedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Bread',
    quantity: 1,
    unit: 'loaf',
    category: 'Bakery',
    isCompleted: true,
    addedAt: new Date('2024-01-02'),
  },
];

const mockInventoryItems = [
  {
    id: 'inv-1',
    name: 'Eggs',
    quantity: 1,
    unit: 'dozen',
    category: 'Dairy',
    location: 'fridge' as const,
    expirationDate: new Date('2024-02-01'),
    purchaseDate: new Date('2024-01-01'),
    isLow: true,
    isFinished: false,
    lastUsed: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'inv-2',
    name: 'Cheese',
    quantity: 200,
    unit: 'g',
    category: 'Dairy',
    location: 'fridge' as const,
    expirationDate: new Date('2024-02-15'),
    purchaseDate: new Date('2024-01-10'),
    isLow: false,
    isFinished: false,
    lastUsed: null,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

describe('useShoppingList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    vi.mocked(useShoppingStore).mockReturnValue(mockShoppingStore);
    vi.mocked(useInventoryStore).mockReturnValue(mockInventoryStore);
  });

  it('loads data on mount', () => {
    renderHook(() => useShoppingList());

    expect(mockShoppingStore.loadItems).toHaveBeenCalled();
    expect(mockInventoryStore.loadItems).toHaveBeenCalled();
  });

  it('returns shopping store state and methods', () => {
    const { result } = renderHook(() => useShoppingList());

    expect(result.current.items).toBe(mockShoppingStore.items);
    expect(result.current.isLoading).toBe(mockShoppingStore.isLoading);
    expect(result.current.error).toBe(mockShoppingStore.error);
    expect(result.current.clearError).toBe(mockShoppingStore.clearError);
  });

  it('returns computed values from store', () => {
    const mockCompletedItems = [mockShoppingItems[1]];
    const mockPendingItems = [mockShoppingItems[0]];
    const mockItemsByCategory = { Dairy: [mockShoppingItems[0]], Bakery: [mockShoppingItems[1]] };
    const mockStats = { completed: 1, total: 2, percentage: 50 };

    mockShoppingStore.getCompletedItems.mockReturnValue(mockCompletedItems);
    mockShoppingStore.getPendingItems.mockReturnValue(mockPendingItems);
    mockShoppingStore.getItemsByCategory.mockReturnValue(mockItemsByCategory);
    mockShoppingStore.getCompletionStats.mockReturnValue(mockStats);

    const { result } = renderHook(() => useShoppingList());

    expect(result.current.completedItems).toBe(mockCompletedItems);
    expect(result.current.pendingItems).toBe(mockPendingItems);
    expect(result.current.itemsByCategory).toBe(mockItemsByCategory);
    expect(result.current.completionStats).toBe(mockStats);
  });

  describe('addItemToList', () => {
    it('adds new item when no duplicate exists', async () => {
      mockShoppingStore.items = [];
      mockShoppingStore.addItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useShoppingList());
      const newItem = {
        name: 'New Item',
        quantity: 1,
        unit: 'piece',
        category: 'Other',
        isCompleted: false,
      };

      await act(async () => {
        await result.current.addItem(newItem);
      });

      expect(mockShoppingStore.addItem).toHaveBeenCalledWith(newItem);
      expect(mockShoppingStore.updateItem).not.toHaveBeenCalled();
    });

    it('updates existing item when duplicate exists', async () => {
      mockShoppingStore.items = [mockShoppingItems[0]];
      mockShoppingStore.updateItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useShoppingList());
      const duplicateItem = {
        name: 'Milk', // Same name as existing item
        quantity: 1,
        unit: 'liters',
        category: 'Dairy', // Same category
        isCompleted: false,
      };

      await act(async () => {
        await result.current.addItem(duplicateItem);
      });

      expect(mockShoppingStore.updateItem).toHaveBeenCalledWith('1', {
        quantity: 3, // 2 + 1
        notes: undefined,
      });
      expect(mockShoppingStore.addItem).not.toHaveBeenCalled();
    });
  });

  describe('addLowStockItemsToList', () => {
    it('adds low stock items that are not already in shopping list', async () => {
      const lowStockItems = [mockInventoryItems[0]]; // Eggs
      mockInventoryStore.getLowStockItems.mockReturnValue(lowStockItems);
      mockShoppingStore.items = []; // Empty shopping list
      mockShoppingStore.addFromInventory.mockResolvedValue(undefined);

      const { result } = renderHook(() => useShoppingList());

      await act(async () => {
        await result.current.addLowStockItemsToList();
      });

      expect(mockShoppingStore.addFromInventory).toHaveBeenCalledWith(lowStockItems);
    });

    it('does not add items that are already in shopping list', async () => {
      const lowStockItems = [mockInventoryItems[0]]; // Eggs
      mockInventoryStore.getLowStockItems.mockReturnValue(lowStockItems);
      mockShoppingStore.items = [
        { ...mockShoppingItems[0], name: 'Eggs' } // Already in shopping list
      ];

      const { result } = renderHook(() => useShoppingList());

      await act(async () => {
        await result.current.addLowStockItemsToList();
      });

      expect(mockShoppingStore.addFromInventory).not.toHaveBeenCalled();
    });

    it('automatically adds low stock items when inventory changes', async () => {
      const lowStockItems = [mockInventoryItems[0]];
      mockInventoryStore.getLowStockItems.mockReturnValue(lowStockItems);
      mockInventoryStore.items = mockInventoryItems;
      mockShoppingStore.items = [];
      mockShoppingStore.addFromInventory.mockResolvedValue(undefined);

      renderHook(() => useShoppingList());

      await waitFor(() => {
        expect(mockShoppingStore.addFromInventory).toHaveBeenCalledWith(lowStockItems);
      });
    });
  });

  describe('batch operations', () => {
    it('addMultipleItems adds all items', async () => {
      mockShoppingStore.items = [];
      mockShoppingStore.addItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useShoppingList());
      const items = [
        { name: 'Item 1', quantity: 1, unit: 'piece', category: 'Other', isCompleted: false },
        { name: 'Item 2', quantity: 2, unit: 'pieces', category: 'Other', isCompleted: false },
      ];

      await act(async () => {
        await result.current.addMultipleItems(items);
      });

      expect(mockShoppingStore.addItem).toHaveBeenCalledTimes(2);
    });

    it('toggleMultipleCompleted toggles all items', async () => {
      mockShoppingStore.toggleCompleted.mockResolvedValue(undefined);

      const { result } = renderHook(() => useShoppingList());
      const itemIds = ['1', '2', '3'];

      await act(async () => {
        await result.current.toggleMultipleCompleted(itemIds);
      });

      expect(mockShoppingStore.toggleCompleted).toHaveBeenCalledTimes(3);
      expect(mockShoppingStore.toggleCompleted).toHaveBeenCalledWith('1');
      expect(mockShoppingStore.toggleCompleted).toHaveBeenCalledWith('2');
      expect(mockShoppingStore.toggleCompleted).toHaveBeenCalledWith('3');
    });

    it('deleteMultipleItems deletes all items', async () => {
      mockShoppingStore.deleteItem.mockResolvedValue(undefined);

      const { result } = renderHook(() => useShoppingList());
      const itemIds = ['1', '2'];

      await act(async () => {
        await result.current.deleteMultipleItems(itemIds);
      });

      expect(mockShoppingStore.deleteItem).toHaveBeenCalledTimes(2);
      expect(mockShoppingStore.deleteItem).toHaveBeenCalledWith('1');
      expect(mockShoppingStore.deleteItem).toHaveBeenCalledWith('2');
    });
  });

  describe('helper functions', () => {
    it('getItemSuggestions returns filtered inventory items', () => {
      mockInventoryStore.items = mockInventoryItems;

      const { result } = renderHook(() => useShoppingList());
      const suggestions = result.current.getItemSuggestions('egg');

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].name).toBe('Eggs');
    });

    it('getItemSuggestions returns empty array for short search terms', () => {
      mockInventoryStore.items = mockInventoryItems;

      const { result } = renderHook(() => useShoppingList());
      const suggestions = result.current.getItemSuggestions('e');

      expect(suggestions).toHaveLength(0);
    });

    it('getAvailableCategories returns unique categories', () => {
      mockInventoryStore.items = mockInventoryItems;

      const { result } = renderHook(() => useShoppingList());
      const categories = result.current.getAvailableCategories();

      expect(categories).toContain('Dairy');
      expect(categories).toContain('Produce'); // Default category
      expect(categories).toContain('Other'); // Default category
    });

    it('getAvailableUnits returns unique units', () => {
      mockInventoryStore.items = mockInventoryItems;

      const { result } = renderHook(() => useShoppingList());
      const units = result.current.getAvailableUnits();

      expect(units).toContain('dozen');
      expect(units).toContain('g');
      expect(units).toContain('pieces'); // Default unit
      expect(units).toContain('lbs'); // Default unit
    });
  });

  it('provides access to inventory items', () => {
    mockInventoryStore.items = mockInventoryItems;

    const { result } = renderHook(() => useShoppingList());

    expect(result.current.inventoryItems).toBe(mockInventoryItems);
  });
});