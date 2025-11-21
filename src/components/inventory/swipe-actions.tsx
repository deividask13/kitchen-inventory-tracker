'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Check, Trash2, Edit3, ShoppingCart, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  backgroundColor: string;
  action: () => void | Promise<void>;
}

interface SwipeActionsProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  disabled?: boolean;
  threshold?: number;
  className?: string;
}

interface HapticFeedback {
  vibrate?: (pattern: number | number[]) => boolean;
}

// Haptic feedback utility
const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window !== 'undefined' && 'navigator' in window) {
    const navigator = window.navigator as Navigator & HapticFeedback;
    
    if (navigator.vibrate) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 50
      };
      navigator.vibrate(patterns[type]);
    }
  }
};

export function SwipeActions({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeStart,
  onSwipeEnd,
  disabled = false,
  threshold = 80,
  className
}: SwipeActionsProps) {
  const [isOpen, setIsOpen] = useState<'left' | 'right' | null>(null);
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  
  // Calculate the maximum swipe distance based on actions
  const maxLeftSwipe = leftActions.length * 80;
  const maxRightSwipe = rightActions.length * 80;
  
  // Transform values for revealing actions
  const leftActionsOpacity = useTransform(x, [0, threshold], [0, 1]);
  const rightActionsOpacity = useTransform(x, [-threshold, 0], [1, 0]);

  // Close swipe when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeSwipe();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const closeSwipe = () => {
    x.set(0);
    setIsOpen(null);
    setHasTriggeredHaptic(false);
    onSwipeEnd?.();
  };

  const handlePanStart = () => {
    if (disabled) return;
    onSwipeStart?.();
    setHasTriggeredHaptic(false);
  };

  const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;

    const { offset } = info;
    let newX = offset.x;

    // Constrain the swipe distance
    if (newX > 0) {
      newX = Math.min(newX, maxLeftSwipe);
    } else {
      newX = Math.max(newX, -maxRightSwipe);
    }

    x.set(newX);

    // Trigger haptic feedback when crossing threshold
    if (!hasTriggeredHaptic && Math.abs(newX) > threshold) {
      triggerHapticFeedback('light');
      setHasTriggeredHaptic(true);
    }
  };

  const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;

    const { offset, velocity } = info;
    const swipeDistance = Math.abs(offset.x);
    const swipeVelocity = Math.abs(velocity.x);

    // Determine if swipe should open or close
    const shouldOpen = swipeDistance > threshold || swipeVelocity > 500;

    if (shouldOpen) {
      if (offset.x > 0 && leftActions.length > 0) {
        // Open left actions
        x.set(maxLeftSwipe);
        setIsOpen('left');
        triggerHapticFeedback('medium');
      } else if (offset.x < 0 && rightActions.length > 0) {
        // Open right actions
        x.set(-maxRightSwipe);
        setIsOpen('right');
        triggerHapticFeedback('medium');
      } else {
        closeSwipe();
      }
    } else {
      closeSwipe();
    }
  };

  const executeAction = async (action: SwipeAction) => {
    triggerHapticFeedback('medium');
    closeSwipe();
    
    try {
      await action.action();
    } catch (error) {
      console.error('Failed to execute swipe action:', error);
      triggerHapticFeedback('heavy');
    }
  };

  const renderActions = (actions: SwipeAction[], side: 'left' | 'right') => {
    if (actions.length === 0) return null;

    return (
      <div
        className={cn(
          'absolute top-0 bottom-0 flex items-center',
          side === 'left' ? 'left-0' : 'right-0'
        )}
        style={{ width: actions.length * 80 }}
      >
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            onClick={() => executeAction(action)}
            className={cn(
              'flex flex-col items-center justify-center w-20 h-full text-white font-medium text-xs',
              'focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50',
              'transition-colors duration-200'
            )}
            style={{ 
              backgroundColor: action.backgroundColor,
              color: action.color 
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen === side ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            aria-label={action.label}
          >
            <div className="mb-1">
              {action.icon}
            </div>
            <span className="leading-tight text-center px-1">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Left actions */}
      {renderActions(leftActions, 'left')}
      
      {/* Right actions */}
      {renderActions(rightActions, 'right')}

      {/* Main content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -maxRightSwipe, right: maxLeftSwipe }}
        dragElastic={0.1}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        style={{ x }}
        className="relative z-10 bg-white"
        whileTap={{ cursor: 'grabbing' }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Predefined action creators for common use cases
export const createSwipeActions = {
  markAsUsed: (onAction: () => void | Promise<void>): SwipeAction => ({
    id: 'mark-used',
    label: 'Mark Used',
    icon: <Package className="h-4 w-4" />,
    color: '#ffffff',
    backgroundColor: '#10b981',
    action: onAction
  }),

  markAsFinished: (onAction: () => void | Promise<void>): SwipeAction => ({
    id: 'mark-finished',
    label: 'Finished',
    icon: <Check className="h-4 w-4" />,
    color: '#ffffff',
    backgroundColor: '#f59e0b',
    action: onAction
  }),

  addToShoppingList: (onAction: () => void | Promise<void>): SwipeAction => ({
    id: 'add-to-shopping',
    label: 'Add to List',
    icon: <ShoppingCart className="h-4 w-4" />,
    color: '#ffffff',
    backgroundColor: '#3b82f6',
    action: onAction
  }),

  edit: (onAction: () => void | Promise<void>): SwipeAction => ({
    id: 'edit',
    label: 'Edit',
    icon: <Edit3 className="h-4 w-4" />,
    color: '#ffffff',
    backgroundColor: '#6b7280',
    action: onAction
  }),

  delete: (onAction: () => void | Promise<void>): SwipeAction => ({
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-4 w-4" />,
    color: '#ffffff',
    backgroundColor: '#ef4444',
    action: onAction
  })
};