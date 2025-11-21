import { test, expect } from './fixtures';

test.describe('Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing data
    await page.goto('/');
    await page.evaluate(() => {
      return indexedDB.databases().then(dbs => {
        return Promise.all(
          dbs.map(db => db.name ? indexedDB.deleteDatabase(db.name) : Promise.resolve())
        );
      });
    });
    await page.waitForTimeout(500);
  });

  test('should add a new inventory item', async ({ page }) => {
    // Navigate to inventory page
    await page.goto('/inventory');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click add item button
    await page.click('button:has-text("Add Item")');
    
    // Wait for modal to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Fill in the form - using placeholder or label selectors
    await page.fill('input[placeholder*="name" i], input[type="text"]:visible', 'Milk');
    await page.fill('input[type="number"]:visible', '2');
    
    // Submit the form - look for Save or Submit button
    await page.click('button:has-text("Save"), button:has-text("Submit"), button[type="submit"]');
    
    // Wait for modal to close
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
    
    // Verify item appears in the list
    await expect(page.locator('text=Milk')).toBeVisible({ timeout: 10000 });
  });

  test('should edit an existing inventory item', async ({ page }) => {
    // First, add an item
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Add Item")');
    await page.waitForSelector('[role="dialog"]');
    
    await page.fill('input[placeholder*="name" i], input[type="text"]:visible', 'Eggs');
    await page.fill('input[type="number"]:visible', '12');
    await page.click('button:has-text("Save"), button:has-text("Submit"), button[type="submit"]');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
    
    // Wait for item to appear
    await expect(page.locator('text=Eggs')).toBeVisible({ timeout: 10000 });
    
    // Click edit button - look for edit icon or button
    await page.click('[aria-label*="Edit" i], button:has-text("Edit")').catch(async () => {
      // If no explicit edit button, try clicking on the item card
      await page.locator('text=Eggs').first().click();
    });
    
    // Update quantity
    await page.waitForSelector('[role="dialog"]');
    await page.fill('input[type="number"]:visible', '6');
    await page.click('button:has-text("Save"), button:has-text("Submit"), button[type="submit"]');
    
    // Verify updated quantity
    await expect(page.locator('text=6')).toBeVisible({ timeout: 10000 });
  });

  test('should mark item as finished', async ({ page }) => {
    // Add an item
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Add Item")');
    await page.waitForSelector('[role="dialog"]');
    
    await page.fill('input[placeholder*="name" i], input[type="text"]:visible', 'Bread');
    await page.fill('input[type="number"]:visible', '1');
    await page.click('button:has-text("Save"), button:has-text("Submit"), button[type="submit"]');
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
    
    // Wait for item to appear
    await expect(page.locator('text=Bread')).toBeVisible({ timeout: 10000 });
    
    // Mark as finished - look for finished button or icon
    await page.click('[aria-label*="finished" i], [aria-label*="delete" i], button:has-text("Finished")').catch(async () => {
      // Alternative: try to find a trash or check icon
      await page.locator('[data-testid="mark-finished"], .lucide-trash, .lucide-check').first().click();
    });
    
    // Verify item is marked as finished or removed
    await page.waitForTimeout(1000); // Give time for animation
    await expect(page.locator('text=Bread')).not.toBeVisible();
  });

  test('should display inventory page', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded
    await expect(page.locator('h1:has-text("Kitchen Inventory"), h1:has-text("Inventory")')).toBeVisible();
    await expect(page.locator('button:has-text("Add Item")')).toBeVisible();
  });

  test('should open add item modal', async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    
    // Click add item button
    await page.click('button:has-text("Add Item")');
    
    // Verify modal appears
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Add New Item, text=Add Item')).toBeVisible();
  });

  test('should navigate to different pages', async ({ page }) => {
    // Test navigation
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to inventory
    await page.goto('/inventory');
    await expect(page.locator('h1:has-text("Inventory")')).toBeVisible({ timeout: 10000 });
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible({ timeout: 10000 });
    
    // Navigate to shopping
    await page.goto('/shopping');
    await expect(page.locator('h1:has-text("Shopping")')).toBeVisible({ timeout: 10000 });
  });
});
