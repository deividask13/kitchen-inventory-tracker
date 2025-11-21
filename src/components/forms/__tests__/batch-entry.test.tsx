import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BatchEntry } from '../batch-entry';
import type { CreateInventoryItem } from '@/lib/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock UI components to avoid framer-motion issues
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

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

const defaultProps = {
  onSubmit: mockOnSubmit,
  onCancel: mockOnCancel,
  categories: mockCategories,
};

describe('BatchEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with initial empty item', () => {
    render(<BatchEntry {...defaultProps} />);
    
    expect(screen.getByText('Batch Entry')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Item name')).toBeInTheDocument();
  });

  it('allows adding new items', async () => {
    const user = userEvent.setup();
    render(<BatchEntry {...defaultProps} />);
    
    const addButton = screen.getByText('Add Another Item');
    await user.click(addButton);
    
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('allows removing items when more than one exists', async () => {
    const user = userEvent.setup();
    render(<BatchEntry {...defaultProps} />);
    
    // Add a second item
    const addButton = screen.getByText('Add Another Item');
    await user.click(addButton);
    
    // Remove the first item
    const removeButtons = screen.getAllByTitle('Remove item');
    await user.click(removeButtons[0]);
    
    expect(screen.queryByText('Item 2')).not.toBeInTheDocument();
  });

  it('allows duplicating items', async () => {
    const user = userEvent.setup();
    render(<BatchEntry {...defaultProps} />);
    
    // Fill in the first item
    const nameInput = screen.getByPlaceholderText('Item name');
    await user.type(nameInput, 'Test Item');
    
    // Duplicate the item
    const duplicateButton = screen.getByTitle('Duplicate item');
    await user.click(duplicateButton);
    
    expect(screen.getByDisplayValue('Test Item (Copy)')).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    const user = userEvent.setup();
    render(<BatchEntry {...defaultProps} />);
    
    const saveButton = screen.getByText(/Save All Items/);
    await user.click(saveButton);
    
    // The component should show validation error for empty items
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates individual item fields', async () => {
    const user = userEvent.setup();
    render(<BatchEntry {...defaultProps} />);
    
    // Add item name but leave other required fields invalid
    const nameInput = screen.getByPlaceholderText('Item name');
    await user.type(nameInput, 'Test Item');
    
    // Set invalid quantity
    const quantityInput = screen.getByPlaceholderText('Qty');
    await user.clear(quantityInput);
    await user.type(quantityInput, '0');
    
    const saveButton = screen.getByText(/Save All Items/);
    await user.click(saveButton);
    
    // Should not submit with invalid data
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid items successfully', async () => {
    const user = userEvent.setup();
    render(<BatchEntry {...defaultProps} />);
    
    // Fill in valid item data
    const nameInput = screen.getByPlaceholderText('Item name');
    await user.type(nameInput, 'Test Item');
    
    const quantityInput = screen.getByPlaceholderText('Qty');
    await user.clear(quantityInput);
    await user.type(quantityInput, '2');
    
    // Select location
    const fridgeButton = screen.getByText('Fridge');
    await user.click(fridgeButton);
    
    // Select category
    const categorySelect = screen.getByDisplayValue('Produce');
    await user.selectOptions(categorySelect, 'Dairy');
    
    const saveButton = screen.getByText(/Save All Items/);
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Test Item',
          quantity: 2,
          unit: 'pieces',
          location: 'fridge',
          category: 'Dairy',
          expirationDate: null,
          notes: undefined,
        }),
      ]);
    });
  });

  it('handles submission errors gracefully', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValueOnce(new Error('Submission failed'));
    
    render(<BatchEntry {...defaultProps} />);
    
    // Fill in valid item data
    const nameInput = screen.getByPlaceholderText('Item name');
    await user.type(nameInput, 'Test Item');
    
    const saveButton = screen.getByText(/Save All Items/);
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to save items. Please try again.')).toBeInTheDocument();
    });
  });

  it('updates item count in header', async () => {
    const user = userEvent.setup();
    render(<BatchEntry {...defaultProps} />);
    
    expect(screen.getByText('0 items')).toBeInTheDocument();
    
    // Add item name
    const nameInput = screen.getByPlaceholderText('Item name');
    await user.type(nameInput, 'Test Item');
    
    expect(screen.getByText('1 items')).toBeInTheDocument();
  });

  it('allows setting expiration dates', async () => {
    const user = userEvent.setup();
    render(<BatchEntry {...defaultProps} />);
    
    const nameInput = screen.getByPlaceholderText('Item name');
    await user.type(nameInput, 'Test Item');
    
    const expirationInput = screen.getByPlaceholderText('Expiration (optional)');
    await user.type(expirationInput, '2024-12-31');
    
    const saveButton = screen.getByText(/Save All Items/);
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith([
        expect.objectContaining({
          expirationDate: new Date('2024-12-31'),
        }),
      ]);
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<BatchEntry {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables save button when no valid items exist', () => {
    render(<BatchEntry {...defaultProps} />);
    
    const saveButton = screen.getByText(/Save All Items/);
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when valid items exist', async () => {
    const user = userEvent.setup();
    render(<BatchEntry {...defaultProps} />);
    
    const nameInput = screen.getByPlaceholderText('Item name');
    await user.type(nameInput, 'Test Item');
    
    const saveButton = screen.getByText(/Save All Items/);
    expect(saveButton).not.toBeDisabled();
  });
});