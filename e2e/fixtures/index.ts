import { test as base, expect } from '@playwright/test';
import { injectCryptoPolyfill } from './crypto-polyfill';

/**
 * Extended Playwright test fixtures that automatically inject the crypto polyfill.
 * 
 * This ensures that all E2E tests have access to crypto.randomUUID without
 * needing to manually inject the polyfill in each test file.
 * 
 * Usage:
 * ```typescript
 * import { test, expect } from './fixtures';
 * 
 * test('my test', async ({ page }) => {
 *   // crypto.randomUUID is now available in the page context
 *   await page.goto('/');
 * });
 * ```
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Inject crypto polyfill before the test uses the page
    await injectCryptoPolyfill(page);
    
    // Set up localStorage to skip onboarding modal and disable Next.js dev overlay in tests
    await page.addInitScript(() => {
      // Mark onboarding as completed to prevent the modal from showing
      localStorage.setItem('hasCompletedOnboarding', 'true');
      
      // Disable Next.js dev overlay that can block clicks in tests
      window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
      window.__NEXT_DATA__.props = window.__NEXT_DATA__.props || {};
      window.__NEXT_DATA__.props.pageProps = window.__NEXT_DATA__.props.pageProps || {};
    });
    
    // Provide the page to the test
    await use(page);
  },
});

// Re-export expect for convenience
export { expect };
