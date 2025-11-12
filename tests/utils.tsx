import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Mock window.claude for testing
const mockClaude = {
  generateMessage: vi.fn(),
  summarizeThread: vi.fn(),
};

// Setup global window.claude mock
Object.defineProperty(window, 'claude', {
  value: mockClaude,
  writable: true,
});

// Custom render function for components
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    ...options,
  });
};

// Test utilities
export const mockClaudeAPI = {
  reset: () => {
    vi.clearAllMocks();
  },
  mockGenerateMessage: (response: any) => {
    mockClaude.generateMessage.mockResolvedValue(response);
  },
  mockGenerateMessageError: (error: any) => {
    mockClaude.generateMessage.mockRejectedValue(error);
  },
  mockSummarizeThread: (response: any) => {
    mockClaude.summarizeThread.mockResolvedValue(response);
  },
};

// Export everything
export * from '@testing-library/react';
export { customRender as render };
export { mockClaude };