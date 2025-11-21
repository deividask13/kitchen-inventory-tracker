import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ShoppingItem } from '../shopping-item';
import { ShoppingListItem } from '@/lib/types';
import React from 'react';

// Mock framer-motion
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>),
      button: React.forwardRef(({ children, ...props }: any, ref: any) => <button ref={ref} {...props}>{children}</button>),
      svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    },
    AnimatePresence: ({ children }: any) => children,
  };
});

const mockItem: ShoppingListItem = {
  id: '1',
  name: 'Milk',
  quantity: 2,
  unit: 'liters',
  category: 'Dairy',
  isCompleted: false,
  addedAt: new Date('2024-01-01'),
  notes: 'Organic preferred'
};

const mockCompletedItem: ShoppingListItem = {
  ...mockItem,
  id: '2',
  isCompleted: true,
  completedAt: new Date('2024-01-02')
};

const mockInventoryItem: ShoppingListItem = {
  ...mockItem,
  id: '3',
  fromInventory: true,
  inventoryItemId: 'inv-1'
};

describe('ShoppingItem', () => {
  const mockOnToggleCompleted = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders item information correctly', () => {
    render(
      <ShoppingItem
        item={mockItem}
        onToggleCompleted={mockOnToggleCompleted}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('2 liters')).toBeInTheDocument();
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.getByText('Organic preferred')).toBeInTheDocument();
  });

  it('shows completed state correctly', () => {
    render(
      <ShoppingItem
        item={mockCompletedItem}
        onToggleCompleted={mockOnToggleCompleted}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const itemName = screen.getByText('Milk');
    expect(itemName).toHaveClass('line-through');
    
    // Check if checkbox shows completed state
    const checkbox = screen.getByRole('button', { name: /mark milk as incomplete/i });
    expect(checkbox).toHaveClass('bg-green-500');
  });

  it('shows inventory badge for items from inventory', () => {
    render(
      <ShoppingItem
        item={mockInventoryItem}
        onToggleCompleted={mockOnToggleCompleted}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('From inventory')).toBeInTheDocument();
  });

  it('calls onToggleCompleted when checkbox is clicked', async () => {
    render(
      <ShoppingItem
        item={mockItem}
        onToggleCompleted={mockOnToggleCompleted}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const checkbox = screen.getByRole('button', { name: /mark milk as complete/i });
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(mockOnToggleCompleted).toHaveBeenCalledWith('1');
    });
  });

  it('calls onDelete when delete button is clicked', async () => {
    render(
      <ShoppingItem
        item={mockItem}
        onToggleCompleted={mockOnToggleCompleted}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete milk \(desktop\)/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });
  });

  it('calls onEdit when edit button is clicked', async () => {
    render(
      <ShoppingItem
        item={mockItem}
        onToggleCompleted={mockOnToggleCompleted}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit milk/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith(mockItem);
    });
  });

  it('does not show edit button when onEdit is not provided', () => {
    render(
      <ShoppingItem
        item={mockItem}
        onToggleCompleted={mockOnToggleCompleted}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByRole('button', { name: /edit milk/i })).not.toBeInTheDocument();
  });

  it('handles items without notes', () => {
    const itemWithoutNotes = { ...mockItem, notes: undefined };
    
    render(
      <ShoppingItem
        item={itemWithoutNotes}
        onToggleCompleted={mockOnToggleCompleted}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.queryByText('Organic preferred')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <ShoppingItem
        item={mockItem}
        onToggleCompleted={mockOnToggleCompleted}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const checkbox = screen.getByRole('button', { name: /mark milk as complete/i });
    expect(checkbox).toHaveAttribute('aria-label');

    const deleteButton = screen.getByRole('button', { name: /delete milk \(desktop\)/i });
    expect(deleteButton).toHaveAttribute('aria-label');

    const editButton = screen.getByRole('button', { name: /edit milk/i });
    expect(editButton).toHaveAttribute('aria-label');
  });

  it('applies correct styling for completed items', () => {
    render(
      <ShoppingItem
        item={mockCompletedItem}
        onToggleCompleted={mockOnToggleCompleted}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    // Check that completed items have appropriate styling
    const itemName = screen.getByText('Milk');
    const quantity = screen.getByText('2 liters');
    const category = screen.getByText('Dairy');

    expect(itemName).toHaveClass('line-through', 'text-gray-500');
    expect(quantity).toHaveClass('line-through');
    expect(category).toHaveClass('line-through');
  });
});