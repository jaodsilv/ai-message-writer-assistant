import Anthropic from "@anthropic-ai/sdk";
import type { 
  ClaudeClient, 
  ClaudeClientConfig, 
  ClaudeClientType, 
  MessageGenerationOptions, 
  MessageGenerationResult,
  ClaudeAPIError 
} from "./types/claude";

class ClaudeAPIClient implements ClaudeClient {
  private anthropic: Anthropic;
  private config: ClaudeClientConfig;

  constructor(config: ClaudeClientConfig) {
    this.config = config;
    this.anthropic = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
    });
  }

  async generateMessage(options: MessageGenerationOptions): Promise<MessageGenerationResult> {
    const startTime = Date.now();
    
    try {
      this.validateMessageOptions(options);
      
      const prompt = this.buildPrompt(options);
      
      const response = await this.callAnthropicAPI(prompt);
      
      const processingTime = Date.now() - startTime;
      
      return {
        message: response,
        success: true,
        metadata: {
          processingTime,
        }
      };
      
    } catch (error) {
      const claudeError = this.handleError(error);
      
      if (this.config.environment === 'development') {
        console.error('Claude API Error:', claudeError);
      }
      
      return {
        message: '',
        success: false,
        error: claudeError.message,
        metadata: {
          processingTime: Date.now() - startTime,
        }
      };
    }
  }

  private validateMessageOptions(options: MessageGenerationOptions): void {
    if (!options.rawThoughts || options.rawThoughts.trim().length === 0) {
      throw new Error('Raw thoughts are required');
    }
    
    if (!options.tone) {
      throw new Error('Tone is required');
    }
    
    if (!options.platform) {
      throw new Error('Platform is required');
    }
  }

  private buildPrompt(options: MessageGenerationOptions): string {
    const { rawThoughts, tone, platform, contextEmail, locale = 'en-US' } = options;
    
    const contextPart = contextEmail?.trim() 
      ? `\n\nContext - I am responding to this email:\n"${contextEmail}"\n\n`
      : '';

    return `You are an expert ${platform} message writer. Transform the following raw thoughts into a well-crafted ${platform} message with a ${tone} tone.

Raw thoughts: "${rawThoughts}"${contextPart}

Instructions:
1. Write a complete, professional ${platform} message body
2. Use a ${tone} tone throughout
3. Make it clear, engaging, and well-structured
4. Ensure proper ${platform} etiquette
5. If it is a response to an ${platform} message, do not include a subject line
6. Before writing the actual message, use your thinking plan to think on the context as a whole and about the best next action, e.g.:
   - Should I even send this message?
   - Should I wait for their communication before sending this message?
   - Should I send a follow-up email after how long if a response is not received?
   - When should I send this generated message?
   - etc

Please respond in ${locale} language.

Respond with ONLY two things:
1. The message body content
2. The best next action based on the context as a whole and about the best next action as described above`;
  }

  private async callAnthropicAPI(prompt: string): Promise<string> {
    const maxRetries = this.config.maxRetries || 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 4000,
          temperature: 0.7,
          system: "You are a professional message writer. Capable of writing any type of message in any requested tone. Focus on clarity, appropriate tone, and actionable content.",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        });

        const content = response.content[0];
        if (content.type === 'text') {
          return content.text;
        }
        
        throw new Error('Unexpected response format from Claude API');
        
      } catch (error) {
        lastError = error as Error;
        
        if (this.config.environment === 'development') {
          console.warn(`Claude API attempt ${attempt}/${maxRetries} failed:`, error);
        }
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError || new Error('Maximum retries exceeded');
  }

  private handleError(error: unknown): ClaudeAPIError {
    if (error instanceof Anthropic.APIError) {
      return {
        code: error.status?.toString() || 'unknown',
        message: error.message,
        type: 'api',
        details: error
      };
    }
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return {
          code: 'timeout',
          message: 'Request timed out. Please try again.',
          type: 'timeout'
        };
      }
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return {
          code: 'network',
          message: 'Network error. Please check your connection and try again.',
          type: 'network'
        };
      }
      
      return {
        code: 'unknown',
        message: error.message,
        type: 'unknown'
      };
    }
    
    return {
      code: 'unknown',
      message: 'An unexpected error occurred',
      type: 'unknown'
    };
  }

  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.apiKey.startsWith('sk-'));
  }

  getConfig(): ClaudeClientConfig {
    return { ...this.config };
  }
}

// Mock client for testing
class MockClaudeClient implements ClaudeClient {
  private config: ClaudeClientConfig;

  constructor(config: ClaudeClientConfig) {
    this.config = config;
  }

  async generateMessage(options: MessageGenerationOptions): Promise<MessageGenerationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      message: `Mock generated message for: ${options.rawThoughts.substring(0, 50)}... (${options.tone} tone for ${options.platform})`,
      success: true,
      metadata: {
        processingTime: 100
      }
    };
  }

  validateConfig(): boolean {
    return true;
  }

  getConfig(): ClaudeClientConfig {
    return { ...this.config };
  }
}

// Factory class
export class ClaudeClientFactory {
  private static configurations: Record<ClaudeClientType, Partial<ClaudeClientConfig>> = {
    development: {
      timeout: 60000,
      maxRetries: 3,
      environment: 'development'
    },
    production: {
      timeout: 30000,
      maxRetries: 2,
      environment: 'production'
    },
    testing: {
      timeout: 5000,
      maxRetries: 1,
      environment: 'testing'
    },
    custom: {
      timeout: 30000,
      maxRetries: 3,
      environment: 'development'
    }
  };

  static create(
    type: ClaudeClientType, 
    apiKey: string, 
    overrides: Partial<ClaudeClientConfig> = {}
  ): ClaudeClient {
    const baseConfig = this.configurations[type];
    
    const config: ClaudeClientConfig = {
      apiKey,
      ...baseConfig,
      ...overrides
    };

    // Validate API key
    if (!config.apiKey || !config.apiKey.startsWith('sk-')) {
      throw new Error('Invalid API key format. API key must start with "sk-"');
    }

    // Return mock client for testing
    if (type === 'testing') {
      return new MockClaudeClient(config);
    }

    return new ClaudeAPIClient(config);
  }

  static createFromEnv(type: ClaudeClientType = 'development'): ClaudeClient {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    const overrides: Partial<ClaudeClientConfig> = {};
    
    if (process.env.ANTHROPIC_API_URL) {
      overrides.baseURL = process.env.ANTHROPIC_API_URL;
    }

    return this.create(type, apiKey, overrides);
  }
}

// Default export for easy importing
export default ClaudeClientFactory;