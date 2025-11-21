'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { InventoryGrid, ItemForm } from '@/components/inventory';
import { useInventoryStore } from '@/stores/inventory-store';
import { useSettingsStore } from '@/stores/settings-store';
import type { InventoryItem, CreateInventoryItem } from '@/lib/types';

export default function InventoryPage() {
  const {
    items,
    filters,
    isLoading,
    error,
    loadItems,
    addItem,
    updateItem,
    markAsUsed,
    markAsFinished,
    setFilters,
    clearError,
    getFilteredItems
  } = useInventoryStore();

  const { categories, loadCategories } = useSettingsStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Load data on mount - only run once
  useEffect(() => {
    loadItems();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this only runs on mount

  // Get filtered items - memoized to avoid recalculation on every render
  const filteredItems = useMemo(() => {
    return getFilteredItems();
  }, [getFilteredItems]);

  // Handle adding new item - stabilized with useCallback
  const handleAddItem = useCallback(async (data: CreateInventoryItem) => {
    try {
      await addItem(data);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  }, [addItem]);

  // Handle editing item - stabilized with useCallback
  const handleEditItem = useCallback(async (data: CreateInventoryItem) => {
    if (!editingItem) return;
    
    try {
      await updateItem(editingItem.id, data);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  }, [editingItem, updateItem]);

  // Handle quantity updates - stabilized with useCallback
  const handleUpdateQuantity = useCallback(async (id: string, quantity: number) => {
    try {
      await updateItem(id, { quantity });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  }, [updateItem]);

  // Handle mark as used - stabilized with useCallback
  const handleMarkAsUsed = useCallback(async (id: string, quantityUsed: number) => {
    try {
      await markAsUsed(id, quantityUsed);
    } catch (error) {
      console.error('Failed to mark as used:', error);
    }
  }, [markAsUsed]);

  // Handle mark as finished - stabilized with useCallback
  const handleMarkAsFinished = useCallback(async (id: string) => {
    try {
      await markAsFinished(id);
    } catch (error) {
      console.error('Failed to mark as finished:', error);
    }
  }, [markAsFinished]);

  // Get category names for form - memoized to avoid recreating array
  const categoryNames = useMemo(() => {
    return categories.map(cat => cat.name);
  }, [categories]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            Kitchen Inventory
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your kitchen items, track quantities, and monitor expiration dates
          </p>
        </div>
        
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
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

      {/* Inventory Grid */}
      <InventoryGrid
        items={filteredItems}
        filters={filters}
        onFiltersChange={setFilters}
        onMarkAsUsed={handleMarkAsUsed}
        onMarkAsFinished={handleMarkAsFinished}
        onUpdateQuantity={handleUpdateQuantity}
        onEditItem={setEditingItem}
        categories={categories}
        isLoading={isLoading}
      />

      {/* Add Item Modal */}
      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Add New Item"
        size="lg"
      >
        <ItemForm
          onSubmit={handleAddItem}
          onCancel={() => setShowAddForm(false)}
          categories={categoryNames}
        />
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Edit Item"
        size="lg"
      >
        {editingItem && (
          <ItemForm
            item={editingItem}
            onSubmit={handleEditItem}
            onCancel={() => setEditingItem(null)}
            categories={categoryNames}
          />
        )}
      </Modal>
    </div>
  );
}