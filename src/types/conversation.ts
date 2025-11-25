/**
 * Conversation and Message Types
 */

export type Platform = 'email' | 'linkedin' | 'whatsapp' | 'custom';

export type ProcessStatus =
  | 'recruiter-reach-out'
  | 'application-response'
  | 'interview-scheduling'
  | 'interview-feedback'
  | 'negotiation'
  | 'offer'
  | 'rejected'
  | 'withdrawn'
  | 'completed';

export type Scenario = 'job-hunting' | 'work' | 'personal';

export interface Message {
  id: string;
  timestamp: string;
  from: string;
  to?: string;
  subject?: string;
  body: string;
  isFromUser: boolean;
  metadata?: Record<string, unknown>;
}

export interface Thread {
  id: string;
  name: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMetadata {
  company?: string;
  contactName?: string;
  contactEmail?: string;
  platform: Platform;
  scenario: Scenario;
  processStatus?: ProcessStatus;
}

export interface JobData {
  resumePath?: string;
  jobDescriptionPath?: string;
  coverLetterPath?: string;
  salaryExpectation?: string;
  visaRequired?: boolean;
  remotePreference?: 'remote' | 'hybrid' | 'onsite' | 'flexible';
}

export interface ConversationMemory {
  thoughts: Array<{
    timestamp: string;
    content: string;
  }>;
  keyInsights: string[];
  agentMemories?: Record<string, Record<string, unknown>>;
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  metadata: ConversationMetadata;
  context: string[];
  jobData?: JobData;
  threads: Thread[];
  memory: ConversationMemory;
}

export interface SavedMessage {
  id: string;
  conversationId: string;
  threadId: string;
  title: string;
  content: string;
  generatedContent: string;
  timingRecommendation?: string;
  tone: string;
  platform: Platform;
  originalThoughts: string;
  context?: string;
  savedAt: string;
  modelUsed: string;
  metadata?: Record<string, unknown>;
}
