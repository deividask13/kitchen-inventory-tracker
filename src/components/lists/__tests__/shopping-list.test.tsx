import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ShoppingList } from '../shopping-list';
import { ShoppingListItem } from '@/lib/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

// Mock ShoppingItem component
vi.mock('../shopping-item', () => ({
  ShoppingItem: ({ item, onToggleCompleted, onDelete, onEdit }: any) => (
    <div data-testid={`shopping-item-${item.id}`}>
      <span>{item.name}</span>
      <button onClick={() => onToggleCompleted(item.id)}>Toggle</button>
      <button onClick={() => onDelete(item.id)}>Delete</button>
      {onEdit && <button onClick={() => onEdit(item)}>Edit</button>}
    </div>
  ),
}));

const mockItems: ShoppingListItem[] = [
  {
    id: '1',
    name: 'Milk',
    quantity: 2,
    unit: 'liters',
    category: 'Dairy',
    isCompleted: false,
    addedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Bread',
    quantity: 1,
    unit: 'loaf',
    category: 'Bakery',
    isCompleted: true,
    addedAt: new Date('2024-01-02'),
    completedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    name: 'Apples',
    quantity: 6,
    unit: 'pieces',
    category: 'Produce',
    isCompleted: false,
    addedAt: new Date('2024-01-03'),
  },
];

describe('ShoppingList', () => {
  const mockOnToggleCompleted = vi.fn();
  const mockOnDeleteItem = vi.fn();
  const mockOnEditItem = vi.fn();
  const mockOnClearCompleted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no items', () => {
    render(
      <ShoppingList
        items={[]}
        onToggleCompleted={mockOnToggleCompleted}
        onDeleteItem={mockOnDeleteItem}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    expect(screen.getByText('No items in your shopping list')).toBeInTheDocument();
    expect(screen.getByText('Add items to get started with your shopping.')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(
      <ShoppingList
        items={[]}
        onToggleCompleted={mockOnToggleCompleted}
        onDeleteItem={mockOnDeleteItem}
        onClearCompleted={mockOnClearCompleted}
        isLoading={true}
      />
    );

    // Should show loading skeletons
    const skeletons = screen.getAllByRole('generic');
    expect(skeletons.some(el => el.className.includes('animate-pulse'))).toBe(true);
  });

  it('renders items correctly', () => {
    render(
      <ShoppingList
        items={mockItems}
        onToggleCompleted={mockOnToggleCompleted}
        onDeleteItem={mockOnDeleteItem}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    expect(screen.getByTestId('shopping-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('shopping-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('shopping-item-3')).toBeInTheDocument();
  });

  it('displays correct progress statistics', () => {
    render(
      <ShoppingList
        items={mockItems}
        onToggleCompleted={mockOnToggleCompleted}
        onDeleteItem={mockOnDeleteItem}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    expect(screen.getByText('1 of 3 items')).toBeInTheDocument();
    expect(screen.getByText('33% complete')).toBeInTheDocument();
  });

  it('shows clear completed button when there are completed items', () => {
    render(
      <ShoppingList
        items={mockItems}
        onToggleCompleted={mockOnToggleCompleted}
        onDeleteItem={mockOnDeleteItem}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    const clearButton = screen.getByText('Clear Completed');
    expect(clearButton).toBeInTheDocument();
  });

  it('does not show clear completed button when no completed items', () => {
    const pendingItems = mockItems.filter(item => !item.isCompleted);
    
    render(
      <ShoppingList
        items={pendingItems}
        onToggleCompleted={mockOnToggleCompleted}
        onDeleteItem={mockOnDeleteItem}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    expect(screen.queryByText('Clear Completed')).not.toBeInTheDocument();
  });

  it('calls onClearCompleted when clear button is clicked', async () => {
    render(
      <ShoppingList
        items={mockItems}
        onToggleCompleted={mockOnToggleCompleted}
        onDeleteItem={mockOnDeleteItem}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    const clearButton = screen.getByText('Clear Completed');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockOnClearCompleted).toHaveBeenCalled();
    });
  });

  it('groups items by category by default', () => {
    render(
      <ShoppingList
        items={mockItems}
        onToggleCompleted={mockOnToggleCompleted}
        onDeleteItem={mockOnDeleteItem}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    expect(screen.getByText('Dairy (1)')).toBeInTheDocument();
    expect(screen.getByText('Bakery (1)')).toBeInTheDocument();
    expect(screen.getByText('Produce (1)')).toBeInTheDocument();
  });

  it('changes grouping when dropdown is changed', async () => {
    render(
      <ShoppingList
        items={mockItems}
        onToggleCompleted={mockOnToggleCompleted}
        onDeleteItem={mockOnDeleteItem}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    const groupSelect = screen.getByDisplayValue('Category');
    fireEvent.change(groupSelect, { target: { value: 'status' } });

    await waitFor(() => {
      expect(screen.getByText('Pending (2)')).toBeInTheDocument();
      expect(screen.getByText('Completed (1)')).toBeInTheDocument();
    });
  });

  it('filters completed items when checkbox is unchecked', async () => {
    render(
      <ShoppingList
        items={mockItems}
        onToggleCompleted={mockOnToggleCompleted}
        onDeleteItem={mockOnDeleteItem}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    const showCompletedCheckbox = screen.getByRole('checkbox', { name: /show completed items/i });
    fireEvent.click(showCompletedCheckbox);

    await waitFor(() => {
      expect(screen.queryByTestId('shopping-item-2')).not.toBeInTheDocument();
      expect(screen.getByTestId('shopping-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('shopping-item-3')).toBeInTheDocument();
    });
  });

  it('passes correct props to ShoppingItem components', () => {
    render(
      <ShoppingList
        items={mockItems}
        onToggleCompleted={mockOnToggleCompleted}
        onDeleteItem={mockOnDeleteItem}
        onEditItem={mockOnEditItem}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    // Check that edit buttons are rendered (indicating onEdit prop was passed)
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons).toHaveLength(3);
  });

  it('handles item interactions correctly', async () => {
    render(
      <ShoppingList
        items={mockItems}
        onToggleCompleted={mockOnToggleCompleted}
        onDeleteItem={mockOnDeleteItem}
        onEditItem={mockOnEditItem}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    // Test toggle
    const toggleButtons = screen.getAllByText('Toggle');
    fireEvent.click(toggleButtons[0]);
    
    await waitFor(() => {
      expect(mockOnToggleCompleted).toHaveBeenCalledWith('1');
    });

    // Test delete
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(mockOnDeleteItem).toHaveBeenCalledWith('1');
    });

    // Test edit
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    await waitFor(() => {
      expect(mockOnEditItem).toHaveBeenCalledWith(mockItems[0]);
    });
  });

  it('calculates progress correctly with different completion states', () => {
    const allCompletedItems = mockItems.map(item => ({ ...item, isCompleted: true }));
    
    render(
      <ShoppingList
        items={allCompletedItems}
        onToggleCompleted={mockOnToggleCompleted}
        onDeleteItem={mockOnDeleteItem}
        onClearCompleted={mockOnClearCompleted}
      />
    );

    expect(screen.getByText('3 of 3 items')).toBeInTheDocument();
    expect(screen.getByText('100% complete')).toBeInTheDocument();
  });
});