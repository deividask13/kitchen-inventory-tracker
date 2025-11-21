'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingListItem } from '@/lib/types';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ShoppingItemProps {
  item: ShoppingListItem;
  onToggleCompleted: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (item: ShoppingListItem) => void;
}

export function ShoppingItem({ item, onToggleCompleted, onDelete, onEdit }: ShoppingItemProps) {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);

  const handleToggle = () => {
    onToggleCompleted(item.id);
  };

  const handleDelete = () => {
    onDelete(item.id);
  };

  const handleEdit = () => {
    onEdit?.(item);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, height: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative overflow-hidden"
    >
      {/* Swipe Actions Background */}
      <div className="absolute inset-y-0 right-0 flex items-center bg-red-500 px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-white hover:bg-red-600"
          aria-label={`Delete ${item.name} (swipe action)`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </div>

      {/* Main Item Content */}
      <motion.div
        className={cn(
          'bg-white border border-gray-200 rounded-lg p-4 cursor-pointer',
          'hover:shadow-md transition-shadow duration-200',
          'min-h-[60px] flex items-center',
          item.isCompleted && 'bg-gray-50 opacity-75'
        )}
        whileTap={{ scale: 0.98 }}
        animate={{ x: isSwipeOpen ? -80 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onTouchStart={(e) => {
          const startX = e.touches[0].clientX;
          let currentX = startX;

          const handleTouchMove = (e: TouchEvent) => {
            currentX = e.touches[0].clientX;
            const deltaX = startX - currentX;
            
            if (deltaX > 50) {
              setIsSwipeOpen(true);
            } else if (deltaX < -50) {
              setIsSwipeOpen(false);
            }
          };

          const handleTouchEnd = () => {
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
          };

          document.addEventListener('touchmove', handleTouchMove);
          document.addEventListener('touchend', handleTouchEnd);
        }}
        onClick={() => setIsSwipeOpen(false)}
      >
        <div className="flex items-center space-x-3 flex-1">
          {/* Checkbox */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center',
              'transition-colors duration-200 min-w-[44px] min-h-[44px] sm:min-w-[24px] sm:min-h-[24px]',
              item.isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-400'
            )}
            whileTap={{ scale: 0.9 }}
            aria-label={item.isCompleted ? `Mark ${item.name} as incomplete` : `Mark ${item.name} as complete`}
          >
            {item.isCompleted && (
              <motion.svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </motion.svg>
            )}
          </motion.button>

          {/* Item Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={cn(
                'font-medium text-gray-900 truncate',
                item.isCompleted && 'line-through text-gray-500'
              )}>
                {item.name}
              </h3>
              <span className={cn(
                'text-sm text-gray-500 ml-2 flex-shrink-0',
                item.isCompleted && 'line-through'
              )}>
                {item.quantity} {item.unit}
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <span className={cn(
                'text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600',
                item.isCompleted && 'line-through'
              )}>
                {item.category}
              </span>
              
              {item.fromInventory && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  From inventory
                </span>
              )}
            </div>

            {item.notes && (
              <p className={cn(
                'text-sm text-gray-600 mt-2',
                item.isCompleted && 'line-through'
              )}>
                {item.notes}
              </p>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center space-x-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                aria-label={`Edit ${item.name}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              aria-label={`Delete ${item.name} (desktop)`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}