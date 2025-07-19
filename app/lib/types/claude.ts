export interface ClaudeClientConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  environment?: 'development' | 'production' | 'testing';
  model?: string;
  allowedTones?: string[];
  allowedPlatforms?: string[];
}

export interface MessageGenerationOptions {
  rawThoughts: string;
  tone: string;
  platform: string;
  contextEmail?: string;
  locale?: string;
}

export interface MessageGenerationResult {
  message: string;
  success: boolean;
  error?: string;
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
  };
}

export interface ClaudeAPIError {
  code: string;
  message: string;
  type: 'validation' | 'api' | 'network' | 'timeout' | 'unknown';
  details?: any;
}

export interface ClaudeClient {
  generateMessage(options: MessageGenerationOptions): Promise<MessageGenerationResult>;
  validateConfig(): boolean;
  getConfig(): ClaudeClientConfig;
}

export type ClaudeClientType = 'development' | 'production' | 'testing' | 'custom';