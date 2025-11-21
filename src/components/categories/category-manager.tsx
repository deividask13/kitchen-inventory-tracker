'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Palette, 
  Tag,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { Button, Input, Card, Modal } from '@/components/ui';
import { CategoryForm } from './category-form';
import { useSettingsStore } from '@/stores/settings-store';
import { cn } from '@/lib/utils';
import type { Category, CreateCategory } from '@/lib/types';

interface CategoryManagerProps {
  className?: string;
}

export function CategoryManager({ className }: CategoryManagerProps) {
  const {
    categories,
    isLoading,
    error,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    clearError,
    getDefaultCategories,
    getCustomCategories
  } = useSettingsStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Handle adding new category
  const handleAddCategory = async (data: CreateCategory) => {
    try {
      await addCategory(data);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  // Handle editing category
  const handleEditCategory = async (data: CreateCategory) => {
    if (!editingCategory) return;
    
    try {
      await updateCategory(editingCategory.id, data);
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  // Handle deleting category
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    
    try {
      await deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const defaultCategories = getDefaultCategories();
  const customCategories = getCustomCategories();

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="h-5 w-5 text-blue-600" />
            Category Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Organize your inventory with custom categories
          </p>
        </div>
        
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <p className="text-red-800">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Default Categories */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Default Categories</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {defaultCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={setEditingCategory}
              onDelete={setDeletingCategory}
              isDefault
            />
          ))}
        </div>
      </div>

      {/* Custom Categories */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Custom Categories
          {customCategories.length > 0 && (
            <span className="text-sm text-gray-500 ml-2">
              ({customCategories.length})
            </span>
          )}
        </h3>
        
        {customCategories.length === 0 ? (
          <Card padding="lg" className="text-center">
            <Palette className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-gray-900 mb-1">No custom categories</h4>
            <p className="text-sm text-gray-600 mb-4">
              Create custom categories to better organize your inventory
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-3 w-3" />
              Add First Category
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {customCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={setEditingCategory}
                onDelete={setDeletingCategory}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Add New Category"
        size="md"
      >
        <CategoryForm
          onSubmit={handleAddCategory}
          onCancel={() => setShowAddForm(false)}
          existingNames={categories.map(c => c.name)}
        />
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Edit Category"
        size="md"
      >
        {editingCategory && (
          <CategoryForm
            category={editingCategory}
            onSubmit={handleEditCategory}
            onCancel={() => setEditingCategory(null)}
            existingNames={categories.filter(c => c.id !== editingCategory.id).map(c => c.name)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        title="Delete Category"
        size="sm"
      >
        {deletingCategory && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-900">
                  Are you sure you want to delete the category "{deletingCategory.name}"?
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  This action cannot be undone. Items using this category will need to be recategorized.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeletingCategory(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCategory}
              >
                Delete Category
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  isDefault?: boolean;
}

function CategoryCard({ category, onEdit, onDelete, isDefault = false }: CategoryCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        padding="md" 
        className="relative group hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-3">
          {/* Category Icon and Color */}
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: category.color + '20', color: category.color }}
          >
            {category.icon}
          </div>
          
          {/* Category Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">
              {category.name}
            </h4>
            <p className="text-xs text-gray-500">
              {isDefault ? 'Default category' : 'Custom category'}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(category)}
              className="h-8 w-8"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            
            {!isDefault && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(category)}
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}