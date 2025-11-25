/**
 * Google Gemini Provider
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseProvider } from './base-provider';
import type {
  ProviderConfig,
  GenerationOptions,
  GenerationResult,
} from '@/types/provider';

// Pricing per 1M tokens (as of 2024)
const GEMINI_PRICING = {
  'gemini-1.5-pro': { input: 1.25, output: 5.0 },
  'gemini-1.5-flash': { input: 0.075, output: 0.3 },
  'gemini-1.0-pro': { input: 0.5, output: 1.5 },
};

export class GeminiProvider extends BaseProvider {
  readonly name = 'gemini' as const;
  readonly displayName = 'Google Gemini';
  readonly availableModels = [
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.0-pro',
  ];

  private client: GoogleGenerativeAI;

  constructor(config: ProviderConfig) {
    super(config, 'gemini-1.5-pro');
    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  async generate(options: GenerationOptions): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      const model = this.client.getGenerativeModel({
        model: this.getModel(),
        generationConfig: {
          maxOutputTokens: options.maxTokens || 4096,
          temperature: options.temperature ?? 0.7,
          ...(options.stopSequences && { stopSequences: options.stopSequences }),
        },
        ...(options.systemPrompt && {
          systemInstruction: options.systemPrompt,
        }),
      });

      const result = await this.withRetry(async () => {
        return model.generateContent(options.prompt);
      });

      const response = result.response;
      const content = response.text();

      if (!content) {
        return this.createErrorResult(
          'No content in Gemini response',
          startTime
        );
      }

      // Gemini doesn't provide token counts directly in all cases
      // We estimate based on ~4 chars per token
      const estimatedInputTokens = Math.ceil(options.prompt.length / 4);
      const estimatedOutputTokens = Math.ceil(content.length / 4);

      return this.createSuccessResult(content, {
        inputTokens: estimatedInputTokens,
        outputTokens: estimatedOutputTokens,
        tokensUsed: estimatedInputTokens + estimatedOutputTokens,
        cost: this.estimateCost(estimatedInputTokens, estimatedOutputTokens),
      }, startTime);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(errorMessage, startTime);
    }
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    const model = this.getModel();
    const pricing = GEMINI_PRICING[model as keyof typeof GEMINI_PRICING] ||
      GEMINI_PRICING['gemini-1.5-pro'];

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
  }

  validateConfig(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 0;
  }
}
