/**
 * Provider Factory
 * Creates and manages LLM provider instances
 */

import type { ProviderName, ProviderConfig, LLMProvider } from '@/types/provider';
import { ClaudeProvider } from './claude-provider';
import { OpenAIProvider } from './openai-provider';
import { GeminiProvider } from './gemini-provider';
import { GroqProvider } from './groq-provider';
import { MistralProvider } from './mistral-provider';
import { CohereProvider } from './cohere-provider';

type ProviderConstructor = new (config: ProviderConfig) => LLMProvider;

const PROVIDER_MAP: Record<ProviderName, ProviderConstructor> = {
  claude: ClaudeProvider,
  openai: OpenAIProvider,
  gemini: GeminiProvider,
  groq: GroqProvider,
  mistral: MistralProvider,
  cohere: CohereProvider,
};

const ENV_KEY_MAP: Record<ProviderName, string> = {
  claude: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  gemini: 'GOOGLE_AI_API_KEY',
  groq: 'GROQ_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  cohere: 'COHERE_API_KEY',
};

const MODEL_ENV_MAP: Record<ProviderName, string> = {
  claude: 'CLAUDE_MODEL',
  openai: 'OPENAI_MODEL',
  gemini: 'GEMINI_MODEL',
  groq: 'GROQ_MODEL',
  mistral: 'MISTRAL_MODEL',
  cohere: 'COHERE_MODEL',
};

export class ProviderFactory {
  private static instances: Map<string, LLMProvider> = new Map();

  /**
   * Create a provider instance
   */
  static create(name: ProviderName, config: ProviderConfig): LLMProvider {
    const ProviderClass = PROVIDER_MAP[name];

    if (!ProviderClass) {
      throw new Error(`Unknown provider: ${name}`);
    }

    return new ProviderClass(config);
  }

  /**
   * Create a provider from environment variables
   */
  static createFromEnv(name: ProviderName): LLMProvider | null {
    const apiKeyEnv = ENV_KEY_MAP[name];
    const modelEnv = MODEL_ENV_MAP[name];

    const apiKey = process.env[apiKeyEnv];

    if (!apiKey) {
      return null;
    }

    const config: ProviderConfig = {
      apiKey,
      model: process.env[modelEnv],
      timeout: parseInt(process.env.LLM_TIMEOUT || '30000', 10),
      maxRetries: parseInt(process.env.LLM_MAX_RETRIES || '3', 10),
    };

    return this.create(name, config);
  }

  /**
   * Get or create a singleton provider instance
   */
  static getInstance(name: ProviderName): LLMProvider | null {
    const cacheKey = name;

    if (this.instances.has(cacheKey)) {
      return this.instances.get(cacheKey)!;
    }

    const provider = this.createFromEnv(name);

    if (provider) {
      this.instances.set(cacheKey, provider);
    }

    return provider;
  }

  /**
   * Get all available providers (configured via environment)
   */
  static getAvailableProviders(): ProviderName[] {
    return (Object.keys(PROVIDER_MAP) as ProviderName[]).filter((name) => {
      const apiKeyEnv = ENV_KEY_MAP[name];
      return !!process.env[apiKeyEnv];
    });
  }

  /**
   * Get all supported provider names
   */
  static getSupportedProviders(): ProviderName[] {
    return Object.keys(PROVIDER_MAP) as ProviderName[];
  }

  /**
   * Get provider display info
   */
  static getProviderInfo(name: ProviderName): {
    name: ProviderName;
    displayName: string;
    models: string[];
    configured: boolean;
  } | null {
    const provider = this.createFromEnv(name);

    if (!provider) {
      // Return basic info even if not configured
      const ProviderClass = PROVIDER_MAP[name];
      if (!ProviderClass) return null;

      // Create a dummy instance to get info
      const dummyProvider = new ProviderClass({ apiKey: 'dummy' });
      return {
        name,
        displayName: dummyProvider.displayName,
        models: dummyProvider.availableModels,
        configured: false,
      };
    }

    return {
      name,
      displayName: provider.displayName,
      models: provider.availableModels,
      configured: true,
    };
  }

  /**
   * Get all provider info
   */
  static getAllProviderInfo(): Array<{
    name: ProviderName;
    displayName: string;
    models: string[];
    configured: boolean;
  }> {
    return this.getSupportedProviders()
      .map((name) => this.getProviderInfo(name))
      .filter((info) => info !== null);
  }

  /**
   * Clear cached instances (useful for testing)
   */
  static clearInstances(): void {
    this.instances.clear();
  }
}

export default ProviderFactory;
