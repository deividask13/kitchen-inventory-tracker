'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Tag, 
  Calendar,
  TrendingDown,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { CategorySelector } from './category-selector';
import { cn } from '@/lib/utils';
import type { InventoryFilters, Category } from '@/lib/types';

interface AdvancedFiltersProps {
  filters: InventoryFilters;
  onFiltersChange: (filters: Partial<InventoryFilters>) => void;
  categories: Category[];
  className?: string;
  showSearch?: boolean;
  showToggle?: boolean;
}

interface FilterChip {
  id: string;
  label: string;
  value: any;
  color?: string;
  icon?: React.ReactNode;
}

const LOCATIONS = [
  { value: 'fridge', label: 'Fridge', icon: '🧊', color: '#06B6D4' },
  { value: 'freezer', label: 'Freezer', icon: '❄️', color: '#0EA5E9' },
  { value: 'pantry', label: 'Pantry', icon: '🏠', color: '#8B5CF6' }
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All Items', icon: Package, color: '#6B7280' },
  { value: 'expiring', label: 'Expiring Soon', icon: Clock, color: '#F59E0B' },
  { value: 'low', label: 'Low Stock', icon: AlertTriangle, color: '#EF4444' },
  { value: 'finished', label: 'Finished', icon: X, color: '#9CA3AF' }
];

export function AdvancedFilters({
  filters,
  onFiltersChange,
  categories,
  className,
  showSearch = true,
  showToggle = true
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  // Update search value when filters change externally
  useEffect(() => {
    setSearchValue(filters.search || '');
  }, [filters.search]);

  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ search: searchValue || undefined });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, onFiltersChange]);

  // Handle filter changes
  const handleLocationFilter = (location: string) => {
    onFiltersChange({ 
      location: filters.location === location ? undefined : location as any 
    });
  };

  const handleCategoryFilter = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    onFiltersChange({ 
      category: filters.category === category?.name ? undefined : category?.name 
    });
  };

  const handleStatusFilter = (status: string) => {
    onFiltersChange({ 
      status: filters.status === status ? 'all' : status as any 
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchValue('');
    onFiltersChange({ 
      location: undefined, 
      category: undefined, 
      status: 'all', 
      search: undefined 
    });
  };

  // Generate filter chips for active filters
  const activeFilterChips = useMemo((): FilterChip[] => {
    const chips: FilterChip[] = [];

    if (filters.location) {
      const location = LOCATIONS.find(l => l.value === filters.location);
      if (location) {
        chips.push({
          id: 'location',
          label: location.label,
          value: filters.location,
          color: location.color,
          icon: <span className="text-sm">{location.icon}</span>
        });
      }
    }

    if (filters.category) {
      const category = categories.find(c => c.name === filters.category);
      if (category) {
        chips.push({
          id: 'category',
          label: category.name,
          value: filters.category,
          color: category.color,
          icon: <span className="text-sm">{category.icon}</span>
        });
      }
    }

    if (filters.status && filters.status !== 'all') {
      const status = STATUS_FILTERS.find(s => s.value === filters.status);
      if (status) {
        const Icon = status.icon;
        chips.push({
          id: 'status',
          label: status.label,
          value: filters.status,
          color: status.color,
          icon: <Icon className="h-3 w-3" />
        });
      }
    }

    if (filters.search) {
      chips.push({
        id: 'search',
        label: `"${filters.search}"`,
        value: filters.search,
        color: '#10B981',
        icon: <Search className="h-3 w-3" />
      });
    }

    return chips;
  }, [filters, categories]);

  // Remove specific filter chip
  const removeFilterChip = (chipId: string) => {
    switch (chipId) {
      case 'location':
        onFiltersChange({ location: undefined });
        break;
      case 'category':
        onFiltersChange({ category: undefined });
        break;
      case 'status':
        onFiltersChange({ status: 'all' });
        break;
      case 'search':
        setSearchValue('');
        onFiltersChange({ search: undefined });
        break;
    }
  };

  const hasActiveFilters = activeFilterChips.length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      {showSearch && (
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search items by name, category, notes, or location..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              rightIcon={
                searchValue && (
                  <button
                    onClick={() => setSearchValue('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )
              }
            />
          </div>
          
          {showToggle && (
            <Button
              variant={isExpanded ? 'default' : 'outline'}
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                  {activeFilterChips.length}
                </span>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Active Filter Chips */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {activeFilterChips.map((chip) => (
              <motion.div
                key={chip.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
                style={{ 
                  backgroundColor: chip.color + '15',
                  borderColor: chip.color + '30',
                  color: chip.color
                }}
              >
                {chip.icon}
                <span>{chip.label}</span>
                <button
                  onClick={() => removeFilterChip(chip.id)}
                  className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 h-auto"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Filters Panel */}
      <AnimatePresence>
        {(isExpanded || !showToggle) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card padding="md" className="space-y-6">
              {/* Location Filters */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </h4>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map((location) => (
                    <Button
                      key={location.value}
                      variant={filters.location === location.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleLocationFilter(location.value)}
                      className="flex items-center gap-2"
                      style={filters.location === location.value ? {
                        backgroundColor: location.color,
                        borderColor: location.color
                      } : {}}
                    >
                      <span>{location.icon}</span>
                      {location.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filters */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Category
                </h4>
                <CategorySelector
                  categories={categories}
                  selectedCategory={filters.category}
                  onCategorySelect={handleCategoryFilter}
                  showAllOption
                  variant="chips"
                />
              </div>

              {/* Status Filters */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Status
                </h4>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FILTERS.map((status) => {
                    const Icon = status.icon;
                    const isActive = filters.status === status.value || 
                      (status.value === 'all' && !filters.status);
                    
                    return (
                      <Button
                        key={status.value}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusFilter(status.value)}
                        className="flex items-center gap-2"
                        style={isActive ? {
                          backgroundColor: status.color,
                          borderColor: status.color
                        } : {}}
                      >
                        <Icon className="h-3 w-3" />
                        {status.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">
                    {hasActiveFilters ? `${activeFilterChips.length} filter${activeFilterChips.length !== 1 ? 's' : ''} active` : 'No filters applied'}
                  </p>
                  
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-xs text-gray-600 hover:text-gray-800"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Clear all filters
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}