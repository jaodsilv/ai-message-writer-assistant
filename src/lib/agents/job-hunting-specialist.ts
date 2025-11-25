/**
 * Job Hunting Specialist Agent
 * Provides job hunting specific advice and context
 */

import { BaseAgent } from './base-agent';
import type { AgentInput, AgentOutput, AgentRole } from '@/types/agent';

export interface JobHuntingAdvice {
  communicationType: string;
  strategicAdvice: string[];
  keyPointsToEmphasize: string[];
  potentialRedFlags: string[];
  followUpRecommendation: {
    recommended: boolean;
    timing: string;
    reason: string;
  };
  negotiationTips?: string[];
  companyResearchInsights?: string[];
}

export class JobHuntingSpecialist extends BaseAgent {
  readonly role: AgentRole = 'job-hunting-specialist';

  constructor() {
    super({
      role: 'job-hunting-specialist',
      priority: 1,
      systemPrompt: `You are a job hunting and career communication expert. Your job is to provide strategic advice for job-related communications.

Your task is to:
1. Identify the type of communication (recruiter response, follow-up, negotiation, etc.)
2. Provide strategic advice for the specific situation
3. Highlight key points to emphasize
4. Identify potential red flags to avoid
5. Recommend follow-up actions
6. Provide negotiation tips if applicable

Respond in JSON format with the following structure:
{
  "communicationType": "string",
  "strategicAdvice": ["array", "of", "advice"],
  "keyPointsToEmphasize": ["array", "of", "points"],
  "potentialRedFlags": ["array", "of", "red flags"],
  "followUpRecommendation": {
    "recommended": boolean,
    "timing": "string",
    "reason": "string"
  },
  "negotiationTips": ["array", "of", "tips"],
  "companyResearchInsights": ["array", "of", "insights"]
}`,
    });
  }

  async process(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.setStatus('running');

    try {
      const prompt = this.buildPrompt(input);
      const response = await this.generateWithLLM(prompt);
      const advice = this.parseResponse(response);

      this.setStatus('completed');
      return this.createSuccessOutput(advice, startTime);
    } catch (error) {
      this.setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorOutput(errorMessage, startTime);
    }
  }

  private buildPrompt(input: AgentInput): string {
    let prompt = `Provide job hunting advice for the following communication:

Raw Thoughts: ${input.rawThoughts}

Platform: ${input.platform}
Tone: ${input.tone}`;

    if (input.conversationContext) {
      prompt += `\n\nPrevious Conversation:\n${input.conversationContext}`;
    }

    if (input.additionalContext) {
      const context = input.additionalContext as Record<string, unknown>;

      if (context.company) {
        prompt += `\n\nCompany: ${context.company}`;
      }

      if (context.position) {
        prompt += `\nPosition: ${context.position}`;
      }

      if (context.stage) {
        prompt += `\nApplication Stage: ${context.stage}`;
      }
    }

    prompt += '\n\nProvide strategic job hunting advice in JSON format.';

    return prompt;
  }

  private parseResponse(response: string): JobHuntingAdvice {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as JobHuntingAdvice;
      }
    } catch {
      // Fall through to default
    }

    return {
      communicationType: 'general job communication',
      strategicAdvice: ['Be professional and concise'],
      keyPointsToEmphasize: ['Your relevant experience', 'Your enthusiasm for the role'],
      potentialRedFlags: [],
      followUpRecommendation: {
        recommended: true,
        timing: 'within 1 week if no response',
        reason: 'Shows continued interest',
      },
    };
  }
}
