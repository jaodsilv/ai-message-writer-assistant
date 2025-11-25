/**
 * Base LLM Provider Abstract Class
 * All providers must extend this class
 */

import type {
  ProviderName,
  ProviderConfig,
  GenerationOptions,
  GenerationResult,
  LLMProvider,
} from '@/types/provider';

export abstract class BaseProvider implements LLMProvider {
  abstract readonly name: ProviderName;
  abstract readonly displayName: string;
  abstract readonly availableModels: string[];

  protected config: ProviderConfig;
  protected defaultModel: string;

  constructor(config: ProviderConfig, defaultModel: string) {
    this.config = config;
    this.defaultModel = defaultModel;
  }

  abstract generate(options: GenerationOptions): Promise<GenerationResult>;

  validateConfig(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 0;
  }

  getConfig(): ProviderConfig {
    return { ...this.config };
  }

  abstract estimateCost(inputTokens: number, outputTokens: number): number;

  protected getModel(): string {
    return this.config.model || this.defaultModel;
  }

  protected createSuccessResult(
    content: string,
    metadata: Partial<GenerationResult['metadata']>,
    startTime: number
  ): GenerationResult {
    return {
      content,
      success: true,
      metadata: {
        provider: this.name,
        model: this.getModel(),
        processingTimeMs: Date.now() - startTime,
        ...metadata,
      },
    };
  }

  protected createErrorResult(
    error: string,
    startTime: number
  ): GenerationResult {
    return {
      content: '',
      success: false,
      error,
      metadata: {
        provider: this.name,
        model: this.getModel(),
        processingTimeMs: Date.now() - startTime,
      },
    };
  }

  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.config.maxRetries || 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }
}
