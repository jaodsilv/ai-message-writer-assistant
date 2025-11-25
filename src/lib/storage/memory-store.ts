/**
 * Memory Storage
 * Stores agent thoughts and insights for conversations
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface AgentMemory {
  [key: string]: unknown;
}

export interface ConversationMemoryStore {
  conversationId: string;
  lastUpdated: string;
  agentMemories: Record<string, AgentMemory>;
  globalInsights: string[];
  thoughtHistory: Array<{
    timestamp: string;
    agentRole: string;
    thought: string;
  }>;
}

function getDataPath(): string {
  return process.env.DATA_PATH || './data';
}

function getMemoryPath(): string {
  return path.join(getDataPath(), 'memory');
}

async function ensureMemoryDir(): Promise<void> {
  const memoryPath = getMemoryPath();
  if (!existsSync(memoryPath)) {
    await mkdir(memoryPath, { recursive: true });
  }
}

function getMemoryFilePath(conversationId: string): string {
  return path.join(getMemoryPath(), `${conversationId}-memory.yaml`);
}

/**
 * Initialize memory for a conversation
 */
export async function initializeMemory(conversationId: string): Promise<ConversationMemoryStore> {
  await ensureMemoryDir();

  const memory: ConversationMemoryStore = {
    conversationId,
    lastUpdated: new Date().toISOString(),
    agentMemories: {},
    globalInsights: [],
    thoughtHistory: [],
  };

  await saveMemory(memory);
  return memory;
}

/**
 * Save memory to disk
 */
export async function saveMemory(memory: ConversationMemoryStore): Promise<void> {
  await ensureMemoryDir();

  const filePath = getMemoryFilePath(memory.conversationId);
  const content = yaml.dump(memory, {
    lineWidth: -1,
    noRefs: true,
  });

  await writeFile(filePath, content, 'utf-8');
}

/**
 * Load memory for a conversation
 */
export async function loadMemory(conversationId: string): Promise<ConversationMemoryStore | null> {
  const filePath = getMemoryFilePath(conversationId);

  if (!existsSync(filePath)) {
    return null;
  }

  const content = await readFile(filePath, 'utf-8');
  return yaml.load(content) as ConversationMemoryStore;
}

/**
 * Get or create memory for a conversation
 */
export async function getOrCreateMemory(conversationId: string): Promise<ConversationMemoryStore> {
  const existing = await loadMemory(conversationId);

  if (existing) {
    return existing;
  }

  return initializeMemory(conversationId);
}

/**
 * Update agent-specific memory
 */
export async function updateAgentMemory(
  conversationId: string,
  agentRole: string,
  memory: AgentMemory
): Promise<ConversationMemoryStore> {
  const store = await getOrCreateMemory(conversationId);

  store.agentMemories[agentRole] = {
    ...store.agentMemories[agentRole],
    ...memory,
  };
  store.lastUpdated = new Date().toISOString();

  await saveMemory(store);
  return store;
}

/**
 * Add a thought to the history
 */
export async function addThought(
  conversationId: string,
  agentRole: string,
  thought: string
): Promise<ConversationMemoryStore> {
  const store = await getOrCreateMemory(conversationId);

  store.thoughtHistory.push({
    timestamp: new Date().toISOString(),
    agentRole,
    thought,
  });
  store.lastUpdated = new Date().toISOString();

  await saveMemory(store);
  return store;
}

/**
 * Add a global insight
 */
export async function addInsight(
  conversationId: string,
  insight: string
): Promise<ConversationMemoryStore> {
  const store = await getOrCreateMemory(conversationId);

  if (!store.globalInsights.includes(insight)) {
    store.globalInsights.push(insight);
  }
  store.lastUpdated = new Date().toISOString();

  await saveMemory(store);
  return store;
}

/**
 * Get agent memory
 */
export async function getAgentMemory(
  conversationId: string,
  agentRole: string
): Promise<AgentMemory | null> {
  const store = await loadMemory(conversationId);

  if (!store) {
    return null;
  }

  return store.agentMemories[agentRole] || null;
}

/**
 * Get recent thoughts (last N)
 */
export async function getRecentThoughts(
  conversationId: string,
  limit: number = 10
): Promise<ConversationMemoryStore['thoughtHistory']> {
  const store = await loadMemory(conversationId);

  if (!store) {
    return [];
  }

  return store.thoughtHistory.slice(-limit);
}

/**
 * Clear memory for a conversation
 */
export async function clearMemory(conversationId: string): Promise<void> {
  const filePath = getMemoryFilePath(conversationId);

  if (existsSync(filePath)) {
    const { unlink } = await import('fs/promises');
    await unlink(filePath);
  }
}
