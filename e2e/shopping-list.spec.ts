import { test, expect } from './fixtures';

test.describe('Shopping List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear any existing data
    await page.evaluate(() => {
      indexedDB.deleteDatabase('KitchenInventoryDB');
    });
  });

  test('should add item to shopping list', async ({ page }) => {
    await page.goto('/shopping');
    
    // Click add item button
    await page.click('button:has-text("Add Item")');
    
    // Fill in item details
    await page.fill('input[name="name"]', 'Tomatoes');
    await page.fill('input[name="quantity"]', '3');
    await page.selectOption('select[name="unit"]', 'kg');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify item appears
    await expect(page.locator('text=Tomatoes')).toBeVisible();
    await expect(page.locator('text=3 kg')).toBeVisible();
  });

  test('should check off shopping list item', async ({ page }) => {
    await page.goto('/shopping');
    
    // Add an item
    await page.click('button:has-text("Add Item")');
    await page.fill('input[name="name"]', 'Carrots');
    await page.click('button[type="submit"]');
    
    // Check off the item
    await page.click('input[type="checkbox"]');
    
    // Verify item is marked as completed (strikethrough or different style)
    const item = page.locator('text=Carrots');
    await expect(item).toHaveClass(/completed|line-through/);
  });

  test('should clear completed items', async ({ page }) => {
    await page.goto('/shopping');
    
    // Add multiple items
    await page.click('button:has-text("Add Item")');
    await page.fill('input[name="name"]', 'Item 1');
    await page.click('button[type="submit"]');
    
    await page.click('button:has-text("Add Item")');
    await page.fill('input[name="name"]', 'Item 2');
    await page.click('button[type="submit"]');
    
    // Check off first item
    await page.locator('input[type="checkbox"]').first().click();
    
    // Clear completed
    await page.click('button:has-text("Clear Completed")');
    
    // Verify only uncompleted item remains
    await expect(page.locator('text=Item 1')).not.toBeVisible();
    await expect(page.locator('text=Item 2')).toBeVisible();
  });

  test('should automatically add low stock items to shopping list', async ({ page }) => {
    // Add a low stock item in inventory
    await page.goto('/inventory');
    await page.click('button:has-text("Add Item")');
    await page.fill('input[name="name"]', 'Sugar');
    await page.fill('input[name="quantity"]', '0.5');
    await page.click('button[type="submit"]');
    
    // Navigate to shopping list
    await page.goto('/shopping');
    
    // Verify low stock item appears (if auto-add is enabled)
    // This depends on your implementation
    await expect(page.locator('text=Sugar')).toBeVisible();
  });

  test('should work offline', async ({ page, context }) => {
    await page.goto('/shopping');
    
    // Add an item while online
    await page.click('button:has-text("Add Item")');
    await page.fill('input[name="name"]', 'Offline Item');
    await page.click('button[type="submit"]');
    
    // Go offline
    await context.setOffline(true);
    
    // Verify item is still visible
    await expect(page.locator('text=Offline Item')).toBeVisible();
    
    // Try to check off item offline
    await page.click('input[type="checkbox"]');
    
    // Verify it works offline
    const item = page.locator('text=Offline Item');
    await expect(item).toHaveClass(/completed|line-through/);
  });
});
