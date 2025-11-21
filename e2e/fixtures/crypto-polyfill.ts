import { Page } from '@playwright/test';

/**
 * Injects a crypto.randomUUID polyfill into the page context.
 * This ensures that crypto.randomUUID is available in Playwright tests
 * across all browser engines (Chromium, Firefox, WebKit).
 * 
 * The polyfill only applies if crypto.randomUUID is not already present,
 * ensuring we don't override existing functionality.
 */
export async function injectCryptoPolyfill(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Only add polyfill if crypto.randomUUID doesn't exist
    if (!window.crypto?.randomUUID) {
      // Ensure crypto object exists
      if (!window.crypto) {
        (window as any).crypto = {};
      }

      // Simple UUID v4 implementation
      // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      // where x is any hexadecimal digit and y is one of 8, 9, A, or B
      window.crypto.randomUUID = function (): `${string}-${string}-${string}-${string}-${string}` {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }) as `${string}-${string}-${string}-${string}-${string}`;
      };
    }
  });
}
