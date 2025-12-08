import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryManager, Conversation } from './MemoryManager';

// Create a mock storage service
const createMockStorageService = () => ({
    save: vi.fn(),
    load: vi.fn(),
    list: vi.fn(),
});

describe('MemoryManager', () => {
    let memoryManager: MemoryManager;
    let mockStorageService: any;

    beforeEach(() => {
        mockStorageService = createMockStorageService();
        memoryManager = new MemoryManager(mockStorageService as any);
        vi.clearAllMocks();
    });

    it('should initialize correctly', () => {
        expect(memoryManager).toBeDefined();
    });

    it('should save a conversation', async () => {
        const conversation: Conversation = {
            id: 'test-123',
            title: 'Test Conversation',
            messages: [
                { role: 'user', content: 'Hello' },
                { role: 'assistant', content: 'Hi there' }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await memoryManager.saveConversation(conversation);

        expect(mockStorageService.save).toHaveBeenCalledWith(
            'conversations',
            'test-123',
            conversation
        );
    });

    it('should get a conversation', async () => {
        const conversation: Conversation = {
            id: 'test-123',
            title: 'Test Conversation',
            messages: [{ role: 'user', content: 'Hello' }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        mockStorageService.load.mockResolvedValue(conversation);

        const result = await memoryManager.getConversation('test-123');

        expect(mockStorageService.load).toHaveBeenCalledWith('conversations', 'test-123');
        expect(result).toEqual(conversation);
    });

    it('should return null for non-existent conversation', async () => {
        mockStorageService.load.mockResolvedValue(null);

        const result = await memoryManager.getConversation('non-existent');

        expect(result).toBeNull();
    });

    it('should list conversations', async () => {
        const conversationIds = ['conv-1', 'conv-2', 'conv-3'];
        mockStorageService.list.mockResolvedValue(conversationIds);

        const result = await memoryManager.listConversations();

        expect(mockStorageService.list).toHaveBeenCalledWith('conversations');
        expect(result).toEqual(conversationIds);
    });

    it('should save a thought', async () => {
        const thought = { content: 'This is a thought', type: 'observation' };
        mockStorageService.load.mockResolvedValue(null);

        await memoryManager.saveThought('conv-123', thought);

        expect(mockStorageService.load).toHaveBeenCalledWith('thoughts', 'conv-123');
        expect(mockStorageService.save).toHaveBeenCalledWith(
            'thoughts',
            'conv-123',
            expect.objectContaining({
                items: expect.arrayContaining([
                    expect.objectContaining({
                        content: 'This is a thought',
                        type: 'observation',
                        timestamp: expect.any(String)
                    })
                ])
            })
        );
    });

    it('should get thoughts', async () => {
        const thoughts = {
            items: [
                { content: 'Thought 1', timestamp: new Date().toISOString() },
                { content: 'Thought 2', timestamp: new Date().toISOString() }
            ]
        };
        mockStorageService.load.mockResolvedValue(thoughts);

        const result = await memoryManager.getThoughts('conv-123');

        expect(mockStorageService.load).toHaveBeenCalledWith('thoughts', 'conv-123');
        expect(result).toEqual(thoughts.items);
    });

    it('should return empty array for non-existent thoughts', async () => {
        mockStorageService.load.mockResolvedValue(null);

        const result = await memoryManager.getThoughts('non-existent');

        expect(result).toEqual([]);
    });

    it('should convert legacy conversation format', async () => {
        const legacyData = {
            subject: 'Legacy Subject',
            conversation_history: [
                { from: 'me', body: 'Hello', timestamp: '2024-01-01T00:00:00Z' },
                { from: 'assistant', body: 'Hi', timestamp: '2024-01-01T00:01:00Z' }
            ],
            context: 'some context',
            platform: 'email',
            process_status: 'active'
        };

        mockStorageService.load.mockResolvedValue(legacyData);

        const result = await memoryManager.getConversation('legacy-123');

        expect(result).toMatchObject({
            id: 'legacy-123',
            title: 'Legacy Subject',
            messages: [
                { role: 'user', content: 'Hello' },
                { role: 'assistant', content: 'Hi' }
            ],
            metadata: {
                context: 'some context',
                platform: 'email',
                process_status: 'active'
            }
        });
    });
});
