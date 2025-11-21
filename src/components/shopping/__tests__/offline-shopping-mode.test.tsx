import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OfflineShoppingMode } from '../offline-shopping-mode';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useShoppingStore } from '@/stores/shopping-store';
import { useSyncService } from '@/lib/sync-service';

// Mock the hooks and stores
vi.mock('@/hooks/use-online-status');
vi.mock('@/stores/shopping-store');
vi.mock('@/lib/sync-service');

const mockUseOnlineStatus = useOnlineStatus as vi.MockedFunction<typeof useOnlineStatus>;
const mockUseShoppingStore = useShoppingStore as vi.MockedFunction<typeof useShoppingStore>;
const mockUseSyncService = useSyncService as vi.MockedFunction<typeof useSyncService>;

describe('OfflineShoppingMode', () => {
  const mockShoppingStore = {
    items: [],
    isLoading: false,
    error: null,
    loadItems: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    toggleCompleted: vi.fn(),
    clearCompleted: vi.fn(),
  };

  const mockSyncService = {
    addPendingChange: vi.fn(),
    getPendingChangesCount: vi.fn(),
    isSyncing: vi.fn(),
    forceSync: vi.fn(),
    clearPendingChanges: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      wasOffline: false,
      resetOfflineFlag: vi.fn(),
    });

    mockUseShoppingStore.mockReturnValue(mockShoppingStore);
    mockUseSyncService.mockReturnValue(mockSyncService);
  });

  it('should render shopping list header', () => {
    render(<OfflineShoppingMode />);
    
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
  });

  it('should show offline indicator when offline', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      wasOffline: false,
      resetOfflineFlag: vi.fn(),
    });

    render(<OfflineShoppingMode />);
    
    expect(screen.getByText('Offline Mode')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseShoppingStore.mockReturnValue({
      ...mockShoppingStore,
      isLoading: true,
    });

    render(<OfflineShoppingMode />);
    
    expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
  });

  it('should show empty state when no items', () => {
    render(<OfflineShoppingMode />);
    
    expect(screen.getByText('Your shopping list is empty')).toBeInTheDocument();
    expect(screen.getByText('Add your first item')).toBeInTheDocument();
  });

  it('should display shopping items', () => {
    const mockItems = [
      {
        id: '1',
        name: 'Milk',
        quantity: 1,
        unit: 'item',
        category: 'dairy',
        isCompleted: false,
        notes: '',
        addedAt: new Date(),
      },
      {
        id: '2',
        name: 'Bread',
        quantity: 2,
        unit: 'loaf',
        category: 'bakery',
        isCompleted: true,
        notes: '',
        addedAt: new Date(),
      },
    ];

    mockUseShoppingStore.mockReturnValue({
      ...mockShoppingStore,
      items: mockItems,
    });

    render(<OfflineShoppingMode />);
    
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('Bread')).toBeInTheDocument();
    expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
  });

  it('should show progress indicator with items', () => {
    const mockItems = [
      { id: '1', name: 'Milk', isCompleted: false },
      { id: '2', name: 'Bread', isCompleted: true },
      { id: '3', name: 'Eggs', isCompleted: true },
    ];

    mockUseShoppingStore.mockReturnValue({
      ...mockShoppingStore,
      items: mockItems as any,
    });

    render(<OfflineShoppingMode />);
    
    expect(screen.getByText('2 of 3 completed')).toBeInTheDocument();
    expect(screen.getByText('67%')).toBeInTheDocument();
  });

  it('should show clear completed button when there are completed items', () => {
    const mockItems = [
      { id: '1', name: 'Milk', isCompleted: false },
      { id: '2', name: 'Bread', isCompleted: true },
    ];

    mockUseShoppingStore.mockReturnValue({
      ...mockShoppingStore,
      items: mockItems as any,
    });

    render(<OfflineShoppingMode />);
    
    expect(screen.getByText('Clear completed (1)')).toBeInTheDocument();
  });

  it('should show add item form when add button is clicked', async () => {
    render(<OfflineShoppingMode />);
    
    const addButton = screen.getByText('Add item to list');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Item name')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1')).toBeInTheDocument(); // Quantity input
    });
  });

  it('should add item when online', async () => {
    render(<OfflineShoppingMode />);
    
    // Open add form
    fireEvent.click(screen.getByText('Add item to list'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Item name')).toBeInTheDocument();
    });

    // Fill form
    const nameInput = screen.getByPlaceholderText('Item name');
    const quantityInput = screen.getByDisplayValue('1');
    
    fireEvent.change(nameInput, { target: { value: 'New Item' } });
    fireEvent.change(quantityInput, { target: { value: '3' } });

    // Submit
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);

    expect(mockShoppingStore.addItem).toHaveBeenCalledWith({
      name: 'New Item',
      quantity: 3,
      unit: 'item',
      category: 'other',
      isCompleted: false,
      notes: '',
    });
  });

  it('should add item to pending changes when offline', async () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      wasOffline: false,
      resetOfflineFlag: vi.fn(),
    });

    render(<OfflineShoppingMode />);
    
    // Open add form
    fireEvent.click(screen.getByText('Add item to list'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Item name')).toBeInTheDocument();
    });

    // Fill and submit form
    const nameInput = screen.getByPlaceholderText('Item name');
    fireEvent.change(nameInput, { target: { value: 'Offline Item' } });
    fireEvent.click(screen.getByText('Add'));

    expect(mockSyncService.addPendingChange).toHaveBeenCalledWith({
      id: expect.stringContaining('temp_'),
      type: 'shopping',
      action: 'create',
      data: {
        name: 'Offline Item',
        quantity: 1,
        unit: 'item',
        category: 'other',
        isCompleted: false,
        notes: '',
      },
    });
  });

  it('should toggle item completion when online', async () => {
    const mockItems = [
      { id: '1', name: 'Milk', isCompleted: false },
    ];

    mockUseShoppingStore.mockReturnValue({
      ...mockShoppingStore,
      items: mockItems as any,
    });

    render(<OfflineShoppingMode />);
    
    const checkButton = screen.getByRole('button', { name: 'Mark Milk as complete' }); // Checkbox button
    fireEvent.click(checkButton);

    expect(mockShoppingStore.toggleCompleted).toHaveBeenCalledWith('1');
  });

  it('should add toggle to pending changes when offline', async () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      wasOffline: false,
      resetOfflineFlag: vi.fn(),
    });

    const mockItems = [
      { id: '1', name: 'Milk', isCompleted: false },
    ];

    mockUseShoppingStore.mockReturnValue({
      ...mockShoppingStore,
      items: mockItems as any,
    });

    render(<OfflineShoppingMode />);
    
    const checkButton = screen.getByRole('button', { name: 'Mark Milk as complete' }); // Checkbox button
    fireEvent.click(checkButton);

    expect(mockSyncService.addPendingChange).toHaveBeenCalledWith({
      id: '1',
      type: 'shopping',
      action: 'update',
      data: { isCompleted: true },
    });
  });

  it('should remove item when delete button is clicked', async () => {
    const mockItems = [
      { id: '1', name: 'Milk', isCompleted: false },
    ];

    mockUseShoppingStore.mockReturnValue({
      ...mockShoppingStore,
      items: mockItems as any,
    });

    render(<OfflineShoppingMode />);
    
    const deleteButton = screen.getByRole('button', { name: 'Delete Milk' }); // Delete button (trash icon)
    fireEvent.click(deleteButton);

    expect(mockShoppingStore.deleteItem).toHaveBeenCalledWith('1');
  });

  it('should clear completed items when online', async () => {
    const mockItems = [
      { id: '1', name: 'Milk', isCompleted: false },
      { id: '2', name: 'Bread', isCompleted: true },
    ];

    mockUseShoppingStore.mockReturnValue({
      ...mockShoppingStore,
      items: mockItems as any,
    });

    render(<OfflineShoppingMode />);
    
    const clearButton = screen.getByText('Clear completed (1)');
    fireEvent.click(clearButton);

    expect(mockShoppingStore.clearCompleted).toHaveBeenCalled();
  });

  it('should add completed items to pending changes when clearing offline', async () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      wasOffline: false,
      resetOfflineFlag: vi.fn(),
    });

    const mockItems = [
      { id: '1', name: 'Milk', isCompleted: false },
      { id: '2', name: 'Bread', isCompleted: true },
    ];

    mockUseShoppingStore.mockReturnValue({
      ...mockShoppingStore,
      items: mockItems as any,
    });

    render(<OfflineShoppingMode />);
    
    const clearButton = screen.getByText('Clear completed (1)');
    fireEvent.click(clearButton);

    expect(mockSyncService.addPendingChange).toHaveBeenCalledWith({
      id: '2',
      type: 'shopping',
      action: 'delete',
      data: {},
    });
  });

  it('should show offline mode info when offline with items', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      wasOffline: false,
      resetOfflineFlag: vi.fn(),
    });

    const mockItems = [
      { id: '1', name: 'Milk', isCompleted: false },
    ];

    mockUseShoppingStore.mockReturnValue({
      ...mockShoppingStore,
      items: mockItems as any,
    });

    render(<OfflineShoppingMode />);
    
    expect(screen.getByText(/you're shopping offline/i)).toBeInTheDocument();
    expect(screen.getByText(/changes will sync automatically/i)).toBeInTheDocument();
  });

  it('should show error message when there is an error', () => {
    mockUseShoppingStore.mockReturnValue({
      ...mockShoppingStore,
      error: 'Something went wrong',
    });

    render(<OfflineShoppingMode />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should add item on Enter key press', async () => {
    render(<OfflineShoppingMode />);
    
    // Open add form
    fireEvent.click(screen.getByText('Add item to list'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Item name')).toBeInTheDocument();
    });

    // Fill form and press Enter
    const nameInput = screen.getByPlaceholderText('Item name');
    fireEvent.change(nameInput, { target: { value: 'Enter Item' } });
    fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });

    expect(mockShoppingStore.addItem).toHaveBeenCalledWith({
      name: 'Enter Item',
      quantity: 1,
      unit: 'item',
      category: 'other',
      isCompleted: false,
      notes: '',
    });
  });
});