// Core data model interfaces for the Kitchen Inventory Tracker

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expirationDate: Date | null;
  location: 'fridge' | 'pantry' | 'freezer';
  purchaseDate: Date;
  category: string;
  isLow: boolean;
  isFinished: boolean;
  lastUsed: Date | null;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  isCompleted: boolean;
  notes?: string;
  addedAt: Date;
  completedAt?: Date;
  fromInventory?: boolean;
  inventoryItemId?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface UserSettings {
  id: string;
  lowStockThreshold: number;
  expirationWarningDays: number;
  defaultLocation: 'fridge' | 'pantry' | 'freezer';
  preferredUnits: string[];
  categories: Category[];
  theme: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
}

// Input types for creating new records (without auto-generated fields)
export type CreateInventoryItem = Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'isLow' | 'isFinished'>;
export type CreateShoppingListItem = Omit<ShoppingListItem, 'id' | 'addedAt' | 'completedAt'>;
export type CreateCategory = Omit<Category, 'id'>;
export type CreateUserSettings = Omit<UserSettings, 'id'>;

// Update types for partial updates
export type UpdateInventoryItem = Partial<Omit<InventoryItem, 'id' | 'createdAt'>>;
export type UpdateShoppingListItem = Partial<Omit<ShoppingListItem, 'id' | 'addedAt'>>;
export type UpdateCategory = Partial<Omit<Category, 'id'>>;
export type UpdateUserSettings = Partial<Omit<UserSettings, 'id'>>;

// Filter and query types
export interface InventoryFilters {
  location?: 'fridge' | 'pantry' | 'freezer';
  category?: string;
  status?: 'all' | 'expiring' | 'low' | 'finished';
  search?: string;
}

export interface ShoppingFilters {
  category?: string;
  completed?: boolean;
  search?: string;
}