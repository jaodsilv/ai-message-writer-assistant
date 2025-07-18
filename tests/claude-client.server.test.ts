import { describe, it, expect, beforeEach } from 'vitest';
import { ClaudeClientFactory } from '../app/lib/claude-client.server';
import type { ClaudeClient } from '../app/lib/types/claude';

describe('ClaudeClientFactory', () => {
  describe('create', () => {
    it('should create a testing client', () => {
      const client = ClaudeClientFactory.create('testing', 'sk-test-key');
      expect(client).toBeDefined();
      expect(client.validateConfig()).toBe(true);
    });

    it('should throw error for invalid API key', () => {
      expect(() => {
        ClaudeClientFactory.create('testing', 'invalid-key');
      }).toThrow('Invalid API key format');
    });

    it('should create development client with correct config', () => {
      const client = ClaudeClientFactory.create('development', 'sk-test-key');
      const config = client.getConfig();
      
      expect(config.apiKey).toBe('sk-test-key');
      expect(config.environment).toBe('development');
      expect(config.timeout).toBe(60000);
      expect(config.maxRetries).toBe(3);
    });

    it('should create production client with correct config', () => {
      const client = ClaudeClientFactory.create('production', 'sk-test-key');
      const config = client.getConfig();
      
      expect(config.apiKey).toBe('sk-test-key');
      expect(config.environment).toBe('production');
      expect(config.timeout).toBe(30000);
      expect(config.maxRetries).toBe(2);
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
    client = ClaudeClientFactory.create('testing', 'sk-test-key');
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
    expect(config.apiKey).toBe('sk-test-key');
    expect(config.environment).toBe('testing');
  });
});