import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Orchestrator } from './Orchestrator';
import { MemoryManager } from './MemoryManager';
import { ModelInterface, Message } from './ModelInterface';

// Mock MemoryManager
vi.mock('./MemoryManager', () => {
    return {
        MemoryManager: vi.fn().mockImplementation(() => ({
            // Add methods as needed
        })),
    };
});

// Mock Agent
class MockAgent implements ModelInterface {
    id: string;
    name: string;
    provider: 'other';

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.provider = 'other';
    }

    generateResponse = vi.fn().mockResolvedValue('Mock response');
}

describe('Orchestrator', () => {
    let orchestrator: Orchestrator;
    let mockMemoryManager: any;

    beforeEach(() => {
        mockMemoryManager = new MemoryManager({} as any);
        orchestrator = new Orchestrator(mockMemoryManager);
    });

    it('should register an agent', () => {
        const agent = new MockAgent('test-agent', 'Test Agent');
        orchestrator.registerAgent(agent);

        expect(orchestrator.getAgent('test-agent')).toBe(agent);
    });

    it('should return undefined for unknown agent', () => {
        expect(orchestrator.getAgent('unknown-agent')).toBeUndefined();
    });

    it('should get all agents', () => {
        const agent1 = new MockAgent('agent1', 'Agent 1');
        const agent2 = new MockAgent('agent2', 'Agent 2');

        orchestrator.registerAgent(agent1);
        orchestrator.registerAgent(agent2);

        const agents = orchestrator.getAllAgents();
        expect(agents).toHaveLength(2);
        expect(agents).toContain(agent1);
        expect(agents).toContain(agent2);
    });

    it('should route message to specific agent', async () => {
        const agent = new MockAgent('test-agent', 'Test Agent');
        orchestrator.registerAgent(agent);

        const messages: Message[] = [{ role: 'user', content: 'Hello' }];
        const response = await orchestrator.routeMessage('test-agent', messages);

        expect(agent.generateResponse).toHaveBeenCalledWith(messages, undefined);
        expect(response).toBe('Mock response');
    });

    it('should throw error when routing to unknown agent', async () => {
        const messages: Message[] = [{ role: 'user', content: 'Hello' }];
        await expect(orchestrator.routeMessage('unknown-agent', messages)).rejects.toThrow('Agent unknown-agent not found');
    });

    it('should broadcast message to all agents', async () => {
        const agent1 = new MockAgent('agent1', 'Agent 1');
        const agent2 = new MockAgent('agent2', 'Agent 2');

        // Mock different responses
        agent1.generateResponse.mockResolvedValue('Response 1');
        agent2.generateResponse.mockResolvedValue('Response 2');

        orchestrator.registerAgent(agent1);
        orchestrator.registerAgent(agent2);

        const messages: Message[] = [{ role: 'user', content: 'Hello' }];
        const results = await orchestrator.broadcastMessage(messages);

        expect(results.size).toBe(2);
        expect(results.get('agent1')).toBe('Response 1');
        expect(results.get('agent2')).toBe('Response 2');
    });

    it('should handle errors during broadcast', async () => {
        const agent1 = new MockAgent('agent1', 'Agent 1');
        const agent2 = new MockAgent('agent2', 'Agent 2');

        agent1.generateResponse.mockResolvedValue('Response 1');
        agent2.generateResponse.mockRejectedValue(new Error('Agent failed'));

        orchestrator.registerAgent(agent1);
        orchestrator.registerAgent(agent2);

        const messages: Message[] = [{ role: 'user', content: 'Hello' }];
        const results = await orchestrator.broadcastMessage(messages);

        expect(results.get('agent1')).toBe('Response 1');
        expect(results.get('agent2')).toBe('Error: Agent failed');
    });
});
