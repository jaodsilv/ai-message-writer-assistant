/**
 * OpenAI Provider
 */

import OpenAI from 'openai';
import { BaseProvider } from './base-provider';
import type {
  ProviderConfig,
  GenerationOptions,
  GenerationResult,
} from '@/types/provider';

// Pricing per 1M tokens (as of 2024)
const OPENAI_PRICING = {
  'gpt-4o': { input: 2.5, output: 10.0 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4-turbo': { input: 10.0, output: 30.0 },
  'gpt-4': { input: 30.0, output: 60.0 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
};

export class OpenAIProvider extends BaseProvider {
  readonly name = 'openai' as const;
  readonly displayName = 'OpenAI';
  readonly availableModels = [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
  ];

  private client: OpenAI;

  constructor(config: ProviderConfig) {
    super(config, 'gpt-4o');
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
    });
  }

  async generate(options: GenerationOptions): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      const response = await this.withRetry(async () => {
        return this.client.chat.completions.create({
          model: this.getModel(),
          max_tokens: options.maxTokens || 4096,
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

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return this.createErrorResult(
          'No content in OpenAI response',
          startTime
        );
      }

      const inputTokens = response.usage?.prompt_tokens || 0;
      const outputTokens = response.usage?.completion_tokens || 0;

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
    const pricing = OPENAI_PRICING[model as keyof typeof OPENAI_PRICING] ||
      OPENAI_PRICING['gpt-4o'];

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
  }

  validateConfig(): boolean {
    if (!this.config.apiKey) return false;
    // OpenAI API keys start with 'sk-'
    return this.config.apiKey.startsWith('sk-');
  }
}
