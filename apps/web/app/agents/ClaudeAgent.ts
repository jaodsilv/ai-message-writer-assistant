import { ModelInterface, Message } from './ModelInterface';
import { query } from '@anthropic-ai/claude-agent-sdk';

export class ClaudeAgent implements ModelInterface {
  id = 'claude';
  name = 'Claude';
  provider = 'claude' as const;
  constructor() { }

  async generateResponse(messages: Message[], _context?: any, model?: string): Promise<string> {
    const writerName = _context?.writerName || 'Assistant';
    const contextItems = _context?.context || [];
    const jobDescription = _context?.jobDescription || '';

    // Format conversation history
    const history = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');

    // Construct the prompt
    let prompt = `You are acting as ${writerName}. Your task is to draft a response to the last message in the conversation below.\n\n`;

    if (jobDescription) {
      prompt += `Job Description Context:\n${jobDescription}\n\n`;
    }

    if (contextItems.length > 0) {
      prompt += `Additional Context:\n${contextItems.join('\n')}\n\n`;
    }

    prompt += `Conversation History:\n${history}\n\n`;

    prompt += `Instructions:
1. Draft a direct response to the last message.
2. Do NOT act as a conversational assistant (e.g., do not say "Here is a draft").
3. Output ONLY the draft response text.
4. Maintain a professional but conversational tone appropriate for ${writerName}.
5. Use the provided context to inform your response.

Draft Response:`;

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
