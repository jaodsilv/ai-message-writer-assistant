import { describe, it, expect, vi } from 'vitest';
import { ClaudeAgent } from './ClaudeAgent';
import { Message } from './ModelInterface';

describe('ClaudeAgent', () => {
  it('should initialize with correct properties', () => {
    const agent = new ClaudeAgent();

    expect(agent.id).toBe('claude');
    expect(agent.name).toBe('Claude');
    expect(agent.provider).toBe('claude');
  });

  it('should generate a response', async () => {
    const mockQuery = vi.hoisted(() => vi.fn());
    vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
      query: mockQuery
    }));

    const mockStream = (async function* () {
      yield { type: 'result', subtype: 'success', result: 'Mocked response' };
    })();
    mockQuery.mockReturnValue(mockStream);

    const agent = new ClaudeAgent();
    const messages: Message[] = [
      { role: 'user', content: 'Hello' }
    ];

    const response = await agent.generateResponse(messages);
    expect(response).toBe('Mocked response');
  });

  it('should handle empty messages gracefully', async () => {
    const agent = new ClaudeAgent();
    const messages: Message[] = [];

    // The implementation returns '' if messages is empty (line 13)
    // But line 11 accesses messages[messages.length - 1] which is undefined
    // Then line 12 checks !lastMessage which is true
    // Then line 13 checks messages.length === 0 which is true, returns ''

    const response = await agent.generateResponse(messages);
    expect(response).toBe('');
  });
});
