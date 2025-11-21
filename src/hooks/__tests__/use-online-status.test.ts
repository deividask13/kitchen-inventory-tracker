import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '../use-online-status';

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock window event listeners
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  value: mockAddEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  value: mockRemoveEventListener,
});

describe('useOnlineStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigator.onLine = true;
  });

  it('should return initial online status', () => {
    const { result } = renderHook(() => useOnlineStatus());
    
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
  });

  it('should return offline status when navigator.onLine is false', () => {
    navigator.onLine = false;
    
    const { result } = renderHook(() => useOnlineStatus());
    
    expect(result.current.isOnline).toBe(false);
  });

  it('should set up event listeners on mount', () => {
    renderHook(() => useOnlineStatus());
    
    expect(mockAddEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should clean up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useOnlineStatus());
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should update online status when online event is fired', () => {
    const { result } = renderHook(() => useOnlineStatus());
    
    // Get the online event handler
    const onlineHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'online'
    )?.[1];
    
    expect(onlineHandler).toBeDefined();
    
    act(() => {
      onlineHandler();
    });
    
    expect(result.current.isOnline).toBe(true);
  });

  it('should update offline status when offline event is fired', () => {
    const { result } = renderHook(() => useOnlineStatus());
    
    // Get the offline event handler
    const offlineHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'offline'
    )?.[1];
    
    expect(offlineHandler).toBeDefined();
    
    act(() => {
      offlineHandler();
    });
    
    expect(result.current.isOnline).toBe(false);
  });

  it('should track wasOffline flag correctly', () => {
    navigator.onLine = false;
    const { result } = renderHook(() => useOnlineStatus());
    
    // Initially offline
    expect(result.current.isOnline).toBe(false);
    expect(result.current.wasOffline).toBe(false);
    
    // Get the online event handler
    const onlineHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'online'
    )?.[1];
    
    // Simulate coming back online
    navigator.onLine = false; // Still offline according to navigator
    act(() => {
      onlineHandler();
    });
    
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(true);
  });

  it('should reset offline flag when resetOfflineFlag is called', () => {
    const { result } = renderHook(() => useOnlineStatus());
    
    // Simulate going offline then online
    const offlineHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'offline'
    )?.[1];
    const onlineHandler = mockAddEventListener.mock.calls.find(
      call => call[0] === 'online'
    )?.[1];
    
    act(() => {
      offlineHandler();
    });
    
    navigator.onLine = false;
    act(() => {
      onlineHandler();
    });
    
    expect(result.current.wasOffline).toBe(true);
    
    // Reset the flag
    act(() => {
      result.current.resetOfflineFlag();
    });
    
    expect(result.current.wasOffline).toBe(false);
  });
});