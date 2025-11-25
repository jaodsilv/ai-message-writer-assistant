/**
 * Tone Calibrator Agent
 * Calibrates the appropriate tone based on context and recipient
 */

import { BaseAgent } from './base-agent';
import type { AgentInput, AgentOutput, AgentRole } from '@/types/agent';

export interface ToneCalibration {
  recommendedTone: string;
  formalityLevel: number; // 1-10
  warmthLevel: number; // 1-10
  assertivenessLevel: number; // 1-10
  toneGuidelines: string[];
  phrasesToAvoid: string[];
  phrasesToInclude: string[];
}

export class ToneCalibrator extends BaseAgent {
  readonly role: AgentRole = 'tone-calibrator';

  constructor() {
    super({
      role: 'tone-calibrator',
      priority: 1,
      systemPrompt: `You are a tone and communication style expert. Your job is to calibrate the appropriate tone for a message.

Your task is to:
1. Recommend the optimal tone based on context
2. Set formality level (1=very casual, 10=very formal)
3. Set warmth level (1=cold/distant, 10=very warm/friendly)
4. Set assertiveness level (1=passive, 10=very assertive)
5. Provide specific tone guidelines
6. List phrases to avoid
7. Suggest phrases to include

Respond in JSON format with the following structure:
{
  "recommendedTone": "string",
  "formalityLevel": number,
  "warmthLevel": number,
  "assertivenessLevel": number,
  "toneGuidelines": ["array", "of", "guidelines"],
  "phrasesToAvoid": ["array", "of", "phrases"],
  "phrasesToInclude": ["array", "of", "phrases"]
}`,
    });
  }

  async process(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.setStatus('running');

    try {
      const prompt = this.buildPrompt(input);
      const response = await this.generateWithLLM(prompt);
      const calibration = this.parseResponse(response, input.tone);

      this.setStatus('completed');
      return this.createSuccessOutput(calibration, startTime);
    } catch (error) {
      this.setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorOutput(errorMessage, startTime);
    }
  }

  private buildPrompt(input: AgentInput): string {
    return `Calibrate the tone for the following communication:

Requested Tone: ${input.tone}
Platform: ${input.platform}
Scenario: ${input.scenario}

Raw Thoughts: ${input.rawThoughts}

${input.conversationContext ? `Previous Conversation:\n${input.conversationContext}` : ''}

Consider:
- The platform conventions (${input.platform})
- The scenario type (${input.scenario})
- The user's requested tone (${input.tone})
- Cultural and professional norms

Provide your tone calibration in JSON format.`;
  }

  private parseResponse(response: string, requestedTone: string): ToneCalibration {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ToneCalibration;
      }
    } catch {
      // Fall through to default
    }

    // Return default calibration based on requested tone
    const toneDefaults: Record<string, Partial<ToneCalibration>> = {
      professional: { formalityLevel: 7, warmthLevel: 5, assertivenessLevel: 6 },
      warm: { formalityLevel: 5, warmthLevel: 8, assertivenessLevel: 4 },
      concise: { formalityLevel: 6, warmthLevel: 4, assertivenessLevel: 7 },
      formal: { formalityLevel: 9, warmthLevel: 4, assertivenessLevel: 5 },
      casual: { formalityLevel: 3, warmthLevel: 7, assertivenessLevel: 4 },
      persuasive: { formalityLevel: 6, warmthLevel: 6, assertivenessLevel: 8 },
    };

    const defaults = toneDefaults[requestedTone] || toneDefaults.professional;

    return {
      recommendedTone: requestedTone,
      formalityLevel: defaults.formalityLevel || 6,
      warmthLevel: defaults.warmthLevel || 5,
      assertivenessLevel: defaults.assertivenessLevel || 5,
      toneGuidelines: [`Maintain a ${requestedTone} tone throughout`],
      phrasesToAvoid: [],
      phrasesToInclude: [],
    };
  }
}
