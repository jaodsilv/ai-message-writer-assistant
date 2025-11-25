/**
 * Context Analyzer Agent
 * Analyzes conversation context and extracts key information
 */

import { BaseAgent } from './base-agent';
import type { AgentInput, AgentOutput, AgentRole } from '@/types/agent';

export interface ContextAnalysis {
  intent: string;
  keyEntities: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'high' | 'medium' | 'low';
  expectedResponseType: string;
  conversationStage: string;
  suggestedActions: string[];
}

export class ContextAnalyzer extends BaseAgent {
  readonly role: AgentRole = 'context-analyzer';

  constructor() {
    super({
      role: 'context-analyzer',
      priority: 1,
      systemPrompt: `You are a context analysis expert. Analyze the given conversation context and extract key information.

Your task is to:
1. Identify the user's intent and what they want to communicate
2. Extract key entities (people, companies, dates, etc.)
3. Determine the sentiment of the conversation
4. Assess urgency level
5. Identify the expected response type
6. Determine the stage of the conversation
7. Suggest appropriate actions

Respond in JSON format with the following structure:
{
  "intent": "string describing the main intent",
  "keyEntities": ["array", "of", "entities"],
  "sentiment": "positive|neutral|negative",
  "urgency": "high|medium|low",
  "expectedResponseType": "string describing expected response",
  "conversationStage": "string describing stage",
  "suggestedActions": ["array", "of", "actions"]
}`,
    });
  }

  async process(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.setStatus('running');

    try {
      const prompt = this.buildPrompt(input);
      const response = await this.generateWithLLM(prompt);
      const analysis = this.parseResponse(response);

      this.setStatus('completed');
      return this.createSuccessOutput(analysis, startTime);
    } catch (error) {
      this.setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorOutput(errorMessage, startTime);
    }
  }

  private buildPrompt(input: AgentInput): string {
    return `Analyze the following communication context:

Raw Thoughts: ${input.rawThoughts}

Platform: ${input.platform}
Tone: ${input.tone}
Scenario: ${input.scenario}

${input.conversationContext ? `Previous Conversation:\n${input.conversationContext}` : ''}

${input.additionalContext ? `Additional Context: ${JSON.stringify(input.additionalContext)}` : ''}

Provide your analysis in JSON format.`;
  }

  private parseResponse(response: string): ContextAnalysis {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ContextAnalysis;
      }
    } catch {
      // Fall through to default
    }

    // Return default analysis if parsing fails
    return {
      intent: 'general communication',
      keyEntities: [],
      sentiment: 'neutral',
      urgency: 'medium',
      expectedResponseType: 'professional response',
      conversationStage: 'ongoing',
      suggestedActions: ['respond promptly'],
    };
  }
}
