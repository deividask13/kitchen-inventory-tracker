import { test, expect } from './fixtures';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear any existing data
    await page.evaluate(() => {
      indexedDB.deleteDatabase('KitchenInventoryDB');
    });
  });

  test('should display dashboard stats', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verify key stats are visible
    await expect(page.locator('text=/Total Items/i')).toBeVisible();
    await expect(page.locator('text=/Expiring Soon/i')).toBeVisible();
    await expect(page.locator('text=/Low Stock/i')).toBeVisible();
  });

  test('should show expiring items widget', async ({ page }) => {
    // Add an item with near expiration date
    await page.goto('/inventory');
    await page.click('button:has-text("Add Item")');
    await page.fill('input[name="name"]', 'Yogurt');
    
    // Set expiration date to 3 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    await page.fill('input[name="expirationDate"]', futureDate.toISOString().split('T')[0]);
    
    await page.click('button[type="submit"]');
    
    // Go to dashboard
    await page.goto('/dashboard');
    
    // Verify expiring item appears in widget
    await expect(page.locator('text=Yogurt')).toBeVisible();
    await expect(page.locator('text=/expiring/i')).toBeVisible();
  });

  test('should display quick actions panel', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verify quick actions are available
    await expect(page.locator('button:has-text("Add Item")')).toBeVisible();
    await expect(page.locator('button:has-text("Shopping List")')).toBeVisible();
  });

  test('should navigate to inventory from quick action', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click add item quick action
    await page.click('button:has-text("Add Item")');
    
    // Verify navigation to inventory page
    await expect(page).toHaveURL(/\/inventory/);
  });

  test('should show insights for unused items', async ({ page }) => {
    // Add an item with old purchase date
    await page.goto('/inventory');
    await page.click('button:has-text("Add Item")');
    await page.fill('input[name="name"]', 'Old Spice');
    
    // Set purchase date to 40 days ago
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 40);
    await page.fill('input[name="purchaseDate"]', oldDate.toISOString().split('T')[0]);
    
    await page.click('button[type="submit"]');
    
    // Go to dashboard
    await page.goto('/dashboard');
    
    // Verify unused item insight appears
    await expect(page.locator('text=/unused/i')).toBeVisible();
  });

  test('should update stats in real-time', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Get initial count
    const initialCount = await page.locator('text=/Total Items/i').textContent();
    
    // Add an item
    await page.goto('/inventory');
    await page.click('button:has-text("Add Item")');
    await page.fill('input[name="name"]', 'New Item');
    await page.click('button[type="submit"]');
    
    // Go back to dashboard
    await page.goto('/dashboard');
    
    // Verify count increased
    const newCount = await page.locator('text=/Total Items/i').textContent();
    expect(newCount).not.toBe(initialCount);
  });
});
