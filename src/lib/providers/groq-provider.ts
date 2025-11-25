/**
 * Groq Provider (Llama models)
 */

import Groq from 'groq-sdk';
import { BaseProvider } from './base-provider';
import type {
  ProviderConfig,
  GenerationOptions,
  GenerationResult,
} from '@/types/provider';

// Pricing per 1M tokens (Groq is very cheap)
const GROQ_PRICING = {
  'llama-3.3-70b-versatile': { input: 0.59, output: 0.79 },
  'llama-3.1-70b-versatile': { input: 0.59, output: 0.79 },
  'llama-3.1-8b-instant': { input: 0.05, output: 0.08 },
  'mixtral-8x7b-32768': { input: 0.24, output: 0.24 },
  'gemma2-9b-it': { input: 0.2, output: 0.2 },
};

export class GroqProvider extends BaseProvider {
  readonly name = 'groq' as const;
  readonly displayName = 'Groq (Llama)';
  readonly availableModels = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
  ];

  private client: Groq;

  constructor(config: ProviderConfig) {
    super(config, 'llama-3.3-70b-versatile');
    this.client = new Groq({
      apiKey: config.apiKey,
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
          'No content in Groq response',
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
    const pricing = GROQ_PRICING[model as keyof typeof GROQ_PRICING] ||
      GROQ_PRICING['llama-3.3-70b-versatile'];

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
  }

  validateConfig(): boolean {
    if (!this.config.apiKey) return false;
    // Groq API keys start with 'gsk_'
    return this.config.apiKey.startsWith('gsk_');
  }
}
