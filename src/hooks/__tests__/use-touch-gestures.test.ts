import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useTouchGestures } from '../use-touch-gestures';
import { useResponsive } from '../use-responsive';

// Mock dependencies
vi.mock('../use-responsive');

const mockUseResponsive = useResponsive as any;

// Helper to create touch events
const createTouchEvent = (type: string, touches: Array<{ clientX: number; clientY: number }>) => {
  const event = new Event(type) as any;
  event.touches = touches;
  event.changedTouches = touches;
  return event;
};

describe('useTouchGestures', () => {
  let mockElement: HTMLDivElement;

  beforeEach(() => {
    mockElement = document.createElement('div');
    document.body.appendChild(mockElement);

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

    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
    vi.useRealTimers();
  });

  describe('Swipe Gestures', () => {
    it('should detect swipe right', () => {
      const onSwipeRight = vi.fn();
      const { result } = renderHook(() =>
        useTouchGestures({ onSwipeRight, swipeThreshold: 50 })
      );

      // Attach ref to mock element using callback ref
      act(() => {
        result.current(mockElement);
      });

      // Simulate swipe right
      act(() => {
        const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 200 }]);
        mockElement.dispatchEvent(touchStart);
      });

      act(() => {
        const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchEnd);
      });

      expect(onSwipeRight).toHaveBeenCalled();
    });

    it('should detect swipe left', () => {
      const onSwipeLeft = vi.fn();
      const { result } = renderHook(() =>
        useTouchGestures({ onSwipeLeft, swipeThreshold: 50 })
      );

      act(() => {
        result.current(mockElement);
      });

      act(() => {
        const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchStart);
      });

      act(() => {
        const touchEnd = createTouchEvent('touchend', [{ clientX: 100, clientY: 200 }]);
        mockElement.dispatchEvent(touchEnd);
      });

      expect(onSwipeLeft).toHaveBeenCalled();
    });

    it('should detect swipe up', () => {
      const onSwipeUp = vi.fn();
      const { result } = renderHook(() =>
        useTouchGestures({ onSwipeUp, swipeThreshold: 50 })
      );

      act(() => {
        result.current(mockElement);
      });

      act(() => {
        const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchStart);
      });

      act(() => {
        const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 100 }]);
        mockElement.dispatchEvent(touchEnd);
      });

      expect(onSwipeUp).toHaveBeenCalled();
    });

    it('should detect swipe down', () => {
      const onSwipeDown = vi.fn();
      const { result } = renderHook(() =>
        useTouchGestures({ onSwipeDown, swipeThreshold: 50 })
      );

      act(() => {
        result.current(mockElement);
      });

      act(() => {
        const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 100 }]);
        mockElement.dispatchEvent(touchStart);
      });

      act(() => {
        const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchEnd);
      });

      expect(onSwipeDown).toHaveBeenCalled();
    });

    it('should not trigger swipe if below threshold', () => {
      const onSwipeRight = vi.fn();
      const { result } = renderHook(() =>
        useTouchGestures({ onSwipeRight, swipeThreshold: 100 })
      );

      act(() => {
        result.current(mockElement);
      });

      act(() => {
        const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 200 }]);
        mockElement.dispatchEvent(touchStart);
      });

      act(() => {
        const touchEnd = createTouchEvent('touchend', [{ clientX: 150, clientY: 200 }]);
        mockElement.dispatchEvent(touchEnd);
      });

      expect(onSwipeRight).not.toHaveBeenCalled();
    });
  });

  describe('Tap Gestures', () => {
    it('should detect single tap', () => {
      const onTap = vi.fn();
      const { result } = renderHook(() => useTouchGestures({ onTap }));

      act(() => {
        result.current(mockElement);
      });

      act(() => {
        const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchStart);
      });

      act(() => {
        const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchEnd);
      });

      // Wait for double tap delay
      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(onTap).toHaveBeenCalled();
    });

    it('should detect double tap', () => {
      const onDoubleTap = vi.fn();
      const { result } = renderHook(() =>
        useTouchGestures({ onDoubleTap, doubleTapDelay: 300 })
      );

      act(() => {
        result.current(mockElement);
      });

      // First tap
      act(() => {
        const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchStart);
      });

      act(() => {
        const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchEnd);
      });

      // Second tap within delay
      act(() => {
        vi.advanceTimersByTime(100);
      });

      act(() => {
        const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchStart);
      });

      act(() => {
        const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchEnd);
      });

      expect(onDoubleTap).toHaveBeenCalled();
    });

    it('should not trigger single tap when double tap is detected', () => {
      const onTap = vi.fn();
      const onDoubleTap = vi.fn();
      const { result } = renderHook(() =>
        useTouchGestures({ onTap, onDoubleTap, doubleTapDelay: 300 })
      );

      act(() => {
        result.current(mockElement);
      });

      // First tap
      act(() => {
        const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchStart);
      });

      act(() => {
        const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchEnd);
      });

      // Second tap within delay
      act(() => {
        vi.advanceTimersByTime(100);
      });

      act(() => {
        const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchStart);
      });

      act(() => {
        const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchEnd);
      });

      // Wait for single tap delay
      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(onDoubleTap).toHaveBeenCalled();
      expect(onTap).not.toHaveBeenCalled();
    });
  });

  describe('Long Press Gesture', () => {
    it('should detect long press', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() =>
        useTouchGestures({ onLongPress, longPressDelay: 500 })
      );

      act(() => {
        result.current(mockElement);
      });

      act(() => {
        const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchStart);
      });

      act(() => {
        vi.advanceTimersByTime(600);
      });

      expect(onLongPress).toHaveBeenCalled();
    });

    it('should cancel long press on movement', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() =>
        useTouchGestures({ onLongPress, longPressDelay: 500 })
      );

      act(() => {
        result.current(mockElement);
      });

      act(() => {
        const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchStart);
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      act(() => {
        const touchMove = createTouchEvent('touchmove', [{ clientX: 220, clientY: 200 }]);
        mockElement.dispatchEvent(touchMove);
      });

      act(() => {
        vi.advanceTimersByTime(400);
      });

      expect(onLongPress).not.toHaveBeenCalled();
    });

    it('should not trigger other gestures after long press', () => {
      const onLongPress = vi.fn();
      const onTap = vi.fn();
      const { result } = renderHook(() =>
        useTouchGestures({ onLongPress, onTap, longPressDelay: 500 })
      );

      act(() => {
        result.current(mockElement);
      });

      act(() => {
        const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchStart);
      });

      act(() => {
        vi.advanceTimersByTime(600);
      });

      act(() => {
        const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchEnd);
      });

      expect(onLongPress).toHaveBeenCalled();
      expect(onTap).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should not trigger gestures when disabled', () => {
      const onSwipeRight = vi.fn();
      const onTap = vi.fn();
      const { result } = renderHook(() =>
        useTouchGestures({ onSwipeRight, onTap, disabled: true })
      );

      act(() => {
        result.current(mockElement);
      });

      act(() => {
        const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 200 }]);
        mockElement.dispatchEvent(touchStart);
      });

      act(() => {
        const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchEnd);
      });

      expect(onSwipeRight).not.toHaveBeenCalled();
      expect(onTap).not.toHaveBeenCalled();
    });
  });

  describe('Non-Touch Devices', () => {
    it('should not trigger gestures on non-touch devices', () => {
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

      const onSwipeRight = vi.fn();
      const { result } = renderHook(() => useTouchGestures({ onSwipeRight }));

      act(() => {
        result.current(mockElement);
      });

      act(() => {
        const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 200 }]);
        mockElement.dispatchEvent(touchStart);
      });

      act(() => {
        const touchEnd = createTouchEvent('touchend', [{ clientX: 200, clientY: 200 }]);
        mockElement.dispatchEvent(touchEnd);
      });

      expect(onSwipeRight).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should clean up event listeners when element is detached', () => {
      const removeEventListenerSpy = vi.spyOn(mockElement, 'removeEventListener');
      const { result } = renderHook(() => useTouchGestures({}));

      // Attach element
      act(() => {
        result.current(mockElement);
      });

      // Detach element (pass null to callback ref)
      act(() => {
        result.current(null);
      });

      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
    });
  });
});
