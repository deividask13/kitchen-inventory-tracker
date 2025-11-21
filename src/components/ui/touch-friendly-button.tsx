'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Button, ButtonProps } from './button';
import { useTouchGestures, useHapticFeedback, usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils';

export interface TouchFriendlyButtonProps extends ButtonProps {
  hapticFeedback?: 'light' | 'medium' | 'heavy';
  longPressAction?: () => void;
  longPressDelay?: number;
  swipeActions?: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
  };
}

const TouchFriendlyButton = forwardRef<HTMLButtonElement, TouchFriendlyButtonProps>(
  ({ 
    className,
    hapticFeedback = 'light',
    longPressAction,
    longPressDelay = 500,
    swipeActions,
    onClick,
    children,
    ...props 
  }, ref) => {
    const { triggerHaptic } = useHapticFeedback();
    const prefersReducedMotion = usePrefersReducedMotion();

    // Touch gesture handling
    const gestureRef = useTouchGestures<HTMLButtonElement>({
      onLongPress: longPressAction,
      longPressDelay,
      onSwipeLeft: swipeActions?.onSwipeLeft,
      onSwipeRight: swipeActions?.onSwipeRight,
      onSwipeUp: swipeActions?.onSwipeUp,
      onSwipeDown: swipeActions?.onSwipeDown,
    });

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      triggerHaptic(hapticFeedback);
      onClick?.(event);
    };

    // Combine refs - gestureRef is a callback ref
    const combinedRef = (node: HTMLButtonElement | null) => {
      gestureRef(node);
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && node) {
        ref.current = node;
      }
    };

    return (
      <motion.div
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        transition={prefersReducedMotion ? {} : { duration: 0.1 }}
        className="inline-block"
      >
        <Button
          ref={combinedRef}
          className={cn(
            'touch-target', // Ensure minimum touch target size
            'tap-highlight-none', // Remove default tap highlight
            'select-none', // Prevent text selection
            // Enhanced touch feedback
            'active:scale-95 active:brightness-95',
            'transition-all duration-150 ease-out',
            className
          )}
          onClick={handleClick}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);

TouchFriendlyButton.displayName = 'TouchFriendlyButton';

export { TouchFriendlyButton };