import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppLayout } from '@/components/layout/app-layout';
import { OfflineShoppingMode } from '@/components/shopping/offline-shopping-mode';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useSyncService } from '@/lib/sync-service';
import { useShoppingStore } from '@/stores/shopping-store';

// Mock all dependencies
vi.mock('@/hooks/use-online-status');
vi.mock('@/lib/sync-service');
vi.mock('@/stores/shopping-store');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/components/layout/mobile-navigation', () => ({
  MobileNavigation: () => <div>Mobile Navigation</div>,
}));
vi.mock('@/components/layout/desktop-sidebar', () => ({
  DesktopSidebar: () => <div>Desktop Sidebar</div>,
}));

const mockUseOnlineStatus = useOnlineStatus as vi.MockedFunction<typeof useOnlineStatus>;
const mockUseSyncService = useSyncService as vi.MockedFunction<typeof useSyncService>;
const mockUseShoppingStore = useShoppingStore as vi.MockedFunction<typeof useShoppingStore>;

describe('Offline Integration Tests', () => {
  const mockSyncService = {
    addPendingChange: vi.fn(),
    getPendingChangesCount: vi.fn(),
    isSyncing: vi.fn(),
    forceSync: vi.fn(),
    clearPendingChanges: vi.fn(),
  };

  const mockShoppingStore = {
    items: [],
    isLoading: false,
    error: null,
    loadItems: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    toggleCompleted: vi.fn(),
    clearCompleted: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      wasOffline: false,
      resetOfflineFlag: vi.fn(),
    });

    mockUseSyncService.mockReturnValue(mockSyncService);
    mockUseShoppingStore.mockReturnValue(mockShoppingStore);
    
    mockSyncService.getPendingChangesCount.mockReturnValue(0);
    mockSyncService.isSyncing.mockReturnValue(false);
  });

  describe('Complete Offline Workflow', () => {
    it('should handle complete offline to online workflow', async () => {
      const resetOfflineFlag = vi.fn();
      
      // Start online
      mockUseOnlineStatus.mockReturnValue({
        isOnline: true,
        wasOffline: false,
        resetOfflineFlag,
      });

      const { rerender } = render(
        <AppLayout>
          <OfflineShoppingMode />
        </AppLayout>
      );

      // Should not show offline indicator initially
      expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();

      // Go offline
      mockUseOnlineStatus.mockReturnValue({
        isOnline: false,
        wasOffline: false,
        resetOfflineFlag,
      });

      rerender(
        <AppLayout>
          <OfflineShoppingMode />
        </AppLayout>
      );

      // Should show offline indicators
      expect(screen.getByText("You're offline")).toBeInTheDocument();
      expect(screen.getByText('Offline Mode')).toBeInTheDocument();

      // Add item while offline
      const addButton = screen.getByText('Add item to list');
      fireEvent.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Item name')).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText('Item name');
      fireEvent.change(nameInput, { target: { value: 'Offline Item' } });
      
      const submitButton = screen.getByRole('button', { name: 'Add item to shopping list' });
      fireEvent.click(submitButton);

      // Should add to pending changes
      await waitFor(() => {
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

      // Come back online with pending changes
      mockSyncService.getPendingChangesCount.mockReturnValue(1);
      mockUseOnlineStatus.mockReturnValue({
        isOnline: true,
        wasOffline: true,
        resetOfflineFlag,
      });

      rerender(
        <AppLayout>
          <OfflineShoppingMode />
        </AppLayout>
      );

      // Should show sync options
      await waitFor(() => {
        expect(screen.getByText('Back online')).toBeInTheDocument();
      });
      expect(screen.getByText('1 changes to sync')).toBeInTheDocument();
      
      const syncButton = screen.getByText('Sync Now');
      expect(syncButton).toBeInTheDocument();

      // Click sync
      fireEvent.click(syncButton);
      expect(mockSyncService.forceSync).toHaveBeenCalled();

      // Simulate successful sync
      mockSyncService.getPendingChangesCount.mockReturnValue(0);
      mockSyncService.isSyncing.mockReturnValue(false);

      rerender(
        <AppLayout>
          <OfflineShoppingMode />
        </AppLayout>
      );

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText('All changes synced successfully')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(resetOfflineFlag).toHaveBeenCalled();
    });

    it('should handle multiple offline operations', async () => {
      // Start offline
      mockUseOnlineStatus.mockReturnValue({
        isOnline: false,
        wasOffline: false,
        resetOfflineFlag: vi.fn(),
      });

      const mockItems = [
        { id: '1', name: 'Existing Item', isCompleted: false },
      ];

      mockUseShoppingStore.mockReturnValue({
        ...mockShoppingStore,
        items: mockItems as any,
      });

      render(
        <AppLayout>
          <OfflineShoppingMode />
        </AppLayout>
      );

      // Add new item
      const addButton = screen.getByText('Add item to list');
      fireEvent.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Item name')).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText('Item name');
      fireEvent.change(nameInput, { target: { value: 'New Item' } });
      
      const submitButton = screen.getByRole('button', { name: 'Add item to shopping list' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSyncService.addPendingChange).toHaveBeenCalledWith({
          id: expect.stringContaining('temp_'),
          type: 'shopping',
          action: 'create',
          data: expect.objectContaining({ name: 'New Item' }),
        });
      });

      // Toggle existing item - find the checkbox button within the item
      const existingItem = screen.getByText('Existing Item').closest('div[class*="flex items-center"]');
      const checkButton = existingItem?.querySelector('button');
      if (checkButton) {
        fireEvent.click(checkButton);
      }

      // Should have multiple pending changes
      await waitFor(() => {
        expect(mockSyncService.addPendingChange).toHaveBeenCalledTimes(2);
      });

      expect(mockSyncService.addPendingChange).toHaveBeenCalledWith({
        id: '1',
        type: 'shopping',
        action: 'update',
        data: { isCompleted: true },
      });
    });

    it('should show appropriate error states', async () => {
      // Start with sync error
      mockUseOnlineStatus.mockReturnValue({
        isOnline: true,
        wasOffline: false,
        resetOfflineFlag: vi.fn(),
      });
      mockSyncService.getPendingChangesCount.mockReturnValue(2);
      mockSyncService.isSyncing.mockReturnValue(false);

      render(
        <AppLayout>
          <OfflineShoppingMode />
        </AppLayout>
      );

      // Should show sync error message
      expect(screen.getByText(/some changes couldn't be synced/i)).toBeInTheDocument();
      expect(screen.getByText('Sync Now')).toBeInTheDocument();
    });

    it('should handle PWA installation flow', async () => {
      // Mock beforeinstallprompt event
      const mockDeferredPrompt = {
        prompt: vi.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      };

      render(<AppLayout><div>Test Content</div></AppLayout>);

      // Simulate beforeinstallprompt event
      const event = Object.assign(new Event('beforeinstallprompt'), mockDeferredPrompt);
      event.preventDefault = vi.fn();
      fireEvent(window, event);

      await waitFor(() => {
        expect(screen.getByText('Install App')).toBeInTheDocument();
      });

      // Click install
      fireEvent.click(screen.getByText('Install'));

      expect(mockDeferredPrompt.prompt).toHaveBeenCalled();

      // Simulate successful installation
      fireEvent(window, new Event('appinstalled'));

      await waitFor(() => {
        expect(screen.queryByText('Install App')).not.toBeInTheDocument();
      });
    });

    it('should persist offline changes across page reloads', async () => {
      // Simulate localStorage with existing pending changes
      const existingChanges = [
        {
          id: 'existing-1',
          type: 'shopping',
          action: 'create',
          data: { name: 'Persisted Item' },
          timestamp: Date.now() - 1000,
        },
      ];

      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue(JSON.stringify(existingChanges)),
        setItem: vi.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
      });

      // Start offline with pending changes
      mockUseOnlineStatus.mockReturnValue({
        isOnline: false,
        wasOffline: false,
        resetOfflineFlag: vi.fn(),
      });
      mockSyncService.getPendingChangesCount.mockReturnValue(1);

      render(
        <AppLayout>
          <OfflineShoppingMode />
        </AppLayout>
      );

      // Should show existing pending changes
      expect(screen.getByText('1 changes pending')).toBeInTheDocument();
    });
  });

  describe('Service Worker Integration', () => {
    it('should handle service worker registration', () => {
      // Mock service worker
      const mockServiceWorker = {
        register: vi.fn().mockResolvedValue({}),
      };

      Object.defineProperty(navigator, 'serviceWorker', {
        value: mockServiceWorker,
      });

      render(<AppLayout><div>Test</div></AppLayout>);

      // Service worker registration would be handled by Next.js PWA plugin
      // This test verifies the component renders without errors when SW is available
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  describe('Accessibility in Offline Mode', () => {
    it('should maintain accessibility during offline operations', async () => {
      mockUseOnlineStatus.mockReturnValue({
        isOnline: false,
        wasOffline: false,
        resetOfflineFlag: vi.fn(),
      });

      render(
        <AppLayout>
          <OfflineShoppingMode />
        </AppLayout>
      );

      // Check for proper ARIA labels and roles
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Offline Mode')).toBeInTheDocument();

      // Add item form should be accessible
      fireEvent.click(screen.getByText('Add item to list'));
      
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Item name');
        expect(nameInput).toBeInTheDocument();
        expect(nameInput).toHaveAttribute('type', 'text');
      });
    });
  });
});