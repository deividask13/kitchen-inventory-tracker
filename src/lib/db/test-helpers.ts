import { db, KitchenInventoryDB } from './schema';

/**
 * Test helper utilities for database initialization and cleanup
 * These functions ensure proper database state management in test environments
 */

// Track database ready state
let isReady = false;

// Listen to database ready event
db.on('ready', () => {
  isReady = true;
});

/**
 * Check if the database is ready for operations
 * @returns {boolean} True if database is initialized and ready
 */
export function isDatabaseReady(): boolean {
  return isReady && db.isOpen();
}

/**
 * Wait for the database to be ready before proceeding
 * Listens to Dexie's ready event and resolves when database is initialized
 * 
 * @param {number} timeout - Maximum time to wait in milliseconds (default: 5000ms)
 * @returns {Promise<void>} Resolves when database is ready, rejects on timeout
 * @throws {Error} If database fails to initialize within timeout period
 */
export async function waitForDatabaseReady(timeout: number = 5000): Promise<void> {
  // If already ready, return immediately
  if (isDatabaseReady()) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    // Set up timeout
    const timeoutId = setTimeout(() => {
      reject(new Error(
        `Database initialization timeout after ${timeout}ms. ` +
        `Current state: isOpen=${db.isOpen()}, isReady=${isReady}`
      ));
    }, timeout);

    // Wait for ready event
    const checkReady = () => {
      if (isDatabaseReady()) {
        clearTimeout(timeoutId);
        resolve();
      } else {
        // Check again on next tick
        setTimeout(checkReady, 10);
      }
    };

    checkReady();
  });
}

/**
 * Reset the database to a clean state
 * Clears all tables and re-initializes with default data
 * Useful for ensuring test isolation between test runs
 * 
 * @returns {Promise<void>} Resolves when database is cleared and re-initialized
 */
export async function resetDatabase(): Promise<void> {
  try {
    // Clear all tables
    await Promise.all([
      db.inventoryItems.clear(),
      db.shoppingItems.clear(),
      db.categories.clear(),
      db.settings.clear()
    ]);

    // Reset ready state
    isReady = false;

    // Re-initialize defaults
    await db.initializeDefaults();

    // Mark as ready
    isReady = true;

    // Wait a tick to ensure all operations complete
    await new Promise(resolve => setTimeout(resolve, 0));
  } catch (error) {
    // If database is not open, try to open it first
    if (!db.isOpen()) {
      await db.open();
      // Retry the reset
      return resetDatabase();
    }
    throw error;
  }
}
