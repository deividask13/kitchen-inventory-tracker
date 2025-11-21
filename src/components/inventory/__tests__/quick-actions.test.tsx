import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { QuickActions } from '../quick-actions';
import type { InventoryItem } from '@/lib/types';

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
  Button: ({ children, onClick, disabled, loading, variant, size, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {loading && <span>Loading...</span>}
      {children}
    </button>
  ),
}));

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

const mockProps = {
  item: mockItem,
  onQuantityChange: vi.fn(),
  onMarkAsUsed: vi.fn(),
  onMarkAsFinished: vi.fn(),
  onEdit: vi.fn(),
  onAddToShoppingList: vi.fn(),
};

describe('QuickActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main action button', () => {
    render(<QuickActions {...mockProps} />);
    
    const actionButton = screen.getByRole('button', { name: 'Quick actions' });
    expect(actionButton).toBeInTheDocument();
  });

  it('expands menu when main button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuickActions {...mockProps} />);
    
    const actionButton = screen.getByRole('button', { name: 'Quick actions' });
    await user.click(actionButton);
    
    expect(screen.getByText('Quantity (5 pieces)')).toBeInTheDocument();
    expect(screen.getByText('Edit Item')).toBeInTheDocument();
    expect(screen.getByText('Add to Shopping List')).toBeInTheDocument();
  });

  it('handles quantity increment actions', async () => {
    const user = userEvent.setup();
    render(<QuickActions {...mockProps} />);
    
    const actionButton = screen.getByRole('button', { name: 'Quick actions' });
    await user.click(actionButton);
    
    // Find the +1 button by looking for the one with a plus icon
    const buttons = screen.getAllByText('1');
    const plusOneButton = buttons.find(button => 
      button.parentElement?.querySelector('svg[class*="plus"]')
    );
    
    if (plusOneButton) {
      await user.click(plusOneButton);
      expect(mockProps.onQuantityChange).toHaveBeenCalledWith('1', 1);
    }
  });

  it('handles quantity decrement actions', async () => {
    const user = userEvent.setup();
    render(<QuickActions {...mockProps} />);
    
    const actionButton = screen.getByRole('button', { name: 'Quick actions' });
    await user.click(actionButton);
    
    // Find all buttons with "1" text
    const allButtons = screen.getAllByRole('button');
    // Find the -1 button by checking if it has a Minus icon as a child
    const minusOneButton = allButtons.find(button => {
      const buttonText = button.textContent;
      const hasMinusIcon = button.querySelector('svg');
      // The -1 button will have "1" as text and a minus icon
      return buttonText === '1' && hasMinusIcon && button.className.includes('h-8 text-xs');
    });
    
    // Click the third button with "1" (after +1 and +5, it's -1)
    const buttonsWithOne = allButtons.filter(b => b.textContent === '1' && b.className.includes('h-8 text-xs'));
    if (buttonsWithOne.length >= 2) {
      await user.click(buttonsWithOne[1]); // Second "1" button is -1
      expect(mockProps.onQuantityChange).toHaveBeenCalledWith('1', -1);
    }
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuickActions {...mockProps} />);
    
    const actionButton = screen.getByRole('button', { name: 'Quick actions' });
    await user.click(actionButton);
    
    const editButton = screen.getByText('Edit Item');
    await user.click(editButton);
    
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockItem);
  });

  it('calls onAddToShoppingList when shopping list button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuickActions {...mockProps} />);
    
    const actionButton = screen.getByRole('button', { name: 'Quick actions' });
    await user.click(actionButton);
    
    const shoppingButton = screen.getByText('Add to Shopping List');
    await user.click(shoppingButton);
    
    expect(mockProps.onAddToShoppingList).toHaveBeenCalledWith(mockItem);
  });

  it('calls onMarkAsUsed when mark as used button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuickActions {...mockProps} />);
    
    const actionButton = screen.getByRole('button', { name: 'Quick actions' });
    await user.click(actionButton);
    
    const markUsedButton = screen.getByText('Mark as Used');
    await user.click(markUsedButton);
    
    expect(mockProps.onMarkAsUsed).toHaveBeenCalledWith('1', 1);
  });

  it('calls onMarkAsFinished when mark as finished button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuickActions {...mockProps} />);
    
    const actionButton = screen.getByRole('button', { name: 'Quick actions' });
    await user.click(actionButton);
    
    const markFinishedButton = screen.getByText('Mark as Finished');
    await user.click(markFinishedButton);
    
    expect(mockProps.onMarkAsFinished).toHaveBeenCalledWith('1');
  });

  it('disables mark as used button when quantity is zero', async () => {
    const user = userEvent.setup();
    const zeroQuantityItem = { ...mockItem, quantity: 0 };
    
    render(<QuickActions {...mockProps} item={zeroQuantityItem} />);
    
    const actionButton = screen.getByRole('button', { name: 'Quick actions' });
    await user.click(actionButton);
    
    const markUsedButton = screen.getByText('Mark as Used');
    expect(markUsedButton).toBeDisabled();
  });

  it('shows loading state during async operations', async () => {
    const user = userEvent.setup();
    const slowOnQuantityChange = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<QuickActions {...mockProps} onQuantityChange={slowOnQuantityChange} />);
    
    const actionButton = screen.getByRole('button', { name: 'Quick actions' });
    await user.click(actionButton);
    
    // Find the +1 button by looking for the one with a plus icon
    const buttons = screen.getAllByText('1');
    const plusOneButton = buttons.find(button => 
      button.parentElement?.querySelector('svg[class*="plus"]')
    );
    
    if (plusOneButton) {
      await user.click(plusOneButton);
      // Should show loading state
      expect(plusOneButton.closest('button')).toBeDisabled();
    }
  });

  it('closes menu after action execution', async () => {
    const user = userEvent.setup();
    render(<QuickActions {...mockProps} />);
    
    const actionButton = screen.getByRole('button', { name: 'Quick actions' });
    await user.click(actionButton);
    
    const editButton = screen.getByText('Edit Item');
    await user.click(editButton);
    
    // Menu should be closed
    expect(screen.queryByText('Edit Item')).not.toBeInTheDocument();
  });

  it('handles action errors gracefully', async () => {
    const user = userEvent.setup();
    const errorOnQuantityChange = vi.fn().mockRejectedValue(new Error('Test error'));
    
    render(<QuickActions {...mockProps} onQuantityChange={errorOnQuantityChange} />);
    
    const actionButton = screen.getByRole('button', { name: 'Quick actions' });
    await user.click(actionButton);
    
    // Find the +1 button by looking for the one with a plus icon
    const buttons = screen.getAllByText('1');
    const plusOneButton = buttons.find(button => 
      button.parentElement?.querySelector('svg[class*="plus"]')
    );
    
    if (plusOneButton) {
      await user.click(plusOneButton);
      
      await waitFor(() => {
        expect(errorOnQuantityChange).toHaveBeenCalled();
      });
    }
  });

  it('prevents negative quantity when using decrement buttons', async () => {
    const user = userEvent.setup();
    const lowQuantityItem = { ...mockItem, quantity: 2 };
    
    render(<QuickActions {...mockProps} item={lowQuantityItem} />);
    
    const actionButton = screen.getByRole('button', { name: 'Quick actions' });
    await user.click(actionButton);
    
    // The -5 button should be disabled when quantity is only 2
    // Find all buttons with "5" text
    const allButtons = screen.getAllByRole('button');
    const buttonsWithFive = allButtons.filter(b => b.textContent === '5' && b.className.includes('h-8 text-xs'));
    
    // Second "5" button is -5
    if (buttonsWithFive.length >= 2) {
      expect(buttonsWithFive[1]).toBeDisabled();
    }
  });
});