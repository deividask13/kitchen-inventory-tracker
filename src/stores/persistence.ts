import { useInventoryStore } from './inventory-store';
import { useShoppingStore } from './shopping-store';
import { useSettingsStore } from './settings-store';

/**
 * Persistence layer that handles automatic synchronization between Zustand stores and IndexedDB
 * This module sets up subscriptions to automatically sync state changes to the database
 */

let isInitialized = false;

/**
 * Initialize the persistence layer
 * This should be called once when the app starts
 */
export const initializePersistence = async () => {
  if (isInitialized) return;

  try {
    // Load initial data from IndexedDB into stores
    await Promise.all([
      useInventoryStore.getState().loadItems(),
      useShoppingStore.getState().loadItems(),
      useSettingsStore.getState().loadSettings(),
      useSettingsStore.getState().loadCategories()
    ]);

    // Set up automatic synchronization subscriptions
    setupInventorySync();
    setupShoppingSync();
    setupSettingsSync();

    isInitialized = true;
    console.log('Persistence layer initialized successfully');
  } catch (error) {
    console.error('Failed to initialize persistence layer:', error);
    throw error;
  }
};

/**
 * Set up automatic synchronization for inventory store
 */
const setupInventorySync = () => {
  // Subscribe to filter changes to automatically reload items
  useInventoryStore.subscribe(
    (state) => state.filters,
    (filters, previousFilters) => {
      // Only reload if filters actually changed
      if (JSON.stringify(filters) !== JSON.stringify(previousFilters)) {
        useInventoryStore.getState().loadItems();
      }
    }
  );
};

/**
 * Set up automatic synchronization for shopping store
 */
const setupShoppingSync = () => {
  // Subscribe to filter changes to automatically reload items
  useShoppingStore.subscribe(
    (state) => state.filters,
    (filters, previousFilters) => {
      // Only reload if filters actually changed
      if (JSON.stringify(filters) !== JSON.stringify(previousFilters)) {
        useShoppingStore.getState().loadItems();
      }
    }
  );
};

/**
 * Set up automatic synchronization for settings store
 */
const setupSettingsSync = () => {
  // Subscribe to settings changes that might affect other stores
  useSettingsStore.subscribe(
    (state) => state.settings?.lowStockThreshold,
    (threshold) => {
      // When low stock threshold changes, reload inventory to recalculate isLow flags
      if (threshold !== undefined) {
        useInventoryStore.getState().loadItems();
      }
    }
  );

  // Subscribe to category changes to reload inventory items
  useSettingsStore.subscribe(
    (state) => state.categories,
    () => {
      // When categories change, we might need to update inventory display
      useInventoryStore.getState().loadItems();
    }
  );
};

/**
 * Refresh all stores from the database
 * Useful for manual refresh or after data import
 */
export const refreshAllStores = async () => {
  try {
    await Promise.all([
      useInventoryStore.getState().loadItems(),
      useShoppingStore.getState().loadItems(),
      useSettingsStore.getState().loadSettings(),
      useSettingsStore.getState().loadCategories()
    ]);
  } catch (error) {
    console.error('Failed to refresh stores:', error);
    throw error;
  }
};

/**
 * Clear all store errors
 * Useful for global error handling
 */
export const clearAllErrors = () => {
  useInventoryStore.getState().clearError();
  useShoppingStore.getState().clearError();
  useSettingsStore.getState().clearError();
};

/**
 * Get combined loading state from all stores
 */
export const useGlobalLoadingState = () => {
  const inventoryLoading = useInventoryStore((state) => state.isLoading);
  const shoppingLoading = useShoppingStore((state) => state.isLoading);
  const settingsLoading = useSettingsStore((state) => state.isLoading);
  
  return inventoryLoading || shoppingLoading || settingsLoading;
};

/**
 * Get combined error state from all stores
 */
export const useGlobalErrorState = () => {
  const inventoryError = useInventoryStore((state) => state.error);
  const shoppingError = useShoppingStore((state) => state.error);
  const settingsError = useSettingsStore((state) => state.error);
  
  return inventoryError || shoppingError || settingsError;
};

/**
 * Hook for initializing persistence in React components
 */
export const usePersistenceInitialization = () => {
  const [isReady, setIsReady] = React.useState(isInitialized);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isInitialized) {
      initializePersistence()
        .then(() => setIsReady(true))
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to initialize persistence');
        });
    }
  }, []);

  return { isReady, error };
};

// Re-export React for the hook above
import React from 'react';