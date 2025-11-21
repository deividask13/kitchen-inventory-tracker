import { describe, it, expect } from 'vitest';
import type { InventoryItem, ShoppingListItem } from '@/lib/types';

// Test the insight calculation logic separately from components
describe('Dashboard Insights Calculations', () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  describe('Unused Items Detection', () => {
    it('identifies items never used and purchased 30+ days ago', () => {
      const items: InventoryItem[] = [
        {
          id: '1',
          name: 'Old Bread',
          quantity: 1,
          unit: 'loaf',
          expirationDate: null,
          location: 'pantry',
          purchaseDate: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
          category: 'bakery',
          isLow: false,
          isFinished: false,
          lastUsed: null, // Never used
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Fresh Milk',
          quantity: 1,
          unit: 'l',
          expirationDate: null,
          location: 'fridge',
          purchaseDate: fiveDaysAgo, // Recent purchase
          category: 'dairy',
          isLow: false,
          isFinished: false,
          lastUsed: null, // Never used but recent
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const activeItems = items.filter(item => !item.isFinished);
      const unusedItems = activeItems.filter(item => {
        if (!item.lastUsed) {
          return item.purchaseDate < thirtyDaysAgo;
        }
        return item.lastUsed < thirtyDaysAgo;
      });

      expect(unusedItems).toHaveLength(1);
      expect(unusedItems[0].name).toBe('Old Bread');
    });

    it('identifies items not used in 30+ days', () => {
      const items: InventoryItem[] = [
        {
          id: '1',
          name: 'Unused Cheese',
          quantity: 200,
          unit: 'g',
          expirationDate: null,
          location: 'fridge',
          purchaseDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          category: 'dairy',
          isLow: false,
          isFinished: false,
          lastUsed: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const activeItems = items.filter(item => !item.isFinished);
      const unusedItems = activeItems.filter(item => {
        if (!item.lastUsed) {
          return item.purchaseDate < thirtyDaysAgo;
        }
        return item.lastUsed < thirtyDaysAgo;
      });

      expect(unusedItems).toHaveLength(1);
      expect(unusedItems[0].name).toBe('Unused Cheese');
    });
  });

  describe('Expiration Warnings', () => {
    it('correctly identifies items expiring within 7 days', () => {
      const items: InventoryItem[] = [
        {
          id: '1',
          name: 'Expiring Milk',
          quantity: 1,
          unit: 'l',
          expirationDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          location: 'fridge',
          purchaseDate: fiveDaysAgo,
          category: 'dairy',
          isLow: false,
          isFinished: false,
          lastUsed: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Fresh Bread',
          quantity: 1,
          unit: 'loaf',
          expirationDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          location: 'pantry',
          purchaseDate: fiveDaysAgo,
          category: 'bakery',
          isLow: false,
          isFinished: false,
          lastUsed: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      
      const expiringItems = items.filter(item => 
        item.expirationDate !== null && 
        item.expirationDate <= weekFromNow && 
        !item.isFinished
      );

      expect(expiringItems).toHaveLength(1);
      expect(expiringItems[0].name).toBe('Expiring Milk');
    });

    it('sorts expiring items by urgency', () => {
      const items: InventoryItem[] = [
        {
          id: '1',
          name: 'Expires in 5 days',
          quantity: 1,
          unit: 'pcs',
          expirationDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
          location: 'fridge',
          purchaseDate: fiveDaysAgo,
          category: 'other',
          isLow: false,
          isFinished: false,
          lastUsed: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Expires tomorrow',
          quantity: 1,
          unit: 'pcs',
          expirationDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
          location: 'fridge',
          purchaseDate: fiveDaysAgo,
          category: 'other',
          isLow: false,
          isFinished: false,
          lastUsed: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Expires in 3 days',
          quantity: 1,
          unit: 'pcs',
          expirationDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          location: 'fridge',
          purchaseDate: fiveDaysAgo,
          category: 'other',
          isLow: false,
          isFinished: false,
          lastUsed: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      
      const expiringItems = items
        .filter(item => 
          item.expirationDate !== null && 
          item.expirationDate <= weekFromNow && 
          !item.isFinished
        )
        .sort((a, b) => {
          if (!a.expirationDate || !b.expirationDate) return 0;
          return a.expirationDate.getTime() - b.expirationDate.getTime();
        });

      expect(expiringItems).toHaveLength(3);
      expect(expiringItems[0].name).toBe('Expires tomorrow');
      expect(expiringItems[1].name).toBe('Expires in 3 days');
      expect(expiringItems[2].name).toBe('Expires in 5 days');
    });
  });

  describe('Category Insights', () => {
    it('calculates average lifespan correctly', () => {
      const items: InventoryItem[] = [
        {
          id: '1',
          name: 'Finished Milk',
          quantity: 0,
          unit: 'l',
          expirationDate: null,
          location: 'fridge',
          purchaseDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          category: 'dairy',
          isLow: false,
          isFinished: true,
          lastUsed: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (8 day lifespan)
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Finished Cheese',
          quantity: 0,
          unit: 'g',
          expirationDate: null,
          location: 'fridge',
          purchaseDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
          category: 'dairy',
          isLow: false,
          isFinished: true,
          lastUsed: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (5 day lifespan)
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const categoryItems = items.filter(item => item.category === 'dairy');
      const lifespans = categoryItems
        .filter(item => item.isFinished && item.lastUsed)
        .map(item => {
          const lifespan = item.lastUsed!.getTime() - item.purchaseDate.getTime();
          return Math.ceil(lifespan / (1000 * 3600 * 24));
        });
      
      const averageLifespan = lifespans.length > 0 
        ? lifespans.reduce((sum, days) => sum + days, 0) / lifespans.length 
        : 0;

      expect(lifespans).toEqual([8, 5]);
      expect(averageLifespan).toBe(6.5);
    });

    it('calculates waste rate correctly', () => {
      const items: InventoryItem[] = [
        {
          id: '1',
          name: 'Expired Unused',
          quantity: 1,
          unit: 'pcs',
          expirationDate: twoDaysAgo, // Expired
          location: 'fridge',
          purchaseDate: fiveDaysAgo,
          category: 'dairy',
          isLow: false,
          isFinished: false,
          lastUsed: null, // Never used = waste
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Expired Used',
          quantity: 1,
          unit: 'pcs',
          expirationDate: twoDaysAgo, // Expired
          location: 'fridge',
          purchaseDate: fiveDaysAgo,
          category: 'dairy',
          isLow: false,
          isFinished: false,
          lastUsed: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Used after expiration = not waste
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Fresh Item',
          quantity: 1,
          unit: 'pcs',
          expirationDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // Future
          location: 'fridge',
          purchaseDate: fiveDaysAgo,
          category: 'dairy',
          isLow: false,
          isFinished: false,
          lastUsed: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const categoryItems = items.filter(item => item.category === 'dairy');
      const expiredItems = categoryItems.filter(item => {
        if (!item.expirationDate) return false;
        return item.expirationDate < now && (!item.lastUsed || item.lastUsed < item.expirationDate);
      });
      
      const wasteRate = categoryItems.length > 0 
        ? (expiredItems.length / categoryItems.length) * 100 
        : 0;

      expect(expiredItems).toHaveLength(1);
      expect(expiredItems[0].name).toBe('Expired Unused');
      expect(wasteRate).toBeCloseTo(33.33, 2);
    });

    it('calculates shopping frequency correctly', () => {
      const shoppingItems: ShoppingListItem[] = [
        {
          id: '1',
          name: 'Recent Purchase',
          quantity: 1,
          unit: 'pcs',
          category: 'dairy',
          isCompleted: true,
          addedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          completedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) // Within 30 days
        },
        {
          id: '2',
          name: 'Old Purchase',
          quantity: 1,
          unit: 'pcs',
          category: 'dairy',
          isCompleted: true,
          addedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
          completedAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000) // Outside 30 days
        },
        {
          id: '3',
          name: 'Pending Item',
          quantity: 1,
          unit: 'pcs',
          category: 'dairy',
          isCompleted: false,
          addedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
          // No completedAt
        }
      ];

      const categoryShoppingItems = shoppingItems.filter(item => item.category === 'dairy');
      const recentShoppingItems = categoryShoppingItems.filter(item => 
        item.isCompleted && item.completedAt && item.completedAt >= thirtyDaysAgo
      );
      
      const shoppingFrequency = recentShoppingItems.length;

      expect(recentShoppingItems).toHaveLength(1);
      expect(recentShoppingItems[0].name).toBe('Recent Purchase');
      expect(shoppingFrequency).toBe(1);
    });
  });

  describe('Usage Patterns', () => {
    it('calculates daily activity correctly', () => {
      const items: InventoryItem[] = [
        {
          id: '1',
          name: 'Added Today',
          quantity: 1,
          unit: 'pcs',
          expirationDate: null,
          location: 'fridge',
          purchaseDate: new Date(),
          category: 'other',
          isLow: false,
          isFinished: false,
          lastUsed: null,
          createdAt: now, // Added today
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Used Today',
          quantity: 1,
          unit: 'pcs',
          expirationDate: null,
          location: 'fridge',
          purchaseDate: fiveDaysAgo,
          category: 'other',
          isLow: false,
          isFinished: false,
          lastUsed: now, // Used today
          createdAt: fiveDaysAgo,
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Expired Today',
          quantity: 1,
          unit: 'pcs',
          expirationDate: now, // Expires today
          location: 'fridge',
          purchaseDate: fiveDaysAgo,
          category: 'other',
          isLow: false,
          isFinished: false,
          lastUsed: null, // Never used = expired waste
          createdAt: fiveDaysAgo,
          updatedAt: new Date()
        }
      ];

      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(now);
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

      expect(itemsAdded).toBe(1);
      expect(itemsUsed).toBe(1);
      expect(itemsExpired).toBe(1);
    });
  });
});