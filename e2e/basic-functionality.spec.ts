import { test, expect } from './fixtures';

test.describe('Basic Functionality', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded
    await expect(page).toHaveTitle(/Kitchen Inventory/i);
  });

  test('should navigate to inventory page', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    
    // Verify inventory page loaded
    await expect(page.locator('h1')).toContainText(/inventory/i, { timeout: 10000 });
    await expect(page.locator('button:has-text("Add Item")')).toBeVisible();
  });

  test('should navigate to dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Verify dashboard page loaded
    await expect(page.locator('h1')).toContainText(/dashboard/i, { timeout: 10000 });
  });

  test('should navigate to shopping page', async ({ page }) => {
    await page.goto('/shopping');
    await page.waitForLoadState('networkidle');
    
    // Verify shopping page loaded
    await expect(page.locator('h1')).toContainText(/shopping/i, { timeout: 10000 });
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Verify settings page loaded
    await expect(page.locator('h1')).toContainText(/settings/i, { timeout: 10000 });
  });

  test('should open add item modal on inventory page', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    
    // Click add item button
    await page.click('button:has-text("Add Item")');
    
    // Verify modal appears
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  });

  test('should close modal when clicking cancel', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    
    // Open modal
    await page.click('button:has-text("Add Item")');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Click cancel button
    await page.click('button:has-text("Cancel")');
    
    // Verify modal closes
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
  });

  test('should display empty state when no items', async ({ page }) => {
    // Clear database
    await page.goto('/');
    await page.evaluate(() => {
      return indexedDB.databases().then(dbs => {
        return Promise.all(
          dbs.map(db => db.name ? indexedDB.deleteDatabase(db.name) : Promise.resolve())
        );
      });
    });
    
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    
    // Verify empty state message (check for either message)
    const hasEmptyMessage = await page.locator('text=/no items/i').isVisible().catch(() => false);
    const hasStartMessage = await page.locator('text=/start by adding/i').isVisible().catch(() => false);
    
    expect(hasEmptyMessage || hasStartMessage).toBeTruthy();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    
    // Verify page is responsive - use first() to avoid strict mode violation
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('button:has-text("Add Item")')).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    
    // Verify page is responsive - use first() to avoid strict mode violation
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('button:has-text("Add Item")')).toBeVisible();
  });

  test('should be responsive on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    
    // Verify page is responsive - use first() to avoid strict mode violation
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('button:has-text("Add Item")')).toBeVisible();
  });
});
