import { StorageService } from '../services/StorageService';
import { Message } from './ModelInterface';

export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
    metadata?: any;
}

export class MemoryManager {
    private storage: StorageService;

    constructor(storage: StorageService) {
        this.storage = storage;
    }

    async saveConversation(conversation: Conversation): Promise<void> {
        await this.storage.save('conversations', conversation.id, conversation);
    }

    async getConversation(id: string): Promise<Conversation | null> {
        const data = await this.storage.load('conversations', id);
        if (!data) return null;

        // Adapter for legacy format
        if (data.conversation_history) {
            const messages: Message[] = data.conversation_history.map((item: any) => {
                let role: 'user' | 'assistant' | 'system' = 'user';
                if (item.from === 'me') {
                    role = 'user';
                } else {
                    role = 'assistant';
                }
                return {
                    role,
                    content: item.body || ''
                };
            });

            return {
                id,
                title: data.subject || id,
                messages,
                createdAt: data.conversation_history[0]?.timestamp || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                metadata: {
                    context: data.context,
                    platform: data.platform,
                    process_status: data.process_status
                }
            };
        }

        return data as Conversation;
    }

    async listConversations(): Promise<string[]> {
        return this.storage.list('conversations');
    }

    async saveThought(conversationId: string, thought: any): Promise<void> {
        const thoughts = await this.storage.load('thoughts', conversationId) || { items: [] };
        thoughts.items.push({ ...thought, timestamp: new Date().toISOString() });
        await this.storage.save('thoughts', conversationId, thoughts);
    }

    async getThoughts(conversationId: string): Promise<any[]> {
        const thoughts = await this.storage.load('thoughts', conversationId);
        return thoughts ? thoughts.items : [];
    }
}
