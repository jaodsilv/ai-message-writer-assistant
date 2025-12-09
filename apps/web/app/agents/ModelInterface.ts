export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sender?: string;
  recipients?: string[];
}

export interface ModelInterface {
  id: string;
  name: string;
  provider: 'claude' | 'gemini' | 'gpt' | 'other';

  generateResponse(messages: Message[], context?: any, model?: string): Promise<string>;
  getSupportedModels?(): Promise<{ value: string; displayName: string }[]>;
}
