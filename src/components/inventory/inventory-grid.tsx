'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  Package
} from 'lucide-react';
import { Button, StaggeredGrid, StaggeredList, LoadingSkeleton } from '@/components/ui';
import { InventoryCard } from './inventory-card';
import { AdvancedFilters } from '@/components/categories';
import { usePrefersReducedMotion } from '@/hooks';
import { cn } from '@/lib/utils';
import type { InventoryItem, InventoryFilters, Category } from '@/lib/types';

interface InventoryGridProps {
  items: InventoryItem[];
  filters: InventoryFilters;
  onFiltersChange: (filters: Partial<InventoryFilters>) => void;
  onMarkAsUsed: (id: string, quantity: number) => void;
  onMarkAsFinished: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onEditItem: (item: InventoryItem) => void;
  categories: Category[];
  isLoading?: boolean;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'quantity' | 'expirationDate' | 'category' | 'location' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

export function InventoryGrid({
  items,
  filters,
  onFiltersChange,
  onMarkAsUsed,
  onMarkAsFinished,
  onUpdateQuantity,
  onEditItem,
  categories,
  isLoading = false,
  className
}: InventoryGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const prefersReducedMotion = usePrefersReducedMotion();

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort and filter items
  const sortedAndFilteredItems = useMemo(() => {
    let result = [...items];

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle date fields
      if (sortField === 'expirationDate' || sortField === 'updatedAt') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, sortField, sortDirection]);

  // Count active filters
  const activeFilterCount = [
    filters.location,
    filters.category,
    filters.status && filters.status !== 'all' ? filters.status : null,
    filters.search
  ].filter(Boolean).length;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-4">
          <LoadingSkeleton lines={1} className="flex-1" />
          <LoadingSkeleton lines={1} className="w-12" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} lines={4} avatar className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Advanced Filters */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        categories={categories}
      />

      {/* View Controls */}
      <div className="flex items-center justify-between">
        {/* View Mode Toggle */}
        <div className="flex border border-gray-300 rounded-md overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="rounded-none border-0"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="rounded-none border-0 border-l border-gray-300"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-600">
          {sortedAndFilteredItems.length} item{sortedAndFilteredItems.length !== 1 ? 's' : ''}
          {activeFilterCount > 0 && ' (filtered)'}
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Sort by:</span>
        {(['name', 'quantity', 'expirationDate', 'category', 'location'] as SortField[]).map((field) => (
          <Button
            key={field}
            variant="ghost"
            size="sm"
            onClick={() => handleSort(field)}
            className={cn(
              'flex items-center gap-1 text-xs',
              sortField === field && 'text-blue-600 bg-blue-50'
            )}
          >
            {field === 'expirationDate' ? 'Expiration' : field.charAt(0).toUpperCase() + field.slice(1)}
            {sortField === field && (
              sortDirection === 'asc' ? 
                <SortAsc className="h-3 w-3" /> : 
                <SortDesc className="h-3 w-3" />
            )}
          </Button>
        ))}
      </div>



      {/* Items Grid/List */}
      <AnimatePresence mode="wait">
        {sortedAndFilteredItems.length === 0 ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
            transition={prefersReducedMotion ? {} : { duration: 0.3 }}
            className="text-center py-12"
          >
            <motion.div
              initial={prefersReducedMotion ? false : { scale: 0.8, opacity: 0 }}
              animate={prefersReducedMotion ? {} : { scale: 1, opacity: 1 }}
              transition={prefersReducedMotion ? {} : { delay: 0.1, duration: 0.3 }}
            >
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            </motion.div>
            <motion.h3
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? {} : { delay: 0.2, duration: 0.3 }}
              className="text-lg font-medium text-gray-900 mb-2"
            >
              No items found
            </motion.h3>
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? {} : { delay: 0.3, duration: 0.3 }}
              className="text-gray-600"
            >
              {activeFilterCount > 0 
                ? 'Try adjusting your filters or search terms.'
                : 'Start by adding your first inventory item.'
              }
            </motion.p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <StaggeredGrid
            key={`grid-${viewMode}`}
            columns={3}
            staggerDelay={0.08}
            className="grid-responsive-1"
          >
            {sortedAndFilteredItems.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
                onMarkAsUsed={onMarkAsUsed}
                onMarkAsFinished={onMarkAsFinished}
                onUpdateQuantity={onUpdateQuantity}
                onEdit={onEditItem}
              />
            ))}
          </StaggeredGrid>
        ) : (
          <StaggeredList
            key={`list-${viewMode}`}
            staggerDelay={0.05}
            layout="list"
            className="space-y-4"
          >
            {sortedAndFilteredItems.map((item) => (
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
          </StaggeredList>
        )}
      </AnimatePresence>
    </div>
  );
}