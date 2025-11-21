import Dexie, { Table } from 'dexie';
import { 
  InventoryItem, 
  ShoppingListItem, 
  Category, 
  UserSettings 
} from '../types';

// Database schema class extending Dexie
export class KitchenInventoryDB extends Dexie {
  // Table declarations
  inventoryItems!: Table<InventoryItem>;
  shoppingItems!: Table<ShoppingListItem>;
  categories!: Table<Category>;
  settings!: Table<UserSettings>;

  constructor() {
    super('KitchenInventoryDB');
    
    // Define database schema with indexes
    this.version(1).stores({
      // InventoryItems table with indexes for efficient querying
      inventoryItems: '++id, name, location, category, expirationDate, [location+category]',
      
      // ShoppingItems table with indexes for filtering and sorting
      shoppingItems: '++id, name, category, addedAt, inventoryItemId',
      
      // Categories table
      categories: '++id, name',
      
      // Settings table (typically single record)
      settings: '++id'
    });

    // Add hooks for automatic timestamp management
    this.inventoryItems.hook('creating', function (_, obj: InventoryItem) {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
      obj.isFinished = obj.quantity <= 0;
      // isLow will be calculated in the service layer using settings
    });

    this.inventoryItems.hook('updating', function (modifications: Partial<InventoryItem>) {
      (modifications as any).updatedAt = new Date();
      
      // Update computed fields if quantity changes
      if (modifications.quantity !== undefined) {
        (modifications as any).isFinished = modifications.quantity <= 0;
        // isLow will be calculated in the service layer using settings
      }
    });

    this.shoppingItems.hook('creating', function (_, obj: ShoppingListItem) {
      obj.addedAt = new Date();
    });

    this.shoppingItems.hook('updating', function (modifications: Partial<ShoppingListItem>, _, obj: ShoppingListItem) {
      // Set completion timestamp when item is marked as completed
      if (modifications.isCompleted === true && !obj.completedAt) {
        (modifications as any).completedAt = new Date();
      } else if (modifications.isCompleted === false) {
        (modifications as any).completedAt = undefined;
      }
    });
  }

  // Initialize default data
  async initializeDefaults() {
    // Check if categories already exist
    const categoryCount = await this.categories.count();
    
    if (categoryCount === 0) {
      // Add default categories
      const defaultCategories: Category[] = [
        { id: 'produce', name: 'Produce', color: '#10B981', icon: '🥬', isDefault: true },
        { id: 'dairy', name: 'Dairy', color: '#F59E0B', icon: '🥛', isDefault: true },
        { id: 'meat', name: 'Meat & Seafood', color: '#EF4444', icon: '🥩', isDefault: true },
        { id: 'pantry', name: 'Pantry Staples', color: '#8B5CF6', icon: '🥫', isDefault: true },
        { id: 'frozen', name: 'Frozen', color: '#06B6D4', icon: '🧊', isDefault: true },
        { id: 'beverages', name: 'Beverages', color: '#84CC16', icon: '🥤', isDefault: true },
        { id: 'snacks', name: 'Snacks', color: '#F97316', icon: '🍿', isDefault: true },
        { id: 'condiments', name: 'Condiments', color: '#EC4899', icon: '🍯', isDefault: true }
      ];

      await this.categories.bulkAdd(defaultCategories);
    }

    // Check if settings exist
    const settingsCount = await this.settings.count();
    
    if (settingsCount === 0) {
      // Add default settings
      const defaultSettings: UserSettings = {
        id: 'default',
        lowStockThreshold: 5,
        expirationWarningDays: 7,
        defaultLocation: 'pantry',
        preferredUnits: ['pieces', 'lbs', 'oz', 'cups', 'liters', 'ml'],
        categories: [],
        theme: 'system',
        reducedMotion: false
      };

      await this.settings.add(defaultSettings);
    }
  }
}

// Create and export database instance
export const db = new KitchenInventoryDB();

// Initialize defaults when database is ready
db.on('ready', () => {
  return db.initializeDefaults();
});