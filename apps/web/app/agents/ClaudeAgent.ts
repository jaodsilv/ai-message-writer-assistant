import { ModelInterface, Message } from './ModelInterface';
import { query } from '@anthropic-ai/claude-agent-sdk';

export class ClaudeAgent implements ModelInterface {
  id = 'claude';
  name = 'Claude';
  provider = 'claude' as const;
  constructor() { }

  async generateResponse(messages: Message[], _context?: any, model?: string): Promise<string> {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      if (messages.length === 0) return '';
    }

    const prompt = lastMessage?.content || '';

    try {
      const stream = query({
        prompt,
        options: {
          cwd: process.cwd(),
          model: model // Pass the model to the SDK
        }
      });

      for await (const message of stream) {
        if (message.type === 'result') {
          if (message.subtype === 'success') {
            return message.result;
          } else if (
            message.subtype === 'error_during_execution' ||
            message.subtype === 'error_max_turns' ||
            message.subtype === 'error_max_budget_usd' ||
            message.subtype === 'error_max_structured_output_retries'
          ) {
            const errorMsg = 'errors' in message ? message.errors.join(', ') : 'Unknown error';
            throw new Error(`Claude Agent failed: ${message.subtype} - ${errorMsg}`);
          }
        }
      }

      throw new Error('No result received from Claude Agent');
    } catch (error) {
      console.error('Error in ClaudeAgent:', error);
      throw error;
    }
  }

  async getSupportedModels(): Promise<{ value: string; displayName: string }[]> {
    try {
      // Create a dummy query to access the supportedModels method
      // We don't need to iterate over the stream for this
      const q = query({ prompt: '' });
      const models = await q.supportedModels();
      console.log('Supported models:', JSON.stringify(models, null, 2));

      return models.map(model => ({
        value: model.value,
        displayName: model.description ? model.description.split(' · ')[0] : model.displayName
      }));
    } catch (error) {
      console.error('Error fetching supported models:', error);
      return [];
    }
  }
}
