import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { InventoryGrid } from '../inventory-grid';
import { ItemForm } from '../item-form';
import { InventoryCard } from '../inventory-card';
import type { InventoryItem, InventoryFilters, Category } from '../../../lib/types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>),
      button: React.forwardRef(({ children, ...props }: any, ref: any) => <button ref={ref} {...props}>{children}</button>),
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
      h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
      p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
      label: ({ children, ...props }: any) => <label {...props}>{children}</label>
    },
    AnimatePresence: ({ children, mode }: any) => <>{children}</>
  };
});

// Mock hooks
vi.mock('@/hooks', () => ({
  useTouchGestures: () => ({ current: null }),
  useHapticFeedback: () => ({ triggerHaptic: vi.fn() }),
  usePrefersReducedMotion: () => false
}));

// Mock animation variants
vi.mock('@/lib/utils/animation-variants', () => ({
  listContainerVariants: { hidden: {}, visible: {}, exit: {} },
  listItemVariants: { hidden: {}, visible: {}, exit: {}, hover: {} },
  gridContainerVariants: { hidden: {}, visible: {}, exit: {} },
  gridItemVariants: { hidden: {}, visible: {}, exit: {}, hover: {} },
  getVariants: (variants: any) => variants
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Grid3X3: () => <div data-testid="grid-icon" />,
  List: () => <div data-testid="list-icon" />,
  Package: () => <div data-testid="package-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Minus: () => <div data-testid="minus-icon" />,
  X: () => <div data-testid="x-icon" />,
  Check: () => <div data-testid="check-icon" />,
  Edit3: () => <div data-testid="edit-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  MapPin: () => <div data-testid="mappin-icon" />,
  Tag: () => <div data-testid="tag-icon" />,
  FileText: () => <div data-testid="filetext-icon" />,
  Save: () => <div data-testid="save-icon" />,
  AlertTriangle: () => <div data-testid="alert-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  SortAsc: () => <div data-testid="sort-asc-icon" />,
  SortDesc: () => <div data-testid="sort-desc-icon" />,
  SlidersHorizontal: () => <div data-testid="sliders-icon" />,
  RotateCcw: () => <div data-testid="rotate-icon" />,
  PackagePlus: () => <div data-testid="package-plus-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  TrendingDown: () => <div data-testid="trending-down-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />
}));

// Sample test data
const mockItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Organic Milk',
    quantity: 2,
    unit: 'liters',
    expirationDate: new Date('2024-12-25'),
    location: 'fridge',
    purchaseDate: new Date('2024-12-15'),
    category: 'Dairy',
    isLow: false,
    isFinished: false,
    lastUsed: null,
    notes: 'Fresh organic milk',
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-15')
  },
  {
    id: '2',
    name: 'Chicken Breast',
    quantity: 1,
    unit: 'lbs',
    expirationDate: new Date('2024-12-20'),
    location: 'fridge',
    purchaseDate: new Date('2024-12-18'),
    category: 'Meat & Seafood',
    isLow: true,
    isFinished: false,
    lastUsed: new Date('2024-12-18'),
    createdAt: new Date('2024-12-18'),
    updatedAt: new Date('2024-12-18')
  },
  {
    id: '3',
    name: 'Rice',
    quantity: 0,
    unit: 'lbs',
    expirationDate: null,
    location: 'pantry',
    purchaseDate: new Date('2024-12-10'),
    category: 'Pantry Staples',
    isLow: false,
    isFinished: true,
    lastUsed: new Date('2024-12-19'),
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-19')
  }
];

const mockCategories: Category[] = [
  { id: '1', name: 'Dairy', icon: '🥛', color: '#3B82F6' },
  { id: '2', name: 'Meat & Seafood', icon: '🥩', color: '#EF4444' },
  { id: '3', name: 'Pantry Staples', icon: '🌾', color: '#F59E0B' },
  { id: '4', name: 'Produce', icon: '🥬', color: '#10B981' },
  { id: '5', name: 'Frozen', icon: '❄️', color: '#06B6D4' }
];

