'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface QuantityControlsProps {
  value: number;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  onIncrement?: (amount: number) => Promise<void>;
  onDecrement?: (amount: number) => Promise<void>;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showQuickActions?: boolean;
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

export function QuantityControls({
  value,
  unit,
  min = 0,
  max = Infinity,
  step = 1,
  onChange,
  onIncrement,
  onDecrement,
  disabled = false,
  size = 'md',
  showQuickActions = true,
  className
}: QuantityControlsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const sizeClasses = {
    sm: {
      button: 'h-8 w-8',
      text: 'text-sm',
      quickButton: 'h-6 px-2 text-xs'
    },
    md: {
      button: 'h-10 w-10',
      text: 'text-base',
      quickButton: 'h-8 px-3 text-sm'
    },
    lg: {
      button: 'h-12 w-12',
      text: 'text-lg',
      quickButton: 'h-10 px-4 text-base'
    }
  };

  const classes = sizeClasses[size];

  const handleIncrement = async (amount: number) => {
    const newValue = Math.min(value + amount, max);
    if (newValue === value) return;

    triggerHapticFeedback('light');
    
    if (onIncrement) {
      setIsLoading(`increment-${amount}`);
      try {
        await onIncrement(amount);
      } catch (error) {
        console.error('Failed to increment:', error);
        triggerHapticFeedback('heavy');
      } finally {
        setIsLoading(null);
      }
    } else {
      onChange(newValue);
    }
  };

  const handleDecrement = async (amount: number) => {
    const newValue = Math.max(value - amount, min);
    if (newValue === value) return;

    triggerHapticFeedback('light');
    
    if (onDecrement) {
      setIsLoading(`decrement-${amount}`);
      try {
        await onDecrement(amount);
      } catch (error) {
        console.error('Failed to decrement:', error);
        triggerHapticFeedback('heavy');
      } finally {
        setIsLoading(null);
      }
    } else {
      onChange(newValue);
    }
  };

  const quickActions = [
    { label: '+1', action: () => handleIncrement(1), disabled: value >= max },
    { label: '+5', action: () => handleIncrement(5), disabled: value >= max },
    { label: '-1', action: () => handleDecrement(1), disabled: value <= min },
    { label: '-5', action: () => handleDecrement(5), disabled: value <= min }
  ];

  return (
    <div className={cn('flex flex-col items-center space-y-3', className)}>
      {/* Main quantity controls */}
      <div className="flex items-center space-x-3">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDecrement(step)}
            disabled={disabled || value <= min || isLoading !== null}
            className={cn(classes.button, 'rounded-full')}
            aria-label={`Decrease by ${step}`}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </motion.div>

        <motion.div
          key={value}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-center min-w-[80px]"
        >
          <div className={cn('font-semibold', classes.text)}>
            {value}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {unit}
          </div>
        </motion.div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleIncrement(step)}
            disabled={disabled || value >= max || isLoading !== null}
            className={cn(classes.button, 'rounded-full')}
            aria-label={`Increase by ${step}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {/* Quick action buttons */}
      {showQuickActions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-2"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={action.action}
                disabled={disabled || action.disabled || isLoading !== null}
                loading={isLoading === `increment-${action.label.slice(1)}` || isLoading === `decrement-${action.label.slice(1)}`}
                className={cn(
                  classes.quickButton,
                  'rounded-full border border-gray-200 hover:border-gray-300',
                  action.label.startsWith('+') 
                    ? 'text-green-600 hover:bg-green-50 hover:text-green-700' 
                    : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                )}
                aria-label={`${action.label.startsWith('+') ? 'Increase' : 'Decrease'} by ${action.label.slice(1)}`}
              >
                {action.label}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}