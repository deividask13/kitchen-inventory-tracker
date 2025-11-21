import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InventoryPage from '../page';
import * as inventoryStore from '../../../stores/inventory-store';
import * as settingsStore from '../../../stores/settings-store';

// Mock the stores
vi.mock('../../../stores/inventory-store', () => ({
  useInventoryStore: vi.fn(),
}));
vi.mock('../../../stores/settings-store', () => ({
  useSettingsStore: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the child components
vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  Modal: ({ children, isOpen }: any) => isOpen ? <div>{children}</div> : null,
}));

vi.mock('@/components/inventory', () => ({
  InventoryGrid: ({ items, filters, onFiltersChange }: any) => (
    <div data-testid="inventory-grid">
      <div data-testid="item-count">{items.length}</div>
      <button onClick={() => onFiltersChange({ location: 'Fridge' })}>
        Change Filter
      </button>
    </div>
  ),
  ItemForm: ({ onSubmit, onCancel }: any) => (
    <div data-testid="item-form">
      <button onClick={() => onSubmit({ name: 'Test Item' })}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('InventoryPage', () => {
  const mockLoadItems = vi.fn();
  const mockLoadCategories = vi.fn();
  const mockSetFilters = vi.fn();
  const mockAddItem = vi.fn();
  const mockUpdateItem = vi.fn();
  const mockMarkAsUsed = vi.fn();
  const mockMarkAsFinished = vi.fn();
  const mockClearError = vi.fn();
  const mockGetFilteredItems = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup inventory store mock
    vi.mocked(inventoryStore.useInventoryStore).mockReturnValue({
      items: [
        { id: '1', name: 'Milk', quantity: 2, location: 'Fridge', category: 'Dairy' },
        { id: '2', name: 'Bread', quantity: 1, location: 'Pantry', category: 'Bakery' },
      ],
      filters: {},
      isLoading: false,
      error: null,
      loadItems: mockLoadItems,
      addItem: mockAddItem,
      updateItem: mockUpdateItem,
      markAsUsed: mockMarkAsUsed,
      markAsFinished: mockMarkAsFinished,
      setFilters: mockSetFilters,
      clearError: mockClearError,
      getFilteredItems: mockGetFilteredItems,
    });

    // Setup settings store mock
    vi.mocked(settingsStore.useSettingsStore).mockReturnValue({
      categories: [
        { id: '1', name: 'Dairy', color: '#blue' },
        { id: '2', name: 'Bakery', color: '#brown' },
      ],
      loadCategories: mockLoadCategories,
    });

    mockGetFilteredItems.mockReturnValue([
      { id: '1', name: 'Milk', quantity: 2, location: 'Fridge', category: 'Dairy' },
      { id: '2', name: 'Bread', quantity: 1, location: 'Pantry', category: 'Bakery' },
    ]);
  });

  it('should load items only once on mount', async () => {
    render(<InventoryPage />);

    await waitFor(() => {
      expect(mockLoadItems).toHaveBeenCalledTimes(1);
      expect(mockLoadCategories).toHaveBeenCalledTimes(1);
    });
  });

  it('should not reload items when filters change', async () => {
    const { rerender } = render(<InventoryPage />);

    // Initial load
    await waitFor(() => {
      expect(mockLoadItems).toHaveBeenCalledTimes(1);
    });

    // Simulate filter change
    const changeFilterButton = screen.getByText('Change Filter');
    changeFilterButton.click();

    // Wait a bit to ensure no additional loads
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should still only be called once from mount
    expect(mockLoadItems).toHaveBeenCalledTimes(1);
    expect(mockSetFilters).toHaveBeenCalledWith({ location: 'Fridge' });
  });

  it('should display filtered items from getFilteredItems', () => {
    render(<InventoryPage />);

    expect(mockGetFilteredItems).toHaveBeenCalled();
    const itemCount = screen.getByTestId('item-count');
    expect(itemCount.textContent).toBe('2');
  });

  it('should handle errors gracefully', () => {
    vi.mocked(inventoryStore.useInventoryStore).mockReturnValue({
      items: [],
      filters: {},
      isLoading: false,
      error: 'Failed to load items',
      loadItems: mockLoadItems,
      addItem: mockAddItem,
      updateItem: mockUpdateItem,
      markAsUsed: mockMarkAsUsed,
      markAsFinished: mockMarkAsFinished,
      setFilters: mockSetFilters,
      clearError: mockClearError,
      getFilteredItems: mockGetFilteredItems,
    });

    render(<InventoryPage />);

    const errorMessage = screen.getByText('Failed to load items');
    expect(errorMessage).toBeDefined();
  });
});
