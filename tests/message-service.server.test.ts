import { describe, it, expect, beforeEach } from 'vitest';
import MessageService, { createMessageService } from '../app/lib/message-service.server';

describe('MessageService', () => {
  let messageService: MessageService;

  beforeEach(() => {
    messageService = createMessageService({ environment: 'testing' });
  });

  describe('generateMessage', () => {
    it('should generate message with valid options', async () => {
      const result = await messageService.generateMessage({
        rawThoughts: 'I want to schedule a meeting',
        tone: 'professional',
        platform: 'email',
        locale: 'en-US'
      });

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.metadata?.processingTime).toBeDefined();
    });

    it('should handle missing rawThoughts', async () => {
      const result = await messageService.generateMessage({
        rawThoughts: '',
        tone: 'professional',
        platform: 'email',
        locale: 'en-US'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Raw thoughts are required');
    });

    it('should handle invalid tone', async () => {
      const result = await messageService.generateMessage({
        rawThoughts: 'Test message',
        tone: 'invalid-tone',
        platform: 'email',
        locale: 'en-US'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid tone');
    });

    it('should handle invalid platform', async () => {
      const result = await messageService.generateMessage({
        rawThoughts: 'Test message',
        tone: 'professional',
        platform: 'invalid-platform',
        locale: 'en-US'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid platform');
    });

    it('should handle context email', async () => {
      const result = await messageService.generateMessage({
        rawThoughts: 'I want to respond to their email',
        tone: 'professional',
        platform: 'email',
        contextEmail: 'Original email content here',
        locale: 'en-US'
      });

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });

    it('should sanitize input', async () => {
      const result = await messageService.generateMessage({
        rawThoughts: '  Test message with extra spaces  ',
        tone: 'PROFESSIONAL',
        platform: 'EMAIL',
        locale: 'en-US'
      });

      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });
  });

  describe('validateConfiguration', () => {
    it('should return true for valid configuration', () => {
      expect(messageService.validateConfiguration()).toBe(true);
    });
  });

  describe('getServiceInfo', () => {
    it('should return service information', () => {
      const info = messageService.getServiceInfo();
      expect(info.environment).toBe('testing');
      expect(info.clientConfig).toBeDefined();
    });
  });
});