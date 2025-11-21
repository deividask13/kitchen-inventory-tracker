# Testing Guide

This document provides an overview of the testing strategy and how to run tests for the Kitchen Inventory Tracker application.

## Test Structure

The application uses a comprehensive testing approach with multiple test types:

### 1. Unit Tests

**Location**: `src/**/__tests__/*.test.ts(x)`

**Purpose**: Test individual functions, components, and utilities in isolation.

**Examples**:
- Component behavior tests
- Utility function tests
- Hook tests
- Store logic tests

**Run unit tests**:
```bash
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:ui       # UI mode
```

### 2. Integration Tests

**Location**: `src/__tests__/*-integration.test.tsx`

**Purpose**: Test how multiple components and systems work together.

**Examples**:
- Complete user flows
- Store interactions
- Database operations
- Component integration

**Run integration tests**:
```bash
npm run test:run src/__tests__/user-flow-integration.test.tsx
```

### 3. End-to-End Tests

**Location**: `e2e/*.spec.ts`

**Purpose**: Test complete user journeys in a real browser environment.

**Test Suites**:
- `basic-functionality.spec.ts`: Core application functionality ✅ **11/11 PASSING**
  - Page navigation (home, inventory, dashboard, shopping, settings)
  - Modal interactions (open/close)
  - Responsive design across viewports (mobile, tablet, desktop)
  - Empty states
- `inventory-management.spec.ts`: Inventory CRUD operations (simplified)
- `shopping-list.spec.ts`: Shopping list functionality and offline mode
- `dashboard.spec.ts`: Dashboard widgets and insights
- `responsive-design.spec.ts`: Responsive behavior and touch interactions

**Run E2E tests**:
```bash
npm run test:e2e           # Run all E2E tests
npm run test:e2e:ui        # Run with Playwright UI
npm run test:e2e:headed    # Run in headed mode (see browser)
```

**E2E Test Configuration**:
- Tests run against `http://localhost:3000`
- Automatically starts dev server
- Tests multiple browsers (Chromium, Firefox, WebKit)
- Tests mobile viewports (iPhone, Pixel)

## Test Coverage

### Unit Test Coverage

- ✅ UI Components (Button, Card, Input, Modal, etc.)
- ✅ Inventory Components (Grid, Card, Form, etc.)
- ✅ Shopping List Components
- ✅ Dashboard Components
- ✅ Utility Functions (fuzzy search, validation, retry, performance)
- ✅ Custom Hooks (form validation, keyboard shortcuts, touch gestures)
- ✅ Store Logic (inventory, shopping, settings)
- ✅ Database Operations

### Integration Test Coverage

- ✅ Complete inventory management flow
- ✅ Shopping list integration with inventory
- ✅ Filtering and searching
- ✅ Expiring items detection
- ✅ Settings persistence
- ✅ Batch operations

### E2E Test Coverage

- ✅ Add, edit, delete inventory items
- ✅ Mark items as finished
- ✅ Filter by location and category
- ✅ Search functionality
- ✅ Quick actions (increment/decrement)
- ✅ Shopping list operations
- ✅ Check off items
- ✅ Clear completed items
- ✅ Offline functionality
- ✅ Dashboard stats and widgets
- ✅ Responsive layouts
- ✅ Touch-friendly controls
- ✅ Swipe gestures

## Running Tests

### Quick Start

```bash
# Run all unit tests
npm run test:run

# Run specific test file
npm run test:run src/components/ui/__tests__/button.test.tsx

# Run tests in watch mode (for development)
npm test

# Run E2E tests
npm run test:e2e
```

### Continuous Integration

For CI/CD pipelines:

```bash
# Run all tests
npm run test:run && npm run test:e2e
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should add inventory item', async ({ page }) => {
  await page.goto('/inventory');
  
  await page.click('button:has-text("Add Item")');
  await page.fill('input[name="name"]', 'Milk');
  await page.fill('input[name="quantity"]', '2');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('text=Milk')).toBeVisible();
});
```

## Test Best Practices

### 1. Test Behavior, Not Implementation

❌ Bad:
```typescript
expect(component.state.count).toBe(5);
```

✅ Good:
```typescript
expect(screen.getByText('Count: 5')).toBeInTheDocument();
```

### 2. Use Descriptive Test Names

❌ Bad:
```typescript
it('works', () => { ... });
```

✅ Good:
```typescript
it('should display error message when form is submitted with empty fields', () => { ... });
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should increment counter', () => {
  // Arrange
  render(<Counter initialValue={0} />);
  
  // Act
  userEvent.click(screen.getByRole('button', { name: /increment/i }));
  
  // Assert
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### 4. Clean Up After Tests

```typescript
afterEach(() => {
  // Clear mocks
  vi.clearAllMocks();
  
  // Clear IndexedDB
  indexedDB.deleteDatabase('TestDB');
});
```

### 5. Test Accessibility

```typescript
it('should be keyboard accessible', () => {
  render(<Button>Click me</Button>);
  
  const button = screen.getByRole('button');
  expect(button).toHaveAttribute('tabindex', '0');
});
```

## Debugging Tests

### Unit Tests

```bash
# Run tests in UI mode for debugging
npm run test:ui

# Run specific test with console output
npm run test:run -- --reporter=verbose src/path/to/test.ts
```

### E2E Tests

```bash
# Run with browser visible
npm run test:e2e:headed

# Run with Playwright Inspector
npm run test:e2e -- --debug

# Generate trace for failed tests
npm run test:e2e -- --trace on
```

## Performance Testing

### Measuring Component Performance

```typescript
import { performanceMonitor } from '@/lib/utils/performance';

it('should render quickly', () => {
  performanceMonitor.start('render');
  render(<ExpensiveComponent />);
  const duration = performanceMonitor.end('render');
  
  expect(duration).toBeLessThan(100); // Should render in < 100ms
});
```

### Load Testing

Use Playwright to test performance under load:

```typescript
test('should handle rapid interactions', async ({ page }) => {
  await page.goto('/inventory');
  
  // Rapidly add items
  for (let i = 0; i < 100; i++) {
    await page.click('button:has-text("Add Item")');
    await page.fill('input[name="name"]', `Item ${i}`);
    await page.click('button[type="submit"]');
  }
  
  // Verify all items are present
  await expect(page.locator('.inventory-item')).toHaveCount(100);
});
```

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "IndexedDB not found"
**Solution**: Ensure `fake-indexeddb` is properly configured in test setup

**Issue**: E2E tests timeout
**Solution**: Increase timeout in `playwright.config.ts` or check if dev server is running

**Issue**: Flaky tests
**Solution**: Use `waitFor` for async operations, avoid hardcoded delays

**Issue**: Tests pass locally but fail in CI
**Solution**: Check for timing issues, ensure proper cleanup between tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
