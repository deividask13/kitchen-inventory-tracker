'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useInventoryStore } from '@/stores/inventory-store';
import { useShoppingStore } from '@/stores/shopping-store';
import type { InventoryItem, ShoppingListItem } from '@/lib/types';

interface InsightsChartProps {
  className?: string;
}

interface CategoryInsight {
  category: string;
  totalItems: number;
  averageLifespan: number; // days
  shoppingFrequency: number; // times per month
  wasteRate: number; // percentage of items that expire unused
}

interface UsagePattern {
  period: string;
  itemsAdded: number;
  itemsUsed: number;
  itemsExpired: number;
}

export function InsightsChart({ className }: InsightsChartProps) {
  const { items } = useInventoryStore();
  const { items: shoppingItems } = useShoppingStore();

  const insights = useMemo(() => {
    // Calculate category insights
    const categoryMap = new Map<string, {
      items: InventoryItem[];
      shoppingItems: ShoppingListItem[];
    }>();

    // Group inventory items by category
    items.forEach(item => {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, { items: [], shoppingItems: [] });
      }
      categoryMap.get(item.category)!.items.push(item);
    });

    // Group shopping items by category
    shoppingItems.forEach(item => {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, { items: [], shoppingItems: [] });
      }
      categoryMap.get(item.category)!.shoppingItems.push(item);
    });

    const categoryInsights: CategoryInsight[] = Array.from(categoryMap.entries()).map(([category, data]) => {
      const { items: categoryItems, shoppingItems: categoryShoppingItems } = data;
      
      // Calculate average lifespan (from purchase to finish/expiry)
      const lifespans = categoryItems
        .filter(item => item.isFinished && item.lastUsed)
        .map(item => {
          const lifespan = item.lastUsed!.getTime() - item.purchaseDate.getTime();
          return Math.ceil(lifespan / (1000 * 3600 * 24)); // Convert to days
        });
      
      const averageLifespan = lifespans.length > 0 
        ? lifespans.reduce((sum, days) => sum + days, 0) / lifespans.length 
        : 0;

      // Calculate shopping frequency (completed shopping items in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentShoppingItems = categoryShoppingItems.filter(item => 
        item.isCompleted && item.completedAt && item.completedAt >= thirtyDaysAgo
      );
      
      const shoppingFrequency = recentShoppingItems.length;

      // Calculate waste rate (items that expired without being used)
      const expiredItems = categoryItems.filter(item => {
        if (!item.expirationDate) return false;
        const now = new Date();
        return item.expirationDate < now && (!item.lastUsed || item.lastUsed < item.expirationDate);
      });
      
      const wasteRate = categoryItems.length > 0 
        ? (expiredItems.length / categoryItems.length) * 100 
        : 0;

      return {
        category,
        totalItems: categoryItems.length,
        averageLifespan,
        shoppingFrequency,
        wasteRate
      };
    }).sort((a, b) => b.totalItems - a.totalItems);

    // Calculate usage patterns for the last 7 days
    const usagePatterns: UsagePattern[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const itemsAdded = items.filter(item => 
        item.createdAt >= dayStart && item.createdAt <= dayEnd
      ).length;

      const itemsUsed = items.filter(item => 
        item.lastUsed && item.lastUsed >= dayStart && item.lastUsed <= dayEnd
      ).length;

      const itemsExpired = items.filter(item => 
        item.expirationDate && 
        item.expirationDate >= dayStart && 
        item.expirationDate <= dayEnd &&
        (!item.lastUsed || item.lastUsed < item.expirationDate)
      ).length;

      usagePatterns.push({
        period: dateStr,
        itemsAdded,
        itemsUsed,
        itemsExpired
      });
    }

    return {
      categoryInsights: categoryInsights.slice(0, 5), // Top 5 categories
      usagePatterns
    };
  }, [items, shoppingItems]);

  const maxUsageValue = Math.max(
    ...insights.usagePatterns.flatMap(p => [p.itemsAdded, p.itemsUsed, p.itemsExpired])
  );

  return (
    <div className={className}>
      {/* Usage Patterns Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.usagePatterns.map((pattern, index) => (
              <div key={pattern.period} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{pattern.period}</span>
                  <span className="text-gray-500">
                    +{pattern.itemsAdded} | -{pattern.itemsUsed} | ✗{pattern.itemsExpired}
                  </span>
                </div>
                <div className="flex space-x-1 h-6">
                  {/* Items Added */}
                  <div 
                    className="bg-green-500 rounded-sm"
                    style={{ 
                      width: `${maxUsageValue > 0 ? (pattern.itemsAdded / maxUsageValue) * 100 : 0}%`,
                      minWidth: pattern.itemsAdded > 0 ? '4px' : '0'
                    }}
                    title={`${pattern.itemsAdded} items added`}
                  />
                  {/* Items Used */}
                  <div 
                    className="bg-blue-500 rounded-sm"
                    style={{ 
                      width: `${maxUsageValue > 0 ? (pattern.itemsUsed / maxUsageValue) * 100 : 0}%`,
                      minWidth: pattern.itemsUsed > 0 ? '4px' : '0'
                    }}
                    title={`${pattern.itemsUsed} items used`}
                  />
                  {/* Items Expired */}
                  <div 
                    className="bg-red-500 rounded-sm"
                    style={{ 
                      width: `${maxUsageValue > 0 ? (pattern.itemsExpired / maxUsageValue) * 100 : 0}%`,
                      minWidth: pattern.itemsExpired > 0 ? '4px' : '0'
                    }}
                    title={`${pattern.itemsExpired} items expired`}
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-center space-x-6 text-xs text-gray-600 mt-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-sm" />
                <span>Added</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                <span>Used</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-sm" />
                <span>Expired</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Category Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.categoryInsights.map((insight) => (
              <div key={insight.category} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-gray-900 capitalize">{insight.category}</h4>
                  <span className="text-sm text-gray-500">{insight.totalItems} items</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Avg. Lifespan</p>
                    <p className="font-medium">
                      {insight.averageLifespan > 0 
                        ? `${Math.round(insight.averageLifespan)} days`
                        : 'N/A'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600">Monthly Shopping</p>
                    <p className="font-medium">{insight.shoppingFrequency}x</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600">Waste Rate</p>
                    <p className={`font-medium ${
                      insight.wasteRate > 20 ? 'text-red-600' : 
                      insight.wasteRate > 10 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {Math.round(insight.wasteRate)}%
                    </p>
                  </div>
                </div>
                
                {/* Waste rate indicator */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        insight.wasteRate > 20 ? 'bg-red-500' : 
                        insight.wasteRate > 10 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(insight.wasteRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {insights.categoryInsights.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No insights available yet</p>
                <p className="text-sm mt-1">Add more items to see patterns</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}