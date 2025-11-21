'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useInventoryStore } from '@/stores/inventory-store';
import type { InventoryItem } from '@/lib/types';

interface ExpiringItemsWidgetProps {
  className?: string;
  maxItems?: number;
}

interface ExpiringItemWithUrgency extends InventoryItem {
  urgencyLevel: 'critical' | 'warning' | 'notice';
  daysUntilExpiration: number;
}

export function ExpiringItemsWidget({ className, maxItems = 10 }: ExpiringItemsWidgetProps) {
  const { getExpiringItems } = useInventoryStore();

  const expiringItemsWithUrgency = useMemo((): ExpiringItemWithUrgency[] => {
    const expiringItems = getExpiringItems();
    const now = new Date();

    return expiringItems
      .map(item => {
        if (!item.expirationDate) return null;
        
        const timeDiff = item.expirationDate.getTime() - now.getTime();
        const daysUntilExpiration = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        let urgencyLevel: 'critical' | 'warning' | 'notice';
        if (daysUntilExpiration <= 1) {
          urgencyLevel = 'critical';
        } else if (daysUntilExpiration <= 3) {
          urgencyLevel = 'warning';
        } else {
          urgencyLevel = 'notice';
        }

        return {
          ...item,
          urgencyLevel,
          daysUntilExpiration
        };
      })
      .filter((item): item is ExpiringItemWithUrgency => item !== null)
      .sort((a, b) => {
        // Sort by urgency first, then by days until expiration
        const urgencyOrder = { critical: 0, warning: 1, notice: 2 };
        const urgencyDiff = urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel];
        if (urgencyDiff !== 0) return urgencyDiff;
        
        return a.daysUntilExpiration - b.daysUntilExpiration;
      })
      .slice(0, maxItems);
  }, [getExpiringItems, maxItems]);

  const getUrgencyStyles = (urgencyLevel: 'critical' | 'warning' | 'notice') => {
    switch (urgencyLevel) {
      case 'critical':
        return {
          indicator: 'bg-red-500',
          text: 'text-red-700',
          bg: 'bg-red-50',
          border: 'border-red-200'
        };
      case 'warning':
        return {
          indicator: 'bg-orange-500',
          text: 'text-orange-700',
          bg: 'bg-orange-50',
          border: 'border-orange-200'
        };
      case 'notice':
        return {
          indicator: 'bg-yellow-500',
          text: 'text-yellow-700',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200'
        };
    }
  };

  const formatExpirationText = (daysUntilExpiration: number) => {
    if (daysUntilExpiration < 0) {
      return `Expired ${Math.abs(daysUntilExpiration)} day${Math.abs(daysUntilExpiration) !== 1 ? 's' : ''} ago`;
    } else if (daysUntilExpiration === 0) {
      return 'Expires today';
    } else if (daysUntilExpiration === 1) {
      return 'Expires tomorrow';
    } else {
      return `Expires in ${daysUntilExpiration} days`;
    }
  };

  if (expiringItemsWithUrgency.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Expiring Items</span>
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-green-600 text-4xl mb-2">✓</div>
            <p className="text-gray-600">No items expiring soon</p>
            <p className="text-sm text-gray-500 mt-1">All your items are fresh!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Expiring Items</span>
          <div className="flex items-center space-x-1">
            {expiringItemsWithUrgency.some(item => item.urgencyLevel === 'critical') && (
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
            <span className="text-sm text-gray-500">
              {expiringItemsWithUrgency.length} item{expiringItemsWithUrgency.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expiringItemsWithUrgency.map((item) => {
            const styles = getUrgencyStyles(item.urgencyLevel);
            
            return (
              <div
                key={item.id}
                className={`p-3 rounded-lg border ${styles.bg} ${styles.border} transition-all hover:shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-3 h-3 rounded-full ${styles.indicator} mt-1 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-600 capitalize">{item.location}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{item.quantity} {item.unit}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className={`text-sm font-medium ${styles.text}`}>
                      {formatExpirationText(item.daysUntilExpiration)}
                    </p>
                    {item.expirationDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.expirationDate.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {expiringItemsWithUrgency.length === maxItems && (
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all expiring items
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}