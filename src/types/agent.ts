/**
 * Multi-Agent System Types
 */

export type AgentRole =
  | 'orchestrator'
  | 'context-analyzer'
  | 'tone-calibrator'
  | 'content-generator'
  | 'platform-formatter'
  | 'quality-reviewer'
  | 'job-hunting-specialist'
  | 'memory-manager'
  | 'result-combiner';

export type AgentStatus =
  | 'idle'
  | 'running'
  | 'completed'
  | 'error';

export interface AgentInput {
  rawThoughts: string;
  conversationContext?: string;
  platform: string;
  tone: string;
  scenario: string;
  additionalContext?: Record<string, unknown>;
}

export interface AgentOutput {
  agentId: string;
  role: AgentRole;
  status: AgentStatus;
  result?: unknown;
  error?: string;
  processingTimeMs: number;
  metadata?: Record<string, unknown>;
}

export interface AgentConfig {
  role: AgentRole;
  enabled: boolean;
  priority: number;
  model?: string;
  systemPrompt?: string;
  timeout?: number;
}

export interface Agent {
  readonly id: string;
  readonly role: AgentRole;
  readonly config: AgentConfig;

  process(input: AgentInput): Promise<AgentOutput>;
  getStatus(): AgentStatus;
}

// Orchestrator specific types
export interface OrchestrationPlan {
  agents: AgentRole[];
  parallelGroups: AgentRole[][];
  estimatedTimeMs: number;
}

export interface OrchestrationResult {
  planId: string;
  startTime: string;
  endTime: string;
  totalTimeMs: number;
  agentOutputs: AgentOutput[];
  finalResult: {
    generatedMessage: string;
    timingRecommendation?: string;
    alternatives?: string[];
    qualityScore?: number;
    improvements?: string[];
  };
}

// Debug and tracing types
export interface AgentTrace {
  agentId: string;
  role: AgentRole;
  startTime: string;
  endTime: string;
  input: AgentInput;
  output: AgentOutput;
  logs: AgentLog[];
}

export interface AgentLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: unknown;
}

export interface ExecutionTrace {
  requestId: string;
  startTime: string;
  endTime: string;
  plan: OrchestrationPlan;
  traces: AgentTrace[];
  result: OrchestrationResult;
}
