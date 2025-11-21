import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuickActionsPanel } from '../quick-actions-panel';
import { useInventoryStore } from '@/stores/inventory-store';
import { useShoppingStore } from '@/stores/shopping-store';
import type { InventoryItem } from '@/lib/types';

// Mock the stores
vi.mock('@/stores/inventory-store');
vi.mock('@/stores/shopping-store');

const mockUseInventoryStore = vi.mocked(useInventoryStore);
const mockUseShoppingStore = vi.mocked(useShoppingStore);

describe('QuickActionsPanel', () => {
  const mockLowStockItems: InventoryItem[] = [
    {
      id: '1',
      name: 'Milk',
      quantity: 1,
      unit: 'l',
      expirationDate: new Date(),
      location: 'fridge',
      purchaseDate: new Date(),
      category: 'dairy',
      isLow: true,
      isFinished: false,
      lastUsed: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockExpiringItems: InventoryItem[] = [
    {
      id: '2',
      name: 'Bread',
      quantity: 1,
      unit: 'loaf',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      location: 'pantry',
      purchaseDate: new Date(),
      category: 'bakery',
      isLow: false,
      isFinished: false,
      lastUsed: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockGetLowStockItems = vi.fn();
  const mockGetExpiringItems = vi.fn();
  const mockAddFromInventory = vi.fn();
  const mockAddShoppingItem = vi.fn();
  const mockAddInventoryItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockGetLowStockItems.mockReturnValue(mockLowStockItems);
    mockGetExpiringItems.mockReturnValue(mockExpiringItems);
    
    mockUseInventoryStore.mockReturnValue({
      items: [],
      getLowStockItems: mockGetLowStockItems,
      getExpiringItems: mockGetExpiringItems,
      addItem: mockAddInventoryItem,
      // Add other required properties with default values
      filters: {},
      isLoading: false,
      error: null,
      loadItems: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      markAsUsed: vi.fn(),
      markAsFinished: vi.fn(),
      setFilters: vi.fn(),
      clearError: vi.fn(),
      getItemsByLocation: vi.fn(),
      getFilteredItems: vi.fn()
    });

    mockUseShoppingStore.mockReturnValue({
      items: [],
      addFromInventory: mockAddFromInventory,
      addItem: mockAddShoppingItem,
      // Add other required properties with default values
      filters: {},
      isLoading: false,
      error: null,
      loadItems: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      toggleCompleted: vi.fn(),
      clearCompleted: vi.fn(),
      setFilters: vi.fn(),
      clearError: vi.fn(),
      getCompletedItems: vi.fn(),
      getPendingItems: vi.fn(),
      getItemsByCategory: vi.fn(),
      getFilteredItems: vi.fn(),
      getCompletionStats: vi.fn()
    });
  });

  it('renders all quick action buttons', () => {
    render(<QuickActionsPanel />);
    
    expect(screen.getByText('Add Item')).toBeInTheDocument();
    expect(screen.getByText('Add to Shopping')).toBeInTheDocument();
    expect(screen.getByText('Low Stock → Shopping')).toBeInTheDocument();
    expect(screen.getByText('Replace Expiring')).toBeInTheDocument();
  });

  it('shows action descriptions', () => {
    render(<QuickActionsPanel />);
    
    expect(screen.getByText('Add new inventory item')).toBeInTheDocument();
    expect(screen.getByText('Quick add to shopping list')).toBeInTheDocument();
    expect(screen.getByText('Add low stock items to shopping list')).toBeInTheDocument();
    expect(screen.getByText('Add replacements for expiring items')).toBeInTheDocument();
  });

  it('displays action icons', () => {
    render(<QuickActionsPanel />);
    
    expect(screen.getByText('➕')).toBeInTheDocument();
    expect(screen.getByText('🛒')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('⏰')).toBeInTheDocument();
  });

  it('opens add item modal when clicked', async () => {
    render(<QuickActionsPanel />);
    
    const addItemButton = screen.getByText('Add Item');
    fireEvent.click(addItemButton);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Add Item')).toBeInTheDocument();
      expect(screen.getByText('Add a new item to your inventory')).toBeInTheDocument();
    });
  });

  it('opens add to shopping modal when clicked', async () => {
    render(<QuickActionsPanel />);
    
    const addToShoppingButton = screen.getByText('Add to Shopping');
    fireEvent.click(addToShoppingButton);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Add to Shopping List')).toBeInTheDocument();
      expect(screen.getByText('Add an item to your shopping list')).toBeInTheDocument();
    });
  });

  it('adds low stock items to shopping list', () => {
    render(<QuickActionsPanel />);
    
    const lowStockButton = screen.getByText('Low Stock → Shopping');
    fireEvent.click(lowStockButton);
    
    expect(mockAddFromInventory).toHaveBeenCalledWith(mockLowStockItems);
  });

  it('adds expiring items as replacements to shopping list', () => {
    render(<QuickActionsPanel />);
    
    const expiringButton = screen.getByText('Replace Expiring');
    fireEvent.click(expiringButton);
    
    expect(mockAddShoppingItem).toHaveBeenCalledWith({
      name: 'Bread',
      quantity: 1,
      unit: 'loaf',
      category: 'bakery',
      isCompleted: false,
      notes: 'Replacement for expiring item',
      fromInventory: true,
      inventoryItemId: '2'
    });
  });

  it('handles empty low stock items gracefully', () => {
    mockGetLowStockItems.mockReturnValue([]);
    
    render(<QuickActionsPanel />);
    
    const lowStockButton = screen.getByText('Low Stock → Shopping');
    fireEvent.click(lowStockButton);
    
    // Should not call addFromInventory with empty array
    expect(mockAddFromInventory).not.toHaveBeenCalled();
  });

  it('handles empty expiring items gracefully', () => {
    mockGetExpiringItems.mockReturnValue([]);
    
    render(<QuickActionsPanel />);
    
    const expiringButton = screen.getByText('Replace Expiring');
    fireEvent.click(expiringButton);
    
    // Should not call addItem when no expiring items
    expect(mockAddShoppingItem).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(<QuickActionsPanel className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  describe('QuickAddItemForm', () => {
    beforeEach(async () => {
      render(<QuickActionsPanel />);
      
      const addItemButton = screen.getByText('Add Item');
      fireEvent.click(addItemButton);
      
      await waitFor(() => {
        expect(screen.getByText('Quick Add Item')).toBeInTheDocument();
      });
    });

    it('renders form fields correctly', () => {
      expect(screen.getByLabelText('Item Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Unit')).toBeInTheDocument();
      expect(screen.getByLabelText('Location')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
    });

    it('submits form with correct data', async () => {
      const nameInput = screen.getByLabelText('Item Name');
      const quantityInput = screen.getByLabelText('Quantity');
      const submitButton = screen.getByRole('button', { name: 'Add Item' });

      fireEvent.change(nameInput, { target: { value: 'Test Item' } });
      fireEvent.change(quantityInput, { target: { value: '2' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAddInventoryItem).toHaveBeenCalledWith({
          name: 'Test Item',
          quantity: 2,
          unit: 'pcs',
          location: 'fridge',
          category: 'other',
          expirationDate: null,
          purchaseDate: expect.any(Date),
          lastUsed: null,
          notes: ''
        });
      });
    });

    it('closes modal on cancel', async () => {
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Quick Add Item')).not.toBeInTheDocument();
      });
    });
  });

  describe('QuickAddShoppingForm', () => {
    beforeEach(async () => {
      render(<QuickActionsPanel />);
      
      const addToShoppingButton = screen.getByText('Add to Shopping');
      fireEvent.click(addToShoppingButton);
      
      await waitFor(() => {
        expect(screen.getByText('Quick Add to Shopping List')).toBeInTheDocument();
      });
    });

    it('renders shopping form fields correctly', () => {
      expect(screen.getByLabelText('Item Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Unit')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Notes (optional)')).toBeInTheDocument();
    });

    it('submits shopping form with correct data', async () => {
      const nameInput = screen.getByLabelText('Item Name');
      const notesInput = screen.getByLabelText('Notes (optional)');
      const submitButton = screen.getByText('Add to Shopping List');

      fireEvent.change(nameInput, { target: { value: 'Shopping Item' } });
      fireEvent.change(notesInput, { target: { value: 'Test notes' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAddShoppingItem).toHaveBeenCalledWith({
          name: 'Shopping Item',
          quantity: 1,
          unit: 'pcs',
          category: 'other',
          notes: 'Test notes',
          isCompleted: false
        });
      });
    });
  });
});