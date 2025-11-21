'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  Check, 
  Trash2, 
  MoreHorizontal,
  Package,
  ShoppingCart,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { InventoryItem } from '@/lib/types';

interface QuickActionsProps {
  item: InventoryItem;
  onQuantityChange: (id: string, change: number) => Promise<void>;
  onMarkAsUsed: (id: string, quantityUsed: number) => Promise<void>;
  onMarkAsFinished: (id: string) => Promise<void>;
  onEdit: (item: InventoryItem) => void;
  onAddToShoppingList: (item: InventoryItem) => void;
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

export function QuickActions({
  item,
  onQuantityChange,
  onMarkAsUsed,
  onMarkAsFinished,
  onEdit,
  onAddToShoppingList,
  className
}: QuickActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Close expanded menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setIsExpanded(false);
    if (isExpanded) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isExpanded]);

  const handleAction = async (actionType: string, action: () => Promise<void>) => {
    setIsLoading(actionType);
    triggerHapticFeedback('light');
    
    try {
      await action();
    } catch (error) {
      console.error(`Failed to execute ${actionType}:`, error);
      triggerHapticFeedback('heavy');
    } finally {
      setIsLoading(null);
      setIsExpanded(false);
    }
  };

  const quickIncrements = [
    { label: '+1', value: 1, variant: 'outline' as const },
    { label: '+5', value: 5, variant: 'outline' as const },
    { label: '-1', value: -1, variant: 'outline' as const },
    { label: '-5', value: -5, variant: 'outline' as const }
  ];

  return (
    <div className={cn('relative', className)}>
      {/* Main action button */}
      <motion.div
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
            triggerHapticFeedback('light');
          }}
          className={cn(
            'h-8 w-8 rounded-full transition-colors',
            isExpanded ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
          )}
          aria-label="Quick actions"
          aria-expanded={isExpanded}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </motion.div>
        </Button>
      </motion.div>

      {/* Expanded actions menu */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quantity adjustments */}
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 mb-2 px-2">
                Quantity ({item.quantity} {item.unit})
              </p>
              <div className="grid grid-cols-2 gap-1">
                {quickIncrements.map((increment) => (
                  <Button
                    key={increment.label}
                    variant={increment.variant}
                    size="sm"
                    onClick={() => handleAction(
                      `quantity-${increment.value}`,
                      () => onQuantityChange(item.id, increment.value)
                    )}
                    disabled={
                      isLoading === `quantity-${increment.value}` ||
                      (increment.value < 0 && item.quantity + increment.value < 0)
                    }
                    loading={isLoading === `quantity-${increment.value}`}
                    className="h-8 text-xs"
                  >
                    {increment.value > 0 ? (
                      <Plus className="h-3 w-3 mr-1" />
                    ) : (
                      <Minus className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(increment.value)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-2" />

            {/* Action buttons */}
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onEdit(item);
                  setIsExpanded(false);
                  triggerHapticFeedback('light');
                }}
                className="w-full justify-start h-8 text-xs"
              >
                <Edit3 className="h-3 w-3 mr-2" />
                Edit Item
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction(
                  'add-to-shopping',
                  async () => {
                    onAddToShoppingList(item);
                  }
                )}
                disabled={isLoading === 'add-to-shopping'}
                loading={isLoading === 'add-to-shopping'}
                className="w-full justify-start h-8 text-xs"
              >
                <ShoppingCart className="h-3 w-3 mr-2" />
                Add to Shopping List
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction(
                  'mark-used',
                  () => onMarkAsUsed(item.id, 1)
                )}
                disabled={isLoading === 'mark-used' || item.quantity <= 0}
                loading={isLoading === 'mark-used'}
                className="w-full justify-start h-8 text-xs"
              >
                <Package className="h-3 w-3 mr-2" />
                Mark as Used
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction(
                  'mark-finished',
                  () => onMarkAsFinished(item.id)
                )}
                disabled={isLoading === 'mark-finished'}
                loading={isLoading === 'mark-finished'}
                className="w-full justify-start h-8 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <Check className="h-3 w-3 mr-2" />
                Mark as Finished
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction(
                  'delete',
                  async () => {
                    if (window.confirm('Are you sure you want to delete this item?')) {
                      // This would typically call a delete function passed as prop
                      console.log('Delete item:', item.id);
                    }
                  }
                )}
                disabled={isLoading === 'delete'}
                loading={isLoading === 'delete'}
                className="w-full justify-start h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete Item
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}