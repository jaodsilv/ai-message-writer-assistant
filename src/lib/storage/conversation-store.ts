/**
 * Conversation Storage
 * File-based storage for conversations using YAML format
 */

import { readFile, writeFile, mkdir, readdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { v4 as uuidv4 } from 'uuid';
import type { Conversation, Thread, Message, ConversationMetadata, ConversationMemory } from '@/types/conversation';

function getDataPath(): string {
  return process.env.DATA_PATH || './data';
}

function getConversationsPath(): string {
  return path.join(getDataPath(), 'conversations');
}

async function ensureConversationsDir(): Promise<void> {
  const conversationsPath = getConversationsPath();
  if (!existsSync(conversationsPath)) {
    await mkdir(conversationsPath, { recursive: true });
  }
}

function getConversationFilePath(id: string): string {
  return path.join(getConversationsPath(), `${id}.yaml`);
}

/**
 * Create a new conversation
 */
export async function createConversation(
  metadata: ConversationMetadata,
  context: string[] = []
): Promise<Conversation> {
  await ensureConversationsDir();

  const now = new Date().toISOString();
  const conversation: Conversation = {
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    metadata,
    context,
    threads: [
      {
        id: 'main',
        name: 'Main Thread',
        messages: [],
        createdAt: now,
        updatedAt: now,
      },
    ],
    memory: {
      thoughts: [],
      keyInsights: [],
    },
  };

  await saveConversation(conversation);
  return conversation;
}

/**
 * Save a conversation to disk
 */
export async function saveConversation(conversation: Conversation): Promise<void> {
  await ensureConversationsDir();

  const filePath = getConversationFilePath(conversation.id);
  const content = yaml.dump(conversation, {
    lineWidth: -1,
    noRefs: true,
    quotingType: '"',
  });

  await writeFile(filePath, content, 'utf-8');
}

/**
 * Load a conversation by ID
 */
export async function loadConversation(id: string): Promise<Conversation | null> {
  const filePath = getConversationFilePath(id);

  if (!existsSync(filePath)) {
    return null;
  }

  const content = await readFile(filePath, 'utf-8');
  return yaml.load(content) as Conversation;
}

/**
 * List all conversations
 */
export async function listConversations(): Promise<Conversation[]> {
  await ensureConversationsDir();

  const conversationsPath = getConversationsPath();
  const files = await readdir(conversationsPath);
  const yamlFiles = files.filter((f) => f.endsWith('.yaml'));

  const conversations: Conversation[] = [];

  for (const file of yamlFiles) {
    const content = await readFile(path.join(conversationsPath, file), 'utf-8');
    const conversation = yaml.load(content) as Conversation;
    conversations.push(conversation);
  }

  // Sort by updatedAt descending (newest first)
  return conversations.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * Delete a conversation
 */
export async function deleteConversation(id: string): Promise<boolean> {
  const filePath = getConversationFilePath(id);

  if (!existsSync(filePath)) {
    return false;
  }

  await unlink(filePath);
  return true;
}

/**
 * Add a message to a thread
 */
export async function addMessage(
  conversationId: string,
  threadId: string,
  message: Omit<Message, 'id'>
): Promise<Conversation | null> {
  const conversation = await loadConversation(conversationId);

  if (!conversation) {
    return null;
  }

  const thread = conversation.threads.find((t) => t.id === threadId);

  if (!thread) {
    return null;
  }

  const now = new Date().toISOString();
  const newMessage: Message = {
    ...message,
    id: uuidv4(),
  };

  thread.messages.push(newMessage);
  thread.updatedAt = now;
  conversation.updatedAt = now;

  await saveConversation(conversation);
  return conversation;
}

/**
 * Add a new thread to a conversation
 */
export async function addThread(
  conversationId: string,
  name: string
): Promise<Thread | null> {
  const conversation = await loadConversation(conversationId);

  if (!conversation) {
    return null;
  }

  const now = new Date().toISOString();
  const thread: Thread = {
    id: uuidv4(),
    name,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  conversation.threads.push(thread);
  conversation.updatedAt = now;

  await saveConversation(conversation);
  return thread;
}

/**
 * Update conversation metadata
 */
export async function updateConversationMetadata(
  conversationId: string,
  metadata: Partial<ConversationMetadata>
): Promise<Conversation | null> {
  const conversation = await loadConversation(conversationId);

  if (!conversation) {
    return null;
  }

  conversation.metadata = { ...conversation.metadata, ...metadata };
  conversation.updatedAt = new Date().toISOString();

  await saveConversation(conversation);
  return conversation;
}

/**
 * Add context to a conversation
 */
export async function addContext(
  conversationId: string,
  context: string
): Promise<Conversation | null> {
  const conversation = await loadConversation(conversationId);

  if (!conversation) {
    return null;
  }

  conversation.context.push(context);
  conversation.updatedAt = new Date().toISOString();

  await saveConversation(conversation);
  return conversation;
}

/**
 * Update conversation memory
 */
export async function updateMemory(
  conversationId: string,
  memory: Partial<ConversationMemory>
): Promise<Conversation | null> {
  const conversation = await loadConversation(conversationId);

  if (!conversation) {
    return null;
  }

  if (memory.thoughts) {
    conversation.memory.thoughts.push(...memory.thoughts);
  }

  if (memory.keyInsights) {
    conversation.memory.keyInsights.push(...memory.keyInsights);
  }

  if (memory.agentMemories) {
    conversation.memory.agentMemories = {
      ...conversation.memory.agentMemories,
      ...memory.agentMemories,
    };
  }

  conversation.updatedAt = new Date().toISOString();

  await saveConversation(conversation);
  return conversation;
}

/**
 * Search conversations
 */
export async function searchConversations(query: string): Promise<Conversation[]> {
  const conversations = await listConversations();
  const lowerQuery = query.toLowerCase();

  return conversations.filter((conv) => {
    // Search in metadata
    if (conv.metadata.company?.toLowerCase().includes(lowerQuery)) return true;
    if (conv.metadata.contactName?.toLowerCase().includes(lowerQuery)) return true;

    // Search in context
    if (conv.context.some((c) => c.toLowerCase().includes(lowerQuery))) return true;

    // Search in messages
    for (const thread of conv.threads) {
      for (const message of thread.messages) {
        if (message.body.toLowerCase().includes(lowerQuery)) return true;
        if (message.subject?.toLowerCase().includes(lowerQuery)) return true;
      }
    }

    return false;
  });
}
