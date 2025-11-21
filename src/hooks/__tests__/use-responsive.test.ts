import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { useResponsive, useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, useIsTouchDevice, usePrefersReducedMotion } from '../use-responsive';

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => ({
  matches,
  media: '',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

describe('useResponsive', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    // Reset window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  it('should return correct initial values', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.windowSize).toEqual({ width: 1024, height: 768 });
    expect(result.current.currentBreakpoint).toBe('lg');
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTouchDevice).toBe(false);
  });

  it('should detect mobile breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.currentBreakpoint).toBe('xs');
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTouchDevice).toBe(true);
  });

  it('should detect tablet breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.currentBreakpoint).toBe('md');
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTouchDevice).toBe(true);
  });

  it('should detect desktop breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1280,
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.currentBreakpoint).toBe('xl');
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isTouchDevice).toBe(false);
  });

  it('should handle window resize', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.currentBreakpoint).toBe('lg');

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.currentBreakpoint).toBe('xs');
    expect(result.current.isMobile).toBe(true);
  });

  it('should provide breakpoint utility functions', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isBreakpoint('lg')).toBe(true);
    expect(result.current.isBreakpoint('xs')).toBe(false);
    expect(result.current.isBreakpointUp('md')).toBe(true);
    expect(result.current.isBreakpointUp('xl')).toBe(false);
    expect(result.current.isBreakpointDown('xl')).toBe(true);
    expect(result.current.isBreakpointDown('sm')).toBe(false);
  });

  it('should provide breakpoints configuration', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current.breakpoints).toEqual({
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    });
  });
});

describe('useMediaQuery', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn();
  });

  it('should return true when media query matches', () => {
    (window.matchMedia as any).mockReturnValue(mockMatchMedia(true));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 768px)');
  });

  it('should return false when media query does not match', () => {
    (window.matchMedia as any).mockReturnValue(mockMatchMedia(false));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);
  });

  it('should handle media query changes', () => {
    const mockMedia = mockMatchMedia(false);
    (window.matchMedia as any).mockReturnValue(mockMedia);

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);

    // Simulate media query change
    act(() => {
      mockMedia.matches = true;
      mockMedia.addEventListener.mock.calls[0][1]({ matches: true });
    });

    expect(result.current).toBe(true);
  });
});

describe('Predefined media query hooks', () => {
  beforeEach(() => {
    window.matchMedia = vi.fn();
  });

  it('useIsMobile should detect mobile devices', () => {
    (window.matchMedia as any).mockReturnValue(mockMatchMedia(true));

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
  });

  it('useIsTablet should detect tablet devices', () => {
    (window.matchMedia as any).mockReturnValue(mockMatchMedia(true));

    const { result } = renderHook(() => useIsTablet());

    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 768px) and (max-width: 1023px)');
  });

  it('useIsDesktop should detect desktop devices', () => {
    (window.matchMedia as any).mockReturnValue(mockMatchMedia(true));

    const { result } = renderHook(() => useIsDesktop());

    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1024px)');
  });

  it('useIsTouchDevice should detect touch devices', () => {
    (window.matchMedia as any).mockReturnValue(mockMatchMedia(true));

    const { result } = renderHook(() => useIsTouchDevice());

    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(hover: none) and (pointer: coarse)');
  });

  it('usePrefersReducedMotion should detect reduced motion preference', () => {
    (window.matchMedia as any).mockReturnValue(mockMatchMedia(true));

    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });
});