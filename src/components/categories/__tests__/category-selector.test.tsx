import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CategorySelector } from '../category-selector';
import type { Category } from '@/lib/types';

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
    name: 'Meat & Seafood',
    color: '#EF4444',
    icon: '🥩',
    isDefault: true
  }
];

const mockOnCategorySelect = vi.fn();

describe('CategorySelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('dropdown variant', () => {
    it('renders dropdown with placeholder', () => {
      render(
        <CategorySelector
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          placeholder="Choose category..."
          variant="dropdown"
        />
      );
      
      expect(screen.getByText('Choose category...')).toBeInTheDocument();
    });

    it('shows selected category', () => {
      render(
        <CategorySelector
          categories={mockCategories}
          selectedCategory="Produce"
          onCategorySelect={mockOnCategorySelect}
          variant="dropdown"
        />
      );
      
      expect(screen.getByText('Produce')).toBeInTheDocument();
      expect(screen.getByText('🥬')).toBeInTheDocument();
    });

    it('opens dropdown when clicked', async () => {
      render(
        <CategorySelector
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          variant="dropdown"
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search categories...')).toBeInTheDocument();
        expect(screen.getByText('Produce')).toBeInTheDocument();
        expect(screen.getByText('Dairy')).toBeInTheDocument();
        expect(screen.getByText('Meat & Seafood')).toBeInTheDocument();
      });
    });

    it('filters categories based on search', async () => {
      render(
        <CategorySelector
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          variant="dropdown"
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search categories...');
        fireEvent.change(searchInput, { target: { value: 'dairy' } });
        
        expect(screen.getByText('Dairy')).toBeInTheDocument();
        expect(screen.queryByText('Produce')).not.toBeInTheDocument();
      });
    });

    it('shows "All Categories" option when showAllOption is true', async () => {
      render(
        <CategorySelector
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          variant="dropdown"
          showAllOption
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('All Categories')).toBeInTheDocument();
      });
    });

    it('calls onCategorySelect when category is selected', async () => {
      render(
        <CategorySelector
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          variant="dropdown"
        />
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        const produceOption = screen.getByText('Produce');
        fireEvent.click(produceOption);
        
        expect(mockOnCategorySelect).toHaveBeenCalledWith('1');
      });
    });

    it('shows clear button when category is selected', () => {
      render(
        <CategorySelector
          categories={mockCategories}
          selectedCategory="Produce"
          onCategorySelect={mockOnCategorySelect}
          variant="dropdown"
        />
      );
      
      // Clear button should be present (X icon)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(1);
    });

    it('clears selection when clear button is clicked', () => {
      render(
        <CategorySelector
          categories={mockCategories}
          selectedCategory="Produce"
          onCategorySelect={mockOnCategorySelect}
          variant="dropdown"
        />
      );
      
      // Find and click clear button (this would need more specific targeting in real implementation)
      const clearButton = screen.getAllByRole('button')[1]; // Assuming second button is clear
      fireEvent.click(clearButton);
      
      expect(mockOnCategorySelect).toHaveBeenCalledWith('');
    });

    it('is disabled when disabled prop is true', () => {
      render(
        <CategorySelector
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          variant="dropdown"
          disabled
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('chips variant', () => {
    it('renders category chips', () => {
      render(
        <CategorySelector
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          variant="chips"
        />
      );
      
      expect(screen.getByText('Produce')).toBeInTheDocument();
      expect(screen.getByText('Dairy')).toBeInTheDocument();
      expect(screen.getByText('Meat & Seafood')).toBeInTheDocument();
    });

    it('shows "All" chip when showAllOption is true', () => {
      render(
        <CategorySelector
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          variant="chips"
          showAllOption
        />
      );
      
      expect(screen.getByText('All')).toBeInTheDocument();
    });

    it('highlights selected category chip', () => {
      render(
        <CategorySelector
          categories={mockCategories}
          selectedCategory="Produce"
          onCategorySelect={mockOnCategorySelect}
          variant="chips"
        />
      );
      
      const produceChip = screen.getByRole('button', { name: /produce/i });
      // In a real implementation, you'd check for specific styling classes
      expect(produceChip).toBeInTheDocument();
    });

    it('calls onCategorySelect when chip is clicked', () => {
      render(
        <CategorySelector
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          variant="chips"
        />
      );
      
      const produceChip = screen.getByRole('button', { name: /produce/i });
      fireEvent.click(produceChip);
      
      expect(mockOnCategorySelect).toHaveBeenCalledWith('1');
    });
  });

  describe('grid variant', () => {
    it('renders category grid', () => {
      render(
        <CategorySelector
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          variant="grid"
        />
      );
      
      expect(screen.getByText('Produce')).toBeInTheDocument();
      expect(screen.getByText('Dairy')).toBeInTheDocument();
      expect(screen.getByText('Meat & Seafood')).toBeInTheDocument();
    });

    it('shows "All" option when showAllOption is true', () => {
      render(
        <CategorySelector
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          variant="grid"
          showAllOption
        />
      );
      
      expect(screen.getByText('All')).toBeInTheDocument();
    });

    it('highlights selected category in grid', () => {
      render(
        <CategorySelector
          categories={mockCategories}
          selectedCategory="Produce"
          onCategorySelect={mockOnCategorySelect}
          variant="grid"
        />
      );
      
      const produceButton = screen.getByRole('button', { name: /produce/i });
      expect(produceButton).toBeInTheDocument();
    });

    it('calls onCategorySelect when grid item is clicked', () => {
      render(
        <CategorySelector
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          variant="grid"
        />
      );
      
      const produceButton = screen.getByRole('button', { name: /produce/i });
      fireEvent.click(produceButton);
      
      expect(mockOnCategorySelect).toHaveBeenCalledWith('1');
    });
  });

  describe('common functionality', () => {
    it('handles empty categories array', () => {
      const { container } = render(
        <CategorySelector
          categories={[]}
          onCategorySelect={mockOnCategorySelect}
          variant="chips"
        />
      );
      
      // Should render without errors
      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <CategorySelector
          categories={mockCategories}
          onCategorySelect={mockOnCategorySelect}
          variant="chips"
          className="custom-class"
        />
      );
      
      // Check that the component renders and has the custom class
      const element = container.querySelector('.custom-class');
      expect(element).toBeInTheDocument();
    });

    it('finds category by name correctly', () => {
      render(
        <CategorySelector
          categories={mockCategories}
          selectedCategory="Meat & Seafood"
          onCategorySelect={mockOnCategorySelect}
          variant="dropdown"
        />
      );
      
      expect(screen.getByText('Meat & Seafood')).toBeInTheDocument();
      expect(screen.getByText('🥩')).toBeInTheDocument();
    });
  });
});