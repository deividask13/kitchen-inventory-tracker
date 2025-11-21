'use client';

import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { InventoryCard } from './inventory-card';
import { usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils';
import type { InventoryItem } from '@/lib/types';

interface VirtualizedInventoryGridProps {
  items: InventoryItem[];
  onMarkAsUsed: (id: string, quantity: number) => void;
  onMarkAsFinished: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onEditItem: (item: InventoryItem) => void;
  viewMode?: 'grid' | 'list';
  className?: string;
}

const GRID_COLUMNS = 3;
const GRID_ITEM_HEIGHT = 280;
const LIST_ITEM_HEIGHT = 200;
const OVERSCAN = 5;

export function VirtualizedInventoryGrid({
  items,
  onMarkAsUsed,
  onMarkAsFinished,
  onUpdateQuantity,
  onEditItem,
  viewMode = 'grid',
  className
}: VirtualizedInventoryGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Calculate rows for grid view
  const rows = useMemo(() => {
    if (viewMode === 'list') {
      return items.map(item => [item]);
    }
    
    const result: InventoryItem[][] = [];
    for (let i = 0; i < items.length; i += GRID_COLUMNS) {
      result.push(items.slice(i, i + GRID_COLUMNS));
    }
    return result;
  }, [items, viewMode]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => viewMode === 'grid' ? GRID_ITEM_HEIGHT : LIST_ITEM_HEIGHT,
    overscan: OVERSCAN,
  });

  if (items.length === 0) {
    return (
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { duration: 0.3 }}
        className="text-center py-12"
      >
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No items found
        </h3>
        <p className="text-gray-600">
          Start by adding your first inventory item.
        </p>
      </motion.div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn('h-[600px] overflow-auto', className)}
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowItems = rows[virtualRow.index];
          
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-1">
                  {rowItems.map((item) => (
                    <InventoryCard
                      key={item.id}
                      item={item}
                      onMarkAsUsed={onMarkAsUsed}
                      onMarkAsFinished={onMarkAsFinished}
                      onUpdateQuantity={onUpdateQuantity}
                      onEdit={onEditItem}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 px-1">
                  {rowItems.map((item) => (
                    <InventoryCard
                      key={item.id}
                      item={item}
                      onMarkAsUsed={onMarkAsUsed}
                      onMarkAsFinished={onMarkAsFinished}
                      onUpdateQuantity={onUpdateQuantity}
                      onEdit={onEditItem}
                      className="max-w-none"
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
