'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Package, Tag, FileText, Save, X } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, FadeTransition } from '@/components/ui';
import { usePrefersReducedMotion } from '@/hooks';
import { formFieldVariants, getVariants } from '@/lib/utils/animation-variants';
import { cn } from '@/lib/utils';
import type { InventoryItem, CreateInventoryItem } from '@/lib/types';

interface ItemFormProps {
  item?: InventoryItem; // If provided, we're editing; otherwise, creating
  onSubmit: (data: CreateInventoryItem) => Promise<void>;
  onCancel: () => void;
  categories: string[];
  className?: string;
}

interface FormData {
  name: string;
  quantity: number;
  unit: string;
  expirationDate: string;
  location: 'fridge' | 'pantry' | 'freezer';
  purchaseDate: string;
  category: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  quantity?: string;
  unit?: string;
  category?: string;
}

const COMMON_UNITS = [
  'pieces', 'lbs', 'oz', 'kg', 'g', 'cups', 'tbsp', 'tsp', 
  'liters', 'ml', 'fl oz', 'pints', 'quarts', 'gallons',
  'cans', 'bottles', 'boxes', 'bags', 'packages'
];

const LOCATIONS = [
  { value: 'fridge', label: 'Fridge', icon: '🧊' },
  { value: 'freezer', label: 'Freezer', icon: '❄️' },
  { value: 'pantry', label: 'Pantry', icon: '🏠' }
] as const;

export function ItemForm({ item, onSubmit, onCancel, categories, className }: ItemFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    quantity: 1,
    unit: 'pieces',
    expirationDate: '',
    location: 'pantry',
    purchaseDate: new Date().toISOString().split('T')[0],
    category: categories[0] || '',
    notes: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUnitSuggestions, setShowUnitSuggestions] = useState(false);
  const [unitFilter, setUnitFilter] = useState('');
  const prefersReducedMotion = usePrefersReducedMotion();

  // Initialize form data when editing
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        expirationDate: item.expirationDate 
          ? new Date(item.expirationDate).toISOString().split('T')[0] 
          : '',
        location: item.location,
        purchaseDate: new Date(item.purchaseDate).toISOString().split('T')[0],
        category: item.category,
        notes: item.notes || ''
      });
    }
  }, [item]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Item name must be less than 100 characters';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    } else if (formData.unit.length > 20) {
      newErrors.unit = 'Unit must be less than 20 characters';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const submitData: CreateInventoryItem = {
        name: formData.name.trim(),
        quantity: formData.quantity,
        unit: formData.unit.trim(),
        expirationDate: formData.expirationDate ? new Date(formData.expirationDate) : null,
        location: formData.location,
        purchaseDate: new Date(formData.purchaseDate),
        category: formData.category.trim(),
        notes: formData.notes.trim() || undefined,
        lastUsed: null
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Filter units based on input
  const filteredUnits = COMMON_UNITS.filter(unit =>
    unit.toLowerCase().includes(unitFilter.toLowerCase())
  );

  const fieldVariants = getVariants(formFieldVariants, prefersReducedMotion);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, y: -20, scale: 0.98 }}
      transition={prefersReducedMotion ? {} : { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
      className={className}
    >
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {item ? 'Edit Item' : 'Add New Item'}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <motion.div
              variants={fieldVariants}
              initial="initial"
              animate="animate"
              transition={prefersReducedMotion ? {} : { delay: 0.1 }}
            >
              <Input
                label="Item Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                placeholder="e.g., Organic Milk, Chicken Breast"
                leftIcon={<Tag className="h-4 w-4" />}
                required
              />
            </motion.div>

            {/* Quantity and Unit */}
            <motion.div
              variants={fieldVariants}
              initial="initial"
              animate="animate"
              transition={prefersReducedMotion ? {} : { delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Input
                label="Quantity"
                type="number"
                min="0"
                step="0.1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                error={errors.quantity}
                placeholder="1"
                leftIcon={<Package className="h-4 w-4" />}
                required
              />

              <div className="relative">
                <Input
                  label="Unit"
                  value={formData.unit}
                  onChange={(e) => {
                    handleInputChange('unit', e.target.value);
                    setUnitFilter(e.target.value);
                    setShowUnitSuggestions(true);
                  }}
                  onFocus={() => setShowUnitSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowUnitSuggestions(false), 200)}
                  error={errors.unit}
                  placeholder="pieces, lbs, cups..."
                  required
                />
                
                {/* Unit suggestions dropdown */}
                <AnimatePresence>
                  {showUnitSuggestions && filteredUnits.length > 0 && (
                    <motion.div
                      initial={prefersReducedMotion ? false : { opacity: 0, y: -10, scale: 0.95 }}
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
                      exit={prefersReducedMotion ? {} : { opacity: 0, y: -10, scale: 0.95 }}
                      transition={prefersReducedMotion ? {} : { 
                        type: 'spring',
                        stiffness: 400,
                        damping: 25
                      }}
                      className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto"
                    >
                      {filteredUnits.slice(0, 8).map((unit, index) => (
                        <motion.button
                          key={unit}
                          type="button"
                          initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                          animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                          transition={prefersReducedMotion ? {} : { delay: index * 0.05 }}
                          onClick={() => {
                            handleInputChange('unit', unit);
                            setShowUnitSuggestions(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                        >
                          {unit}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Location and Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LOCATIONS.map((location) => (
                    <button
                      key={location.value}
                      type="button"
                      onClick={() => handleInputChange('location', location.value)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors min-h-[44px]',
                        formData.location === location.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <span className="text-lg">{location.icon}</span>
                      <span className="text-xs font-medium">{location.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={cn(
                    'w-full h-12 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    'min-h-[44px]',
                    errors.category && 'border-red-500 focus:ring-red-500'
                  )}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {errors.category}
                  </p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Purchase Date"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                leftIcon={<Calendar className="h-4 w-4" />}
                required
              />

              <Input
                label="Expiration Date (Optional)"
                type="date"
                value={formData.expirationDate}
                onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                leftIcon={<Calendar className="h-4 w-4" />}
                helperText="Leave empty if item doesn't expire"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes about this item..."
                rows={3}
                className={cn(
                  'w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'placeholder:text-gray-400'
                )}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.notes.length}/500 characters
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                loading={isSubmitting}
                className="flex-1"
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                {item ? 'Update Item' : 'Add Item'}
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
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}