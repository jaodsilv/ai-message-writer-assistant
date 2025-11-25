/**
 * Base Agent Abstract Class
 * All agents must extend this class
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Agent,
  AgentRole,
  AgentConfig,
  AgentInput,
  AgentOutput,
  AgentStatus,
} from '@/types/agent';
import type { LLMProvider, GenerationOptions } from '@/types/provider';
import { ProviderFactory } from '@/lib/providers';

export abstract class BaseAgent implements Agent {
  readonly id: string;
  abstract readonly role: AgentRole;
  readonly config: AgentConfig;

  protected provider: LLMProvider | null = null;
  protected status: AgentStatus = 'idle';

  constructor(config: Partial<AgentConfig> = {}) {
    this.id = uuidv4();
    this.config = {
      role: 'orchestrator', // Will be overridden by subclass
      enabled: true,
      priority: 0,
      ...config,
    };

    // Initialize provider
    this.initializeProvider();
  }

  private initializeProvider(): void {
    const defaultProvider = process.env.DEFAULT_MODEL_PROVIDER || 'claude';
    this.provider = ProviderFactory.getInstance(defaultProvider as never) || null;
  }

  abstract process(input: AgentInput): Promise<AgentOutput>;

  getStatus(): AgentStatus {
    return this.status;
  }

  protected setStatus(status: AgentStatus): void {
    this.status = status;
  }

  protected async generateWithLLM(
    prompt: string,
    systemPrompt?: string
  ): Promise<string> {
    if (!this.provider) {
      throw new Error('No LLM provider available');
    }

    const options: GenerationOptions = {
      prompt,
      systemPrompt: systemPrompt || this.config.systemPrompt,
      temperature: 0.7,
      maxTokens: 4096,
    };

    const result = await this.provider.generate(options);

    if (!result.success) {
      throw new Error(result.error || 'LLM generation failed');
    }

    return result.content;
  }

  protected createSuccessOutput(
    result: unknown,
    startTime: number,
    metadata?: Record<string, unknown>
  ): AgentOutput {
    return {
      agentId: this.id,
      role: this.role,
      status: 'completed',
      result,
      processingTimeMs: Date.now() - startTime,
      metadata,
    };
  }

  protected createErrorOutput(
    error: string,
    startTime: number
  ): AgentOutput {
    return {
      agentId: this.id,
      role: this.role,
      status: 'error',
      error,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
