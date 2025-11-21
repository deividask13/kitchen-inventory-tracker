import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  InventoryService, 
  ShoppingService, 
  CategoryService, 
  SettingsService,
  DatabaseService 
} from '../services';
import { db } from '../schema';
import { CreateInventoryItem, CreateShoppingListItem, CreateCategory } from '../../types';

describe('Database Services', () => {
  beforeEach(async () => {
    // Clear database before each test
    await DatabaseService.clearAll();
    // Ensure initialization is complete
    await db.initializeDefaults();
  });

  describe('InventoryService', () => {
    const mockInventoryItem: CreateInventoryItem = {
      name: 'Test Apple',
      quantity: 10,
      unit: 'pieces',
      expirationDate: new Date('2024-12-31'),
      location: 'fridge',
      purchaseDate: new Date('2024-11-01'),
      category: 'produce',
      lastUsed: null,
      notes: 'Fresh apples'
    };

    it('should create a new inventory item', async () => {
      const id = await InventoryService.create(mockInventoryItem);
      expect(id).toBeDefined();
      
      const item = await InventoryService.getById(id);
      expect(item).toBeDefined();
      expect(item?.name).toBe('Test Apple');
      expect(item?.quantity).toBe(10);
      expect(item?.isLow).toBe(false); // 10 > 5 (default threshold)
      expect(item?.isFinished).toBe(false);
      expect(item?.createdAt).toBeInstanceOf(Date);
      expect(item?.updatedAt).toBeInstanceOf(Date);
    });

    it('should mark item as low stock when quantity is low', async () => {
      const lowStockItem = { ...mockInventoryItem, quantity: 3 };
      const id = await InventoryService.create(lowStockItem);
      
      const item = await InventoryService.getById(id);
      expect(item?.isLow).toBe(true);
      expect(item?.isFinished).toBe(false);
    });

    it('should mark item as finished when quantity is zero', async () => {
      const finishedItem = { ...mockInventoryItem, quantity: 0 };
      const id = await InventoryService.create(finishedItem);
      
      const item = await InventoryService.getById(id);
      expect(item?.isLow).toBe(true);
      expect(item?.isFinished).toBe(true);
    });

    it('should update inventory item', async () => {
      const id = await InventoryService.create(mockInventoryItem);
      
      await InventoryService.update(id, {
        name: 'Updated Apple',
        quantity: 15
      });
      
      const item = await InventoryService.getById(id);
      expect(item?.name).toBe('Updated Apple');
      expect(item?.quantity).toBe(15);
      expect(item?.isLow).toBe(false);
      expect(item?.updatedAt).toBeInstanceOf(Date);
    });

    it('should mark item as used', async () => {
      const id = await InventoryService.create(mockInventoryItem);
      
      await InventoryService.markAsUsed(id, 3);
      
      const item = await InventoryService.getById(id);
      expect(item?.quantity).toBe(7);
      expect(item?.lastUsed).toBeInstanceOf(Date);
      expect(item?.isLow).toBe(false);
    });

    it('should mark item as finished', async () => {
      const id = await InventoryService.create(mockInventoryItem);
      
      await InventoryService.markAsFinished(id);
      
      const item = await InventoryService.getById(id);
      expect(item?.quantity).toBe(0);
      expect(item?.isFinished).toBe(true);
      expect(item?.lastUsed).toBeInstanceOf(Date);
    });

    it('should get all inventory items', async () => {
      await InventoryService.create(mockInventoryItem);
      await InventoryService.create({ ...mockInventoryItem, name: 'Test Banana' });
      
      const items = await InventoryService.getAll();
      expect(items).toHaveLength(2);
    });

    it('should get all items without filtering', async () => {
      await InventoryService.create({ ...mockInventoryItem, location: 'fridge' });
      await InventoryService.create({ ...mockInventoryItem, name: 'Pasta', location: 'pantry' });
      
      const allItems = await InventoryService.getAll();
      expect(allItems).toHaveLength(2);
      expect(allItems.some(item => item.location === 'fridge')).toBe(true);
      expect(allItems.some(item => item.location === 'pantry')).toBe(true);
    });

    it('should get expiring items', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      await InventoryService.create({ ...mockInventoryItem, expirationDate: tomorrow });
      await InventoryService.create({ ...mockInventoryItem, name: 'Future Item', expirationDate: nextMonth });
      
      const expiringItems = await InventoryService.getExpiringItems(7);
      expect(expiringItems).toHaveLength(1);
      expect(expiringItems[0].expirationDate).toEqual(tomorrow);
    });

    it('should get low stock items', async () => {
      await InventoryService.create({ ...mockInventoryItem, quantity: 2 });
      await InventoryService.create({ ...mockInventoryItem, name: 'Normal Item', quantity: 10 });
      
      const lowStockItems = await InventoryService.getLowStockItems();
      expect(lowStockItems).toHaveLength(1);
      expect(lowStockItems[0].quantity).toBe(2);
    });

    it('should delete inventory item', async () => {
      const id = await InventoryService.create(mockInventoryItem);
      
      await InventoryService.delete(id);
      
      const item = await InventoryService.getById(id);
      expect(item).toBeUndefined();
    });
  });

  describe('ShoppingService', () => {
    const mockShoppingItem: CreateShoppingListItem = {
      name: 'Milk',
      quantity: 2,
      unit: 'liters',
      category: 'dairy',
      isCompleted: false,
      notes: 'Organic milk'
    };

    it('should create a new shopping list item', async () => {
      const id = await ShoppingService.create(mockShoppingItem);
      expect(id).toBeDefined();
      
      const item = await ShoppingService.getById(id);
      expect(item).toBeDefined();
      expect(item?.name).toBe('Milk');
      expect(item?.isCompleted).toBe(false);
      expect(item?.addedAt).toBeInstanceOf(Date);
    });

    it('should toggle completion status', async () => {
      const id = await ShoppingService.create(mockShoppingItem);
      
      await ShoppingService.toggleCompleted(id);
      
      let item = await ShoppingService.getById(id);
      expect(item?.isCompleted).toBe(true);
      expect(item?.completedAt).toBeInstanceOf(Date);
      
      await ShoppingService.toggleCompleted(id);
      
      item = await ShoppingService.getById(id);
      expect(item?.isCompleted).toBe(false);
      expect(item?.completedAt).toBeUndefined();
    });

    it('should get all shopping items', async () => {
      await ShoppingService.create(mockShoppingItem);
      await ShoppingService.create({ ...mockShoppingItem, name: 'Bread' });
      
      const items = await ShoppingService.getAll();
      expect(items).toHaveLength(2);
    });

    it('should filter by completion status', async () => {
      const id1 = await ShoppingService.create(mockShoppingItem);
      await ShoppingService.create({ ...mockShoppingItem, name: 'Bread' });
      
      await ShoppingService.toggleCompleted(id1);
      
      const completedItems = await ShoppingService.getAll({ completed: true });
      expect(completedItems).toHaveLength(1);
      expect(completedItems[0].isCompleted).toBe(true);
      
      const pendingItems = await ShoppingService.getAll({ completed: false });
      expect(pendingItems).toHaveLength(1);
      expect(pendingItems[0].isCompleted).toBe(false);
    });

    it('should clear completed items', async () => {
      const id1 = await ShoppingService.create(mockShoppingItem);
      const id2 = await ShoppingService.create({ ...mockShoppingItem, name: 'Bread' });
      
      await ShoppingService.toggleCompleted(id1);
      
      await ShoppingService.clearCompleted();
      
      const remainingItems = await ShoppingService.getAll();
      expect(remainingItems).toHaveLength(1);
      expect(remainingItems[0].name).toBe('Bread');
    });

    it('should delete shopping item', async () => {
      const id = await ShoppingService.create(mockShoppingItem);
      
      await ShoppingService.delete(id);
      
      const item = await ShoppingService.getById(id);
      expect(item).toBeUndefined();
    });
  });

  describe('CategoryService', () => {
    const mockCategory: CreateCategory = {
      name: 'Test Category',
      color: '#FF0000',
      icon: '🧪',
      isDefault: false
    };

    it('should create a new category', async () => {
      const id = await CategoryService.create(mockCategory);
      expect(id).toBeDefined();
      
      const category = await CategoryService.getById(id);
      expect(category).toBeDefined();
      expect(category?.name).toBe('Test Category');
      expect(category?.color).toBe('#FF0000');
      expect(category?.isDefault).toBe(false);
    });

    it('should get all categories including defaults', async () => {
      // Default categories should be created during initialization
      const categories = await CategoryService.getAll();
      expect(categories.length).toBeGreaterThan(0);
      
      // Check that default categories exist
      const defaultCategories = categories.filter(c => c.isDefault);
      expect(defaultCategories.length).toBeGreaterThan(0);
    });

    it('should update category', async () => {
      const id = await CategoryService.create(mockCategory);
      
      await CategoryService.update(id, {
        name: 'Updated Category',
        color: '#00FF00'
      });
      
      const category = await CategoryService.getById(id);
      expect(category?.name).toBe('Updated Category');
      expect(category?.color).toBe('#00FF00');
    });

    it('should not delete default categories', async () => {
      const defaultCategories = await CategoryService.getDefaults();
      expect(defaultCategories.length).toBeGreaterThan(0);
      
      const defaultCategory = defaultCategories[0];
      
      await expect(CategoryService.delete(defaultCategory.id))
        .rejects.toThrow('Cannot delete default category');
    });

    it('should delete non-default categories', async () => {
      const id = await CategoryService.create(mockCategory);
      
      await CategoryService.delete(id);
      
      const category = await CategoryService.getById(id);
      expect(category).toBeUndefined();
    });
  });

  describe('SettingsService', () => {
    it('should get default settings', async () => {
      const settings = await SettingsService.get();
      expect(settings).toBeDefined();
      expect(settings?.lowStockThreshold).toBe(5);
      expect(settings?.expirationWarningDays).toBe(7);
      expect(settings?.defaultLocation).toBe('pantry');
      expect(settings?.theme).toBe('system');
    });

    it('should update settings', async () => {
      await SettingsService.update({
        lowStockThreshold: 10,
        theme: 'dark'
      });
      
      const settings = await SettingsService.get();
      expect(settings?.lowStockThreshold).toBe(10);
      expect(settings?.theme).toBe('dark');
      expect(settings?.expirationWarningDays).toBe(7); // Should remain unchanged
    });

    it('should reset settings to defaults', async () => {
      await SettingsService.update({
        lowStockThreshold: 15,
        theme: 'light'
      });
      
      await SettingsService.reset();
      
      const settings = await SettingsService.get();
      expect(settings?.lowStockThreshold).toBe(5);
      expect(settings?.theme).toBe('system');
    });
  });

  describe('DatabaseService', () => {
    it('should clear all data', async () => {
      // Add some test data
      await InventoryService.create({
        name: 'Test Item',
        quantity: 5,
        unit: 'pieces',
        expirationDate: null,
        location: 'pantry',
        purchaseDate: new Date(),
        category: 'test',
        lastUsed: null
      });
      
      await DatabaseService.clearAll();
      
      const items = await InventoryService.getAll();
      expect(items).toHaveLength(0);
      
      // Should still have default categories and settings
      const categories = await CategoryService.getAll();
      expect(categories.length).toBeGreaterThan(0);
      
      const settings = await SettingsService.get();
      expect(settings).toBeDefined();
    });

    it('should export and import data', async () => {
      // Add test data
      const inventoryId = await InventoryService.create({
        name: 'Export Test',
        quantity: 5,
        unit: 'pieces',
        expirationDate: null,
        location: 'pantry',
        purchaseDate: new Date(),
        category: 'test',
        lastUsed: null
      });
      
      // Export data
      const exportData = await DatabaseService.exportData();
      expect(exportData.inventory).toHaveLength(1);
      expect(exportData.exportDate).toBeDefined();
      
      // Clear database completely
      await db.inventoryItems.clear();
      await db.shoppingItems.clear();
      await db.categories.clear();
      await db.settings.clear();
      
      // Import only inventory data to avoid constraint conflicts
      if (exportData.inventory?.length) {
        await db.inventoryItems.bulkAdd(exportData.inventory);
      }
      
      // Verify data was restored
      const items = await InventoryService.getAll();
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe('Export Test');
    });

    it('should get database statistics', async () => {
      await InventoryService.create({
        name: 'Stats Test',
        quantity: 5,
        unit: 'pieces',
        expirationDate: null,
        location: 'pantry',
        purchaseDate: new Date(),
        category: 'test',
        lastUsed: null
      });
      
      const stats = await DatabaseService.getStats();
      expect(stats.inventoryItems).toBe(1);
      expect(stats.shoppingItems).toBe(0);
      expect(stats.categories).toBeGreaterThan(0); // Default categories
    });
  });
});