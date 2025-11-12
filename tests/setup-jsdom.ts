import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock environment variables for testing
process.env.ANTHROPIC_API_KEY = 'sk-1234567890abcdef1234567890abcdef1234567890abcdef';
process.env.NODE_ENV = 'test';

// Mock CSS imports
vi.mock('*.css', () => ({}));

// Mock window.matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
});