/**
 * Quality Reviewer Agent
 * Reviews message quality and suggests improvements
 */

import { BaseAgent } from './base-agent';
import type { AgentInput, AgentOutput, AgentRole } from '@/types/agent';
import type { FormattedMessage } from './platform-formatter';

export interface QualityReview {
  overallScore: number; // 1-10
  grammarScore: number; // 1-10
  clarityScore: number; // 1-10
  toneScore: number; // 1-10
  professionalismScore: number; // 1-10
  issues: Array<{
    type: 'grammar' | 'clarity' | 'tone' | 'structure' | 'content';
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion: string;
  }>;
  improvements: string[];
  strengths: string[];
}

export class QualityReviewer extends BaseAgent {
  readonly role: AgentRole = 'quality-reviewer';

  constructor() {
    super({
      role: 'quality-reviewer',
      priority: 3,
      systemPrompt: `You are a quality review expert for professional communications. Your job is to review messages and identify issues and improvements.

Your task is to:
1. Score overall quality (1-10)
2. Score grammar, clarity, tone, and professionalism
3. Identify specific issues with severity levels
4. Suggest improvements
5. Highlight strengths

Respond in JSON format with the following structure:
{
  "overallScore": number,
  "grammarScore": number,
  "clarityScore": number,
  "toneScore": number,
  "professionalismScore": number,
  "issues": [
    {
      "type": "grammar|clarity|tone|structure|content",
      "severity": "low|medium|high",
      "description": "string",
      "suggestion": "string"
    }
  ],
  "improvements": ["array", "of", "suggestions"],
  "strengths": ["array", "of", "strengths"]
}`,
    });
  }

  async process(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.setStatus('running');

    try {
      const previousOutputs = input.additionalContext?.previousAgentOutputs as Array<{
        role: string;
        result: unknown;
      }> || [];

      const formattedMessage = previousOutputs.find(
        (o) => o.role === 'platform-formatter'
      )?.result as FormattedMessage | undefined;

      const prompt = this.buildPrompt(input, formattedMessage);
      const response = await this.generateWithLLM(prompt);
      const review = this.parseResponse(response);

      this.setStatus('completed');
      return this.createSuccessOutput(review, startTime);
    } catch (error) {
      this.setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorOutput(errorMessage, startTime);
    }
  }

  private buildPrompt(input: AgentInput, formattedMessage?: FormattedMessage): string {
    const messageToReview = formattedMessage?.formattedMessage || input.rawThoughts;

    return `Review the following ${input.platform} message for quality:

Message to Review:
${messageToReview}

Context:
- Platform: ${input.platform}
- Requested Tone: ${input.tone}
- Scenario: ${input.scenario}

Provide a comprehensive quality review in JSON format.`;
  }

  private parseResponse(response: string): QualityReview {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as QualityReview;
      }
    } catch {
      // Fall through to default
    }

    return {
      overallScore: 7,
      grammarScore: 7,
      clarityScore: 7,
      toneScore: 7,
      professionalismScore: 7,
      issues: [],
      improvements: [],
      strengths: ['Message was generated successfully'],
    };
  }
}
