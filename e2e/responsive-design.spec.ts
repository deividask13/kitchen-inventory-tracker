import { test, expect } from './fixtures';
import { devices } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should display mobile navigation on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize(devices['iPhone 12'].viewport);
    await page.goto('/');
    
    // Verify mobile navigation is visible
    await expect(page.locator('nav[aria-label="Mobile navigation"]')).toBeVisible();
    
    // Verify desktop sidebar is not visible
    await expect(page.locator('aside[aria-label="Desktop sidebar"]')).not.toBeVisible();
  });

  test('should display desktop sidebar on large screens', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Verify desktop sidebar is visible
    await expect(page.locator('aside[aria-label="Desktop sidebar"]')).toBeVisible();
    
    // Verify mobile navigation is not visible
    await expect(page.locator('nav[aria-label="Mobile navigation"]')).not.toBeVisible();
  });

  test('should adapt grid layout on different screen sizes', async ({ page }) => {
    await page.goto('/inventory');
    
    // Add some items
    for (let i = 1; i <= 6; i++) {
      await page.click('button:has-text("Add Item")');
      await page.fill('input[name="name"]', `Item ${i}`);
      await page.click('button[type="submit"]');
    }
    
    // Test mobile layout (1 column)
    await page.setViewportSize(devices['iPhone 12'].viewport);
    const mobileGrid = page.locator('.grid');
    await expect(mobileGrid).toHaveClass(/grid-cols-1/);
    
    // Test tablet layout (2 columns)
    await page.setViewportSize(devices['iPad Pro'].viewport);
    await expect(mobileGrid).toHaveClass(/md:grid-cols-2/);
    
    // Test desktop layout (3 columns)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(mobileGrid).toHaveClass(/lg:grid-cols-3/);
  });

  test('should have touch-friendly controls on mobile', async ({ page }) => {
    await page.setViewportSize(devices['iPhone 12'].viewport);
    await page.goto('/inventory');
    
    // Add an item
    await page.click('button:has-text("Add Item")');
    await page.fill('input[name="name"]', 'Touch Test');
    await page.click('button[type="submit"]');
    
    // Verify buttons have adequate touch targets (44px minimum)
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should support swipe gestures on mobile', async ({ page }) => {
    await page.setViewportSize(devices['iPhone 12'].viewport);
    await page.goto('/inventory');
    
    // Add an item
    await page.click('button:has-text("Add Item")');
    await page.fill('input[name="name"]', 'Swipe Test');
    await page.click('button[type="submit"]');
    
    // Simulate swipe gesture
    const item = page.locator('text=Swipe Test').first();
    const box = await item.boundingBox();
    
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x - 100, box.y + box.height / 2);
      await page.mouse.up();
      
      // Verify swipe actions appear
      await expect(page.locator('[aria-label="Swipe actions"]')).toBeVisible();
    }
  });

  test('should adapt font sizes for readability', async ({ page }) => {
    await page.goto('/');
    
    // Mobile - smaller fonts
    await page.setViewportSize(devices['iPhone 12'].viewport);
    const mobileHeading = page.locator('h1').first();
    const mobileSize = await mobileHeading.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Desktop - larger fonts
    await page.setViewportSize({ width: 1920, height: 1080 });
    const desktopSize = await mobileHeading.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Desktop font should be larger or equal
    expect(parseFloat(desktopSize)).toBeGreaterThanOrEqual(parseFloat(mobileSize));
  });
});
