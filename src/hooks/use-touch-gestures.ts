'use client';

import { useRef, useCallback, useState } from 'react';
import { useResponsive } from './use-responsive';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  disabled?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  lastTapTime: number;
  tapCount: number;
  isLongPress: boolean;
  longPressTimer: NodeJS.Timeout | null;
}

export function useTouchGestures<T extends HTMLElement>(
  options: TouchGestureOptions = {}
) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
    disabled = false,
  } = options;

  const { isTouchDevice } = useResponsive();
  const [element, setElement] = useState<T | null>(null);
  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    lastTapTime: 0,
    tapCount: 0,
    isLongPress: false,
    longPressTimer: null,
  });

  const clearLongPressTimer = useCallback(() => {
    if (touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer);
      touchState.current.longPressTimer = null;
    }
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (disabled || !isTouchDevice) return;

    const touch = event.touches[0];
    const now = Date.now();
    
    touchState.current.startX = touch.clientX;
    touchState.current.startY = touch.clientY;
    touchState.current.startTime = now;
    touchState.current.isLongPress = false;

    // Clear any existing long press timer
    clearLongPressTimer();

    // Start long press timer
    if (onLongPress) {
      touchState.current.longPressTimer = setTimeout(() => {
        touchState.current.isLongPress = true;
        onLongPress();
      }, longPressDelay);
    }
  }, [disabled, isTouchDevice, onLongPress, longPressDelay, clearLongPressTimer]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (disabled || !isTouchDevice) return;

    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - touchState.current.startX);
    const deltaY = Math.abs(touch.clientY - touchState.current.startY);

    // If user moves finger significantly, cancel long press
    if (deltaX > 10 || deltaY > 10) {
      clearLongPressTimer();
    }
  }, [disabled, isTouchDevice, clearLongPressTimer]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (disabled || !isTouchDevice) return;

    const touch = event.changedTouches[0];
    const now = Date.now();
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    const deltaTime = now - touchState.current.startTime;

    // Clear long press timer
    clearLongPressTimer();

    // If it was a long press, don't process other gestures
    if (touchState.current.isLongPress) {
      return;
    }

    // Check for swipe gestures
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
      // Determine swipe direction
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
      return;
    }

    // Check for tap gestures (only if no significant movement and quick)
    if (absDeltaX < 10 && absDeltaY < 10 && deltaTime < 300) {
      const timeSinceLastTap = now - touchState.current.lastTapTime;
      
      if (timeSinceLastTap < doubleTapDelay) {
        // Double tap
        touchState.current.tapCount++;
        if (touchState.current.tapCount === 2 && onDoubleTap) {
          onDoubleTap();
          touchState.current.tapCount = 0;
          return;
        }
      } else {
        // Reset tap count
        touchState.current.tapCount = 1;
      }

      touchState.current.lastTapTime = now;

      // Single tap (with delay to check for double tap)
      if (onTap && !onDoubleTap) {
        onTap();
      } else if (onTap && onDoubleTap) {
        setTimeout(() => {
          if (touchState.current.tapCount === 1) {
            onTap();
            touchState.current.tapCount = 0;
          }
        }, doubleTapDelay);
      }
    }
  }, [
    disabled,
    isTouchDevice,
    swipeThreshold,
    doubleTapDelay,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    clearLongPressTimer,
  ]);

  // Callback ref that attaches/detaches event listeners when element changes
  const ref = useCallback((node: T | null) => {
    // Clean up previous element
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      clearLongPressTimer();
    }

    // Set up new element
    if (node && !disabled && isTouchDevice) {
      node.addEventListener('touchstart', handleTouchStart, { passive: true });
      node.addEventListener('touchmove', handleTouchMove, { passive: true });
      node.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    setElement(node);
  }, [
    disabled,
    isTouchDevice,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    clearLongPressTimer,
    element,
  ]);

  return ref;
}