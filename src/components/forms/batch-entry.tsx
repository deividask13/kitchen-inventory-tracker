'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Save, Package, Trash2, Copy } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { CreateInventoryItem } from '@/lib/types';

interface BatchEntryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  location: 'fridge' | 'pantry' | 'freezer';
  category: string;
  expirationDate: string;
  notes: string;
}

interface BatchEntryProps {
  onSubmit: (items: CreateInventoryItem[]) => Promise<void>;
  onCancel: () => void;
  categories: string[];
  className?: string;
}

const COMMON_UNITS = [
  'pieces', 'lbs', 'oz', 'kg', 'g', 'cups', 'tbsp', 'tsp', 
  'liters', 'ml', 'fl oz', 'cans', 'bottles', 'boxes', 'bags'
];

const LOCATIONS = [
  { value: 'fridge', label: 'Fridge', icon: '🧊' },
  { value: 'freezer', label: 'Freezer', icon: '❄️' },
  { value: 'pantry', label: 'Pantry', icon: '🏠' }
] as const;

export function BatchEntry({ onSubmit, onCancel, categories, className }: BatchEntryProps) {
  const [items, setItems] = useState<BatchEntryItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nextIdRef = useRef(1);

  // Add initial empty item
  useEffect(() => {
    addNewItem();
  }, []);

  const createEmptyItem = (): BatchEntryItem => ({
    id: `batch-${nextIdRef.current++}`,
    name: '',
    quantity: 1,
    unit: 'pieces',
    location: 'pantry',
    category: categories[0] || '',
    expirationDate: '',
    notes: ''
  });

  const addNewItem = () => {
    setItems(prev => [...prev, createEmptyItem()]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    // Clear any errors for this item
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(id)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  const duplicateItem = (id: string) => {
    const itemToDuplicate = items.find(item => item.id === id);
    if (itemToDuplicate) {
      const duplicatedItem = {
        ...itemToDuplicate,
        id: `batch-${nextIdRef.current++}`,
        name: `${itemToDuplicate.name} (Copy)`
      };
      const index = items.findIndex(item => item.id === id);
      setItems(prev => [
        ...prev.slice(0, index + 1),
        duplicatedItem,
        ...prev.slice(index + 1)
      ]);
    }
  };

  const updateItem = (id: string, field: keyof BatchEntryItem, value: string | number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
    
    // Clear error for this field
    const errorKey = `${id}-${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const validateItems = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    items.forEach(item => {
      if (!item.name.trim()) {
        newErrors[`${item.id}-name`] = 'Name is required';
        hasErrors = true;
      }
      if (item.quantity <= 0) {
        newErrors[`${item.id}-quantity`] = 'Quantity must be greater than 0';
        hasErrors = true;
      }
      if (!item.unit.trim()) {
        newErrors[`${item.id}-unit`] = 'Unit is required';
        hasErrors = true;
      }
      if (!item.category.trim()) {
        newErrors[`${item.id}-category`] = 'Category is required';
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async () => {
    // Filter out empty items (items with no name)
    const validItems = items.filter(item => item.name.trim());
    
    if (validItems.length === 0) {
      setErrors({ general: 'Please add at least one item' });
      return;
    }

    if (!validateItems()) return;

    setIsSubmitting(true);
    try {
      const submitData: CreateInventoryItem[] = validItems.map(item => ({
        name: item.name.trim(),
        quantity: item.quantity,
        unit: item.unit.trim(),
        location: item.location,
        category: item.category.trim(),
        expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
        purchaseDate: new Date(),
        notes: item.notes.trim() || undefined,
        lastUsed: null
      }));

      await onSubmit(submitData);
    } catch (error) {
      console.error('Failed to submit batch items:', error);
      setErrors({ general: 'Failed to save items. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Batch Entry
            </div>
            <span className="text-sm font-normal text-gray-500">
              {items.filter(item => item.name.trim()).length} items
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-red-50 border border-red-200 rounded-md"
            >
              <p className="text-sm text-red-600">{errors.general}</p>
            </motion.div>
          )}

          <div className="space-y-4 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 border border-gray-200 rounded-lg space-y-3"
                >
                  {/* Item header with actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Item {index + 1}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => duplicateItem(item.id)}
                        className="h-8 w-8"
                        title="Duplicate item"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Item name */}
                  <Input
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    error={errors[`${item.id}-name`]}
                  />

                  {/* Quantity and Unit */}
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      error={errors[`${item.id}-quantity`]}
                    />
                    
                    <div className="relative">
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                        className={cn(
                          'w-full h-12 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                          'min-h-[44px]',
                          errors[`${item.id}-unit`] && 'border-red-500 focus:ring-red-500'
                        )}
                      >
                        {COMMON_UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                      {errors[`${item.id}-unit`] && (
                        <p className="mt-1 text-xs text-red-600">{errors[`${item.id}-unit`]}</p>
                      )}
                    </div>
                  </div>

                  {/* Location and Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="grid grid-cols-3 gap-1">
                        {LOCATIONS.map((location) => (
                          <button
                            key={location.value}
                            type="button"
                            onClick={() => updateItem(item.id, 'location', location.value)}
                            className={cn(
                              'flex flex-col items-center gap-1 p-2 rounded-md border transition-colors min-h-[44px]',
                              item.location === location.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <span className="text-sm">{location.icon}</span>
                            <span className="text-xs">{location.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <select
                      value={item.category}
                      onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                      className={cn(
                        'w-full h-12 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'min-h-[44px]',
                        errors[`${item.id}-category`] && 'border-red-500 focus:ring-red-500'
                      )}
                    >
                      <option value="">Category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Expiration Date */}
                  <Input
                    type="date"
                    placeholder="Expiration (optional)"
                    value={item.expirationDate}
                    onChange={(e) => updateItem(item.id, 'expirationDate', e.target.value)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add new item button */}
          <Button
            type="button"
            variant="outline"
            onClick={addNewItem}
            className="w-full"
            disabled={isSubmitting}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Item
          </Button>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              className="flex-1"
              disabled={isSubmitting || items.filter(item => item.name.trim()).length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Save All Items ({items.filter(item => item.name.trim()).length})
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}