import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AdvancedFilters } from '../advanced-filters';
import type { InventoryFilters, Category } from '@/lib/types';

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Produce',
    color: '#10B981',
    icon: '🥬',
    isDefault: true
  },
  {
    id: '2',
    name: 'Dairy',
    color: '#F59E0B',
    icon: '🥛',
    isDefault: true
  },
  {
    id: '3',
    name: 'Meat',
    color: '#EF4444',
    icon: '🥩',
    isDefault: true
  }
];

const mockFilters: InventoryFilters = {
  location: undefined,
  category: undefined,
  status: 'all',
  search: undefined
};

const mockOnFiltersChange = vi.fn();

describe('AdvancedFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input and filters toggle', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
      />
    );
    
    expect(screen.getByPlaceholderText(/search items by name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument();
  });

  it('updates search filter with debouncing', async () => {
    vi.useFakeTimers();
    
    try {
      render(
        <AdvancedFilters
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          categories={mockCategories}
        />
      );
      
      const searchInput = screen.getByPlaceholderText(/search items by name/i);
      fireEvent.change(searchInput, { target: { value: 'apple' } });
      
      // Should not call immediately
      expect(mockOnFiltersChange).not.toHaveBeenCalled();
      
      // Fast-forward time to trigger debounce
      await vi.advanceTimersByTimeAsync(300);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: 'apple' });
    } finally {
      vi.useRealTimers();
    }
  });

  it('clears search when clear button is clicked', async () => {
    const filtersWithSearch = { ...mockFilters, search: 'apple' };
    
    render(
      <AdvancedFilters
        filters={filtersWithSearch}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
      />
    );
    
    // Find all buttons and locate the clear button (X icon button)
    const buttons = screen.getAllByRole('button');
    // The clear button should be one of the buttons without text content
    const clearButton = buttons.find(button => {
      const svg = button.querySelector('svg');
      return svg && button.textContent === '';
    });
    
    expect(clearButton).toBeTruthy();
    if (clearButton) {
      fireEvent.click(clearButton);
      
      // The component uses debouncing, so we need to wait for the effect
      await waitFor(() => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: undefined });
      }, { timeout: 500 });
    }
  });

  it('expands filters panel when filters button is clicked', async () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
      />
    );
    
    const filtersButton = screen.getByRole('button', { name: /filters/i });
    fireEvent.click(filtersButton);
    
    await waitFor(() => {
      expect(screen.getByText('Location')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('displays location filter options', async () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        showToggle={false} // Always show filters
      />
    );
    
    expect(screen.getByText('Fridge')).toBeInTheDocument();
    expect(screen.getByText('Freezer')).toBeInTheDocument();
    expect(screen.getByText('Pantry')).toBeInTheDocument();
  });

  it('displays category filter options', async () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        showToggle={false} // Always show filters
      />
    );
    
    expect(screen.getByText('Produce')).toBeInTheDocument();
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.getByText('Meat')).toBeInTheDocument();
  });

  it('displays status filter options', async () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        showToggle={false} // Always show filters
      />
    );
    
    expect(screen.getByText('All Items')).toBeInTheDocument();
    expect(screen.getByText('Expiring Soon')).toBeInTheDocument();
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
    expect(screen.getByText('Finished')).toBeInTheDocument();
  });

  it('handles location filter selection', async () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        showToggle={false}
      />
    );
    
    const fridgeButton = screen.getByRole('button', { name: /fridge/i });
    fireEvent.click(fridgeButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ location: 'fridge' });
  });

  it('handles category filter selection', async () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        showToggle={false}
      />
    );
    
    const produceButton = screen.getByRole('button', { name: /produce/i });
    fireEvent.click(produceButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ category: 'Produce' });
  });

  it('handles status filter selection', async () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        showToggle={false}
      />
    );
    
    const expiringButton = screen.getByRole('button', { name: /expiring soon/i });
    fireEvent.click(expiringButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ status: 'expiring' });
  });

  it('displays active filter chips', () => {
    const activeFilters: InventoryFilters = {
      location: 'fridge',
      category: 'Produce',
      status: 'expiring',
      search: 'apple'
    };
    
    render(
      <AdvancedFilters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
      />
    );
    
    // Should show filter chips
    expect(screen.getByText('Fridge')).toBeInTheDocument();
    expect(screen.getByText('Produce')).toBeInTheDocument();
    expect(screen.getByText('Expiring Soon')).toBeInTheDocument();
    expect(screen.getByText('"apple"')).toBeInTheDocument();
  });

  it('removes filter chip when X is clicked', () => {
    const activeFilters: InventoryFilters = {
      location: 'fridge',
      category: undefined,
      status: 'all',
      search: undefined
    };
    
    render(
      <AdvancedFilters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
      />
    );
    
    // Find the Fridge chip and its remove button
    const fridgeChip = screen.getByText('Fridge').closest('div');
    expect(fridgeChip).toBeTruthy();
    
    if (fridgeChip) {
      const removeButton = fridgeChip.querySelector('button');
      expect(removeButton).toBeTruthy();
      
      if (removeButton) {
        fireEvent.click(removeButton);
        expect(mockOnFiltersChange).toHaveBeenCalledWith({ location: undefined });
      }
    }
  });

  it('clears all filters when clear all button is clicked', () => {
    const activeFilters: InventoryFilters = {
      location: 'fridge',
      category: 'Produce',
      status: 'expiring',
      search: 'apple'
    };
    
    render(
      <AdvancedFilters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
      />
    );
    
    const clearAllButton = screen.getByRole('button', { name: /clear all/i });
    fireEvent.click(clearAllButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      location: undefined,
      category: undefined,
      status: 'all',
      search: undefined
    });
  });

  it('shows filter count badge when filters are active', () => {
    const activeFilters: InventoryFilters = {
      location: 'fridge',
      category: 'Produce',
      status: 'expiring',
      search: undefined
    };
    
    render(
      <AdvancedFilters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
      />
    );
    
    // Should show badge with count of 3 active filters
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('toggles filter selection correctly', async () => {
    render(
      <AdvancedFilters
        filters={{ ...mockFilters, location: 'fridge' }}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        showToggle={false}
      />
    );
    
    // Clicking the same location should clear it
    const fridgeButton = screen.getByRole('button', { name: /fridge/i });
    fireEvent.click(fridgeButton);
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ location: undefined });
  });

  it('handles empty categories array gracefully', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={[]}
        showToggle={false}
      />
    );
    
    // Should still render without errors
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('respects showSearch prop', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        showSearch={false}
      />
    );
    
    expect(screen.queryByPlaceholderText(/search items by name/i)).not.toBeInTheDocument();
  });

  it('respects showToggle prop', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        onFiltersChange={mockOnFiltersChange}
        categories={mockCategories}
        showToggle={false}
      />
    );
    
    expect(screen.queryByRole('button', { name: /filters/i })).not.toBeInTheDocument();
    // Filters should be visible by default when showToggle is false
    expect(screen.getByText('Location')).toBeInTheDocument();
  });
});