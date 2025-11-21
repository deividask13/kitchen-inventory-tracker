'use client';

import { useEffect, useCallback } from 'react';
import { useShoppingStore } from '@/stores/shopping-store';
import { useInventoryStore } from '@/stores/inventory-store';
import { CreateShoppingListItem, InventoryItem } from '@/lib/types';

export function useShoppingList() {
  const {
    items,
    isLoading,
    error,
    loadItems,
    addItem,
    updateItem,
    deleteItem,
    toggleCompleted,
    clearCompleted,
    addFromInventory,
    clearError,
    getCompletedItems,
    getPendingItems,
    getItemsByCategory,
    getFilteredItems,
    getCompletionStats
  } = useShoppingStore();

  const {
    items: inventoryItems,
    loadItems: loadInventoryItems,
    getLowStockItems
  } = useInventoryStore();

  // Load data on mount
  useEffect(() => {
    loadItems();
    loadInventoryItems();
  }, [loadItems, loadInventoryItems]);

  // Auto-add low stock items to shopping list
  const addLowStockItemsToList = useCallback(async () => {
    try {
      const lowStockItems = getLowStockItems();
      
      // Filter out items that are already in the shopping list
      const existingItemNames = items.map(item => item.name.toLowerCase());
      const newLowStockItems = lowStockItems.filter(
        item => !existingItemNames.includes(item.name.toLowerCase())
      );

      if (newLowStockItems.length > 0) {
        await addFromInventory(newLowStockItems);
      }
    } catch (error) {
      console.error('Failed to add low stock items to shopping list:', error);
    }
  }, [items, getLowStockItems, addFromInventory]);

  // Check for low stock items periodically
  useEffect(() => {
    if (inventoryItems.length > 0) {
      addLowStockItemsToList();
    }
  }, [inventoryItems, addLowStockItemsToList]);

  // Enhanced add item function with duplicate checking
  const addItemToList = useCallback(async (item: CreateShoppingListItem) => {
    // Check for duplicates
    const existingItem = items.find(
      existing => existing.name.toLowerCase() === item.name.toLowerCase() && 
                 existing.category === item.category
    );

    if (existingItem) {
      // Update quantity instead of creating duplicate
      await updateItem(existingItem.id, {
        quantity: existingItem.quantity + item.quantity,
        notes: item.notes || existingItem.notes
      });
    } else {
      await addItem(item);
    }
  }, [items, addItem, updateItem]);

  // Batch operations
  const addMultipleItems = useCallback(async (itemsToAdd: CreateShoppingListItem[]) => {
    for (const item of itemsToAdd) {
      await addItemToList(item);
    }
  }, [addItemToList]);

  const toggleMultipleCompleted = useCallback(async (itemIds: string[]) => {
    for (const id of itemIds) {
      await toggleCompleted(id);
    }
  }, [toggleCompleted]);

  const deleteMultipleItems = useCallback(async (itemIds: string[]) => {
    for (const id of itemIds) {
      await deleteItem(id);
    }
  }, [deleteItem]);

  // Get suggestions for auto-complete
  const getItemSuggestions = useCallback((searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    return inventoryItems
      .filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 10);
  }, [inventoryItems]);

  // Get categories from inventory items
  const getAvailableCategories = useCallback(() => {
    const categories = new Set(inventoryItems.map(item => item.category));
    const defaultCategories = ['Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Beverages', 'Snacks', 'Other'];
    
    return Array.from(new Set([...defaultCategories, ...categories])).sort();
  }, [inventoryItems]);

  // Get units from inventory items
  const getAvailableUnits = useCallback(() => {
    const units = new Set(inventoryItems.map(item => item.unit));
    const defaultUnits = ['pieces', 'lbs', 'oz', 'cups', 'liters', 'ml', 'kg', 'g', 'dozen', 'pack'];
    
    return Array.from(new Set([...defaultUnits, ...units])).sort();
  }, [inventoryItems]);

  return {
    // State
    items,
    isLoading,
    error,
    
    // Basic operations
    addItem: addItemToList,
    updateItem,
    deleteItem,
    toggleCompleted,
    clearCompleted,
    clearError,
    
    // Batch operations
    addMultipleItems,
    toggleMultipleCompleted,
    deleteMultipleItems,
    addLowStockItemsToList,
    
    // Computed values
    completedItems: getCompletedItems(),
    pendingItems: getPendingItems(),
    itemsByCategory: getItemsByCategory(),
    filteredItems: getFilteredItems(),
    completionStats: getCompletionStats(),
    
    // Helper functions
    getItemSuggestions,
    getAvailableCategories,
    getAvailableUnits,
    
    // Inventory data for suggestions
    inventoryItems
  };
}