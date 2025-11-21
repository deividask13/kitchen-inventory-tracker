import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BatchEntry } from '../forms/batch-entry';
import { QuickActions } from '../inventory/quick-actions';
import { QuantityControls } from '../inventory/quantity-controls';
import { SwipeActions, createSwipeActions } from '../inventory/swipe-actions';
import type { CreateInventoryItem, InventoryItem } from '@/lib/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
  useMotionValue: () => ({ set: vi.fn(), get: vi.fn(() => 0) }),
  useTransform: () => 0,
  PanInfo: {},
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, disabled, loading, ...props }: any) => (
    <button onClick={onClick} disabled={disabled || loading} {...props}>
      {loading && <span>Loading...</span>}
      {children}
    </button>
  ),
  Input: ({ onChange, value, placeholder, error, ...props }: any) => (
    <div>
      <input 
        onChange={onChange} 
        value={value} 
        placeholder={placeholder} 
        {...props} 
      />
      {error && <p role="alert">{error}</p>}
    </div>
  ),
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

const mockCategories = ['Produce', 'Dairy', 'Meat', 'Pantry'];

const mockItem: InventoryItem = {
  id: '1',
  name: 'Test Item',
  quantity: 5,
  unit: 'pieces',
  expirationDate: null,
  location: 'pantry',
  purchaseDate: new Date(),
  category: 'Test Category',
  isLow: false,
  isFinished: false,
  lastUsed: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Batch Entry and Quick Actions Integration', () => {
  it('integrates batch entry with quantity controls', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <BatchEntry
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        categories={mockCategories}
      />
    );

    // Add item name
    const nameInput = screen.getByPlaceholderText('Item name');
    await user.type(nameInput, 'Test Item');

    // Verify quantity controls work
    const quantityInput = screen.getByPlaceholderText('Qty');
    expect(quantityInput).toHaveValue(1);

    // Submit the form
    const saveButton = screen.getByText(/Save All Items/);
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Test Item',
          quantity: 1,
          unit: 'pieces',
        }),
      ]);
    });
  });

  it('integrates quick actions with haptic feedback', async () => {
    const user = userEvent.setup();
    const mockOnQuantityChange = vi.fn();
    const mockOnEdit = vi.fn();
    const mockOnAddToShoppingList = vi.fn();
    const mockOnMarkAsUsed = vi.fn();
    const mockOnMarkAsFinished = vi.fn();

    render(
      <QuickActions
        item={mockItem}
        onQuantityChange={mockOnQuantityChange}
        onMarkAsUsed={mockOnMarkAsUsed}
        onMarkAsFinished={mockOnMarkAsFinished}
        onEdit={mockOnEdit}
        onAddToShoppingList={mockOnAddToShoppingList}
      />
    );

    // Open quick actions menu
    const actionButton = screen.getByRole('button', { name: 'Quick actions' });
    await user.click(actionButton);

    // Verify menu is open
    expect(screen.getByText('Edit Item')).toBeInTheDocument();
    expect(screen.getByText('Add to Shopping List')).toBeInTheDocument();
  });

  it('integrates quantity controls with different sizes', () => {
    const mockOnChange = vi.fn();

    const { rerender } = render(
      <QuantityControls
        value={5}
        unit="pieces"
        onChange={mockOnChange}
        size="sm"
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('pieces')).toBeInTheDocument();

    // Test different sizes
    rerender(
      <QuantityControls
        value={10}
        unit="lbs"
        onChange={mockOnChange}
        size="lg"
      />
    );

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('lbs')).toBeInTheDocument();
  });

  it('integrates swipe actions with predefined actions', () => {
    const mockMarkAsUsed = vi.fn();
    const mockDelete = vi.fn();

    const leftActions = [createSwipeActions.markAsUsed(mockMarkAsUsed)];
    const rightActions = [createSwipeActions.delete(mockDelete)];

    render(
      <SwipeActions leftActions={leftActions} rightActions={rightActions}>
        <div>Swipeable Content</div>
      </SwipeActions>
    );

    expect(screen.getByText('Swipeable Content')).toBeInTheDocument();
    expect(screen.getByText('Mark Used')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('handles complex batch entry workflow', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <BatchEntry
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        categories={mockCategories}
      />
    );

    // Add first item
    const nameInput = screen.getByPlaceholderText('Item name');
    await user.type(nameInput, 'First Item');

    // Add second item
    const addButton = screen.getByText('Add Another Item');
    await user.click(addButton);

    const nameInputs = screen.getAllByPlaceholderText('Item name');
    await user.type(nameInputs[1], 'Second Item');

    // Duplicate first item
    const duplicateButtons = screen.getAllByTitle('Duplicate item');
    await user.click(duplicateButtons[0]);

    // Verify we have 3 items now
    expect(screen.getByText('3 items')).toBeInTheDocument();

    // Submit all items
    const saveButton = screen.getByText(/Save All Items \(3\)/);
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith([
        expect.objectContaining({ name: 'First Item' }),
        expect.objectContaining({ name: 'First Item (Copy)' }),
        expect.objectContaining({ name: 'Second Item' }),
      ]);
    });
  });
});