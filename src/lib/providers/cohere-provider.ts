/**
 * Cohere Provider
 */

import { CohereClient } from 'cohere-ai';
import { BaseProvider } from './base-provider';
import type {
  ProviderConfig,
  GenerationOptions,
  GenerationResult,
} from '@/types/provider';

// Pricing per 1M tokens
const COHERE_PRICING = {
  'command-r-plus': { input: 2.5, output: 10.0 },
  'command-r': { input: 0.15, output: 0.6 },
  'command': { input: 1.0, output: 2.0 },
  'command-light': { input: 0.3, output: 0.6 },
};

export class CohereProvider extends BaseProvider {
  readonly name = 'cohere' as const;
  readonly displayName = 'Cohere';
  readonly availableModels = [
    'command-r-plus',
    'command-r',
    'command',
    'command-light',
  ];

  private client: CohereClient;

  constructor(config: ProviderConfig) {
    super(config, 'command-r-plus');
    this.client = new CohereClient({
      token: config.apiKey,
    });
  }

  async generate(options: GenerationOptions): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      const response = await this.withRetry(async () => {
        return this.client.chat({
          model: this.getModel(),
          message: options.prompt,
          maxTokens: options.maxTokens || 4096,
          temperature: options.temperature ?? 0.7,
          ...(options.systemPrompt && { preamble: options.systemPrompt }),
          ...(options.stopSequences && { stopSequences: options.stopSequences }),
        });
      });

      const content = response.text;
      if (!content) {
        return this.createErrorResult(
          'No content in Cohere response',
          startTime
        );
      }

      // Cohere provides token counts in meta
      const inputTokens = response.meta?.tokens?.inputTokens || 0;
      const outputTokens = response.meta?.tokens?.outputTokens || 0;

      return this.createSuccessResult(content, {
        inputTokens,
        outputTokens,
        tokensUsed: inputTokens + outputTokens,
        cost: this.estimateCost(inputTokens, outputTokens),
      }, startTime);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(errorMessage, startTime);
    }
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    const model = this.getModel();
    const pricing = COHERE_PRICING[model as keyof typeof COHERE_PRICING] ||
      COHERE_PRICING['command-r-plus'];

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
  }

  validateConfig(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 0;
  }
}
