'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Search, X, Tag } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory?: string;
  onCategorySelect: (categoryId: string) => void;
  placeholder?: string;
  showAllOption?: boolean;
  variant?: 'dropdown' | 'chips' | 'grid';
  className?: string;
  disabled?: boolean;
}

export function CategorySelector({
  categories,
  selectedCategory,
  onCategorySelect,
  placeholder = 'Select category...',
  showAllOption = false,
  variant = 'dropdown',
  className,
  disabled = false
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Find selected category object
  const selectedCategoryObj = categories.find(c => c.name === selectedCategory);

  // Handle category selection
  const handleSelect = (categoryId: string) => {
    onCategorySelect(categoryId);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle clear selection
  const handleClear = () => {
    onCategorySelect('');
    setIsOpen(false);
  };

  // Render dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        <Button
          variant="outline"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full justify-between',
            selectedCategoryObj && 'text-left'
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedCategoryObj ? (
              <>
                <div 
                  className="w-4 h-4 rounded flex items-center justify-center text-xs"
                  style={{ backgroundColor: selectedCategoryObj.color + '30', color: selectedCategoryObj.color }}
                >
                  {selectedCategoryObj.icon}
                </div>
                <span className="truncate">{selectedCategoryObj.name}</span>
              </>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {selectedCategoryObj && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <ChevronDown className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )} />
          </div>
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-hidden"
            >
              {/* Search */}
              <div className="p-2 border-b border-gray-100">
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="h-3 w-3" />}
                />
              </div>

              {/* Options */}
              <div className="max-h-48 overflow-y-auto">
                {showAllOption && (
                  <button
                    onClick={() => handleSelect('')}
                    className={cn(
                      'w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2',
                      !selectedCategory && 'bg-blue-50 text-blue-700'
                    )}
                  >
                    <Tag className="h-4 w-4" />
                    <span>All Categories</span>
                    {!selectedCategory && <Check className="h-3 w-3 ml-auto" />}
                  </button>
                )}

                {filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleSelect(category.id)}
                    className={cn(
                      'w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2',
                      selectedCategory === category.name && 'bg-blue-50 text-blue-700'
                    )}
                  >
                    <div 
                      className="w-4 h-4 rounded flex items-center justify-center text-xs"
                      style={{ backgroundColor: category.color + '30', color: category.color }}
                    >
                      {category.icon}
                    </div>
                    <span className="flex-1 truncate">{category.name}</span>
                    {selectedCategory === category.name && (
                      <Check className="h-3 w-3" />
                    )}
                  </button>
                ))}

                {filteredCategories.length === 0 && (
                  <div className="px-3 py-4 text-center text-gray-500 text-sm">
                    No categories found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Render chips variant
  if (variant === 'chips') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {showAllOption && (
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSelect('')}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <Tag className="h-3 w-3" />
            All
          </Button>
        )}

        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          return (
            <Button
              key={category.id}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSelect(category.id)}
              disabled={disabled}
              className="flex items-center gap-2"
              style={isSelected ? {
                backgroundColor: category.color,
                borderColor: category.color,
                color: 'white'
              } : {}}
            >
              <span className="text-sm">{category.icon}</span>
              {category.name}
            </Button>
          );
        })}
      </div>
    );
  }

  // Render grid variant
  if (variant === 'grid') {
    return (
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3', className)}>
        {showAllOption && (
          <button
            onClick={() => handleSelect('')}
            disabled={disabled}
            className={cn(
              'p-3 rounded-lg border-2 transition-all hover:scale-105',
              !selectedCategory 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Tag className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">All</span>
            </div>
          </button>
        )}

        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          return (
            <button
              key={category.id}
              onClick={() => handleSelect(category.id)}
              disabled={disabled}
              className={cn(
                'p-3 rounded-lg border-2 transition-all hover:scale-105',
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: category.color + '20', color: category.color }}
                >
                  {category.icon}
                </div>
                <span className="text-xs font-medium text-gray-700 truncate w-full">
                  {category.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return null;
}