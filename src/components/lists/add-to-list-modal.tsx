'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Modal, Button, Input } from '@/components/ui';
import { CreateShoppingListItem, InventoryItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: CreateShoppingListItem) => Promise<void>;
  inventoryItems?: InventoryItem[];
  categories?: string[];
  defaultUnits?: string[];
}

const DEFAULT_CATEGORIES = [
  'Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Beverages', 'Snacks', 'Other'
];

const DEFAULT_UNITS = [
  'pieces', 'lbs', 'oz', 'cups', 'liters', 'ml', 'kg', 'g', 'dozen', 'pack'
];

export function AddToListModal({
  isOpen,
  onClose,
  onAdd,
  inventoryItems = [],
  categories = DEFAULT_CATEGORIES,
  defaultUnits = DEFAULT_UNITS
}: AddToListModalProps) {
  const [formData, setFormData] = useState<CreateShoppingListItem>({
    name: '',
    quantity: 1,
    unit: 'pieces',
    category: 'Other',
    isCompleted: false,
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-complete suggestions based on inventory items
  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    return inventoryItems
      .filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5);
  }, [searchTerm, inventoryItems]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        quantity: 1,
        unit: 'pieces',
        category: 'Other',
        isCompleted: false,
        notes: ''
      });
      setSearchTerm('');
      setErrors({});
    }
  }, [isOpen]);

  // Update search term when name changes
  useEffect(() => {
    setSearchTerm(formData.name);
  }, [formData.name]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onAdd(formData);
      onClose();
    } catch (error) {
      console.error('Failed to add item:', error);
      setErrors({ submit: 'Failed to add item. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestionSelect = (item: InventoryItem) => {
    setFormData(prev => ({
      ...prev,
      name: item.name,
      unit: item.unit,
      category: item.category,
      quantity: Math.max(1, item.quantity) // Suggest at least 1
    }));
    setShowSuggestions(false);
    setSearchTerm(item.name);
  };

  const handleInputChange = (field: keyof CreateShoppingListItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Item to Shopping List"
      description="Add a new item to your shopping list"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Name with Auto-complete */}
        <div className="relative">
          <Input
            id="item-name-input"
            label="Item Name"
            value={formData.name}
            onChange={(e) => {
              handleInputChange('name', e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Delay hiding suggestions to allow clicking
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder="Enter item name..."
            error={errors.name}
            required
          />
          
          {/* Auto-complete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto"
            >
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSuggestionSelect(item)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="text-sm text-gray-500">{item.category}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.quantity} {item.unit} • {item.location}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Quantity and Unit */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="quantity-input"
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
              handleInputChange('quantity', isNaN(value) ? 0 : value);
            }}
            min="0.1"
            step="0.1"
            error={errors.quantity}
            required
          />
          
          <div>
            <label htmlFor="unit-select" className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            <select
              id="unit-select"
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
              className={cn(
                'w-full h-12 px-3 py-2 border border-gray-300 rounded-md',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'text-sm bg-white',
                errors.unit && 'border-red-500 focus:ring-red-500'
              )}
              required
            >
              {defaultUnits.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit}</p>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category-select"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className={cn(
              'w-full h-12 px-3 py-2 border border-gray-300 rounded-md',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'text-sm bg-white',
              errors.category && 'border-red-500 focus:ring-red-500'
            )}
            required
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Notes */}
        <Input
          label="Notes (Optional)"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Any additional notes..."
        />

        {/* Submit Error */}
        {errors.submit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 border border-red-200 rounded-md"
          >
            <p className="text-sm text-red-600">{errors.submit}</p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Add to List
          </Button>
        </div>
      </form>
    </Modal>
  );
}