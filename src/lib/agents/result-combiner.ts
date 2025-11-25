/**
 * Result Combiner Agent
 * Combines outputs from all agents into the final result
 */

import { BaseAgent } from './base-agent';
import type { AgentInput, AgentOutput, AgentRole } from '@/types/agent';
import type { ContextAnalysis } from './context-analyzer';
import type { ToneCalibration } from './tone-calibrator';
import type { GeneratedContent } from './content-generator';
import type { FormattedMessage } from './platform-formatter';
import type { QualityReview } from './quality-reviewer';
import type { JobHuntingAdvice } from './job-hunting-specialist';
import type { MemoryContext } from './memory-manager';

export interface CombinedResult {
  generatedMessage: string;
  subject?: string;
  timingRecommendation?: string;
  alternatives?: string[];
  qualityScore: number;
  improvements: string[];
  metadata: {
    platform: string;
    tone: string;
    characterCount: number;
    withinLimits: boolean;
    contextAnalysis?: Partial<ContextAnalysis>;
    toneCalibration?: Partial<ToneCalibration>;
    qualityReview?: Partial<QualityReview>;
    jobHuntingAdvice?: Partial<JobHuntingAdvice>;
  };
}

export class ResultCombiner extends BaseAgent {
  readonly role: AgentRole = 'result-combiner';

  constructor() {
    super({
      role: 'result-combiner',
      priority: 4,
      systemPrompt: 'You combine results from multiple agents into a final output.',
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

      const result = this.combineResults(input, previousOutputs);

      this.setStatus('completed');
      return this.createSuccessOutput(result, startTime);
    } catch (error) {
      this.setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorOutput(errorMessage, startTime);
    }
  }

  private combineResults(
    input: AgentInput,
    outputs: Array<{ role: string; result: unknown }>
  ): CombinedResult {
    // Extract results from each agent
    const contextAnalysis = outputs.find(
      (o) => o.role === 'context-analyzer'
    )?.result as ContextAnalysis | undefined;

    const toneCalibration = outputs.find(
      (o) => o.role === 'tone-calibrator'
    )?.result as ToneCalibration | undefined;

    const generatedContent = outputs.find(
      (o) => o.role === 'content-generator'
    )?.result as GeneratedContent | undefined;

    const formattedMessage = outputs.find(
      (o) => o.role === 'platform-formatter'
    )?.result as FormattedMessage | undefined;

    const qualityReview = outputs.find(
      (o) => o.role === 'quality-reviewer'
    )?.result as QualityReview | undefined;

    const jobHuntingAdvice = outputs.find(
      (o) => o.role === 'job-hunting-specialist'
    )?.result as JobHuntingAdvice | undefined;

    const _memoryContext = outputs.find(
      (o) => o.role === 'memory-manager'
    )?.result as MemoryContext | undefined;

    // Build the final message
    const finalMessage = formattedMessage?.formattedMessage ||
      generatedContent?.fullMessage ||
      input.rawThoughts;

    // Build timing recommendation
    let timingRecommendation: string | undefined;
    if (jobHuntingAdvice?.followUpRecommendation) {
      const { recommended, timing, reason } = jobHuntingAdvice.followUpRecommendation;
      if (recommended) {
        timingRecommendation = `Follow up ${timing}: ${reason}`;
      }
    } else if (contextAnalysis?.urgency === 'high') {
      timingRecommendation = 'Send as soon as possible due to high urgency';
    }

    // Collect all improvements
    const improvements: string[] = [
      ...(qualityReview?.improvements || []),
      ...(formattedMessage?.platformNotes || []),
    ];

    return {
      generatedMessage: finalMessage,
      subject: generatedContent?.subject,
      timingRecommendation,
      qualityScore: qualityReview?.overallScore || 7,
      improvements,
      metadata: {
        platform: input.platform,
        tone: input.tone,
        characterCount: formattedMessage?.characterCount || finalMessage.length,
        withinLimits: formattedMessage?.withinLimits ?? true,
        contextAnalysis: contextAnalysis ? {
          intent: contextAnalysis.intent,
          sentiment: contextAnalysis.sentiment,
          urgency: contextAnalysis.urgency,
        } : undefined,
        toneCalibration: toneCalibration ? {
          recommendedTone: toneCalibration.recommendedTone,
          formalityLevel: toneCalibration.formalityLevel,
          warmthLevel: toneCalibration.warmthLevel,
        } : undefined,
        qualityReview: qualityReview ? {
          overallScore: qualityReview.overallScore,
          grammarScore: qualityReview.grammarScore,
          clarityScore: qualityReview.clarityScore,
          strengths: qualityReview.strengths,
        } : undefined,
        jobHuntingAdvice: jobHuntingAdvice ? {
          communicationType: jobHuntingAdvice.communicationType,
          strategicAdvice: jobHuntingAdvice.strategicAdvice,
          keyPointsToEmphasize: jobHuntingAdvice.keyPointsToEmphasize,
        } : undefined,
      },
    };
  }
}
