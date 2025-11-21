import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExpiringItemsWidget } from '../expiring-items-widget';
import { useInventoryStore } from '@/stores/inventory-store';
import type { InventoryItem } from '@/lib/types';

// Mock the inventory store
vi.mock('@/stores/inventory-store');

const mockUseInventoryStore = vi.mocked(useInventoryStore);

describe('ExpiringItemsWidget', () => {
  const now = new Date();
  
  const mockExpiringItems: InventoryItem[] = [
    {
      id: '1',
      name: 'Milk',
      quantity: 1,
      unit: 'l',
      expirationDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow (critical)
      location: 'fridge',
      purchaseDate: new Date(),
      category: 'dairy',
      isLow: false,
      isFinished: false,
      lastUsed: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'Yogurt',
      quantity: 2,
      unit: 'cups',
      expirationDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days (warning)
      location: 'fridge',
      purchaseDate: new Date(),
      category: 'dairy',
      isLow: false,
      isFinished: false,
      lastUsed: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Bread',
      quantity: 1,
      unit: 'loaf',
      expirationDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days (notice)
      location: 'pantry',
      purchaseDate: new Date(),
      category: 'bakery',
      isLow: false,
      isFinished: false,
      lastUsed: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      name: 'Expired Cheese',
      quantity: 1,
      unit: 'pack',
      expirationDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday (expired)
      location: 'fridge',
      purchaseDate: new Date(),
      category: 'dairy',
      isLow: false,
      isFinished: false,
      lastUsed: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockGetExpiringItems = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockGetExpiringItems.mockReturnValue(mockExpiringItems);
    
    mockUseInventoryStore.mockReturnValue({
      items: [],
      getExpiringItems: mockGetExpiringItems,
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
  });

  it('renders expiring items widget correctly', () => {
    render(<ExpiringItemsWidget />);
    
    expect(screen.getByText('Expiring Items')).toBeInTheDocument();
    expect(screen.getByText('4 items')).toBeInTheDocument();
  });

  it('displays items sorted by urgency', () => {
    render(<ExpiringItemsWidget />);
    
    const itemNames = screen.getAllByText(/Milk|Yogurt|Bread|Expired Cheese/);
    
    // Should be sorted: Expired Cheese (critical/expired), Milk (critical), Yogurt (warning), Bread (notice)
    expect(itemNames[0]).toHaveTextContent('Expired Cheese');
    expect(itemNames[1]).toHaveTextContent('Milk');
    expect(itemNames[2]).toHaveTextContent('Yogurt');
    expect(itemNames[3]).toHaveTextContent('Bread');
  });

  it('shows correct urgency indicators', () => {
    render(<ExpiringItemsWidget />);
    
    // Critical items should have red indicators
    const criticalIndicators = document.querySelectorAll('.bg-red-500');
    expect(criticalIndicators.length).toBeGreaterThan(0);
    
    // Warning items should have orange indicators
    const warningIndicators = document.querySelectorAll('.bg-orange-500');
    expect(warningIndicators.length).toBeGreaterThan(0);
    
    // Notice items should have yellow indicators
    const noticeIndicators = document.querySelectorAll('.bg-yellow-500');
    expect(noticeIndicators.length).toBeGreaterThan(0);
  });

  it('displays correct expiration text', () => {
    render(<ExpiringItemsWidget />);
    
    expect(screen.getByText('Expires tomorrow')).toBeInTheDocument(); // Milk
    expect(screen.getByText('Expires in 2 days')).toBeInTheDocument(); // Yogurt
    expect(screen.getByText('Expires in 5 days')).toBeInTheDocument(); // Bread
    expect(screen.getByText('Expired 1 day ago')).toBeInTheDocument(); // Expired Cheese
  });

  it('shows item details correctly', () => {
    render(<ExpiringItemsWidget />);
    
    // Check if item details are displayed (using getAllByText since there are multiple items with same location)
    const fridgeElements = screen.getAllByText('fridge');
    expect(fridgeElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText('pantry')).toBeInTheDocument();
    
    // Check for specific quantity/unit combinations
    const quantityElements = screen.getAllByText(/1\s+l/);
    expect(quantityElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText(/2\s+cups/)).toBeInTheDocument();
  });

  it('limits items to maxItems prop', () => {
    render(<ExpiringItemsWidget maxItems={2} />);
    
    const itemElements = screen.getAllByText(/fridge|pantry/);
    // Should only show 2 items max
    expect(itemElements.length).toBeLessThanOrEqual(4); // 2 items * 2 possible locations each
  });

  it('shows empty state when no expiring items', () => {
    mockGetExpiringItems.mockReturnValue([]);
    
    render(<ExpiringItemsWidget />);
    
    expect(screen.getByText('No items expiring soon')).toBeInTheDocument();
    expect(screen.getByText('All your items are fresh!')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('shows pulsing indicator for critical items', () => {
    render(<ExpiringItemsWidget />);
    
    // Should have a pulsing red indicator when critical items exist
    const pulsingIndicator = document.querySelector('.animate-pulse.bg-red-500');
    expect(pulsingIndicator).toBeInTheDocument();
  });

  it('handles items without expiration dates', () => {
    const itemsWithoutExpiration = [
      {
        ...mockExpiringItems[0],
        expirationDate: null
      }
    ];
    
    mockGetExpiringItems.mockReturnValue(itemsWithoutExpiration);
    
    render(<ExpiringItemsWidget />);
    
    // Should show empty state since items without expiration dates are filtered out
    expect(screen.getByText('No items expiring soon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ExpiringItemsWidget className="custom-class" />);
    // The className is applied to the Card component which is wrapped in a motion.div
    const cardElement = container.querySelector('.custom-class');
    expect(cardElement).toBeInTheDocument();
  });

  it('shows view all link when at max items limit', () => {
    render(<ExpiringItemsWidget maxItems={3} />);
    
    // With 4 expiring items and maxItems=3, should show "View all" link
    expect(screen.getByText('View all expiring items')).toBeInTheDocument();
  });
});