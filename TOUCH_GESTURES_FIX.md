# Touch Gestures Hook Fix

## Problem

The `useTouchGestures` hook had a fundamental design issue where event listeners were not being attached to DOM elements properly.

### Root Cause

The hook used a **ref object pattern** with `useEffect`:

```typescript
const elementRef = useRef<T>(null);

useEffect(() => {
  const element = elementRef.current;
  if (!element) return;
  
  element.addEventListener('touchstart', handleTouchStart);
  // ... more listeners
}, [/* dependencies */]);

return elementRef;
```

**The Problem:**
- `useEffect` runs after the component renders
- However, `elementRef.current` is NOT in the dependency array (intentionally, as refs don't trigger re-renders)
- When the ref is first attached to a DOM element, the effect doesn't re-run
- Result: Event listeners are never attached in real usage

### Why Tests Failed

Tests tried to work around this by manually setting the ref:

```typescript
act(() => {
  result.current.current = mockElement;
});
rerender(); // This doesn't trigger the effect!
```

But calling `rerender()` doesn't help because the effect's dependencies haven't changed.

## Solution

Convert from a **ref object** to a **callback ref** pattern:

```typescript
const [element, setElement] = useState<T | null>(null);

const ref = useCallback((node: T | null) => {
  // Clean up previous element
  if (element) {
    element.removeEventListener('touchstart', handleTouchStart);
    // ... cleanup
  }

  // Set up new element
  if (node && !disabled && isTouchDevice) {
    node.addEventListener('touchstart', handleTouchStart);
    // ... setup
  }

  setElement(node);
}, [/* dependencies including element */]);

return ref;
```

### Why This Works

1. **Callback refs are called when elements attach/detach**: React calls the callback ref function whenever the element is mounted or unmounted
2. **Immediate attachment**: Event listeners are attached as soon as the element exists
3. **Proper cleanup**: When the element is detached or dependencies change, cleanup happens automatically
4. **Testable**: Tests can call the callback ref directly: `result.current(mockElement)`

## Changes Made

### Hook (`use-touch-gestures.ts`)
- Replaced `useRef` with `useState` to track the current element
- Replaced `useEffect` with `useCallback` to create a callback ref
- Event listener attachment/cleanup now happens in the callback ref
- Added `element` to the dependency array to handle element changes

### Tests (`use-touch-gestures.test.ts`)
- Changed from `result.current.current = mockElement` to `result.current(mockElement)`
- Removed unnecessary `rerender()` calls
- Updated cleanup test to verify detachment by calling `result.current(null)`

## Usage

### Before (Broken)
```typescript
const elementRef = useRef<HTMLDivElement>(null);
useTouchGestures(elementRef, options);
return <div ref={elementRef}>...</div>;
```

### After (Fixed)
```typescript
const touchRef = useTouchGestures<HTMLDivElement>(options);
return <div ref={touchRef}>...</div>;
```

## Benefits

1. **Correct behavior**: Event listeners are properly attached in all scenarios
2. **Simpler API**: No need to pass a ref object, just use the returned callback ref
3. **Better testability**: Tests can directly control when elements are attached/detached
4. **React best practices**: Follows React's recommended pattern for ref-dependent side effects

## Test Results

All 14 tests passing:
- ✓ Swipe Gestures (5 tests)
- ✓ Tap Gestures (3 tests)
- ✓ Long Press Gesture (3 tests)
- ✓ Disabled State (1 test)
- ✓ Non-Touch Devices (1 test)
- ✓ Cleanup (1 test)

## References

- [React Docs: Callback Refs](https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback)
- [React Docs: useEffect with Refs](https://react.dev/learn/synchronizing-with-effects#some-refs-are-not-reactive)
