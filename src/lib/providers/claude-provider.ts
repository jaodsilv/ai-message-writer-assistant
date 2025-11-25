/**
 * Claude (Anthropic) Provider
 */

import Anthropic from '@anthropic-ai/sdk';
import { BaseProvider } from './base-provider';
import type {
  ProviderConfig,
  GenerationOptions,
  GenerationResult,
} from '@/types/provider';

// Pricing per 1M tokens (as of 2024)
const CLAUDE_PRICING = {
  'claude-sonnet-4-5-20250929': { input: 3.0, output: 15.0 },
  'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
  'claude-3-5-haiku-20241022': { input: 0.25, output: 1.25 },
  'claude-3-opus-20240229': { input: 15.0, output: 75.0 },
};

export class ClaudeProvider extends BaseProvider {
  readonly name = 'claude' as const;
  readonly displayName = 'Claude (Anthropic)';
  readonly availableModels = [
    'claude-sonnet-4-5-20250929',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
  ];

  private client: Anthropic;

  constructor(config: ProviderConfig) {
    super(config, 'claude-sonnet-4-5-20250929');
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
    });
  }

  async generate(options: GenerationOptions): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      const response = await this.withRetry(async () => {
        return this.client.messages.create({
          model: this.getModel(),
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature ?? 0.7,
          system: options.systemPrompt || 'You are a helpful assistant.',
          messages: [
            {
              role: 'user',
              content: options.prompt,
            },
          ],
          ...(options.stopSequences && { stop_sequences: options.stopSequences }),
        });
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        return this.createErrorResult(
          'Unexpected response format from Claude API',
          startTime
        );
      }

      return this.createSuccessResult(content.text, {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        cost: this.estimateCost(
          response.usage.input_tokens,
          response.usage.output_tokens
        ),
      }, startTime);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorResult(errorMessage, startTime);
    }
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    const model = this.getModel();
    const pricing = CLAUDE_PRICING[model as keyof typeof CLAUDE_PRICING] ||
      CLAUDE_PRICING['claude-sonnet-4-5-20250929'];

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;

    return inputCost + outputCost;
  }

  validateConfig(): boolean {
    if (!this.config.apiKey) return false;
    // Anthropic API keys start with 'sk-ant-'
    return this.config.apiKey.startsWith('sk-ant-');
  }
}
