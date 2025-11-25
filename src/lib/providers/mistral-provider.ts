/**
 * Mistral AI Provider
 */

import { Mistral } from '@mistralai/mistralai';
import { BaseProvider } from './base-provider';
import type {
  ProviderConfig,
  GenerationOptions,
  GenerationResult,
} from '@/types/provider';

// Pricing per 1M tokens
const MISTRAL_PRICING = {
  'mistral-large-latest': { input: 2.0, output: 6.0 },
  'mistral-medium-latest': { input: 2.7, output: 8.1 },
  'mistral-small-latest': { input: 0.2, output: 0.6 },
  'open-mixtral-8x22b': { input: 2.0, output: 6.0 },
  'open-mixtral-8x7b': { input: 0.7, output: 0.7 },
};

export class MistralProvider extends BaseProvider {
  readonly name = 'mistral' as const;
  readonly displayName = 'Mistral AI';
  readonly availableModels = [
    'mistral-large-latest',
    'mistral-medium-latest',
    'mistral-small-latest',
    'open-mixtral-8x22b',
    'open-mixtral-8x7b',
  ];

  private client: Mistral;

  constructor(config: ProviderConfig) {
    super(config, 'mistral-large-latest');
    this.client = new Mistral({
      apiKey: config.apiKey,
    });
  }

  async generate(options: GenerationOptions): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      const response = await this.withRetry(async () => {
        return this.client.chat.complete({
          model: this.getModel(),
          maxTokens: options.maxTokens || 4096,
          temperature: options.temperature ?? 0.7,
          messages: [
            ...(options.systemPrompt
              ? [{ role: 'system' as const, content: options.systemPrompt }]
              : []),
            { role: 'user' as const, content: options.prompt },
          ],
          ...(options.stopSequences && { stop: options.stopSequences }),
        });
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        return this.createErrorResult(
          'No content in Mistral response',
          startTime
        );
      }

      const inputTokens = response.usage?.promptTokens || 0;
      const outputTokens = response.usage?.completionTokens || 0;

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
    const pricing = MISTRAL_PRICING[model as keyof typeof MISTRAL_PRICING] ||
      MISTRAL_PRICING['mistral-large-latest'];

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
  }

  validateConfig(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 0;
  }
}