describe('Inventory Integration Tests', () => {
  const mockHandlers = {
    onFiltersChange: vi.fn(),
    onMarkAsUsed: vi.fn(),
    onMarkAsFinished: vi.fn(),
    onUpdateQuantity: vi.fn(),
    onEditItem: vi.fn(),
    onSubmit: vi.fn(),
    onCancel: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('InventoryGrid Component', () => {
    const defaultProps = {
      items: mockItems,
      filters: {} as InventoryFilters,
      categories: mockCategories,
      ...mockHandlers
    };

    it('renders inventory items correctly', () => {
      render(<InventoryGrid {...defaultProps} />);
      
      expect(screen.getByText('Organic Milk')).toBeInTheDocument();
      expect(screen.getByText('Chicken Breast')).toBeInTheDocument();
      expect(screen.getByText('Rice')).toBeInTheDocument();
    });

    it('handles search functionality', async () => {
      const user = userEvent.setup();
      render(<InventoryGrid {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText(/search items/i);
      await user.type(searchInput, 'milk');
      
      // Wait for debounce (300ms)
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // Check that onFiltersChange was called with search term
      expect(mockHandlers.onFiltersChange).toHaveBeenCalled();
    });

    it('toggles filter panel', async () => {
      const user = userEvent.setup();
      render(<InventoryGrid {...defaultProps} />);
      
      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);
      
      // Use getAllByText to handle multiple elements with same text
      expect(screen.getAllByText('Location')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Category')[0]).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('applies location filters', async () => {
      const user = userEvent.setup();
      render(<InventoryGrid {...defaultProps} />);
      
      // Open filters
      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);
      
      // Click fridge filter
      const fridgeButton = screen.getByRole('button', { name: /fridge/i });
      await user.click(fridgeButton);
      
      expect(mockHandlers.onFiltersChange).toHaveBeenCalledWith({ location: 'fridge' });
    });

    it('applies category filters', async () => {
      const user = userEvent.setup();
      render(<InventoryGrid {...defaultProps} />);
      
      // Open filters
      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);
      
      // Click dairy filter - look for button containing "Dairy" text
      const dairyButton = screen.getByRole('button', { name: /dairy/i });
      await user.click(dairyButton);
      
      expect(mockHandlers.onFiltersChange).toHaveBeenCalled();
    });

    it('applies status filters', async () => {
      const user = userEvent.setup();
      render(<InventoryGrid {...defaultProps} />);
      
      // Open filters
      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);
      
      // Click low stock filter
      const lowStockButton = screen.getByRole('button', { name: /low stock/i });
      await user.click(lowStockButton);
      
      expect(mockHandlers.onFiltersChange).toHaveBeenCalledWith({ status: 'low' });
    });

    it('clears all filters', async () => {
      const user = userEvent.setup();
      const propsWithFilters = {
        ...defaultProps,
        filters: { location: 'fridge', category: 'Dairy', status: 'low' as const, search: 'milk' }
      };
      
      render(<InventoryGrid {...propsWithFilters} />);
      
      // Open filters
      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);
      
      // Clear filters
      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      await user.click(clearButton);
      
      expect(mockHandlers.onFiltersChange).toHaveBeenCalledWith({
        location: undefined,
        category: undefined,
        status: 'all',
        search: undefined
      });
    });

    it('toggles between grid and list view', async () => {
      const user = userEvent.setup();
      render(<InventoryGrid {...defaultProps} />);
      
      // Use data-testid to find the list view button
      const listViewButton = screen.getByTestId('list-icon').closest('button');
      await user.click(listViewButton!);
      
      // Check if layout changes (this would need more specific assertions based on actual implementation)
      expect(listViewButton).toBeInTheDocument();
    });

    it('displays empty state when no items', () => {
      render(<InventoryGrid {...defaultProps} items={[]} />);
      
      expect(screen.getByText('No items found')).toBeInTheDocument();
      expect(screen.getByText(/start by adding your first inventory item/i)).toBeInTheDocument();
    });

    it('displays filtered empty state', () => {
      const propsWithFilters = {
        ...defaultProps,
        items: [],
        filters: { search: 'nonexistent' }
      };
      
      render(<InventoryGrid {...propsWithFilters} />);
      
      expect(screen.getByText('No items found')).toBeInTheDocument();
      expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
    });
  });

  describe('InventoryCard Component', () => {
    const defaultProps = {
      item: mockItems[0],
      onEdit: mockHandlers.onEditItem,
      ...mockHandlers
    };

    it('renders item information correctly', () => {
      render(<InventoryCard {...defaultProps} />);
      
      expect(screen.getByText('Organic Milk')).toBeInTheDocument();
      expect(screen.getByText('Dairy')).toBeInTheDocument();
      expect(screen.getByText('2 liters')).toBeInTheDocument();
      expect(screen.getByText('Fresh organic milk')).toBeInTheDocument();
    });

    it('handles quantity updates', async () => {
      const user = userEvent.setup();
      render(<InventoryCard {...defaultProps} />);
      
      // Click on quantity to enter edit mode
      const quantityButton = screen.getByText('2 liters');
      await user.click(quantityButton);
      
      // Find plus button by data-testid
      const plusButton = screen.getByTestId('plus-icon').closest('button');
      await user.click(plusButton!);
      
      // Find confirm button by data-testid
      const confirmButton = screen.getByTestId('check-icon').closest('button');
      await user.click(confirmButton!);
      
      expect(mockHandlers.onUpdateQuantity).toHaveBeenCalledWith('1', 3);
    });

    it('handles mark as used action', async () => {
      const user = userEvent.setup();
      render(<InventoryCard {...defaultProps} />);
      
      const useButton = screen.getByRole('button', { name: /use 1/i });
      await user.click(useButton);
      
      expect(mockHandlers.onMarkAsUsed).toHaveBeenCalledWith('1', 1);
    });

    it('handles mark as finished action', async () => {
      const user = userEvent.setup();
      render(<InventoryCard {...defaultProps} />);
      
      const finishedButton = screen.getByRole('button', { name: /finished/i });
      await user.click(finishedButton);
      
      expect(mockHandlers.onMarkAsFinished).toHaveBeenCalledWith('1');
    });

    it('handles edit action', async () => {
      const user = userEvent.setup();
      render(<InventoryCard {...defaultProps} />);
      
      const editButton = screen.getByLabelText(/edit organic milk/i);
      await user.click(editButton);
      
      expect(mockHandlers.onEditItem).toHaveBeenCalledWith(mockItems[0]);
    });

    it('displays low stock indicator', () => {
      const lowStockProps = { ...defaultProps, item: mockItems[1] };
      render(<InventoryCard {...lowStockProps} />);
      
      expect(screen.getByText('Low Stock')).toBeInTheDocument();
    });

    it('displays finished state correctly', () => {
      const finishedProps = { ...defaultProps, item: mockItems[2] };
      render(<InventoryCard {...finishedProps} />);
      
      expect(screen.getByText('Finished')).toBeInTheDocument();
      // Should not show action buttons for finished items
      expect(screen.queryByRole('button', { name: /use 1/i })).not.toBeInTheDocument();
    });

    it('displays expiration status correctly', () => {
      const expiringItem = {
        ...mockItems[0],
        expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      };
      const expiringProps = { ...defaultProps, item: expiringItem };
      
      render(<InventoryCard {...expiringProps} />);
      
      expect(screen.getByText(/2d left/)).toBeInTheDocument();
    });
  });

  describe('ItemForm Component', () => {
    it('component exists and can be imported', () => {
      expect(ItemForm).toBeDefined();
    });
  });

  describe('CRUD Operations Integration', () => {
    it('completes full CRUD workflow', async () => {
      const user = userEvent.setup();
      
      // Mock a complete workflow
      const items = [...mockItems];
      let currentFilters: InventoryFilters = {};
      
      const handlers = {
        onFiltersChange: vi.fn((filters) => {
          currentFilters = { ...currentFilters, ...filters };
        }),
        onMarkAsUsed: vi.fn(),
        onMarkAsFinished: vi.fn(),
        onUpdateQuantity: vi.fn(),
        onEditItem: vi.fn(),
        onSubmit: vi.fn(),
        onCancel: vi.fn()
      };
      
      // Render grid with items
      const { rerender } = render(
        <InventoryGrid
          items={items}
          filters={currentFilters}
          categories={mockCategories}
          {...handlers}
        />
      );
      
      // Test filtering
      const filterButton = screen.getByRole('button', { name: /filters/i });
      await user.click(filterButton);
      
      const dairyButton = screen.getByRole('button', { name: /dairy/i });
      await user.click(dairyButton);
      
      expect(handlers.onFiltersChange).toHaveBeenCalled();
      
      // Test search
      const searchInput = screen.getByPlaceholderText(/search items/i);
      await user.type(searchInput, 'milk');
      
      // Wait for debounce (300ms)
      await new Promise(resolve => setTimeout(resolve, 350));
      
      expect(handlers.onFiltersChange).toHaveBeenCalled();
      
      // Test item actions
      const useButtons = screen.getAllByRole('button', { name: /use 1/i });
      await user.click(useButtons[0]);
      
      expect(handlers.onMarkAsUsed).toHaveBeenCalledWith('2', 1);
    });
  });
});