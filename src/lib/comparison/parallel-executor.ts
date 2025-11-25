/**
 * Parallel Executor
 * Executes generation requests across multiple models in parallel
 */

import { v4 as uuidv4 } from 'uuid';
import { ProviderFactory } from '@/lib/providers';
import type {
  ProviderName,
  GenerationOptions,
  GenerationResult,
  ComparisonRequest,
  ComparisonResult,
} from '@/types/provider';

export interface ParallelExecutionOptions {
  timeout?: number;
  abortOnFirstError?: boolean;
}

export class ParallelExecutor {
  private defaultOptions: ParallelExecutionOptions = {
    timeout: 60000, // 1 minute
    abortOnFirstError: false,
  };

  /**
   * Execute the same prompt across multiple providers in parallel
   */
  async execute(
    request: ComparisonRequest,
    options: ParallelExecutionOptions = {}
  ): Promise<ComparisonResult> {
    const opts = { ...this.defaultOptions, ...options };
    const requestId = uuidv4();
    const timestamp = new Date().toISOString();

    // Get available providers
    const availableProviders = ProviderFactory.getAvailableProviders();
    const requestedProviders = request.providers.filter((p) =>
      availableProviders.includes(p)
    );

    if (requestedProviders.length === 0) {
      return {
        requestId,
        timestamp,
        prompt: request.prompt,
        results: [],
      };
    }

    // Create generation options
    const generationOptions: GenerationOptions = {
      prompt: request.prompt,
      systemPrompt: request.systemPrompt,
      ...request.options,
    };

    // Execute in parallel with timeout
    const results = await Promise.all(
      requestedProviders.map((providerName) =>
        this.executeWithTimeout(providerName, generationOptions, opts.timeout!)
      )
    );

    return {
      requestId,
      timestamp,
      prompt: request.prompt,
      results,
    };
  }

  private async executeWithTimeout(
    providerName: ProviderName,
    options: GenerationOptions,
    timeout: number
  ): Promise<GenerationResult> {
    const provider = ProviderFactory.getInstance(providerName);

    if (!provider) {
      return this.createErrorResult(
        providerName,
        `Provider ${providerName} not configured`,
        0
      );
    }

    const startTime = Date.now();

    try {
      const result = await Promise.race([
        provider.generate(options),
        this.createTimeoutPromise(timeout, providerName),
      ]);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(providerName, errorMessage, Date.now() - startTime);
    }
  }

  private createTimeoutPromise(
    timeout: number,
    providerName: ProviderName
  ): Promise<GenerationResult> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timeout after ${timeout}ms for provider ${providerName}`));
      }, timeout);
    });
  }

  private createErrorResult(
    providerName: ProviderName,
    error: string,
    processingTimeMs: number
  ): GenerationResult {
    return {
      content: '',
      success: false,
      error,
      metadata: {
        provider: providerName,
        model: 'unknown',
        processingTimeMs,
      },
    };
  }

  /**
   * Get all available providers for comparison
   */
  getAvailableProviders(): ProviderName[] {
    return ProviderFactory.getAvailableProviders();
  }

  /**
   * Get provider info for UI display
   */
  getProviderInfo() {
    return ProviderFactory.getAllProviderInfo();
  }
}

export const parallelExecutor = new ParallelExecutor();
