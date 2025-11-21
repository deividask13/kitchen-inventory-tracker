import { useInventoryStore } from '@/stores/inventory-store';
import { useShoppingStore } from '@/stores/shopping-store';
import { useSettingsStore } from '@/stores/settings-store';

/**
 * Service for handling data synchronization when connectivity is restored
 * Manages offline changes and syncs them when back online
 */

interface PendingChange {
  id: string;
  type: 'inventory' | 'shopping' | 'settings';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

class SyncService {
  private pendingChanges: PendingChange[] = [];
  private isOnline = true;
  private syncInProgress = false;

  constructor() {
    this.loadPendingChanges();
    this.setupOnlineListener();
  }

  /**
   * Set online status and trigger sync if coming back online
   */
  setOnlineStatus(isOnline: boolean) {
    const wasOffline = !this.isOnline;
    this.isOnline = isOnline;

    if (isOnline && wasOffline && this.pendingChanges.length > 0) {
      this.syncPendingChanges();
    }
  }

  /**
   * Add a change to the pending queue when offline
   */
  addPendingChange(change: Omit<PendingChange, 'timestamp'>) {
    const pendingChange: PendingChange = {
      ...change,
      timestamp: Date.now(),
    };

    this.pendingChanges.push(pendingChange);
    this.savePendingChanges();
  }

  /**
   * Get count of pending changes
   */
  getPendingChangesCount(): number {
    return this.pendingChanges.length;
  }

  /**
   * Check if sync is in progress
   */
  isSyncing(): boolean {
    return this.syncInProgress;
  }

  /**
   * Manually trigger sync (useful for retry scenarios)
   */
  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncPendingChanges();
    }
  }

  /**
   * Clear all pending changes (useful for reset scenarios)
   */
  clearPendingChanges() {
    this.pendingChanges = [];
    this.savePendingChanges();
  }

  /**
   * Sync all pending changes to the stores/database
   */
  private async syncPendingChanges() {
    if (this.syncInProgress || this.pendingChanges.length === 0) {
      return;
    }

    this.syncInProgress = true;

    try {
      // Sort changes by timestamp to maintain order
      const sortedChanges = [...this.pendingChanges].sort((a, b) => a.timestamp - b.timestamp);

      for (const change of sortedChanges) {
        await this.applySingleChange(change);
      }

      // Clear pending changes after successful sync
      this.pendingChanges = [];
      this.savePendingChanges();

      console.log('Successfully synced all pending changes');
    } catch (error) {
      console.error('Failed to sync pending changes:', error);
      // Keep pending changes for retry
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Apply a single change to the appropriate store
   */
  private async applySingleChange(change: PendingChange) {
    try {
      switch (change.type) {
        case 'inventory':
          await this.applyInventoryChange(change);
          break;
        case 'shopping':
          await this.applyShoppingChange(change);
          break;
        case 'settings':
          await this.applySettingsChange(change);
          break;
        default:
          console.warn('Unknown change type:', change.type);
      }
    } catch (error) {
      console.error(`Failed to apply ${change.type} change:`, error);
      throw error;
    }
  }

  /**
   * Apply inventory-related changes
   */
  private async applyInventoryChange(change: PendingChange) {
    const store = useInventoryStore.getState();

    switch (change.action) {
      case 'create':
        await store.addItem(change.data);
        break;
      case 'update':
        await store.updateItem(change.id, change.data);
        break;
      case 'delete':
        await store.deleteItem(change.id);
        break;
    }
  }

  /**
   * Apply shopping list changes
   */
  private async applyShoppingChange(change: PendingChange) {
    const store = useShoppingStore.getState();

    switch (change.action) {
      case 'create':
        await store.addItem(change.data);
        break;
      case 'update':
        await store.updateItem(change.id, change.data);
        break;
      case 'delete':
        await store.deleteItem(change.id);
        break;
    }
  }

  /**
   * Apply settings changes
   */
  private async applySettingsChange(change: PendingChange) {
    const store = useSettingsStore.getState();

    switch (change.action) {
      case 'update':
        if (change.data.type === 'settings') {
          await store.updateSettings(change.data.settings);
        } else if (change.data.type === 'category') {
          await store.updateCategory(change.id, change.data.category);
        }
        break;
      case 'create':
        if (change.data.type === 'category') {
          await store.addCategory(change.data.category);
        }
        break;
      case 'delete':
        if (change.data.type === 'category') {
          await store.deleteCategory(change.id);
        }
        break;
    }
  }

  /**
   * Load pending changes from localStorage
   */
  private loadPendingChanges() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('kitchenTracker_pendingChanges');
      if (stored) {
        this.pendingChanges = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load pending changes:', error);
      this.pendingChanges = [];
    }
  }

  /**
   * Save pending changes to localStorage
   */
  private savePendingChanges() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('kitchenTracker_pendingChanges', JSON.stringify(this.pendingChanges));
    } catch (error) {
      console.error('Failed to save pending changes:', error);
    }
  }

  /**
   * Setup online/offline event listeners
   */
  private setupOnlineListener() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;

      window.addEventListener('online', () => {
        this.setOnlineStatus(true);
      });

      window.addEventListener('offline', () => {
        this.setOnlineStatus(false);
      });
    }
  }
}

// Create singleton instance
export const syncService = new SyncService();

/**
 * Hook for using sync service in React components
 */
export const useSyncService = () => {
  return {
    addPendingChange: syncService.addPendingChange.bind(syncService),
    getPendingChangesCount: syncService.getPendingChangesCount.bind(syncService),
    isSyncing: syncService.isSyncing.bind(syncService),
    forceSync: syncService.forcSync.bind(syncService),
    clearPendingChanges: syncService.clearPendingChanges.bind(syncService),
  };
};