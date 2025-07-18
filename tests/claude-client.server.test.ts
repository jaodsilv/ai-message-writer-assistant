import { describe, it, expect, beforeEach } from 'vitest';
import { ClaudeClientFactory } from '../app/lib/claude-client.server';
import type { ClaudeClient } from '../app/lib/types/claude';

describe('ClaudeClientFactory', () => {
  const validApiKey = 'sk-1234567890abcdef1234567890abcdef1234567890abcdef';
  
  describe('create', () => {
    it('should create a testing client', () => {
      const client = ClaudeClientFactory.create('testing', validApiKey);
      expect(client).toBeDefined();
      expect(client.validateConfig()).toBe(true);
    });

    it('should throw error for invalid API key', () => {
      expect(() => {
        ClaudeClientFactory.create('testing', 'invalid-key');
      }).toThrow('Invalid API key format');
    });

    it('should create development client with correct config', () => {
      const client = ClaudeClientFactory.create('development', validApiKey);
      const config = client.getConfig();
      
      expect(config.apiKey).toBe(validApiKey);
      expect(config.environment).toBe('development');
      expect(config.timeout).toBeDefined();
      expect(config.maxRetries).toBeDefined();
    });

    it('should create production client with correct config', () => {
      const client = ClaudeClientFactory.create('production', validApiKey);
      const config = client.getConfig();
      
      expect(config.apiKey).toBe(validApiKey);
      expect(config.environment).toBe('production');
      expect(config.timeout).toBeDefined();
      expect(config.maxRetries).toBeDefined();
    });
  });

  describe('createFromEnv', () => {
    it('should create client from environment variables', () => {
      const client = ClaudeClientFactory.createFromEnv('testing');
      expect(client).toBeDefined();
      expect(client.validateConfig()).toBe(true);
    });
  });
});

describe('MockClaudeClient', () => {
  let client: ClaudeClient;

  beforeEach(() => {
    client = ClaudeClientFactory.create('testing', 'sk-1234567890abcdef1234567890abcdef1234567890abcdef');
  });

  it('should generate mock message', async () => {
    const result = await client.generateMessage({
      rawThoughts: 'Test message',
      tone: 'professional',
      platform: 'email',
      locale: 'en-US'
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('Test message');
    expect(result.message).toContain('professional');
    expect(result.message).toContain('email');
    expect(result.metadata?.processingTime).toBeDefined();
  });

  it('should validate configuration', () => {
    expect(client.validateConfig()).toBe(true);
  });

  it('should return configuration', () => {
    const config = client.getConfig();
    expect(config.apiKey).toBe('sk-1234567890abcdef1234567890abcdef1234567890abcdef');
    expect(config.environment).toBe('testing');
  });
});