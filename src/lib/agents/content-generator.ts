/**
 * Content Generator Agent
 * Generates the main message content based on analysis and calibration
 */

import { BaseAgent } from './base-agent';
import type { AgentInput, AgentOutput, AgentRole } from '@/types/agent';
import type { ContextAnalysis } from './context-analyzer';
import type { ToneCalibration } from './tone-calibrator';

export interface GeneratedContent {
  subject?: string;
  greeting: string;
  body: string;
  closing: string;
  signature?: string;
  fullMessage: string;
}

export class ContentGenerator extends BaseAgent {
  readonly role: AgentRole = 'content-generator';

  constructor() {
    super({
      role: 'content-generator',
      priority: 2,
      systemPrompt: `You are an expert message writer. Your job is to transform raw thoughts into polished, well-structured messages.

Your task is to:
1. Create an appropriate greeting
2. Write a clear, well-structured body
3. Add an appropriate closing
4. Ensure the message flows naturally
5. Apply the tone guidelines provided

Respond in JSON format with the following structure:
{
  "subject": "string (if applicable)",
  "greeting": "string",
  "body": "string",
  "closing": "string",
  "fullMessage": "complete message string"
}`,
    });
  }

  async process(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.setStatus('running');

    try {
      // Extract previous agent outputs
      const previousOutputs = input.additionalContext?.previousAgentOutputs as Array<{
        role: string;
        result: unknown;
      }> || [];

      const contextAnalysis = previousOutputs.find(
        (o) => o.role === 'context-analyzer'
      )?.result as ContextAnalysis | undefined;

      const toneCalibration = previousOutputs.find(
        (o) => o.role === 'tone-calibrator'
      )?.result as ToneCalibration | undefined;

      const prompt = this.buildPrompt(input, contextAnalysis, toneCalibration);
      const response = await this.generateWithLLM(prompt);
      const content = this.parseResponse(response);

      this.setStatus('completed');
      return this.createSuccessOutput(content, startTime);
    } catch (error) {
      this.setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorOutput(errorMessage, startTime);
    }
  }

  private buildPrompt(
    input: AgentInput,
    contextAnalysis?: ContextAnalysis,
    toneCalibration?: ToneCalibration
  ): string {
    let prompt = `Generate a ${input.platform} message based on the following:

Raw Thoughts: ${input.rawThoughts}

Platform: ${input.platform}
Requested Tone: ${input.tone}
Scenario: ${input.scenario}`;

    if (input.conversationContext) {
      prompt += `\n\nPrevious Conversation:\n${input.conversationContext}`;
    }

    if (contextAnalysis) {
      prompt += `\n\nContext Analysis:
- Intent: ${contextAnalysis.intent}
- Urgency: ${contextAnalysis.urgency}
- Expected Response: ${contextAnalysis.expectedResponseType}
- Suggested Actions: ${contextAnalysis.suggestedActions.join(', ')}`;
    }

    if (toneCalibration) {
      prompt += `\n\nTone Guidelines:
- Recommended Tone: ${toneCalibration.recommendedTone}
- Formality: ${toneCalibration.formalityLevel}/10
- Warmth: ${toneCalibration.warmthLevel}/10
- Guidelines: ${toneCalibration.toneGuidelines.join('; ')}
- Phrases to Include: ${toneCalibration.phrasesToInclude.join(', ') || 'N/A'}
- Phrases to Avoid: ${toneCalibration.phrasesToAvoid.join(', ') || 'N/A'}`;
    }

    prompt += '\n\nGenerate the message in JSON format.';

    return prompt;
  }

  private parseResponse(response: string): GeneratedContent {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          fullMessage: parsed.fullMessage ||
            `${parsed.greeting}\n\n${parsed.body}\n\n${parsed.closing}`,
        };
      }
    } catch {
      // Fall through to extracting content directly
    }

    // If JSON parsing fails, use the response as the body
    return {
      greeting: '',
      body: response,
      closing: '',
      fullMessage: response,
    };
  }
}
