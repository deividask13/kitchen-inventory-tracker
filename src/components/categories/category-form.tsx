'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Smile } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Category, CreateCategory } from '@/lib/types';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CreateCategory) => void;
  onCancel: () => void;
  existingNames: string[];
}

// Predefined color palette
const COLOR_PALETTE = [
  '#EF4444', // Red
  '#F97316', // Orange  
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#22C55E', // Green
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
  '#F43F5E'  // Rose
];

// Predefined emoji icons
const EMOJI_ICONS = [
  '🥬', '🥛', '🥩', '🥫', '🧊', '🥤', '🍿', '🍯',
  '🍎', '🥕', '🧄', '🧅', '🥔', '🍅', '🥒', '🌶️',
  '🍞', '🧀', '🥚', '🐟', '🍗', '🥓', '🍝', '🍚',
  '☕', '🍵', '🥃', '🍷', '🍺', '🥤', '🧃', '🥛',
  '🍪', '🍰', '🍫', '🍭', '🍯', '🥜', '🍿', '🥨',
  '🧂', '🌿', '🍋', '🫒', '🥥', '🌰', '🍄', '🥖'
];

export function CategoryForm({ 
  category, 
  onSubmit, 
  onCancel, 
  existingNames 
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CreateCategory>({
    name: category?.name || '',
    color: category?.color || COLOR_PALETTE[0],
    icon: category?.icon || EMOJI_ICONS[0],
    isDefault: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    } else if (formData.name.length > 30) {
      newErrors.name = 'Category name must be less than 30 characters';
    } else if (existingNames.some(name => 
      name.toLowerCase() === formData.name.toLowerCase()
    )) {
      newErrors.name = 'A category with this name already exists';
    }
    
    if (!formData.color) {
      newErrors.color = 'Please select a color';
    }
    
    if (!formData.icon) {
      newErrors.icon = 'Please select an icon';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof CreateCategory, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category Name
        </label>
        <Input
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter category name..."
          error={errors.name}
          maxLength={30}
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.name.length}/30 characters
        </p>
      </div>

      {/* Color Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color
        </label>
        <div className="space-y-3">
          {/* Selected Color Display */}
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: formData.color }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <Palette className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {formData.color}
              </p>
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {showColorPicker ? 'Hide colors' : 'Choose color'}
              </button>
            </div>
          </div>

          {/* Color Palette */}
          {showColorPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-8 gap-2 p-3 bg-gray-50 rounded-lg"
            >
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    handleInputChange('color', color);
                    setShowColorPicker(false);
                  }}
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 transition-all hover:scale-110',
                    formData.color === color 
                      ? 'border-gray-900 ring-2 ring-gray-300' 
                      : 'border-gray-200'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </motion.div>
          )}
        </div>
        {errors.color && (
          <p className="text-xs text-red-600 mt-1">{errors.color}</p>
        )}
      </div>

      {/* Icon Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Icon
        </label>
        <div className="space-y-3">
          {/* Selected Icon Display */}
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center text-xl cursor-pointer bg-gray-50"
              onClick={() => setShowIconPicker(!showIconPicker)}
            >
              {formData.icon || <Smile className="h-5 w-5 text-gray-400" />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Selected: {formData.icon}
              </p>
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {showIconPicker ? 'Hide icons' : 'Choose icon'}
              </button>
            </div>
          </div>

          {/* Icon Grid */}
          {showIconPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-8 gap-2 p-3 bg-gray-50 rounded-lg max-h-48 overflow-y-auto"
            >
              {EMOJI_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => {
                    handleInputChange('icon', icon);
                    setShowIconPicker(false);
                  }}
                  className={cn(
                    'w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center text-lg',
                    formData.icon === icon 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  {icon}
                </button>
              ))}
            </motion.div>
          )}
        </div>
        {errors.icon && (
          <p className="text-xs text-red-600 mt-1">{errors.icon}</p>
        )}
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preview
        </label>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: formData.color + '20', color: formData.color }}
          >
            {formData.icon}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {formData.name || 'Category Name'}
            </p>
            <p className="text-xs text-gray-500">
              Custom category
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!formData.name.trim()}
        >
          {category ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
}