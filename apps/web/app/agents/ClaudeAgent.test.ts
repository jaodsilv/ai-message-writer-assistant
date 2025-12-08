import { describe, it, expect, vi } from 'vitest';
import { ClaudeAgent } from './ClaudeAgent';
import { Message } from './ModelInterface';

describe('ClaudeAgent', () => {
    it('should initialize with correct properties', () => {
        const apiKey = 'test-api-key';
        const agent = new ClaudeAgent(apiKey);

        expect(agent.id).toBe('claude');
        expect(agent.name).toBe('Claude');
        expect(agent.provider).toBe('claude');
    });

    it('should generate a response', async () => {
        const apiKey = 'test-api-key';
        const agent = new ClaudeAgent(apiKey);
        const messages: Message[] = [
            { role: 'user', content: 'Hello' }
        ];

        const response = await agent.generateResponse(messages);
        expect(response).toContain('[Claude] Response to: Hello');
    });

    it('should handle empty messages gracefully', async () => {
        const apiKey = 'test-api-key';
        const agent = new ClaudeAgent(apiKey);
        // @ts-ignore - testing invalid input
        const messages: Message[] = [];

        // The current implementation might throw or return undefined if accessing index -1
        // Let's see how it behaves. Based on code: messages[messages.length - 1].content
        // This will throw if empty.

        await expect(agent.generateResponse(messages)).rejects.toThrow();
    });
});
