'use client';

import { useEffect } from 'react';
import { useInventoryStore } from '@/stores/inventory-store';
import { useShoppingStore } from '@/stores/shopping-store';
import {
  DashboardStats,
  ExpiringItemsWidget,
  InsightsChart,
  QuickActionsPanel
} from '@/components/dashboard';

export default function DashboardPage() {
  const { loadItems } = useInventoryStore();
  const { loadItems: loadShoppingItems } = useShoppingStore();

  // Load data on component mount
  useEffect(() => {
    loadItems();
    loadShoppingItems();
  }, [loadItems, loadShoppingItems]);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-responsive-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Quick Actions Panel */}
      <QuickActionsPanel />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Stats and Insights */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <DashboardStats />
          <InsightsChart />
        </div>

        {/* Right Column - Expiring Items Widget */}
        <div className="space-y-4 sm:space-y-6">
          <ExpiringItemsWidget />
        </div>
      </div>
    </div>
  );
}