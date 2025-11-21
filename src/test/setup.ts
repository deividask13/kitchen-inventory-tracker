import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';
import { resetDatabase, waitForDatabaseReady } from '../lib/db/test-helpers';

// Mock crypto.randomUUID for consistent testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
  }
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Reset IndexedDB and ensure database is ready before each test
beforeEach(async () => {
  // Clear all databases at the IndexedDB level
  const databases = indexedDB._databases;
  if (databases) {
    Object.keys(databases).forEach(name => {
      delete databases[name];
    });
  }

  // Reset database state and wait for initialization
  await resetDatabase();
  await waitForDatabaseReady();
});

// Cleanup after each test
afterEach(async () => {
  // Ensure any pending database operations complete
  await new Promise(resolve => setTimeout(resolve, 0));
});