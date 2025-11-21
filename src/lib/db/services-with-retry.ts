/**
 * Database services with retry logic for failed operations
 * Wraps the base services with automatic retry on transient failures
 */

import { retry, RetryableError } from '../utils/retry';
import { InventoryService, ShoppingService, CategoryService, SettingsService } from './services';
import type {
  InventoryItem,
  ShoppingListItem,
  Category,
  UserSettings,
  CreateInventoryItem,
  CreateShoppingListItem,
  CreateCategory,
  CreateUserSettings,
  UpdateInventoryItem,
  UpdateShoppingListItem,
  UpdateCategory,
  UpdateUserSettings,
  ShoppingFilters
} from '../types';

const RETRY_OPTIONS = {
  maxAttempts: 3,
  delayMs: 500,
  backoffMultiplier: 2,
  shouldRetry: (error: Error) => {
    // Retry on database errors but not validation errors
    return (
      error.name !== 'ValidationError' &&
      (error.message.includes('database') ||
       error.message.includes('IndexedDB') ||
       error.message.includes('transaction') ||
       error.message.includes('quota'))
    );
  },
};

/**
 * Inventory Service with retry logic
 */
export class InventoryServiceWithRetry {
  static async create(item: CreateInventoryItem): Promise<string> {
    return retry(() => InventoryService.create(item), RETRY_OPTIONS);
  }

  static async getAll(): Promise<InventoryItem[]> {
    return retry(() => InventoryService.getAll(), RETRY_OPTIONS);
  }

  static async getById(id: string): Promise<InventoryItem | undefined> {
    return retry(() => InventoryService.getById(id), RETRY_OPTIONS);
  }

  static async update(id: string, updates: UpdateInventoryItem): Promise<void> {
    return retry(() => InventoryService.update(id, updates), RETRY_OPTIONS);
  }

  static async delete(id: string): Promise<void> {
    return retry(() => InventoryService.delete(id), RETRY_OPTIONS);
  }

  static async markAsUsed(id: string, quantityUsed: number): Promise<void> {
    return retry(() => InventoryService.markAsUsed(id, quantityUsed), RETRY_OPTIONS);
  }

  static async markAsFinished(id: string): Promise<void> {
    return retry(() => InventoryService.markAsFinished(id), RETRY_OPTIONS);
  }

  static async getExpiringItems(days: number = 7): Promise<InventoryItem[]> {
    return retry(() => InventoryService.getExpiringItems(days), RETRY_OPTIONS);
  }

  static async getLowStockItems(): Promise<InventoryItem[]> {
    return retry(() => InventoryService.getLowStockItems(), RETRY_OPTIONS);
  }

  static async getItemsByLocation(location: 'fridge' | 'pantry' | 'freezer'): Promise<InventoryItem[]> {
    return retry(() => InventoryService.getByLocation(location), RETRY_OPTIONS);
  }
}

/**
 * Shopping Service with retry logic
 */
export class ShoppingServiceWithRetry {
  static async create(item: CreateShoppingListItem): Promise<string> {
    return retry(() => ShoppingService.create(item), RETRY_OPTIONS);
  }

  static async getAll(filters?: ShoppingFilters): Promise<ShoppingListItem[]> {
    return retry(() => ShoppingService.getAll(filters), RETRY_OPTIONS);
  }

  static async getById(id: string): Promise<ShoppingListItem | undefined> {
    return retry(() => ShoppingService.getById(id), RETRY_OPTIONS);
  }

  static async update(id: string, updates: UpdateShoppingListItem): Promise<void> {
    return retry(() => ShoppingService.update(id, updates), RETRY_OPTIONS);
  }

  static async delete(id: string): Promise<void> {
    return retry(() => ShoppingService.delete(id), RETRY_OPTIONS);
  }

  static async toggleCompleted(id: string): Promise<void> {
    return retry(() => ShoppingService.toggleCompleted(id), RETRY_OPTIONS);
  }

  static async clearCompleted(): Promise<void> {
    return retry(() => ShoppingService.clearCompleted(), RETRY_OPTIONS);
  }

  static async addFromInventory(inventoryItems: InventoryItem[]): Promise<void> {
    return retry(() => ShoppingService.addFromInventory(inventoryItems), RETRY_OPTIONS);
  }
}

/**
 * Category Service with retry logic
 */
export class CategoryServiceWithRetry {
  static async create(category: CreateCategory): Promise<string> {
    return retry(() => CategoryService.create(category), RETRY_OPTIONS);
  }

  static async getAll(): Promise<Category[]> {
    return retry(() => CategoryService.getAll(), RETRY_OPTIONS);
  }

  static async getById(id: string): Promise<Category | undefined> {
    return retry(() => CategoryService.getById(id), RETRY_OPTIONS);
  }

  static async update(id: string, updates: UpdateCategory): Promise<void> {
    return retry(() => CategoryService.update(id, updates), RETRY_OPTIONS);
  }

  static async delete(id: string): Promise<void> {
    return retry(() => CategoryService.delete(id), RETRY_OPTIONS);
  }

  static async getDefaultCategories(): Promise<Category[]> {
    return retry(() => CategoryService.getDefaults(), RETRY_OPTIONS);
  }
}

/**
 * Settings Service with retry logic
 */
export class SettingsServiceWithRetry {
  static async get(): Promise<UserSettings | undefined> {
    return retry(() => SettingsService.get(), RETRY_OPTIONS);
  }

  static async update(updates: UpdateUserSettings): Promise<void> {
    return retry(() => SettingsService.update(updates), RETRY_OPTIONS);
  }

  static async reset(): Promise<void> {
    return retry(() => SettingsService.reset(), RETRY_OPTIONS);
  }
}
