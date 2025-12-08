import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loader, action } from './chat';
import { getServices } from '../services/container';

// Mock dependencies
vi.mock('../services/container');

describe('Chat Route', () => {
  let mockServices: any;

  beforeEach(() => {
    mockServices = {
      memoryManager: {
        getConversation: vi.fn(),
        saveConversation: vi.fn(),
      },
      fileRepository: {
        list: vi.fn(),
        archive: vi.fn(),
        restore: vi.fn(),
        delete: vi.fn(),
      },
      orchestrator: {
        routeMessage: vi.fn(),
        getAvailableModels: vi.fn(),
      },
      undoService: {
        canUndo: false,
        push: vi.fn(),
        pop: vi.fn(),
      },
      messageParser: {
        parse: vi.fn(),
      }
    };
    mockServices.orchestrator.getAvailableModels.mockResolvedValue([]);
    vi.mocked(getServices).mockReturnValue(mockServices);
  });

  describe('loader', () => {
    it('should redirect to first conversation if no id provided and conversations exist', async () => {
      mockServices.fileRepository.list.mockResolvedValue(['conv-1', 'conv-2']);
      const request = new Request('http://localhost/chat');

      const response = await loader({ request, params: {}, context: {} } as any);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/chat?id=conv-1');
    });

    it('should return new conversation id if no id provided and no conversations exist', async () => {
      mockServices.fileRepository.list.mockResolvedValue([]);
      mockServices.memoryManager.getConversation.mockResolvedValue(null);
      const request = new Request('http://localhost/chat');

      const data = await loader({ request, params: {}, context: {} } as any);

      expect(data.conversationId).toBe('new-conversation');
      expect(data.messages).toEqual([]);
    });

    it('should return conversation data if id provided', async () => {
      mockServices.fileRepository.list.mockResolvedValue(['conv-1']);
      const mockConversation = {
        id: 'conv-1',
        messages: [{ role: 'user', content: 'hello' }],
        metadata: { context: [], jobDescription: '' }
      };
      mockServices.memoryManager.getConversation.mockResolvedValue(mockConversation);

      const request = new Request('http://localhost/chat?id=conv-1');
      const data = await loader({ request, params: {}, context: {} } as any);

      expect(data.conversationId).toBe('conv-1');
      expect(data.messages).toEqual(mockConversation.messages);
    });
  });

  describe('action', () => {
    it('should handle sendMessage intent', async () => {
      const formData = new FormData();
      formData.append('intent', 'sendMessage');
      formData.append('conversationId', 'conv-1');
      formData.append('content', 'hello');

      const request = new Request('http://localhost/chat', {
        method: 'POST',
        body: formData
      });

      const mockConversation = {
        id: 'conv-1',
        messages: [],
        metadata: {}
      };
      mockServices.memoryManager.getConversation.mockResolvedValue(mockConversation);

      const result = await action({ request, params: {}, context: {} } as any);

      expect(result).toEqual({ success: true });
      expect(mockConversation.messages).toHaveLength(1);
      expect(mockConversation.messages[0]).toEqual({ role: 'user', content: 'hello' });
      expect(mockServices.memoryManager.saveConversation).toHaveBeenCalledWith(mockConversation);
    });

    it('should handle newConversation intent', async () => {
      const formData = new FormData();
      formData.append('intent', 'newConversation');

      const request = new Request('http://localhost/chat', {
        method: 'POST',
        body: formData
      });

      const response = await action({ request, params: {}, context: {} } as any);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toMatch(/^\/chat\?id=conversation-\d+/);
    });

    it('should handle generateResponse intent', async () => {
      const formData = new FormData();
      formData.append('intent', 'generateResponse');
      formData.append('conversationId', 'conv-1');
      formData.append('writerType', 'ai');
      formData.append('model', 'claude');

      const request = new Request('http://localhost/chat', {
        method: 'POST',
        body: formData
      });

      const mockConversation = {
        id: 'conv-1',
        messages: [{ role: 'user', content: 'hello' }],
        metadata: { context: [], jobDescription: '' }
      };
      mockServices.memoryManager.getConversation.mockResolvedValue(mockConversation);
      mockServices.orchestrator.routeMessage.mockResolvedValue('AI response');

      const result = await action({ request, params: {}, context: {} } as any);

      expect(result).toEqual({ success: true });
      expect(mockConversation.messages).toHaveLength(2);
      expect(mockConversation.messages[1]).toEqual({ role: 'assistant', content: 'AI response' });
      expect(mockServices.memoryManager.saveConversation).toHaveBeenCalledWith(mockConversation);
    });

    it('should handle editMessage intent', async () => {
      const formData = new FormData();
      formData.append('intent', 'editMessage');
      formData.append('conversationId', 'conv-1');
      formData.append('messageIndex', '0');
      formData.append('newContent', 'edited content');

      const request = new Request('http://localhost/chat', {
        method: 'POST',
        body: formData
      });

      const mockConversation = {
        id: 'conv-1',
        messages: [{ role: 'user', content: 'original content' }],
        metadata: {}
      };
      mockServices.memoryManager.getConversation.mockResolvedValue(mockConversation);

      const result = await action({ request, params: {}, context: {} } as any);

      expect(result).toEqual({ success: true });
      expect(mockConversation.messages[0].content).toBe('edited content');
      expect(mockServices.memoryManager.saveConversation).toHaveBeenCalledWith(mockConversation);
    });

    it('should handle deleteMessage intent', async () => {
      const formData = new FormData();
      formData.append('intent', 'deleteMessage');
      formData.append('conversationId', 'conv-1');
      formData.append('messageIndex', '0');

      const request = new Request('http://localhost/chat', {
        method: 'POST',
        body: formData
      });

      const mockConversation = {
        id: 'conv-1',
        messages: [{ role: 'user', content: 'message to delete' }],
        metadata: {}
      };
      mockServices.memoryManager.getConversation.mockResolvedValue(mockConversation);

      const result = await action({ request, params: {}, context: {} } as any);

      expect(result).toEqual({ success: true });
      expect(mockConversation.messages).toHaveLength(0);
      expect(mockServices.memoryManager.saveConversation).toHaveBeenCalledWith(mockConversation);
    });
  });
});
