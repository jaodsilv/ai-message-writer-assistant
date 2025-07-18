import { ClaudeClientFactory } from './claude-client.server';
import type { 
  ClaudeClient, 
  MessageGenerationOptions, 
  MessageGenerationResult 
} from './types/claude';

interface MessageServiceConfig {
  environment?: 'development' | 'production' | 'testing';
  enableLogging?: boolean;
  allowedTones?: string[];
  allowedPlatforms?: string[];
}

class MessageService {
  private client: ClaudeClient;
  private config: MessageServiceConfig;

  constructor(config: MessageServiceConfig = {}) {
    this.config = {
      environment: config.environment || 'development',
      enableLogging: config.enableLogging ?? (config.environment === 'development'),
      allowedTones: config.allowedTones || 
        (process.env.ALLOWED_TONES?.split(',').map(t => t.trim())) || 
        ['professional', 'warm', 'concise', 'formal', 'casual', 'persuasive'],
      allowedPlatforms: config.allowedPlatforms || 
        (process.env.ALLOWED_PLATFORMS?.split(',').map(p => p.trim())) || 
        ['email', 'linkedin', 'support', 'custom'],
    };

    // Create appropriate client based on environment
    const clientType = this.config.environment === 'testing' ? 'testing' : 
                      this.config.environment === 'production' ? 'production' : 
                      'development';
    
    this.client = ClaudeClientFactory.createFromEnv(clientType);
  }

  async generateMessage(options: MessageGenerationOptions): Promise<MessageGenerationResult> {
    const startTime = Date.now();
    
    try {
      // Validate and sanitize input
      const sanitizedOptions = this.validateAndSanitizeOptions(options);
      
      if (this.config.enableLogging) {
        console.log('Generating message with options:', {
          tone: sanitizedOptions.tone,
          platform: sanitizedOptions.platform,
          thoughtsLength: sanitizedOptions.rawThoughts.length,
          hasContext: !!sanitizedOptions.contextEmail,
        });
      }

      // Generate message using Claude client
      const result = await this.client.generateMessage(sanitizedOptions);
      
      // Process and format the result
      const processedResult = this.processResult(result);
      
      if (this.config.enableLogging) {
        console.log('Message generation completed:', {
          success: processedResult.success,
          messageLength: processedResult.message.length,
          processingTime: Date.now() - startTime,
        });
      }
      
      return processedResult;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (this.config.enableLogging) {
        console.error('Message generation failed:', errorMessage);
      }
      
      return {
        message: '',
        success: false,
        error: this.sanitizeErrorMessage(errorMessage),
        metadata: {
          processingTime: Date.now() - startTime,
        }
      };
    }
  }

  private validateAndSanitizeOptions(options: MessageGenerationOptions): MessageGenerationOptions {
    const errors: string[] = [];
    
    // Validate required fields
    if (!options.rawThoughts || typeof options.rawThoughts !== 'string') {
      errors.push('Raw thoughts are required and must be a string');
    }
    
    if (!options.tone || typeof options.tone !== 'string') {
      errors.push('Tone is required and must be a string');
    }
    
    if (!options.platform || typeof options.platform !== 'string') {
      errors.push('Platform is required and must be a string');
    }

    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }

    // Validate tone options
    const validTones = this.config.allowedTones || ['professional', 'warm', 'concise', 'formal', 'casual', 'persuasive'];
    if (!validTones.includes(options.tone.toLowerCase())) {
      throw new Error(`Invalid tone: ${options.tone}. Must be one of: ${validTones.join(', ')}`);
    }

    // Validate platform options
    const validPlatforms = this.config.allowedPlatforms || ['email', 'linkedin', 'support', 'custom'];
    if (!validPlatforms.includes(options.platform.toLowerCase())) {
      throw new Error(`Invalid platform: ${options.platform}. Must be one of: ${validPlatforms.join(', ')}`);
    }

    // Sanitize input
    return {
      rawThoughts: options.rawThoughts.trim(),
      tone: options.tone.toLowerCase(),
      platform: options.platform.toLowerCase(),
      contextEmail: options.contextEmail?.trim() || undefined,
      locale: options.locale || 'en-US',
    };
  }

  private processResult(result: MessageGenerationResult): MessageGenerationResult {
    if (!result.success) {
      return result;
    }

    // Clean up the message content
    let processedMessage = result.message;
    
    // Remove any leading/trailing whitespace
    processedMessage = processedMessage.trim();
    
    // Ensure proper line breaks
    processedMessage = processedMessage.replace(/\n{3,}/g, '\n\n');
    
    // Remove any placeholder text that might have been left in
    processedMessage = processedMessage.replace(/\{\{[^}]+\}\}/g, '');
    
    return {
      ...result,
      message: processedMessage,
    };
  }

  private sanitizeErrorMessage(errorMessage: string): string {
    // Remove any sensitive information from error messages
    return errorMessage
      .replace(/sk-[a-zA-Z0-9-_]+/g, '[API_KEY_HIDDEN]') // Hide API keys
      .replace(/Bearer\s+[a-zA-Z0-9-_]+/g, '[TOKEN_HIDDEN]') // Hide Bearer tokens
      .replace(/password[=:]\s*[^\s]+/gi, 'password=[HIDDEN]') // Hide passwords
      .replace(/token[=:]\s*[^\s]+/gi, 'token=[HIDDEN]'); // Hide tokens
  }

  // Health check method
  validateConfiguration(): boolean {
    try {
      return this.client.validateConfig();
    } catch (error) {
      if (this.config.enableLogging) {
        console.error('Configuration validation failed:', error);
      }
      return false;
    }
  }

  // Get service information
  getServiceInfo(): { environment: string; clientConfig: any } {
    return {
      environment: this.config.environment || 'unknown',
      clientConfig: this.client.getConfig(),
    };
  }
}

// Singleton instance for the application
let messageServiceInstance: MessageService | null = null;
let isInitializing = false;

export function getMessageService(): MessageService {
  if (messageServiceInstance) {
    return messageServiceInstance;
  }
  
  if (isInitializing) {
    throw new Error('MessageService is currently being initialized. Please try again.');
  }
  
  isInitializing = true;
  try {
    const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    messageServiceInstance = new MessageService({ environment });
    return messageServiceInstance;
  } finally {
    isInitializing = false;
  }
}

// For testing purposes
export function createMessageService(config: MessageServiceConfig): MessageService {
  return new MessageService(config);
}

// Default export
export default MessageService;