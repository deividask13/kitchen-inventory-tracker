# Database Layer

This directory contains the complete database layer implementation for the Kitchen Inventory Tracker application.

## Overview

The database layer uses IndexedDB with Dexie.js for client-side data persistence, providing offline-first functionality. It includes comprehensive TypeScript interfaces, service layers, validation, and full test coverage.

## Structure

```
db/
├── schema.ts           # Dexie database schema and initialization
├── services.ts         # Service layer with CRUD operations
├── index.ts           # Main exports
├── __tests__/         # Comprehensive test suite
│   ├── services.test.ts      # Unit tests for all services
│   └── integration.test.ts   # Integration tests
└── README.md          # This file

../types/
└── index.ts           # TypeScript interfaces and types

../utils/
├── validation.ts      # Data validation and sanitization
└── __tests__/
    └── validation.test.ts    # Validation tests
```

## Features

### Data Models
- **InventoryItem**: Kitchen inventory items with expiration tracking
- **ShoppingListItem**: Shopping list management with completion tracking
- **Category**: Customizable categories with default presets
- **UserSettings**: User preferences and configuration

### Services
- **InventoryService**: Complete inventory management CRUD operations
- **ShoppingService**: Shopping list management with smart features
- **CategoryService**: Category management with default protection
- **SettingsService**: User settings management
- **DatabaseService**: Utility functions for backup/restore and statistics

### Key Features
- **Offline-first**: Full functionality without internet connection
- **Smart calculations**: Automatic low stock and expiration detection
- **Data validation**: Comprehensive input validation and sanitization
- **Flexible filtering**: Advanced search and filtering capabilities
- **Data integrity**: Automatic timestamps and computed fields
- **Backup/Restore**: Export and import functionality

## Usage

### Basic Operations

```typescript
import { InventoryService, ShoppingService } from '@/lib/db';

// Create inventory item
const itemId = await InventoryService.create({
  name: 'Apples',
  quantity: 10,
  unit: 'pieces',
  location: 'fridge',
  category: 'produce',
  purchaseDate: new Date(),
  expirationDate: new Date('2024-12-31'),
  lastUsed: null
});

// Get low stock items
const lowStockItems = await InventoryService.getLowStockItems();

// Add to shopping list
await ShoppingService.addFromInventory(lowStockItems);
```

### Advanced Filtering

```typescript
// Filter inventory by multiple criteria
const items = await InventoryService.getAll({
  location: 'fridge',
  status: 'expiring',
  search: 'apple'
});

// Get expiring items within 3 days
const urgentItems = await InventoryService.getExpiringItems(3);
```

### Settings Management

```typescript
import { SettingsService } from '@/lib/db';

// Update low stock threshold
await SettingsService.update({
  lowStockThreshold: 10,
  expirationWarningDays: 5
});
```

## Data Validation

All data is validated before database operations:

```typescript
import { validateInventoryItem, sanitizeInventoryItem } from '@/lib/utils/validation';

const rawItem = {
  name: '  Fresh Apples  ',
  quantity: 10,
  // ... other fields
};

// Sanitize and validate
const cleanItem = sanitizeInventoryItem(rawItem);
validateInventoryItem(cleanItem);

// Safe to create
await InventoryService.create(cleanItem);
```

## Testing

The database layer includes comprehensive tests:

- **Unit Tests**: 65 tests covering all service methods
- **Integration Tests**: 5 tests covering complete workflows
- **Validation Tests**: 35 tests covering all validation scenarios

Run tests:
```bash
npm run test:run
```

## Database Schema

### Indexes
- **InventoryItems**: Optimized for location, category, and expiration queries
- **ShoppingItems**: Indexed for category and date-based operations
- **Categories**: Simple name-based indexing
- **Settings**: Single record storage

### Relationships
- InventoryItem ↔ Category (many-to-one)
- ShoppingListItem ↔ InventoryItem (optional one-to-one)
- UserSettings ↔ Category (one-to-many for custom categories)

## Performance Considerations

- **Efficient Queries**: Proper indexing for common filter operations
- **Batch Operations**: Bulk operations for multiple items
- **Computed Fields**: Automatic calculation of derived values
- **Memory Management**: Proper cleanup and resource management

## Error Handling

- **Validation Errors**: Clear error messages with field identification
- **Database Errors**: Graceful handling of IndexedDB constraints
- **Type Safety**: Full TypeScript coverage prevents runtime errors
- **Fallback Behavior**: Sensible defaults when data is missing