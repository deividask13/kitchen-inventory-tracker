import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useShoppingStore } from '../shopping-store';
import { ShoppingService } from '@/lib/db';
import { ShoppingListItem, InventoryItem } from '@/lib/types';

// Mock the database service
vi.mock('@/lib/db', () => ({
  ShoppingService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toggleCompleted: vi.fn(),
    clearCompleted: vi.fn(),
    addFromInventory: vi.fn(),
  },
}));

const mockShoppingItems: ShoppingListItem[] = [
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
    completedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    name: 'Apples',
    quantity: 6,
    unit: 'pieces',
    category: 'Produce',
    isCompleted: false,
    addedAt: new Date('2024-01-03'),
  },
];

const mockInventoryItems: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Eggs',
    quantity: 1,
    unit: 'dozen',
    category: 'Dairy',
    location: 'fridge',
    expirationDate: new Date('2024-02-01'),
    purchaseDate: new Date('2024-01-01'),
    isLow: true,
    isFinished: false,
    lastUsed: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

describe('ShoppingStore', () => {
  beforeEach(() => {
    // Reset the store state
    useShoppingStore.setState({
      items: [],
      filters: {},
      isLoading: false,
      error: null,
    });
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('loadItems', () => {
    it('loads items successfully', async () => {
      vi.mocked(ShoppingService.getAll).mockResolvedValue(mockShoppingItems);

      const { loadItems } = useShoppingStore.getState();
      await loadItems();

      const state = useShoppingStore.getState();
      expect(state.items).toEqual(mockShoppingItems);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('handles loading errors', async () => {
      const errorMessage = 'Failed to load items';
      vi.mocked(ShoppingService.getAll).mockRejectedValue(new Error(errorMessage));

      const { loadItems } = useShoppingStore.getState();
      await loadItems();

      const state = useShoppingStore.getState();
      expect(state.items).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('sets loading state during fetch', async () => {
      let resolvePromise: (value: ShoppingListItem[]) => void;
      const promise = new Promise<ShoppingListItem[]>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(ShoppingService.getAll).mockReturnValue(promise);

      const { loadItems } = useShoppingStore.getState();
      const loadPromise = loadItems();

      // Check loading state
      expect(useShoppingStore.getState().isLoading).toBe(true);

      // Resolve the promise
      resolvePromise!(mockShoppingItems);
      await loadPromise;

      expect(useShoppingStore.getState().isLoading).toBe(false);
    });
  });

  describe('addItem', () => {
    it('adds item successfully', async () => {
      vi.mocked(ShoppingService.create).mockResolvedValue('new-id');
      vi.mocked(ShoppingService.getAll).mockResolvedValue([...mockShoppingItems]);

      const { addItem } = useShoppingStore.getState();
      const newItem = {
        name: 'New Item',
        quantity: 1,
        unit: 'piece',
        category: 'Other',
        isCompleted: false,
      };

      await addItem(newItem);

      expect(ShoppingService.create).toHaveBeenCalledWith(newItem);
      expect(ShoppingService.getAll).toHaveBeenCalled();
    });

    it('handles add errors', async () => {
      const errorMessage = 'Failed to add item';
      vi.mocked(ShoppingService.create).mockRejectedValue(new Error(errorMessage));

      const { addItem } = useShoppingStore.getState();
      const newItem = {
        name: 'New Item',
        quantity: 1,
        unit: 'piece',
        category: 'Other',
        isCompleted: false,
      };

      await expect(addItem(newItem)).rejects.toThrow();
      expect(useShoppingStore.getState().error).toBe(errorMessage);
    });
  });

  describe('updateItem', () => {
    beforeEach(() => {
      useShoppingStore.setState({ items: mockShoppingItems });
    });

    it('updates item successfully', async () => {
      vi.mocked(ShoppingService.update).mockResolvedValue();

      const { updateItem } = useShoppingStore.getState();
      const updates = { quantity: 5 };

      await updateItem('1', updates);

      expect(ShoppingService.update).toHaveBeenCalledWith('1', updates);
      
      const state = useShoppingStore.getState();
      const updatedItem = state.items.find(item => item.id === '1');
      expect(updatedItem?.quantity).toBe(5);
    });

    it('reverts optimistic update on error', async () => {
      const errorMessage = 'Failed to update item';
      vi.mocked(ShoppingService.update).mockRejectedValue(new Error(errorMessage));
      vi.mocked(ShoppingService.getAll).mockResolvedValue(mockShoppingItems);

      const { updateItem } = useShoppingStore.getState();
      const updates = { quantity: 5 };

      await expect(updateItem('1', updates)).rejects.toThrow();
      
      expect(ShoppingService.getAll).toHaveBeenCalled();
      expect(useShoppingStore.getState().error).toBe(errorMessage);
    });
  });

  describe('deleteItem', () => {
    beforeEach(() => {
      useShoppingStore.setState({ items: mockShoppingItems });
    });

    it('deletes item successfully', async () => {
      vi.mocked(ShoppingService.delete).mockResolvedValue();

      const { deleteItem } = useShoppingStore.getState();
      await deleteItem('1');

      expect(ShoppingService.delete).toHaveBeenCalledWith('1');
      
      const state = useShoppingStore.getState();
      expect(state.items.find(item => item.id === '1')).toBeUndefined();
    });

    it('handles delete errors', async () => {
      const errorMessage = 'Failed to delete item';
      vi.mocked(ShoppingService.delete).mockRejectedValue(new Error(errorMessage));

      const { deleteItem } = useShoppingStore.getState();
      
      await expect(deleteItem('1')).rejects.toThrow();
      expect(useShoppingStore.getState().error).toBe(errorMessage);
    });
  });

  describe('toggleCompleted', () => {
    beforeEach(() => {
      useShoppingStore.setState({ items: mockShoppingItems });
    });

    it('toggles completion status successfully', async () => {
      vi.mocked(ShoppingService.toggleCompleted).mockResolvedValue();

      const { toggleCompleted } = useShoppingStore.getState();
      await toggleCompleted('1');

      expect(ShoppingService.toggleCompleted).toHaveBeenCalledWith('1');
      
      const state = useShoppingStore.getState();
      const toggledItem = state.items.find(item => item.id === '1');
      expect(toggledItem?.isCompleted).toBe(true);
      expect(toggledItem?.completedAt).toBeInstanceOf(Date);
    });

    it('reverts optimistic update on error', async () => {
      const errorMessage = 'Failed to toggle completion';
      vi.mocked(ShoppingService.toggleCompleted).mockRejectedValue(new Error(errorMessage));
      vi.mocked(ShoppingService.getAll).mockResolvedValue(mockShoppingItems);

      const { toggleCompleted } = useShoppingStore.getState();
      
      await expect(toggleCompleted('1')).rejects.toThrow();
      
      expect(ShoppingService.getAll).toHaveBeenCalled();
      expect(useShoppingStore.getState().error).toBe(errorMessage);
    });
  });

  describe('clearCompleted', () => {
    beforeEach(() => {
      useShoppingStore.setState({ items: mockShoppingItems });
    });

    it('clears completed items successfully', async () => {
      vi.mocked(ShoppingService.clearCompleted).mockResolvedValue();

      const { clearCompleted } = useShoppingStore.getState();
      await clearCompleted();

      expect(ShoppingService.clearCompleted).toHaveBeenCalled();
      
      const state = useShoppingStore.getState();
      const completedItems = state.items.filter(item => item.isCompleted);
      expect(completedItems).toHaveLength(0);
    });

    it('handles clear errors', async () => {
      const errorMessage = 'Failed to clear completed items';
      vi.mocked(ShoppingService.clearCompleted).mockRejectedValue(new Error(errorMessage));

      const { clearCompleted } = useShoppingStore.getState();
      
      await expect(clearCompleted()).rejects.toThrow();
      expect(useShoppingStore.getState().error).toBe(errorMessage);
    });
  });

  describe('addFromInventory', () => {
    it('adds items from inventory successfully', async () => {
      vi.mocked(ShoppingService.addFromInventory).mockResolvedValue();
      vi.mocked(ShoppingService.getAll).mockResolvedValue([...mockShoppingItems]);

      const { addFromInventory } = useShoppingStore.getState();
      await addFromInventory(mockInventoryItems);

      expect(ShoppingService.addFromInventory).toHaveBeenCalledWith(mockInventoryItems);
      expect(ShoppingService.getAll).toHaveBeenCalled();
    });

    it('handles add from inventory errors', async () => {
      const errorMessage = 'Failed to add items from inventory';
      vi.mocked(ShoppingService.addFromInventory).mockRejectedValue(new Error(errorMessage));

      const { addFromInventory } = useShoppingStore.getState();
      
      await expect(addFromInventory(mockInventoryItems)).rejects.toThrow();
      expect(useShoppingStore.getState().error).toBe(errorMessage);
    });
  });

  describe('computed values', () => {
    beforeEach(() => {
      useShoppingStore.setState({ items: mockShoppingItems });
    });

    it('getCompletedItems returns only completed items', () => {
      const { getCompletedItems } = useShoppingStore.getState();
      const completedItems = getCompletedItems();
      
      expect(completedItems).toHaveLength(1);
      expect(completedItems[0].id).toBe('2');
    });

    it('getPendingItems returns only pending items', () => {
      const { getPendingItems } = useShoppingStore.getState();
      const pendingItems = getPendingItems();
      
      expect(pendingItems).toHaveLength(2);
      expect(pendingItems.map(item => item.id)).toEqual(['1', '3']);
    });

    it('getItemsByCategory groups items correctly', () => {
      const { getItemsByCategory } = useShoppingStore.getState();
      const itemsByCategory = getItemsByCategory();
      
      expect(itemsByCategory.Dairy).toHaveLength(1);
      expect(itemsByCategory.Bakery).toHaveLength(1);
      expect(itemsByCategory.Produce).toHaveLength(1);
    });

    it('getCompletionStats calculates correctly', () => {
      const { getCompletionStats } = useShoppingStore.getState();
      const stats = getCompletionStats();
      
      expect(stats.completed).toBe(1);
      expect(stats.total).toBe(3);
      expect(stats.percentage).toBe(33);
    });
  });

  describe('filters', () => {
    beforeEach(() => {
      useShoppingStore.setState({ 
        items: mockShoppingItems,
        filters: {}
      });
    });

    it('setFilters updates filters and reloads items', async () => {
      vi.mocked(ShoppingService.getAll).mockResolvedValue(mockShoppingItems);

      const { setFilters } = useShoppingStore.getState();
      setFilters({ category: 'Dairy' });

      const state = useShoppingStore.getState();
      expect(state.filters.category).toBe('Dairy');
      expect(ShoppingService.getAll).toHaveBeenCalledWith({ category: 'Dairy' });
    });

    it('getFilteredItems applies search filter', () => {
      useShoppingStore.setState({
        items: mockShoppingItems,
        filters: { search: 'milk' }
      });

      const { getFilteredItems } = useShoppingStore.getState();
      const filteredItems = getFilteredItems();
      
      expect(filteredItems).toHaveLength(1);
      expect(filteredItems[0].name).toBe('Milk');
    });

    it('getFilteredItems applies category filter', () => {
      useShoppingStore.setState({
        items: mockShoppingItems,
        filters: { category: 'Dairy' }
      });

      const { getFilteredItems } = useShoppingStore.getState();
      const filteredItems = getFilteredItems();
      
      expect(filteredItems).toHaveLength(1);
      expect(filteredItems[0].category).toBe('Dairy');
    });

    it('getFilteredItems applies completion filter', () => {
      useShoppingStore.setState({
        items: mockShoppingItems,
        filters: { completed: true }
      });

      const { getFilteredItems } = useShoppingStore.getState();
      const filteredItems = getFilteredItems();
      
      expect(filteredItems).toHaveLength(1);
      expect(filteredItems[0].isCompleted).toBe(true);
    });
  });

  describe('error handling', () => {
    it('clearError clears the error state', () => {
      useShoppingStore.setState({ error: 'Some error' });

      const { clearError } = useShoppingStore.getState();
      clearError();

      expect(useShoppingStore.getState().error).toBe(null);
    });
  });
});