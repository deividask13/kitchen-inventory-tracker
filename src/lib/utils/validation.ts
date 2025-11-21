import { 
  InventoryItem, 
  ShoppingListItem, 
  Category, 
  UserSettings,
  CreateInventoryItem,
  CreateShoppingListItem,
  CreateCategory,
  CreateUserSettings
} from '../types';

// Validation functions for data integrity

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Inventory Item Validation
export const validateInventoryItem = (item: CreateInventoryItem): void => {
  if (!item.name || item.name.trim().length === 0) {
    throw new ValidationError('Item name is required', 'name');
  }
  
  if (item.name.length > 100) {
    throw new ValidationError('Item name must be 100 characters or less', 'name');
  }

  if (item.quantity < 0) {
    throw new ValidationError('Quantity cannot be negative', 'quantity');
  }

  if (!item.unit || item.unit.trim().length === 0) {
    throw new ValidationError('Unit is required', 'unit');
  }

  if (item.unit.length > 20) {
    throw new ValidationError('Unit must be 20 characters or less', 'unit');
  }

  if (!['fridge', 'pantry', 'freezer'].includes(item.location)) {
    throw new ValidationError('Location must be fridge, pantry, or freezer', 'location');
  }

  if (!item.category || item.category.trim().length === 0) {
    throw new ValidationError('Category is required', 'category');
  }

  if (item.expirationDate && item.expirationDate < item.purchaseDate) {
    throw new ValidationError('Expiration date cannot be before purchase date', 'expirationDate');
  }

  if (item.notes && item.notes.length > 500) {
    throw new ValidationError('Notes must be 500 characters or less', 'notes');
  }
};

// Shopping List Item Validation
export const validateShoppingListItem = (item: CreateShoppingListItem): void => {
  if (!item.name || item.name.trim().length === 0) {
    throw new ValidationError('Item name is required', 'name');
  }
  
  if (item.name.length > 100) {
    throw new ValidationError('Item name must be 100 characters or less', 'name');
  }

  if (item.quantity <= 0) {
    throw new ValidationError('Quantity must be greater than 0', 'quantity');
  }

  if (!item.unit || item.unit.trim().length === 0) {
    throw new ValidationError('Unit is required', 'unit');
  }

  if (item.unit.length > 20) {
    throw new ValidationError('Unit must be 20 characters or less', 'unit');
  }

  if (!item.category || item.category.trim().length === 0) {
    throw new ValidationError('Category is required', 'category');
  }

  if (item.notes && item.notes.length > 500) {
    throw new ValidationError('Notes must be 500 characters or less', 'notes');
  }
};

// Category Validation
export const validateCategory = (category: CreateCategory): void => {
  if (!category.name || category.name.trim().length === 0) {
    throw new ValidationError('Category name is required', 'name');
  }
  
  if (category.name.length > 50) {
    throw new ValidationError('Category name must be 50 characters or less', 'name');
  }

  if (!category.color || !isValidHexColor(category.color)) {
    throw new ValidationError('Valid hex color is required', 'color');
  }

  if (!category.icon || category.icon.trim().length === 0) {
    throw new ValidationError('Category icon is required', 'icon');
  }
};

// User Settings Validation
export const validateUserSettings = (settings: CreateUserSettings): void => {
  if (settings.lowStockThreshold < 0 || settings.lowStockThreshold > 100) {
    throw new ValidationError('Low stock threshold must be between 0 and 100', 'lowStockThreshold');
  }

  if (settings.expirationWarningDays < 1 || settings.expirationWarningDays > 30) {
    throw new ValidationError('Expiration warning days must be between 1 and 30', 'expirationWarningDays');
  }

  if (!['fridge', 'pantry', 'freezer'].includes(settings.defaultLocation)) {
    throw new ValidationError('Default location must be fridge, pantry, or freezer', 'defaultLocation');
  }

  if (!['light', 'dark', 'system'].includes(settings.theme)) {
    throw new ValidationError('Theme must be light, dark, or system', 'theme');
  }

  if (!Array.isArray(settings.preferredUnits) || settings.preferredUnits.length === 0) {
    throw new ValidationError('At least one preferred unit is required', 'preferredUnits');
  }

  // Validate each preferred unit
  settings.preferredUnits.forEach((unit, index) => {
    if (!unit || unit.trim().length === 0) {
      throw new ValidationError(`Preferred unit at index ${index} cannot be empty`, 'preferredUnits');
    }
    if (unit.length > 20) {
      throw new ValidationError(`Preferred unit at index ${index} must be 20 characters or less`, 'preferredUnits');
    }
  });
};

// Helper function to validate hex colors
const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Sanitization functions
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

export const sanitizeInventoryItem = (item: CreateInventoryItem): CreateInventoryItem => {
  return {
    ...item,
    name: sanitizeString(item.name),
    unit: sanitizeString(item.unit),
    category: sanitizeString(item.category),
    notes: item.notes ? sanitizeString(item.notes) : undefined
  };
};

export const sanitizeShoppingListItem = (item: CreateShoppingListItem): CreateShoppingListItem => {
  return {
    ...item,
    name: sanitizeString(item.name),
    unit: sanitizeString(item.unit),
    category: sanitizeString(item.category),
    notes: item.notes ? sanitizeString(item.notes) : undefined
  };
};

export const sanitizeCategory = (category: CreateCategory): CreateCategory => {
  return {
    ...category,
    name: sanitizeString(category.name),
    color: category.color.toUpperCase(),
    icon: category.icon.trim()
  };
};