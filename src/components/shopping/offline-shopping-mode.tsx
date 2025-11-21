'use client';

import { useState, useEffect } from 'react';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useShoppingStore } from '@/stores/shopping-store';
import { useSyncService } from '@/lib/sync-service';
import { ShoppingCart, WifiOff, Check, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Offline-first shopping mode component
 * Provides full shopping list functionality even when offline
 */
export const OfflineShoppingMode = () => {
  const { isOnline } = useOnlineStatus();
  const { addPendingChange } = useSyncService();
  const {
    items,
    isLoading,
    error,
    loadItems,
    addItem,
    updateItem,
    deleteItem,
    toggleCompleted,
    clearCompleted
  } = useShoppingStore();

  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load items on component mount
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Enhanced add item function that works offline
  const handleAddItem = async (name: string, quantity: number = 1) => {
    const newItem = {
      name: name.trim(),
      quantity,
      unit: 'item',
      category: 'other',
      isCompleted: false,
      notes: '',
    };

    try {
      if (isOnline) {
        // Online: add directly to store
        await addItem(newItem);
      } else {
        // Offline: queue for sync when back online
        const tempId = `temp_${Date.now()}`;
        
        addPendingChange({
          id: tempId,
          type: 'shopping',
          action: 'create',
          data: newItem,
        });
        
        // Also add to local state for immediate UI update
        await addItem({ ...newItem, id: tempId } as any);
      }

      // Reset form
      setNewItemName('');
      setNewItemQuantity('1');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  // Enhanced toggle completion that works offline
  const handleToggleCompleted = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    try {
      if (isOnline) {
        // Online: update directly
        await toggleCompleted(itemId);
      } else {
        // Offline: queue for sync first, then update local state
        addPendingChange({
          id: itemId,
          type: 'shopping',
          action: 'update',
          data: { isCompleted: !item.isCompleted },
        });
        
        // Update local state for immediate UI feedback
        await toggleCompleted(itemId);
      }
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  // Enhanced remove item that works offline
  const handleRemoveItem = async (itemId: string) => {
    try {
      if (isOnline) {
        // Online: remove directly
        await deleteItem(itemId);
      } else {
        // Offline: queue for sync first, then remove from local state
        addPendingChange({
          id: itemId,
          type: 'shopping',
          action: 'delete',
          data: {},
        });
        
        // Remove from local state for immediate UI feedback
        await deleteItem(itemId);
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  // Enhanced clear completed that works offline
  const handleClearCompleted = async () => {
    const completedItems = items.filter(item => item.isCompleted);
    
    try {
      if (isOnline) {
        // Online: clear directly
        await clearCompleted();
      } else {
        // Offline: queue for sync first, then clear from local state
        // Queue each completed item for deletion
        completedItems.forEach(item => {
          addPendingChange({
            id: item.id,
            type: 'shopping',
            action: 'delete',
            data: {},
          });
        });
        
        // Clear from local state for immediate UI feedback
        await clearCompleted();
      }
    } catch (error) {
      console.error('Failed to clear completed items:', error);
    }
  };

  const completedCount = items.filter(item => item.isCompleted).length;
  const totalCount = items.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" role="status" aria-label="Loading shopping list"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header with offline indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
          {!isOnline && (
            <div className="flex items-center space-x-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              <WifiOff className="h-4 w-4" />
              <span className="text-xs font-medium">Offline Mode</span>
            </div>
          )}
        </div>
        
        {completedCount > 0 && (
          <button
            onClick={handleClearCompleted}
            className="text-sm text-gray-600 hover:text-gray-800"
            aria-label={`Clear ${completedCount} completed items`}
          >
            Clear completed ({completedCount})
          </button>
        )}
      </div>

      {/* Progress indicator */}
      {totalCount > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>{completedCount} of {totalCount} completed</span>
            <span>{Math.round((completedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-green-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Add item form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Item name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Item name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newItemName.trim()) {
                    e.preventDefault();
                    handleAddItem(newItemName, parseInt(newItemQuantity) || 1);
                  }
                }}
              />
              <input
                type="number"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                min="1"
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Item quantity"
              />
              <button
                onClick={() => handleAddItem(newItemName, parseInt(newItemQuantity) || 1)}
                disabled={!newItemName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add item to shopping list"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add item button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full mb-4 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center space-x-2"
          aria-label="Add item to list"
        >
          <Plus className="h-5 w-5" />
          <span>Add item to list</span>
        </button>
      )}

      {/* Shopping list items */}
      <div className="space-y-2">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={`flex items-center space-x-3 p-3 bg-white rounded-lg border ${
                item.isCompleted ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
              }`}
            >
              <button
                onClick={() => handleToggleCompleted(item.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  item.isCompleted
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-300 hover:border-green-400'
                }`}
                aria-label={item.isCompleted ? `Mark ${item.name} as incomplete` : `Mark ${item.name} as complete`}
              >
                {item.isCompleted && <Check className="h-4 w-4" />}
              </button>

              <div className="flex-1">
                <div className={`font-medium ${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {item.name}
                </div>
                {item.quantity > 1 && (
                  <div className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleRemoveItem(item.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600"
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your shopping list is empty</h3>
          <p className="text-gray-600 mb-4">Add items to get started with your shopping</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            aria-label="Add your first item"
          >
            Add your first item
          </button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Offline mode info */}
      {!isOnline && items.length > 0 && (
        <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-orange-800 text-sm">
            You're shopping offline. Changes will sync automatically when you're back online.
          </p>
        </div>
      )}
    </div>
  );
};