import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

// Global mocks
global.fetch = vi.fn();

beforeAll(() => {
  // Add any global setup
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  // Global teardown
});
