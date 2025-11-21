import { describe, it, expect, beforeEach } from 'vitest';
import { 
  InventoryService, 
  ShoppingService, 
  CategoryService, 
  SettingsService,
  DatabaseService 
} from '../services';
import { db } from '../schema';
import { 
  validateInventoryItem, 
  validateShoppingListItem, 
  sanitizeInventoryItem 
} from '../../utils/validation';
import { CreateInventoryItem, CreateShoppingListItem } from '../../types';

describe('Database Integration Tests', () => {
  beforeEach(async () => {
    await DatabaseService.clearAll();
  });

  it('should handle complete inventory workflow', async () => {
    // 1. Create inventory item with validation
    const rawItem: CreateInventoryItem = {
      name: '  Fresh Apples  ',
      quantity: 10,
      unit: 'pieces',
      expirationDate: new Date('2024-12-31'),
      location: 'fridge',
      purchaseDate: new Date('2024-11-01'),
      category: 'produce',
      lastUsed: null,
      notes: '  Organic   apples  '
    };

    // Validate and sanitize
    const sanitizedItem = sanitizeInventoryItem(rawItem);
    validateInventoryItem(sanitizedItem);
    
    // Create item
    const itemId = await InventoryService.create(sanitizedItem);
    expect(itemId).toBeDefined();

    // 2. Verify item was created correctly
    const item = await InventoryService.getById(itemId);
    expect(item?.name).toBe('Fresh Apples');
    expect(item?.notes).toBe('Organic apples');
    expect(item?.isLow).toBe(false);
    expect(item?.isFinished).toBe(false);

    // 3. Use some of the item
    await InventoryService.markAsUsed(itemId, 7);
    
    const updatedItem = await InventoryService.getById(itemId);
    expect(updatedItem?.quantity).toBe(3);
    expect(updatedItem?.isLow).toBe(true); // 3 <= 5 (default threshold)
    expect(updatedItem?.lastUsed).toBeInstanceOf(Date);

    // 4. Get low stock items
    const lowStockItems = await InventoryService.getLowStockItems();
    expect(lowStockItems).toHaveLength(1);
    expect(lowStockItems[0].id).toBe(itemId);

    // 5. Add low stock item to shopping list
    await ShoppingService.addFromInventory(lowStockItems);
    
    const shoppingItems = await ShoppingService.getAll();
    expect(shoppingItems).toHaveLength(1);
    expect(shoppingItems[0].name).toBe('Fresh Apples');
    expect(shoppingItems[0].fromInventory).toBe(true);
    expect(shoppingItems[0].inventoryItemId).toBe(itemId);

    // 6. Complete shopping item
    await ShoppingService.toggleCompleted(shoppingItems[0].id);
    
    const completedItem = await ShoppingService.getById(shoppingItems[0].id);
    expect(completedItem?.isCompleted).toBe(true);
    expect(completedItem?.completedAt).toBeInstanceOf(Date);

    // 7. Clear completed items
    await ShoppingService.clearCompleted();
    
    const remainingShoppingItems = await ShoppingService.getAll();
    expect(remainingShoppingItems).toHaveLength(0);
  });

  it('should handle category management workflow', async () => {
    // 1. Get default categories
    const defaultCategories = await CategoryService.getAll();
    expect(defaultCategories.length).toBeGreaterThan(0);
    
    const produceCategory = defaultCategories.find(c => c.name === 'Produce');
    expect(produceCategory).toBeDefined();
    expect(produceCategory?.isDefault).toBe(true);

    // 2. Create custom category
    const customCategoryId = await CategoryService.create({
      name: 'Custom Category',
      color: '#FF5733',
      icon: '🎯',
      isDefault: false
    });

    // 3. Use custom category for inventory item
    const itemId = await InventoryService.create({
      name: 'Custom Item',
      quantity: 5,
      unit: 'pieces',
      expirationDate: null,
      location: 'pantry',
      purchaseDate: new Date(),
      category: 'Custom Category',
      lastUsed: null
    });

    // 4. Filter items by custom category
    const categoryItems = await InventoryService.getAll({ category: 'Custom Category' });
    expect(categoryItems).toHaveLength(1);
    expect(categoryItems[0].name).toBe('Custom Item');

    // 5. Delete custom category (should work since it's not default)
    await CategoryService.delete(customCategoryId);
    
    const updatedCategories = await CategoryService.getAll();
    const deletedCategory = updatedCategories.find(c => c.id === customCategoryId);
    expect(deletedCategory).toBeUndefined();
  });

  it('should handle settings management', async () => {
    // 1. Get default settings
    const defaultSettings = await SettingsService.get();
    expect(defaultSettings?.lowStockThreshold).toBe(5);
    expect(defaultSettings?.theme).toBe('system');

    // 2. Update settings
    await SettingsService.update({
      lowStockThreshold: 10,
      theme: 'dark',
      expirationWarningDays: 14
    });

    const updatedSettings = await SettingsService.get();
    expect(updatedSettings?.lowStockThreshold).toBe(10);
    expect(updatedSettings?.theme).toBe('dark');
    expect(updatedSettings?.expirationWarningDays).toBe(14);
    expect(updatedSettings?.defaultLocation).toBe('pantry'); // Should remain unchanged

    // 3. Test low stock threshold affects item classification
    const itemId = await InventoryService.create({
      name: 'Test Item',
      quantity: 8, // Between old threshold (5) and new threshold (10)
      unit: 'pieces',
      expirationDate: null,
      location: 'pantry',
      purchaseDate: new Date(),
      category: 'test',
      lastUsed: null
    });

    // Item should be marked as low stock with new threshold
    await InventoryService.update(itemId, { quantity: 8 });
    
    const item = await InventoryService.getById(itemId);
    expect(item?.isLow).toBe(true); // 8 <= 10 (new threshold)
  });

  it('should handle expiring items workflow', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 8);
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Create items with different expiration dates
    await InventoryService.create({
      name: 'Expiring Tomorrow',
      quantity: 5,
      unit: 'pieces',
      expirationDate: tomorrow,
      location: 'fridge',
      purchaseDate: new Date(),
      category: 'produce',
      lastUsed: null
    });

    await InventoryService.create({
      name: 'Expiring Next Week',
      quantity: 3,
      unit: 'pieces',
      expirationDate: nextWeek,
      location: 'fridge',
      purchaseDate: new Date(),
      category: 'produce',
      lastUsed: null
    });

    await InventoryService.create({
      name: 'Expiring Next Month',
      quantity: 10,
      unit: 'pieces',
      expirationDate: nextMonth,
      location: 'fridge',
      purchaseDate: new Date(),
      category: 'produce',
      lastUsed: null
    });

    // Get items expiring within 7 days
    const expiringItems = await InventoryService.getExpiringItems(7);
    expect(expiringItems).toHaveLength(1);
    expect(expiringItems[0].name).toBe('Expiring Tomorrow');

    // Get items expiring within 10 days
    const expiringItems10 = await InventoryService.getExpiringItems(10);
    expect(expiringItems10).toHaveLength(2);
    
    // Should be sorted by expiration date (soonest first)
    expect(expiringItems10[0].name).toBe('Expiring Tomorrow');
    expect(expiringItems10[1].name).toBe('Expiring Next Week');
  });

  it('should handle data export and import', async () => {
    // Create test data
    const itemId = await InventoryService.create({
      name: 'Export Test Item',
      quantity: 5,
      unit: 'pieces',
      expirationDate: null,
      location: 'pantry',
      purchaseDate: new Date(),
      category: 'test',
      lastUsed: null
    });

    const shoppingId = await ShoppingService.create({
      name: 'Export Test Shopping',
      quantity: 2,
      unit: 'pieces',
      category: 'test',
      isCompleted: false
    });

    // Export data
    const exportData = await DatabaseService.exportData();
    expect(exportData.inventory).toHaveLength(1);
    expect(exportData.shopping).toHaveLength(1);
    expect(exportData.categories.length).toBeGreaterThan(0);
    expect(exportData.settings).toHaveLength(1);

    // Get stats before clearing
    const statsBefore = await DatabaseService.getStats();
    expect(statsBefore.inventoryItems).toBe(1);
    expect(statsBefore.shoppingItems).toBe(1);

    // Clear and verify empty
    await DatabaseService.clearAll();
    const statsAfter = await DatabaseService.getStats();
    expect(statsAfter.inventoryItems).toBe(0);
    expect(statsAfter.shoppingItems).toBe(0);

    // Import only inventory and shopping data to avoid constraint conflicts
    await db.inventoryItems.bulkAdd(exportData.inventory);
    await db.shoppingItems.bulkAdd(exportData.shopping);

    // Verify data restored
    const restoredInventory = await InventoryService.getAll();
    const restoredShopping = await ShoppingService.getAll();
    
    expect(restoredInventory).toHaveLength(1);
    expect(restoredInventory[0].name).toBe('Export Test Item');
    
    expect(restoredShopping).toHaveLength(1);
    expect(restoredShopping[0].name).toBe('Export Test Shopping');
  });
});