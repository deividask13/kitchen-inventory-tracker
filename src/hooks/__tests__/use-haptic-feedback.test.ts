import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useHapticFeedback } from '../use-haptic-feedback';

// Mock navigator.vibrate
const mockVibrate = vi.fn();

Object.defineProperty(window, 'navigator', {
  value: {
    vibrate: mockVibrate,
  },
  writable: true,
});

describe('useHapticFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns isSupported as true when vibrate API is available', () => {
    const { result } = renderHook(() => useHapticFeedback());
    
    expect(result.current.isSupported).toBe(true);
  });

  it('returns isSupported as false when vibrate API is not available', () => {
    const originalNavigator = window.navigator;
    
    // Mock navigator without vibrate
    Object.defineProperty(window, 'navigator', {
      value: {},
      writable: true,
      configurable: true,
    });
    
    const { result } = renderHook(() => useHapticFeedback());
    
    expect(result.current.isSupported).toBe(false);
    
    // Restore navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it('triggers light haptic feedback by default', () => {
    const { result } = renderHook(() => useHapticFeedback());
    
    act(() => {
      result.current.triggerHaptic();
    });
    
    expect(mockVibrate).toHaveBeenCalledWith(10);
  });

  it('triggers different haptic patterns for different types', () => {
    const { result } = renderHook(() => useHapticFeedback());
    
    // Clear any previous calls
    mockVibrate.mockClear();
    
    act(() => {
      result.current.triggerHaptic('medium');
    });
    expect(mockVibrate).toHaveBeenLastCalledWith(20);
    
    // Advance time to avoid throttling
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    act(() => {
      result.current.triggerHaptic('heavy');
    });
    expect(mockVibrate).toHaveBeenLastCalledWith(50);
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    act(() => {
      result.current.triggerHaptic('success');
    });
    expect(mockVibrate).toHaveBeenLastCalledWith([10, 50, 10]);
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    act(() => {
      result.current.triggerHaptic('warning');
    });
    expect(mockVibrate).toHaveBeenLastCalledWith([20, 100, 20]);
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    act(() => {
      result.current.triggerHaptic('error');
    });
    expect(mockVibrate).toHaveBeenLastCalledWith([50, 100, 50, 100, 50]);
  });

  it('does not trigger haptic when not supported', () => {
    const originalNavigator = window.navigator;
    
    // Mock navigator without vibrate
    Object.defineProperty(window, 'navigator', {
      value: {},
      writable: true,
      configurable: true,
    });
    
    const { result } = renderHook(() => useHapticFeedback());
    
    act(() => {
      result.current.triggerHaptic();
    });
    
    expect(mockVibrate).not.toHaveBeenCalled();
    
    // Restore navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it('throttles haptic feedback calls', () => {
    const { result } = renderHook(() => useHapticFeedback());
    
    act(() => {
      result.current.triggerHaptic();
      result.current.triggerHaptic();
      result.current.triggerHaptic();
    });
    
    // Should only be called once due to throttling
    expect(mockVibrate).toHaveBeenCalledTimes(1);
  });

  it('allows haptic feedback after throttle interval', () => {
    const { result } = renderHook(() => useHapticFeedback());
    
    act(() => {
      result.current.triggerHaptic();
    });
    
    expect(mockVibrate).toHaveBeenCalledTimes(1);
    
    // Advance time past throttle interval
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    act(() => {
      result.current.triggerHaptic();
    });
    
    expect(mockVibrate).toHaveBeenCalledTimes(2);
  });

  it('handles vibrate API errors gracefully', () => {
    mockVibrate.mockImplementation(() => {
      throw new Error('Vibrate failed');
    });
    
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const { result } = renderHook(() => useHapticFeedback());
    
    act(() => {
      result.current.triggerHaptic();
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('Haptic feedback failed:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
});