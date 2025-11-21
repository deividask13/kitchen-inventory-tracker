import { describe, it, expect } from 'vitest';
import {
  validateInventoryItem,
  validateShoppingListItem,
  validateCategory,
  validateUserSettings,
  ValidationError,
  sanitizeString,
  sanitizeInventoryItem,
  sanitizeShoppingListItem,
  sanitizeCategory
} from '../validation';
import { 
  CreateInventoryItem, 
  CreateShoppingListItem, 
  CreateCategory, 
  CreateUserSettings 
} from '../../types';

describe('Validation Functions', () => {
  describe('validateInventoryItem', () => {
    const validItem: CreateInventoryItem = {
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

    it('should pass validation for valid item', () => {
      expect(() => validateInventoryItem(validItem)).not.toThrow();
    });

    it('should throw error for empty name', () => {
      const item = { ...validItem, name: '' };
      expect(() => validateInventoryItem(item))
        .toThrow(new ValidationError('Item name is required', 'name'));
    });

    it('should throw error for name too long', () => {
      const item = { ...validItem, name: 'a'.repeat(101) };
      expect(() => validateInventoryItem(item))
        .toThrow(new ValidationError('Item name must be 100 characters or less', 'name'));
    });

    it('should throw error for negative quantity', () => {
      const item = { ...validItem, quantity: -1 };
      expect(() => validateInventoryItem(item))
        .toThrow(new ValidationError('Quantity cannot be negative', 'quantity'));
    });

    it('should throw error for empty unit', () => {
      const item = { ...validItem, unit: '' };
      expect(() => validateInventoryItem(item))
        .toThrow(new ValidationError('Unit is required', 'unit'));
    });

    it('should throw error for unit too long', () => {
      const item = { ...validItem, unit: 'a'.repeat(21) };
      expect(() => validateInventoryItem(item))
        .toThrow(new ValidationError('Unit must be 20 characters or less', 'unit'));
    });

    it('should throw error for invalid location', () => {
      const item = { ...validItem, location: 'invalid' as any };
      expect(() => validateInventoryItem(item))
        .toThrow(new ValidationError('Location must be fridge, pantry, or freezer', 'location'));
    });

    it('should throw error for empty category', () => {
      const item = { ...validItem, category: '' };
      expect(() => validateInventoryItem(item))
        .toThrow(new ValidationError('Category is required', 'category'));
    });

    it('should throw error for expiration before purchase date', () => {
      const item = { 
        ...validItem, 
        purchaseDate: new Date('2024-12-01'),
        expirationDate: new Date('2024-11-01')
      };
      expect(() => validateInventoryItem(item))
        .toThrow(new ValidationError('Expiration date cannot be before purchase date', 'expirationDate'));
    });

    it('should throw error for notes too long', () => {
      const item = { ...validItem, notes: 'a'.repeat(501) };
      expect(() => validateInventoryItem(item))
        .toThrow(new ValidationError('Notes must be 500 characters or less', 'notes'));
    });
  });

  describe('validateShoppingListItem', () => {
    const validItem: CreateShoppingListItem = {
      name: 'Milk',
      quantity: 2,
      unit: 'liters',
      category: 'dairy',
      isCompleted: false,
      notes: 'Organic milk'
    };

    it('should pass validation for valid item', () => {
      expect(() => validateShoppingListItem(validItem)).not.toThrow();
    });

    it('should throw error for empty name', () => {
      const item = { ...validItem, name: '' };
      expect(() => validateShoppingListItem(item))
        .toThrow(new ValidationError('Item name is required', 'name'));
    });

    it('should throw error for zero quantity', () => {
      const item = { ...validItem, quantity: 0 };
      expect(() => validateShoppingListItem(item))
        .toThrow(new ValidationError('Quantity must be greater than 0', 'quantity'));
    });

    it('should throw error for negative quantity', () => {
      const item = { ...validItem, quantity: -1 };
      expect(() => validateShoppingListItem(item))
        .toThrow(new ValidationError('Quantity must be greater than 0', 'quantity'));
    });

    it('should throw error for empty unit', () => {
      const item = { ...validItem, unit: '' };
      expect(() => validateShoppingListItem(item))
        .toThrow(new ValidationError('Unit is required', 'unit'));
    });

    it('should throw error for empty category', () => {
      const item = { ...validItem, category: '' };
      expect(() => validateShoppingListItem(item))
        .toThrow(new ValidationError('Category is required', 'category'));
    });
  });

  describe('validateCategory', () => {
    const validCategory: CreateCategory = {
      name: 'Test Category',
      color: '#FF0000',
      icon: '🧪',
      isDefault: false
    };

    it('should pass validation for valid category', () => {
      expect(() => validateCategory(validCategory)).not.toThrow();
    });

    it('should throw error for empty name', () => {
      const category = { ...validCategory, name: '' };
      expect(() => validateCategory(category))
        .toThrow(new ValidationError('Category name is required', 'name'));
    });

    it('should throw error for name too long', () => {
      const category = { ...validCategory, name: 'a'.repeat(51) };
      expect(() => validateCategory(category))
        .toThrow(new ValidationError('Category name must be 50 characters or less', 'name'));
    });

    it('should throw error for invalid hex color', () => {
      const category = { ...validCategory, color: 'red' };
      expect(() => validateCategory(category))
        .toThrow(new ValidationError('Valid hex color is required', 'color'));
    });

    it('should throw error for empty icon', () => {
      const category = { ...validCategory, icon: '' };
      expect(() => validateCategory(category))
        .toThrow(new ValidationError('Category icon is required', 'icon'));
    });

    it('should accept 3-digit hex colors', () => {
      const category = { ...validCategory, color: '#F00' };
      expect(() => validateCategory(category)).not.toThrow();
    });
  });

  describe('validateUserSettings', () => {
    const validSettings: CreateUserSettings = {
      lowStockThreshold: 5,
      expirationWarningDays: 7,
      defaultLocation: 'pantry',
      preferredUnits: ['pieces', 'lbs', 'oz'],
      categories: [],
      theme: 'system',
      reducedMotion: false
    };

    it('should pass validation for valid settings', () => {
      expect(() => validateUserSettings(validSettings)).not.toThrow();
    });

    it('should throw error for invalid low stock threshold', () => {
      const settings = { ...validSettings, lowStockThreshold: -1 };
      expect(() => validateUserSettings(settings))
        .toThrow(new ValidationError('Low stock threshold must be between 0 and 100', 'lowStockThreshold'));
    });

    it('should throw error for invalid expiration warning days', () => {
      const settings = { ...validSettings, expirationWarningDays: 0 };
      expect(() => validateUserSettings(settings))
        .toThrow(new ValidationError('Expiration warning days must be between 1 and 30', 'expirationWarningDays'));
    });

    it('should throw error for invalid default location', () => {
      const settings = { ...validSettings, defaultLocation: 'invalid' as any };
      expect(() => validateUserSettings(settings))
        .toThrow(new ValidationError('Default location must be fridge, pantry, or freezer', 'defaultLocation'));
    });

    it('should throw error for invalid theme', () => {
      const settings = { ...validSettings, theme: 'invalid' as any };
      expect(() => validateUserSettings(settings))
        .toThrow(new ValidationError('Theme must be light, dark, or system', 'theme'));
    });

    it('should throw error for empty preferred units', () => {
      const settings = { ...validSettings, preferredUnits: [] };
      expect(() => validateUserSettings(settings))
        .toThrow(new ValidationError('At least one preferred unit is required', 'preferredUnits'));
    });

    it('should throw error for empty unit in preferred units', () => {
      const settings = { ...validSettings, preferredUnits: ['pieces', ''] };
      expect(() => validateUserSettings(settings))
        .toThrow(new ValidationError('Preferred unit at index 1 cannot be empty', 'preferredUnits'));
    });
  });

  describe('Sanitization Functions', () => {
    describe('sanitizeString', () => {
      it('should trim whitespace', () => {
        expect(sanitizeString('  hello  ')).toBe('hello');
      });

      it('should replace multiple spaces with single space', () => {
        expect(sanitizeString('hello    world')).toBe('hello world');
      });

      it('should handle mixed whitespace', () => {
        expect(sanitizeString('  hello\t\n  world  ')).toBe('hello world');
      });
    });

    describe('sanitizeInventoryItem', () => {
      it('should sanitize string fields', () => {
        const item: CreateInventoryItem = {
          name: '  Test Apple  ',
          quantity: 10,
          unit: '  pieces  ',
          expirationDate: null,
          location: 'fridge',
          purchaseDate: new Date(),
          category: '  produce  ',
          lastUsed: null,
          notes: '  Fresh   apples  '
        };

        const sanitized = sanitizeInventoryItem(item);
        expect(sanitized.name).toBe('Test Apple');
        expect(sanitized.unit).toBe('pieces');
        expect(sanitized.category).toBe('produce');
        expect(sanitized.notes).toBe('Fresh apples');
      });
    });

    describe('sanitizeShoppingListItem', () => {
      it('should sanitize string fields', () => {
        const item: CreateShoppingListItem = {
          name: '  Milk  ',
          quantity: 2,
          unit: '  liters  ',
          category: '  dairy  ',
          isCompleted: false,
          notes: '  Organic   milk  '
        };

        const sanitized = sanitizeShoppingListItem(item);
        expect(sanitized.name).toBe('Milk');
        expect(sanitized.unit).toBe('liters');
        expect(sanitized.category).toBe('dairy');
        expect(sanitized.notes).toBe('Organic milk');
      });
    });

    describe('sanitizeCategory', () => {
      it('should sanitize category fields', () => {
        const category: CreateCategory = {
          name: '  Test Category  ',
          color: '#ff0000',
          icon: '  🧪  ',
          isDefault: false
        };

        const sanitized = sanitizeCategory(category);
        expect(sanitized.name).toBe('Test Category');
        expect(sanitized.color).toBe('#FF0000');
        expect(sanitized.icon).toBe('🧪');
      });
    });
  });
});