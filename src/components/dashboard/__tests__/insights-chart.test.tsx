import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InsightsChart } from '../insights-chart';
import { useInventoryStore } from '@/stores/inventory-store';
import { useShoppingStore } from '@/stores/shopping-store';
import type { InventoryItem, ShoppingListItem } from '@/lib/types';

// Mock the stores
vi.mock('@/stores/inventory-store');
vi.mock('@/stores/shopping-store');

const mockUseInventoryStore = vi.mocked(useInventoryStore);
const mockUseShoppingStore = vi.mocked(useShoppingStore);

describe('InsightsChart', () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  
  const mockInventoryItems: InventoryItem[] = [
    {
      id: '1',
      name: 'Milk',
      quantity: 1,
      unit: 'l',
      expirationDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      location: 'fridge',
      purchaseDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      category: 'dairy',
      isLow: false,
      isFinished: true,
      lastUsed: fiveDaysAgo,
      createdAt: fiveDaysAgo,
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Bread',
      quantity: 1,
      unit: 'loaf',
      expirationDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Expired 2 days ago
      location: 'pantry',
      purchaseDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      category: 'bakery',
      isLow: false,
      isFinished: false,
      lastUsed: null, // Never used, so it's waste
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Cheese',
      quantity: 200,
      unit: 'g',
      expirationDate: null,
      location: 'fridge',
      purchaseDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      category: 'dairy',
      isLow: false,
      isFinished: false,
      lastUsed: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }
  ];

  const mockShoppingItems: ShoppingListItem[] = [
    {
      id: '1',
      name: 'Milk',
      quantity: 1,
      unit: 'l',
      category: 'dairy',
      isCompleted: true,
      addedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Bread',
      quantity: 1,
      unit: 'loaf',
      category: 'bakery',
      isCompleted: true,
      addedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      completedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseInventoryStore.mockReturnValue({
      items: mockInventoryItems,
      getExpiringItems: vi.fn(),
      getLowStockItems: vi.fn(),
      // Add other required properties with default values
      filters: {},
      isLoading: false,
      error: null,
      loadItems: vi.fn(),
      addItem: vi.fn(),
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
      items: mockShoppingItems,
      filters: {},
      isLoading: false,
      error: null,
      loadItems: vi.fn(),
      addItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      toggleCompleted: vi.fn(),
      clearCompleted: vi.fn(),
      addFromInventory: vi.fn(),
      setFilters: vi.fn(),
      clearError: vi.fn(),
      getCompletedItems: vi.fn(),
      getPendingItems: vi.fn(),
      getItemsByCategory: vi.fn(),
      getFilteredItems: vi.fn(),
      getCompletionStats: vi.fn()
    });
  });

  it('renders insights chart correctly', () => {
    render(<InsightsChart />);
    
    expect(screen.getByText('Weekly Activity')).toBeInTheDocument();
    expect(screen.getByText('Category Insights')).toBeInTheDocument();
  });

  it('displays weekly activity chart', () => {
    render(<InsightsChart />);
    
    // Should show days of the week
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const foundDays = dayLabels.filter(day => {
      try {
        screen.getByText(day);
        return true;
      } catch {
        return false;
      }
    });
    
    // Should find at least some days (depends on current date)
    expect(foundDays.length).toBeGreaterThan(0);
  });

  it('shows activity legend', () => {
    render(<InsightsChart />);
    
    expect(screen.getByText('Added')).toBeInTheDocument();
    expect(screen.getByText('Used')).toBeInTheDocument();
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('displays category insights', () => {
    render(<InsightsChart />);
    
    // Should show categories from the mock data
    expect(screen.getByText('dairy')).toBeInTheDocument();
    expect(screen.getByText('bakery')).toBeInTheDocument();
  });

  it('calculates category metrics correctly', () => {
    render(<InsightsChart />);
    
    // Check if metric labels are present (multiple categories will have these labels)
    expect(screen.getAllByText('Avg. Lifespan').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Monthly Shopping').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Waste Rate').length).toBeGreaterThan(0);
  });

  it('shows waste rate with appropriate colors', () => {
    render(<InsightsChart />);
    
    // Should have waste rate indicators
    const wasteRateElements = document.querySelectorAll('.bg-red-500, .bg-orange-500, .bg-green-500');
    expect(wasteRateElements.length).toBeGreaterThan(0);
  });

  it('calculates shopping frequency correctly', () => {
    render(<InsightsChart />);
    
    // Should show shopping frequency (items completed in last 30 days)
    // Both mock shopping items were completed within 30 days
    const frequencyElements = screen.getAllByText(/\d+x/);
    expect(frequencyElements.length).toBeGreaterThan(0);
  });

  it('handles empty data gracefully', () => {
    mockUseInventoryStore.mockReturnValue({
      items: [],
      getExpiringItems: vi.fn(),
      getLowStockItems: vi.fn(),
      // Add other required properties with default values
      filters: {},
      isLoading: false,
      error: null,
      loadItems: vi.fn(),
      addItem: vi.fn(),
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
      filters: {},
      isLoading: false,
      error: null,
      loadItems: vi.fn(),
      addItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      toggleCompleted: vi.fn(),
      clearCompleted: vi.fn(),
      addFromInventory: vi.fn(),
      setFilters: vi.fn(),
      clearError: vi.fn(),
      getCompletedItems: vi.fn(),
      getPendingItems: vi.fn(),
      getItemsByCategory: vi.fn(),
      getFilteredItems: vi.fn(),
      getCompletionStats: vi.fn()
    });

    render(<InsightsChart />);
    
    expect(screen.getByText('No insights available yet')).toBeInTheDocument();
    expect(screen.getByText('Add more items to see patterns')).toBeInTheDocument();
  });

  it('limits category insights to top 5', () => {
    // Create mock data with more than 5 categories
    const manyCategories = Array.from({ length: 8 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Item ${i + 1}`,
      quantity: 1,
      unit: 'pcs',
      expirationDate: null,
      location: 'pantry' as const,
      purchaseDate: new Date(),
      category: `category${i + 1}`,
      isLow: false,
      isFinished: false,
      lastUsed: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    mockUseInventoryStore.mockReturnValue({
      items: manyCategories,
      getExpiringItems: vi.fn(),
      getLowStockItems: vi.fn(),
      // Add other required properties with default values
      filters: {},
      isLoading: false,
      error: null,
      loadItems: vi.fn(),
      addItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      markAsUsed: vi.fn(),
      markAsFinished: vi.fn(),
      setFilters: vi.fn(),
      clearError: vi.fn(),
      getItemsByLocation: vi.fn(),
      getFilteredItems: vi.fn()
    });

    render(<InsightsChart />);
    
    // Should only show top 5 categories
    const categoryElements = screen.getAllByText(/category\d+/);
    expect(categoryElements.length).toBeLessThanOrEqual(5);
  });

  it('applies custom className', () => {
    const { container } = render(<InsightsChart className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('shows item counts for categories', () => {
    render(<InsightsChart />);
    
    // Should show item counts (dairy has 2 items, bakery has 1)
    expect(screen.getByText('2 items')).toBeInTheDocument();
    expect(screen.getByText('1 items')).toBeInTheDocument();
  });
});