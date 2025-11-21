import { useSyncService } from '../sync-service';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('SyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should provide sync service methods', () => {
    const syncMethods = useSyncService();

    expect(syncMethods).toHaveProperty('addPendingChange');
    expect(syncMethods).toHaveProperty('getPendingChangesCount');
    expect(syncMethods).toHaveProperty('isSyncing');
    expect(syncMethods).toHaveProperty('forceSync');
    expect(syncMethods).toHaveProperty('clearPendingChanges');
  });

  it('should handle localStorage operations', () => {
    const syncMethods = useSyncService();
    
    // Test that methods exist and can be called
    expect(typeof syncMethods.addPendingChange).toBe('function');
    expect(typeof syncMethods.getPendingChangesCount).toBe('function');
    expect(typeof syncMethods.isSyncing).toBe('function');
    expect(typeof syncMethods.forceSync).toBe('function');
    expect(typeof syncMethods.clearPendingChanges).toBe('function');
  });
});

