import { db } from './schema';
import {
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

// Inventory Items Service
export class InventoryService {
  // Create new inventory item
  static async create(item: CreateInventoryItem): Promise<string> {
    // Get current settings for low stock threshold
    const settings = await SettingsService.get();
    const threshold = settings?.lowStockThreshold || 5;
    
    const id = await db.inventoryItems.add({
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isLow: item.quantity <= threshold,
      isFinished: item.quantity <= 0
    });
    return id as string;
  }

  // Get all inventory items
  static async getAll(): Promise<InventoryItem[]> {
    return await db.inventoryItems.orderBy('name').toArray();
  }

  // Get single inventory item by ID
  static async getById(id: string): Promise<InventoryItem | undefined> {
    return await db.inventoryItems.get(id);
  }

  // Update inventory item
  static async update(id: string, updates: UpdateInventoryItem): Promise<void> {
    const updateData: any = {
      ...updates,
      updatedAt: new Date()
    };
    
    // Recalculate isLow if quantity is being updated
    if (updates.quantity !== undefined) {
      const settings = await SettingsService.get();
      const threshold = settings?.lowStockThreshold || 5;
      updateData.isLow = updates.quantity <= threshold;
      updateData.isFinished = updates.quantity <= 0;
    }
    
    await db.inventoryItems.update(id, updateData);
  }

  // Delete inventory item
  static async delete(id: string): Promise<void> {
    await db.inventoryItems.delete(id);
  }

  // Mark item as used (decrease quantity)
  static async markAsUsed(id: string, quantityUsed: number): Promise<void> {
    const item = await this.getById(id);
    if (!item) throw new Error('Item not found');

    const newQuantity = Math.max(0, item.quantity - quantityUsed);
    await this.update(id, {
      quantity: newQuantity,
      lastUsed: new Date()
    });
  }

  // Mark item as finished
  static async markAsFinished(id: string): Promise<void> {
    await this.update(id, {
      quantity: 0,
      lastUsed: new Date()
    });
  }

  // Get expiring items (within specified days)
  static async getExpiringItems(days: number = 7): Promise<InventoryItem[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return await db.inventoryItems
      .where('expirationDate')
      .belowOrEqual(cutoffDate)
      .and(item => !item.isFinished && item.expirationDate !== null)
      .sortBy('expirationDate');
  }

  // Get low stock items
  static async getLowStockItems(): Promise<InventoryItem[]> {
    return await db.inventoryItems
      .filter(item => item.isLow && !item.isFinished)
      .toArray();
  }

  // Get items by location
  static async getByLocation(location: 'fridge' | 'pantry' | 'freezer'): Promise<InventoryItem[]> {
    return await db.inventoryItems
      .where('location')
      .equals(location)
      .and(item => !item.isFinished)
      .toArray();
  }
}

// Shopping List Service
export class ShoppingService {
  // Create new shopping list item
  static async create(item: CreateShoppingListItem): Promise<string> {
    const id = await db.shoppingItems.add({
      ...item,
      id: crypto.randomUUID(),
      addedAt: new Date()
    });
    return id as string;
  }

  // Get all shopping list items with optional filtering
  static async getAll(filters?: ShoppingFilters): Promise<ShoppingListItem[]> {
    let query = db.shoppingItems.orderBy('addedAt');

    if (filters?.category) {
      query = db.shoppingItems.where('category').equals(filters.category);
    }

    if (filters?.completed !== undefined) {
      query = query.and(item => item.isCompleted === filters.completed);
    }

    let items = await query.toArray();

    // Apply search filter if provided
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        item.notes?.toLowerCase().includes(searchTerm)
      );
    }

    return items;
  }

  // Get single shopping item by ID
  static async getById(id: string): Promise<ShoppingListItem | undefined> {
    return await db.shoppingItems.get(id);
  }

  // Update shopping item
  static async update(id: string, updates: UpdateShoppingListItem): Promise<void> {
    await db.shoppingItems.update(id, updates);
  }

  // Toggle completion status
  static async toggleCompleted(id: string): Promise<void> {
    const item = await this.getById(id);
    if (!item) throw new Error('Item not found');

    await this.update(id, {
      isCompleted: !item.isCompleted,
      completedAt: !item.isCompleted ? new Date() : undefined
    });
  }

  // Delete shopping item
  static async delete(id: string): Promise<void> {
    await db.shoppingItems.delete(id);
  }

  // Clear all completed items
  static async clearCompleted(): Promise<void> {
    const completedItems = await db.shoppingItems.filter(item => item.isCompleted).toArray();
    const ids = completedItems.map(item => item.id);
    await db.shoppingItems.bulkDelete(ids);
  }

  // Add items from inventory (for low stock items)
  static async addFromInventory(inventoryItems: InventoryItem[]): Promise<void> {
    const shoppingItems = inventoryItems.map(item => ({
      id: crypto.randomUUID(),
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      isCompleted: false,
      fromInventory: true,
      inventoryItemId: item.id,
      addedAt: new Date()
    }));

    await db.shoppingItems.bulkAdd(shoppingItems);
  }
}

