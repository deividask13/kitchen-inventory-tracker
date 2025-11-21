/**
 * Example usage of the useTouchGestures hook
 * 
 * This demonstrates how to use the callback ref pattern
 * that was implemented to fix the event listener attachment issue.
 */

'use client';

import { useTouchGestures } from './use-touch-gestures';

export function TouchGestureExample() {
  // The hook now returns a callback ref instead of a ref object
  const touchRef = useTouchGestures<HTMLDivElement>({
    onSwipeLeft: () => console.log('Swiped left'),
    onSwipeRight: () => console.log('Swiped right'),
    onSwipeUp: () => console.log('Swiped up'),
    onSwipeDown: () => console.log('Swiped down'),
    onTap: () => console.log('Tapped'),
    onDoubleTap: () => console.log('Double tapped'),
    onLongPress: () => console.log('Long pressed'),
    swipeThreshold: 50,
    longPressDelay: 500,
    doubleTapDelay: 300,
  });

  // Use the callback ref directly on the element
  // This ensures event listeners are attached when the element mounts
  return (
    <div
      ref={touchRef}
      className="w-full h-64 bg-blue-100 flex items-center justify-center"
    >
      <p>Try swiping, tapping, or long pressing on this area</p>
    </div>
  );
}

/**
 * BEFORE (broken pattern):
 * 
 * const elementRef = useRef<HTMLDivElement>(null);
 * useTouchGestures(elementRef, options);
 * return <div ref={elementRef}>...</div>
 * 
 * Problem: useEffect runs before ref is attached, so event listeners
 * are never added to the element.
 * 
 * 
 * AFTER (fixed pattern):
 * 
 * const touchRef = useTouchGestures<HTMLDivElement>(options);
 * return <div ref={touchRef}>...</div>
 * 
 * Solution: Callback ref is called when element is attached/detached,
 * allowing proper event listener management.
 */
