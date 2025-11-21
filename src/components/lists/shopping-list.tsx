'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingListItem } from '@/lib/types';
import { ShoppingItem } from './shopping-item';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ShoppingListProps {
  items: ShoppingListItem[];
  onToggleCompleted: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onEditItem?: (item: ShoppingListItem) => void;
  onClearCompleted: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ShoppingList({
  items,
  onToggleCompleted,
  onDeleteItem,
  onEditItem,
  onClearCompleted,
  isLoading = false,
  className
}: ShoppingListProps) {
  const [groupBy, setGroupBy] = useState<'none' | 'category' | 'status'>('category');
  const [showCompleted, setShowCompleted] = useState(true);

  // Group and filter items
  const { groupedItems, stats } = useMemo(() => {
    let filteredItems = items;
    
    if (!showCompleted) {
      filteredItems = items.filter(item => !item.isCompleted);
    }

    const completed = items.filter(item => item.isCompleted).length;
    const total = items.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (groupBy === 'none') {
      return {
        groupedItems: { 'All Items': filteredItems },
        stats: { completed, total, percentage }
      };
    }

    if (groupBy === 'status') {
      const pending = filteredItems.filter(item => !item.isCompleted);
      const completedItems = filteredItems.filter(item => item.isCompleted);
      
      const groups: Record<string, ShoppingListItem[]> = {};
      if (pending.length > 0) groups['Pending'] = pending;
      if (completedItems.length > 0) groups['Completed'] = completedItems;
      
      return {
        groupedItems: groups,
        stats: { completed, total, percentage }
      };
    }

    // Group by category
    const grouped = filteredItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ShoppingListItem[]>);

    return {
      groupedItems: grouped,
      stats: { completed, total, percentage }
    };
  }, [items, groupBy, showCompleted]);

  const hasCompletedItems = items.some(item => item.isCompleted);

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Loading skeleton */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-16" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300',
          className
        )}
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No items in your shopping list</h3>
        <p className="text-gray-600">Add items to get started with your shopping.</p>
      </motion.div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Bar and Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-4 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Shopping Progress
          </h2>
          <span className="text-sm text-gray-600">
            {stats.completed} of {stats.total} items
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <motion.div
            className="bg-green-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${stats.percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{stats.percentage}% complete</span>
          {hasCompletedItems && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearCompleted}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Clear Completed
            </Button>
          )}
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Group by:</label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="category">Category</option>
            <option value="status">Status</option>
            <option value="none">None</option>
          </select>
        </div>
        
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">Show completed items</span>
        </label>
      </div>

      {/* Shopping List Items */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {Object.entries(groupedItems).map(([groupName, groupItems]) => (
            <motion.div
              key={groupName}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {Object.keys(groupedItems).length > 1 && (
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  {groupName} ({groupItems.length})
                </h3>
              )}
              
              <motion.div
                layout
                className="space-y-2"
              >
                <AnimatePresence mode="popLayout">
                  {groupItems.map((item) => (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      onToggleCompleted={onToggleCompleted}
                      onDelete={onDeleteItem}
                      onEdit={onEditItem}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}