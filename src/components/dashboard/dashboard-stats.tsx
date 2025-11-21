'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useInventoryStore } from '@/stores/inventory-store';
import type { InventoryItem } from '@/lib/types';

interface DashboardStatsProps {
  className?: string;
}

interface StatsData {
  totalItems: number;
  expiringItems: number;
  lowStockItems: number;
  unusedItems: number;
  totalValue: number;
  locationBreakdown: Record<string, number>;
}

export function DashboardStats({ className }: DashboardStatsProps) {
  const { items, getExpiringItems, getLowStockItems } = useInventoryStore();

  const stats = useMemo((): StatsData => {
    const activeItems = items.filter(item => !item.isFinished);
    const expiringItems = getExpiringItems();
    const lowStockItems = getLowStockItems();
    
    // Detect unused items (not used in 30+ days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const unusedItems = activeItems.filter(item => {
      if (!item.lastUsed) {
        // If never used, check if purchased more than 30 days ago
        return item.purchaseDate < thirtyDaysAgo;
      }
      return item.lastUsed < thirtyDaysAgo;
    });

    // Calculate location breakdown
    const locationBreakdown = activeItems.reduce((acc, item) => {
      acc[item.location] = (acc[item.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalItems: activeItems.length,
      expiringItems: expiringItems.length,
      lowStockItems: lowStockItems.length,
      unusedItems: unusedItems.length,
      totalValue: 0, // Could be calculated if we had price data
      locationBreakdown
    };
  }, [items, getExpiringItems, getLowStockItems]);

  const statCards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      description: 'Active inventory items',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringItems,
      description: 'Items expiring within 7 days',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Low Stock',
      value: stats.lowStockItems,
      description: 'Items running low',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Unused Items',
      value: stats.unusedItems,
      description: 'Not used in 30+ days',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  return (
    <div className={className}>
      {/* Main Stats Grid */}
      <div className="grid grid-responsive-stats gap-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className={`absolute top-0 right-0 w-16 h-16 ${stat.bgColor} rounded-bl-full opacity-20`} />
              <div className="relative">
                <p className="text-responsive-xs font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-responsive-2xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Location Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.locationBreakdown).map(([location, count]) => {
              const percentage = stats.totalItems > 0 ? (count / stats.totalItems) * 100 : 0;
              const locationColors = {
                fridge: 'bg-blue-500',
                freezer: 'bg-cyan-500',
                pantry: 'bg-green-500'
              };
              
              return (
                <div key={location} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${locationColors[location as keyof typeof locationColors] || 'bg-gray-500'}`} />
                    <span className="text-sm font-medium capitalize">{location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${locationColors[location as keyof typeof locationColors] || 'bg-gray-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}