// Categories Service
export class CategoryService {
  // Create new category
  static async create(category: CreateCategory): Promise<string> {
    const id = await db.categories.add({
      ...category,
      id: crypto.randomUUID()
    });
    return id as string;
  }

  // Get all categories
  static async getAll(): Promise<Category[]> {
    return await db.categories.orderBy('name').toArray();
  }

  // Get single category by ID
  static async getById(id: string): Promise<Category | undefined> {
    return await db.categories.get(id);
  }

  // Update category
  static async update(id: string, updates: UpdateCategory): Promise<void> {
    await db.categories.update(id, updates);
  }

  // Delete category (only if not default)
  static async delete(id: string): Promise<void> {
    const category = await this.getById(id);
    if (category?.isDefault) {
      throw new Error('Cannot delete default category');
    }
    await db.categories.delete(id);
  }

  // Get default categories
  static async getDefaults(): Promise<Category[]> {
    return await db.categories.filter(category => category.isDefault).toArray();
  }
}

// Settings Service
export class SettingsService {
  // Get user settings (should be single record)
  static async get(): Promise<UserSettings | undefined> {
    return await db.settings.orderBy('id').first();
  }

  // Update settings
  static async update(updates: UpdateUserSettings): Promise<void> {
    const existing = await this.get();
    if (existing) {
      await db.settings.update(existing.id, updates);
    } else {
      // Create default settings if none exist
      await db.settings.add({
        id: 'default',
        lowStockThreshold: 5,
        expirationWarningDays: 7,
        defaultLocation: 'pantry',
        preferredUnits: ['pieces', 'lbs', 'oz', 'cups', 'liters', 'ml'],
        categories: [],
        theme: 'system',
        reducedMotion: false,
        ...updates
      });
    }
  }

  // Reset to defaults
  static async reset(): Promise<void> {
    await db.settings.clear();
    await db.initializeDefaults();
  }
}

// Database utility functions
export class DatabaseService {
  // Clear all data (for testing or reset)
  static async clearAll(): Promise<void> {
    await Promise.all([
      db.inventoryItems.clear(),
      db.shoppingItems.clear(),
      db.categories.clear(),
      db.settings.clear()
    ]);
    await db.initializeDefaults();
  }

  // Export data for backup
  static async exportData() {
    const [inventory, shopping, categories, settings] = await Promise.all([
      db.inventoryItems.toArray(),
      db.shoppingItems.toArray(),
      db.categories.toArray(),
      db.settings.toArray()
    ]);

    return {
      inventory,
      shopping,
      categories,
      settings,
      exportDate: new Date().toISOString()
    };
  }

  // Import data from backup
  static async importData(data: any): Promise<void> {
    // Clear existing data
    await Promise.all([
      db.inventoryItems.clear(),
      db.shoppingItems.clear(),
      db.categories.clear(),
      db.settings.clear()
    ]);
    
    // Import data in order (settings first, then categories, then items)
    if (data.settings?.length) {
      await db.settings.bulkAdd(data.settings);
    }
    if (data.categories?.length) {
      await db.categories.bulkAdd(data.categories);
    }
    if (data.inventory?.length) {
      await db.inventoryItems.bulkAdd(data.inventory);
    }
    if (data.shopping?.length) {
      await db.shoppingItems.bulkAdd(data.shopping);
    }
    
    // If no data was imported, initialize defaults
    const hasData = (data.settings?.length || 0) + (data.categories?.length || 0) > 0;
    if (!hasData) {
      await db.initializeDefaults();
    }
  }

  // Get database statistics
  static async getStats() {
    const [inventoryCount, shoppingCount, categoryCount] = await Promise.all([
      db.inventoryItems.count(),
      db.shoppingItems.count(),
      db.categories.count()
    ]);

    return {
      inventoryItems: inventoryCount,
      shoppingItems: shoppingCount,
      categories: categoryCount
    };
  }
}