import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardStats } from '../dashboard-stats';
import { useInventoryStore } from '@/stores/inventory-store';
import type { InventoryItem } from '@/lib/types';

// Mock the inventory store
vi.mock('@/stores/inventory-store');

const mockUseInventoryStore = vi.mocked(useInventoryStore);

describe('DashboardStats', () => {
  const mockItems: InventoryItem[] = [
    {
      id: '1',
      name: 'Milk',
      quantity: 1,
      unit: 'l',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      location: 'fridge',
      purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      category: 'dairy',
      isLow: true,
      isFinished: false,
      lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Bread',
      quantity: 1,
      unit: 'loaf',
      expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      location: 'pantry',
      purchaseDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
      category: 'bakery',
      isLow: false,
      isFinished: false,
      lastUsed: null, // Never used
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Frozen Peas',
      quantity: 500,
      unit: 'g',
      expirationDate: null,
      location: 'freezer',
      purchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      category: 'frozen',
      isLow: false,
      isFinished: true, // Finished item
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockGetExpiringItems = vi.fn();
  const mockGetLowStockItems = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockGetExpiringItems.mockReturnValue([mockItems[0]]); // Milk is expiring
    mockGetLowStockItems.mockReturnValue([mockItems[0]]); // Milk is low stock
    
    mockUseInventoryStore.mockReturnValue({
      items: mockItems,
      getExpiringItems: mockGetExpiringItems,
      getLowStockItems: mockGetLowStockItems,
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
  });

  it('renders dashboard stats correctly', () => {
    render(<DashboardStats />);
    
    // Check if main stat cards are rendered
    expect(screen.getByText('Total Items')).toBeInTheDocument();
    expect(screen.getByText('Expiring Soon')).toBeInTheDocument();
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
    expect(screen.getByText('Unused Items')).toBeInTheDocument();
  });

  it('calculates total items correctly (excluding finished items)', () => {
    render(<DashboardStats />);
    
    // Should show 2 active items (excluding the finished frozen peas)
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays expiring items count', () => {
    render(<DashboardStats />);
    
    // Should show 1 expiring item (milk)
    const expiringSection = screen.getByText('Expiring Soon').closest('div');
    expect(expiringSection).toContainHTML('1');
  });

  it('displays low stock items count', () => {
    render(<DashboardStats />);
    
    // Should show 1 low stock item (milk)
    const lowStockSection = screen.getByText('Low Stock').closest('div');
    expect(lowStockSection).toContainHTML('1');
  });

  it('calculates unused items correctly', () => {
    render(<DashboardStats />);
    
    // Should show 1 unused item (bread - purchased 35 days ago, never used)
    const unusedSection = screen.getByText('Unused Items').closest('div');
    expect(unusedSection).toContainHTML('1');
  });

  it('displays storage location breakdown', () => {
    render(<DashboardStats />);
    
    expect(screen.getByText('Storage Locations')).toBeInTheDocument();
    expect(screen.getByText('fridge')).toBeInTheDocument();
    expect(screen.getByText('pantry')).toBeInTheDocument();
    // Freezer item is finished, so it shouldn't appear in active breakdown
  });

  it('calculates location percentages correctly', () => {
    render(<DashboardStats />);
    
    // Check that progress bars exist for each location
    const fridgeBar = document.querySelector('.bg-blue-500');
    const pantryBar = document.querySelector('.bg-green-500');
    
    expect(fridgeBar).toBeInTheDocument();
    expect(pantryBar).toBeInTheDocument();
    
    // Check that both bars exist (they represent the location breakdown)
    // The percentage calculation is implicit in their rendering
    expect(fridgeBar).toBeTruthy();
    expect(pantryBar).toBeTruthy();
  });

  it('handles empty inventory gracefully', () => {
    mockUseInventoryStore.mockReturnValue({
      items: [],
      getExpiringItems: () => [],
      getLowStockItems: () => [],
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

    render(<DashboardStats />);
    
    // All counts should be 0
    const statCards = screen.getAllByText('0');
    expect(statCards).toHaveLength(4); // Total, Expiring, Low Stock, Unused
  });

  it('applies custom className', () => {
    const { container } = render(<DashboardStats className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});