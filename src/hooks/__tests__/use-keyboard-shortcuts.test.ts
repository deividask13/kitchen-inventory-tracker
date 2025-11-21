import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { useRouter } from 'next/navigation';
import { useKeyboardShortcuts, useKeyboardShortcutsHelp } from '../use-keyboard-shortcuts';
import { useResponsive } from '../use-responsive';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('../use-responsive');

const mockRouter = {
  push: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
};

const mockUseResponsive = useResponsive as any;

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    (useRouter as any).mockReturnValue(mockRouter);
    mockUseResponsive.mockReturnValue({
      windowSize: { width: 1280, height: 800 },
      currentBreakpoint: 'xl',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: false,
      isBreakpoint: vi.fn(),
      isBreakpointUp: vi.fn(),
      isBreakpointDown: vi.fn(),
      breakpoints: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
    });
    vi.clearAllMocks();
  });

  it('should be enabled on desktop', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());

    expect(result.current.isEnabled).toBe(true);
    expect(result.current.shortcuts).toHaveLength(8); // Default shortcuts
  });

  it('should be disabled on mobile', () => {
    mockUseResponsive.mockReturnValue({
      windowSize: { width: 375, height: 667 },
      currentBreakpoint: 'xs',
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isTouchDevice: true,
      isBreakpoint: vi.fn(),
      isBreakpointUp: vi.fn(),
      isBreakpointDown: vi.fn(),
      breakpoints: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
    });

    const { result } = renderHook(() => useKeyboardShortcuts());

    expect(result.current.isEnabled).toBe(false);
  });

  it('should handle navigation shortcuts', () => {
    renderHook(() => useKeyboardShortcuts());

    // Simulate Alt+1 (Dashboard)
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: '1',
        altKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle search shortcuts', () => {
    // Create a mock search input
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = 'Search items...';
    document.body.appendChild(searchInput);

    renderHook(() => useKeyboardShortcuts());

    // Simulate Ctrl+/ (Focus search)
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: '/',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(document.activeElement).toBe(searchInput);

    document.body.removeChild(searchInput);
  });

  it('should handle escape key', () => {
    // Create a mock modal
    const modal = document.createElement('div');
    modal.setAttribute('role', 'dialog');
    const closeButton = document.createElement('button');
    closeButton.setAttribute('data-close', 'true');
    closeButton.onclick = vi.fn();
    modal.appendChild(closeButton);
    document.body.appendChild(modal);

    renderHook(() => useKeyboardShortcuts());

    // Simulate Escape key
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(closeButton.onclick).toHaveBeenCalled();

    document.body.removeChild(modal);
  });

  it('should accept custom shortcuts', () => {
    const customAction = vi.fn();
    const customShortcuts = [
      {
        key: 't',
        ctrlKey: true,
        action: customAction,
        description: 'Test shortcut',
      },
    ];

    const { result } = renderHook(() => useKeyboardShortcuts(customShortcuts));

    expect(result.current.shortcuts).toHaveLength(9); // 8 default + 1 custom

    // Simulate Ctrl+T
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 't',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(customAction).toHaveBeenCalled();
  });

  it('should not trigger shortcuts in input fields', () => {
    const customAction = vi.fn();
    const customShortcuts = [
      {
        key: 't',
        ctrlKey: true,
        action: customAction,
        description: 'Test shortcut',
      },
    ];

    // Create an input field and focus it
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    renderHook(() => useKeyboardShortcuts(customShortcuts));

    // Simulate Ctrl+T while input is focused
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 't',
        ctrlKey: true,
        bubbles: true,
      });
      Object.defineProperty(event, 'target', {
        value: input,
        enumerable: true,
      });
      document.dispatchEvent(event);
    });

    expect(customAction).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should allow escape key in input fields', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const blurSpy = vi.spyOn(input, 'blur');

    renderHook(() => useKeyboardShortcuts());

    // Simulate Escape key while input is focused
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      });
      Object.defineProperty(event, 'target', {
        value: input,
        enumerable: true,
      });
      document.dispatchEvent(event);
    });

    expect(blurSpy).toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should handle disabled shortcuts', () => {
    const customAction = vi.fn();
    const customShortcuts = [
      {
        key: 't',
        ctrlKey: true,
        action: customAction,
        description: 'Test shortcut',
        disabled: true,
      },
    ];

    renderHook(() => useKeyboardShortcuts(customShortcuts));

    // Simulate Ctrl+T
    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 't',
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(customAction).not.toHaveBeenCalled();
  });
});

describe('useKeyboardShortcutsHelp', () => {
  beforeEach(() => {
    (useRouter as any).mockReturnValue(mockRouter);
    mockUseResponsive.mockReturnValue({
      windowSize: { width: 1280, height: 800 },
      currentBreakpoint: 'xl',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: false,
      isBreakpoint: vi.fn(),
      isBreakpointUp: vi.fn(),
      isBreakpointDown: vi.fn(),
      breakpoints: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
    });
  });

  it('should format shortcuts correctly', () => {
    const { result } = renderHook(() => useKeyboardShortcutsHelp());

    expect(result.current.isEnabled).toBe(true);
    expect(result.current.shortcuts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          keys: 'Alt + 1',
          description: 'Go to Dashboard',
        }),
        expect.objectContaining({
          keys: 'Ctrl + /',
          description: 'Focus search',
        }),
        expect.objectContaining({
          keys: 'Ctrl + N',
          description: 'Add new item',
        }),
      ])
    );
  });

  it.skip('should handle complex key combinations', () => {
    const customShortcuts = [
      {
        key: 's',
        ctrlKey: true,
        shiftKey: true,
        altKey: true,
        action: vi.fn(),
        description: 'Complex shortcut',
      },
    ];

    renderHook(() => useKeyboardShortcuts(customShortcuts));
    const { result: helpResult } = renderHook(() => useKeyboardShortcutsHelp(customShortcuts));

    const complexShortcut = helpResult.current.shortcuts.find(
      s => s.description === 'Complex shortcut'
    );

    expect(complexShortcut?.keys).toBe('Ctrl + Alt + Shift + S');
  });

  it('should be disabled on mobile', () => {
    mockUseResponsive.mockReturnValue({
      windowSize: { width: 375, height: 667 },
      currentBreakpoint: 'xs',
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isTouchDevice: true,
      isBreakpoint: vi.fn(),
      isBreakpointUp: vi.fn(),
      isBreakpointDown: vi.fn(),
      breakpoints: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 },
    });

    const { result } = renderHook(() => useKeyboardShortcutsHelp());

    expect(result.current.isEnabled).toBe(false);
  });
});