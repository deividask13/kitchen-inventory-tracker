'use client';

import { useState } from 'react';
import { Button, Modal } from '@/components/ui';
import { useInventoryStore } from '@/stores/inventory-store';
import { useShoppingStore } from '@/stores/shopping-store';

interface QuickActionsPanelProps {
  className?: string;
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

export function QuickActionsPanel({ className }: QuickActionsPanelProps) {
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddToShoppingModalOpen, setIsAddToShoppingModalOpen] = useState(false);
  
  const { getLowStockItems, getExpiringItems } = useInventoryStore();
  const { addFromInventory, addItem: addShoppingItem } = useShoppingStore();

  const handleAddLowStockToShopping = () => {
    const lowStockItems = getLowStockItems();
    if (lowStockItems.length > 0) {
      addFromInventory(lowStockItems);
    }
  };

  const handleAddExpiringToShopping = () => {
    const expiringItems = getExpiringItems();
    if (expiringItems.length > 0) {
      // Add expiring items to shopping list as "replacement" items
      expiringItems.forEach(item => {
        addShoppingItem({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          isCompleted: false,
          notes: 'Replacement for expiring item',
          fromInventory: true,
          inventoryItemId: item.id
        });
      });
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'add-item',
      label: 'Add Item',
      description: 'Add new inventory item',
      icon: '➕',
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => setIsAddItemModalOpen(true)
    },
    {
      id: 'add-to-shopping',
      label: 'Add to Shopping',
      description: 'Quick add to shopping list',
      icon: '🛒',
      color: 'bg-green-500 hover:bg-green-600',
      action: () => setIsAddToShoppingModalOpen(true)
    },
    {
      id: 'low-stock-shopping',
      label: 'Low Stock → Shopping',
      description: 'Add low stock items to shopping list',
      icon: '⚠️',
      color: 'bg-orange-500 hover:bg-orange-600',
      action: handleAddLowStockToShopping
    },
    {
      id: 'expiring-shopping',
      label: 'Replace Expiring',
      description: 'Add replacements for expiring items',
      icon: '⏰',
      color: 'bg-red-500 hover:bg-red-600',
      action: handleAddExpiringToShopping
    }
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm font-medium mb-1">{action.label}</div>
              <div className="text-xs opacity-90">{action.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Add Item Modal */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Quick Add Item"
        description="Add a new item to your inventory"
      >
        <QuickAddItemForm onClose={() => setIsAddItemModalOpen(false)} />
      </Modal>

      {/* Quick Add to Shopping Modal */}
      <Modal
        isOpen={isAddToShoppingModalOpen}
        onClose={() => setIsAddToShoppingModalOpen(false)}
        title="Quick Add to Shopping List"
        description="Add an item to your shopping list"
      >
        <QuickAddShoppingForm onClose={() => setIsAddToShoppingModalOpen(false)} />
      </Modal>
    </div>
  );
}

// Quick Add Item Form Component
function QuickAddItemForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'pcs',
    location: 'fridge' as const,
    category: 'other'
  });
  
  const { addItem } = useInventoryStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addItem({
        ...formData,
        expirationDate: null,
        purchaseDate: new Date(),
        lastUsed: null,
        notes: ''
      });
      onClose();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="item-name" className="block text-sm font-medium text-gray-700 mb-1">
          Item Name
        </label>
        <input
          id="item-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter item name"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="item-quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            id="item-quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            required
          />
        </div>

        <div>
          <label htmlFor="item-unit" className="block text-sm font-medium text-gray-700 mb-1">
            Unit
          </label>
          <select
            id="item-unit"
            value={formData.unit}
            onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pcs">pieces</option>
            <option value="kg">kg</option>
            <option value="g">grams</option>
            <option value="l">liters</option>
            <option value="ml">ml</option>
            <option value="cups">cups</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="item-location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            id="item-location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="fridge">Fridge</option>
            <option value="freezer">Freezer</option>
            <option value="pantry">Pantry</option>
          </select>
        </div>

        <div>
          <label htmlFor="item-category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="item-category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="produce">Produce</option>
            <option value="dairy">Dairy</option>
            <option value="meat">Meat</option>
            <option value="pantry">Pantry</option>
            <option value="beverages">Beverages</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Add Item
        </Button>
      </div>
    </form>
  );
}

// Quick Add Shopping Form Component
function QuickAddShoppingForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'pcs',
    category: 'other',
    notes: ''
  });
  
  const { addItem } = useShoppingStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      addItem({
        ...formData,
        isCompleted: false
      });
      onClose();
    } catch (error) {
      console.error('Failed to add shopping item:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="shopping-name" className="block text-sm font-medium text-gray-700 mb-1">
          Item Name
        </label>
        <input
          id="shopping-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter item name"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="shopping-quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            id="shopping-quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            required
          />
        </div>

        <div>
          <label htmlFor="shopping-unit" className="block text-sm font-medium text-gray-700 mb-1">
            Unit
          </label>
          <select
            id="shopping-unit"
            value={formData.unit}
            onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pcs">pieces</option>
            <option value="kg">kg</option>
            <option value="g">grams</option>
            <option value="l">liters</option>
            <option value="ml">ml</option>
            <option value="cups">cups</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="shopping-category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="shopping-category"
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="produce">Produce</option>
          <option value="dairy">Dairy</option>
          <option value="meat">Meat</option>
          <option value="pantry">Pantry</option>
          <option value="beverages">Beverages</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="shopping-notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <input
          id="shopping-notes"
          type="text"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Any additional notes"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Add to Shopping List
        </Button>
      </div>
    </form>
  );
}