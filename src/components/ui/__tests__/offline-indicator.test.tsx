import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OfflineIndicator } from '../offline-indicator';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useSyncService } from '@/lib/sync-service';

// Mock the hooks
vi.mock('@/hooks/use-online-status');
vi.mock('@/lib/sync-service');

const mockUseOnlineStatus = useOnlineStatus as vi.MockedFunction<typeof useOnlineStatus>;
const mockUseSyncService = useSyncService as vi.MockedFunction<typeof useSyncService>;

describe('OfflineIndicator', () => {
  const mockSyncService = {
    getPendingChangesCount: vi.fn(),
    isSyncing: vi.fn(),
    forceSync: vi.fn(),
    addPendingChange: vi.fn(),
    clearPendingChanges: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      wasOffline: false,
      resetOfflineFlag: vi.fn(),
    });

    mockUseSyncService.mockReturnValue(mockSyncService);
    mockSyncService.getPendingChangesCount.mockReturnValue(0);
    mockSyncService.isSyncing.mockReturnValue(false);
  });

  it('should not render when online with no pending changes', () => {
    render(<OfflineIndicator />);
    
    expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sync/i)).not.toBeInTheDocument();
  });

  it('should show offline status when offline', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      wasOffline: false,
      resetOfflineFlag: vi.fn(),
    });

    render(<OfflineIndicator />);
    
    expect(screen.getByText("You're offline")).toBeInTheDocument();
  });

  it('should show pending changes count when offline', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      wasOffline: false,
      resetOfflineFlag: vi.fn(),
    });
    mockSyncService.getPendingChangesCount.mockReturnValue(3);

    render(<OfflineIndicator />);
    
    expect(screen.getByText("3 changes pending")).toBeInTheDocument();
  });

  it('should show sync options when back online with pending changes', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      wasOffline: true,
      resetOfflineFlag: vi.fn(),
    });
    mockSyncService.getPendingChangesCount.mockReturnValue(2);

    render(<OfflineIndicator />);
    
    expect(screen.getByText("Back online")).toBeInTheDocument();
    expect(screen.getByText("2 changes to sync")).toBeInTheDocument();
    expect(screen.getByText("Sync Now")).toBeInTheDocument();
  });

  it('should show syncing status when sync is in progress', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      wasOffline: true,
      resetOfflineFlag: vi.fn(),
    });
    mockSyncService.getPendingChangesCount.mockReturnValue(1);
    mockSyncService.isSyncing.mockReturnValue(true);

    render(<OfflineIndicator />);
    
    expect(screen.getByText("Syncing...")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /syncing/i })).toBeDisabled();
  });

  it('should call forceSync when sync button is clicked', async () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      wasOffline: true,
      resetOfflineFlag: vi.fn(),
    });
    mockSyncService.getPendingChangesCount.mockReturnValue(1);
    mockSyncService.forceSync.mockResolvedValue(undefined);

    render(<OfflineIndicator />);
    
    const syncButton = screen.getByText("Sync Now");
    fireEvent.click(syncButton);

    expect(mockSyncService.forceSync).toHaveBeenCalled();
  });

  it('should show success message after successful sync', async () => {
    const mockResetOfflineFlag = vi.fn();
    
    // Start with pending changes
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      wasOffline: true,
      resetOfflineFlag: mockResetOfflineFlag,
    });
    mockSyncService.getPendingChangesCount.mockReturnValue(0); // No pending changes = sync complete
    mockSyncService.isSyncing.mockReturnValue(false);

    render(<OfflineIndicator />);
    
    await waitFor(() => {
      expect(screen.getByText("All changes synced successfully")).toBeInTheDocument();
    });

    expect(mockResetOfflineFlag).toHaveBeenCalled();
  });

  it('should show sync error message when appropriate', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      wasOffline: false,
      resetOfflineFlag: vi.fn(),
    });
    mockSyncService.getPendingChangesCount.mockReturnValue(2);
    mockSyncService.isSyncing.mockReturnValue(false);

    render(<OfflineIndicator />);
    
    expect(screen.getByText(/some changes couldn't be synced/i)).toBeInTheDocument();
  });

  it('should handle sync errors gracefully', async () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: true,
      wasOffline: true,
      resetOfflineFlag: vi.fn(),
    });
    mockSyncService.getPendingChangesCount.mockReturnValue(1);
    mockSyncService.forceSync.mockRejectedValue(new Error('Sync failed'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<OfflineIndicator />);
    
    const syncButton = screen.getByText("Sync Now");
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Manual sync failed:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should update pending count when count changes', () => {
    mockUseOnlineStatus.mockReturnValue({
      isOnline: false,
      wasOffline: false,
      resetOfflineFlag: vi.fn(),
    });
    
    mockSyncService.getPendingChangesCount.mockReturnValue(3);

    render(<OfflineIndicator />);
    
    expect(screen.getByText("3 changes pending")).toBeInTheDocument();
  });
});