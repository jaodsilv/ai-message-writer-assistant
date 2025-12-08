import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaudeCodeAgent } from './ClaudeCodeAgent';
import { Message } from './ModelInterface';
import * as claudeSdk from '@anthropic-ai/claude-agent-sdk';

// Mock the SDK
vi.mock('@anthropic-ai/claude-agent-sdk', () => ({
    query: vi.fn()
}));

describe('ClaudeCodeAgent', () => {
    let agent: ClaudeCodeAgent;

    beforeEach(() => {
        vi.clearAllMocks();
        agent = new ClaudeCodeAgent();
    });

    it('should initialize with correct properties', () => {
        expect(agent.id).toBe('claude-code');
        expect(agent.name).toBe('Claude Code');
        expect(agent.provider).toBe('claude');
    });

    it('should generate a response successfully', async () => {
        const messages: Message[] = [
            { role: 'user', content: 'Hello Claude Code' }
        ];

        // Mock successful stream response
        const mockStream = (async function* () {
            yield { type: 'result', subtype: 'success', result: 'Hello from Claude Code' };
        })();

        vi.mocked(claudeSdk.query).mockReturnValue(mockStream as any);

        const response = await agent.generateResponse(messages);
        expect(response).toBe('Hello from Claude Code');

        // Verify query was called with correct arguments (no API key)
        expect(claudeSdk.query).toHaveBeenCalledWith({
            prompt: 'Hello Claude Code',
            options: {
                cwd: process.cwd()
            }
        });
    });

    it('should handle execution errors', async () => {
        const messages: Message[] = [
            { role: 'user', content: 'Error please' }
        ];

        // Mock error stream response
        const mockStream = (async function* () {
            yield {
                type: 'result',
                subtype: 'error_during_execution',
                errors: ['Something went wrong']
            };
        })();

        vi.mocked(claudeSdk.query).mockReturnValue(mockStream as any);

        await expect(agent.generateResponse(messages)).rejects.toThrow('Claude Code Agent failed: error_during_execution - Something went wrong');
    });

    it('should handle empty messages gracefully', async () => {
        const messages: Message[] = [];
        const response = await agent.generateResponse(messages);
        expect(response).toBe('');
        expect(claudeSdk.query).not.toHaveBeenCalled();
    });
});
