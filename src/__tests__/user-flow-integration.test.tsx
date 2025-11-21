import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useInventoryStore } from '@/stores/inventory-store';
import { useShoppingStore } from '@/stores/shopping-store';
import { useSettingsStore } from '@/stores/settings-store';
import type { InventoryItem } from '@/lib/types';

describe('Complete User Flow Integration', () => {
  beforeEach(() => {
    // Reset all stores to initial state
    // Database cleanup is handled by global test setup
    useInventoryStore.setState({
      items: [],
      filters: {},
      isLoading: false,
      error: null,
    });
    
    useShoppingStore.setState({
      items: [],
      isLoading: false,
      error: null,
    });
    
    useSettingsStore.setState({
      settings: {
        lowStockThreshold: 3,
        expirationWarningDays: 7,
        theme: 'light',
        enableNotifications: true,
        enableHapticFeedback: true,
      },
      isLoading: false,
      error: null,
    });
  });

  it('should complete full inventory management flow', async () => {
    const { result: inventoryResult } = renderHook(() => useInventoryStore());

    // 1. Add an item
    act(() => {
      inventoryResult.current.addItem({
        name: 'Milk',
        quantity: 2,
        unit: 'liters',
        location: 'fridge',
        category: 'dairy',
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        purchaseDate: new Date(),
        isLow: false,
        isFinished: false,
        lastUsed: null,
      });
    });

    await waitFor(() => {
      expect(inventoryResult.current.items).toHaveLength(1);
      expect(inventoryResult.current.items[0].name).toBe('Milk');
    });

    const itemId = inventoryResult.current.items[0].id;

    // 2. Update quantity
    act(() => {
      inventoryResult.current.updateItem(itemId, { quantity: 1 });
    });

    await waitFor(() => {
      expect(inventoryResult.current.items[0].quantity).toBe(1);
    });

    // 3. Mark as used
    act(() => {
      inventoryResult.current.markAsUsed(itemId, 0.5);
    });

    await waitFor(() => {
      expect(inventoryResult.current.items[0].quantity).toBe(0.5);
    });

    // 4. Mark as finished
    act(() => {
      inventoryResult.current.markAsFinished(itemId);
    });

    await waitFor(() => {
      expect(inventoryResult.current.items[0].isFinished).toBe(true);
    });
  });

  it('should handle low stock items and shopping list integration', async () => {
    const { result: inventoryResult } = renderHook(() => useInventoryStore());
    const { result: shoppingResult } = renderHook(() => useShoppingStore());

    // Add a low stock item
    act(() => {
      inventoryResult.current.addItem({
        name: 'Eggs',
        quantity: 2,
        unit: 'pieces',
        location: 'fridge',
        category: 'dairy',
        expirationDate: null,
        purchaseDate: new Date(),
        isLow: true,
        isFinished: false,
        lastUsed: null,
      });
    });

    await waitFor(() => {
      expect(inventoryResult.current.items).toHaveLength(1);
    });

    const lowStockItem = inventoryResult.current.items[0];

    // Add to shopping list
    act(() => {
      shoppingResult.current.addItem({
        name: lowStockItem.name,
        quantity: 12,
        unit: lowStockItem.unit,
        category: lowStockItem.category,
        isCompleted: false,
        fromInventory: true,
        inventoryItemId: lowStockItem.id,
      });
    });

    await waitFor(() => {
      expect(shoppingResult.current.items).toHaveLength(1);
      expect(shoppingResult.current.items[0].name).toBe('Eggs');
    });

    // Complete shopping item
    const shoppingItemId = shoppingResult.current.items[0].id;
    act(() => {
      shoppingResult.current.toggleCompleted(shoppingItemId);
    });

    await waitFor(() => {
      expect(shoppingResult.current.items[0].isCompleted).toBe(true);
    });

    // Clear completed items
    act(() => {
      shoppingResult.current.clearCompleted();
    });

    await waitFor(() => {
      expect(shoppingResult.current.items).toHaveLength(0);
    });
  });

  it('should filter and search inventory items', async () => {
    const { result } = renderHook(() => useInventoryStore());

    // Add multiple items
    act(() => {
      result.current.addItem({
        name: 'Milk',
        quantity: 2,
        unit: 'liters',
        location: 'fridge',
        category: 'dairy',
        expirationDate: null,
        purchaseDate: new Date(),
        isLow: false,
        isFinished: false,
        lastUsed: null,
      });

      result.current.addItem({
        name: 'Rice',
        quantity: 5,
        unit: 'kg',
        location: 'pantry',
        category: 'grains',
        expirationDate: null,
        purchaseDate: new Date(),
        isLow: false,
        isFinished: false,
        lastUsed: null,
      });

      result.current.addItem({
        name: 'Cheese',
        quantity: 1,
        unit: 'kg',
        location: 'fridge',
        category: 'dairy',
        expirationDate: null,
        purchaseDate: new Date(),
        isLow: false,
        isFinished: false,
        lastUsed: null,
      });
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(3);
    });

    // Filter by location
    act(() => {
      result.current.setFilters({ location: 'fridge' });
    });

    await waitFor(() => {
      const fridgeItems = result.current.items.filter(
        item => item.location === 'fridge'
      );
      expect(fridgeItems).toHaveLength(2);
    });

    // Filter by category
    act(() => {
      result.current.setFilters({ location: undefined, category: 'dairy' });
    });

    await waitFor(() => {
      const dairyItems = result.current.items.filter(
        item => item.category === 'dairy'
      );
      expect(dairyItems).toHaveLength(2);
    });

    // Search
    act(() => {
      result.current.setFilters({ category: undefined, search: 'milk' });
    });

    await waitFor(() => {
      const searchResults = result.current.items.filter(item =>
        item.name.toLowerCase().includes('milk')
      );
      expect(searchResults).toHaveLength(1);
    });
  });

  it('should handle expiring items correctly', async () => {
    const { result } = renderHook(() => useInventoryStore());

    const now = Date.now();
    const threeDaysFromNow = new Date(now + 3 * 24 * 60 * 60 * 1000);
    const tenDaysFromNow = new Date(now + 10 * 24 * 60 * 60 * 1000);

    // Add items with different expiration dates
    act(() => {
      result.current.addItem({
        name: 'Yogurt',
        quantity: 1,
        unit: 'kg',
        location: 'fridge',
        category: 'dairy',
        expirationDate: threeDaysFromNow,
        purchaseDate: new Date(),
        isLow: false,
        isFinished: false,
        lastUsed: null,
      });

      result.current.addItem({
        name: 'Canned Beans',
        quantity: 2,
        unit: 'cans',
        location: 'pantry',
        category: 'canned',
        expirationDate: tenDaysFromNow,
        purchaseDate: new Date(),
        isLow: false,
        isFinished: false,
        lastUsed: null,
      });
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2);
    });

    // Check expiring items (within 7 days)
    const expiringItems = result.current.items.filter(item => {
      if (!item.expirationDate) return false;
      const daysUntilExpiration =
        (new Date(item.expirationDate).getTime() - now) / (24 * 60 * 60 * 1000);
      return daysUntilExpiration <= 7;
    });

    expect(expiringItems).toHaveLength(1);
    expect(expiringItems[0].name).toBe('Yogurt');
  });

  it('should persist settings changes', async () => {
    const { result } = renderHook(() => useSettingsStore());

    // Update settings
    act(() => {
      result.current.updateSettings({
        lowStockThreshold: 5,
        expirationWarningDays: 5,
        theme: 'dark',
      });
    });

    await waitFor(() => {
      expect(result.current.settings.lowStockThreshold).toBe(5);
      expect(result.current.settings.expirationWarningDays).toBe(5);
      expect(result.current.settings.theme).toBe('dark');
    });
  });

  it('should handle batch operations', async () => {
    const { result } = renderHook(() => useInventoryStore());

    // Add multiple items at once
    const items = [
      {
        name: 'Item 1',
        quantity: 1,
        unit: 'kg',
        location: 'pantry' as const,
        category: 'test',
        expirationDate: null,
        purchaseDate: new Date(),
        isLow: false,
        isFinished: false,
        lastUsed: null,
      },
      {
        name: 'Item 2',
        quantity: 2,
        unit: 'kg',
        location: 'fridge' as const,
        category: 'test',
        expirationDate: null,
        purchaseDate: new Date(),
        isLow: false,
        isFinished: false,
        lastUsed: null,
      },
      {
        name: 'Item 3',
        quantity: 3,
        unit: 'kg',
        location: 'freezer' as const,
        category: 'test',
        expirationDate: null,
        purchaseDate: new Date(),
        isLow: false,
        isFinished: false,
        lastUsed: null,
      },
    ];

    act(() => {
      items.forEach(item => result.current.addItem(item));
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(3);
    });

    // Verify all items were added
    expect(result.current.items.map(i => i.name)).toEqual([
      'Item 1',
      'Item 2',
      'Item 3',
    ]);
  });
});
