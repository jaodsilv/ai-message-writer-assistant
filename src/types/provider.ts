/**
 * LLM Provider Types
 */

export type ProviderName =
  | 'claude'
  | 'openai'
  | 'gemini'
  | 'groq'
  | 'mistral'
  | 'cohere';

export interface ProviderConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface GenerationOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface GenerationResult {
  content: string;
  success: boolean;
  error?: string;
  metadata: {
    provider: ProviderName;
    model: string;
    tokensUsed?: number;
    inputTokens?: number;
    outputTokens?: number;
    processingTimeMs: number;
    cost?: number;
  };
}

export interface LLMProvider {
  readonly name: ProviderName;
  readonly displayName: string;
  readonly availableModels: string[];

  generate(options: GenerationOptions): Promise<GenerationResult>;
  validateConfig(): boolean;
  getConfig(): ProviderConfig;
  estimateCost(inputTokens: number, outputTokens: number): number;
}

export interface ProviderFactory {
  create(name: ProviderName, config: ProviderConfig): LLMProvider;
  createFromEnv(name: ProviderName): LLMProvider | null;
  getAvailableProviders(): ProviderName[];
}

// Multi-model comparison types
export interface ComparisonRequest {
  prompt: string;
  systemPrompt?: string;
  providers: ProviderName[];
  options?: Partial<GenerationOptions>;
}

export interface ComparisonResult {
  requestId: string;
  timestamp: string;
  prompt: string;
  results: GenerationResult[];
  winner?: ProviderName;
  votes?: Record<ProviderName, number>;
}
