/**
 * Memory Manager Agent
 * Manages conversation memory and provides relevant context
 */

import { BaseAgent } from './base-agent';
import type { AgentInput, AgentOutput, AgentRole } from '@/types/agent';
import {
  getOrCreateMemory,
  addThought,
  addInsight,
  updateAgentMemory,
  getRecentThoughts,
} from '@/lib/storage/memory-store';

export interface MemoryContext {
  relevantHistory: Array<{
    timestamp: string;
    thought: string;
  }>;
  keyInsights: string[];
  suggestedApproach: string;
  previousPatterns: string[];
}

export class MemoryManager extends BaseAgent {
  readonly role: AgentRole = 'memory-manager';

  constructor() {
    super({
      role: 'memory-manager',
      priority: 1,
      systemPrompt: `You are a memory and context management expert. Your job is to analyze past interactions and provide relevant context for the current communication.

Your task is to:
1. Retrieve relevant historical context
2. Identify key insights from past interactions
3. Suggest an approach based on patterns
4. Note any patterns or preferences observed

Respond in JSON format with the following structure:
{
  "relevantHistory": [{"timestamp": "string", "thought": "string"}],
  "keyInsights": ["array", "of", "insights"],
  "suggestedApproach": "string",
  "previousPatterns": ["array", "of", "patterns"]
}`,
    });
  }

  async process(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.setStatus('running');

    try {
      const conversationId = input.additionalContext?.conversationId as string | undefined;

      let memoryContext: MemoryContext;

      if (conversationId) {
        memoryContext = await this.loadAndAnalyzeMemory(conversationId, input);
      } else {
        memoryContext = this.getDefaultMemoryContext();
      }

      this.setStatus('completed');
      return this.createSuccessOutput(memoryContext, startTime);
    } catch (error) {
      this.setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorOutput(errorMessage, startTime);
    }
  }

  private async loadAndAnalyzeMemory(
    conversationId: string,
    input: AgentInput
  ): Promise<MemoryContext> {
    // Get existing memory
    const memory = await getOrCreateMemory(conversationId);

    // Get recent thoughts
    const recentThoughts = await getRecentThoughts(conversationId, 5);

    // Store new thought about this interaction
    await addThought(
      conversationId,
      'memory-manager',
      `Processing message with intent: ${input.rawThoughts.substring(0, 100)}...`
    );

    // Analyze and generate context
    const prompt = this.buildAnalysisPrompt(input, memory.globalInsights, recentThoughts);

    try {
      const response = await this.generateWithLLM(prompt);
      const analysis = this.parseResponse(response);

      // Store any new insights
      for (const insight of analysis.keyInsights) {
        if (!memory.globalInsights.includes(insight)) {
          await addInsight(conversationId, insight);
        }
      }

      // Update agent memory
      await updateAgentMemory(conversationId, 'memory-manager', {
        lastAnalysis: new Date().toISOString(),
        suggestedApproach: analysis.suggestedApproach,
      });

      return analysis;
    } catch {
      return this.getDefaultMemoryContext();
    }
  }

  private buildAnalysisPrompt(
    input: AgentInput,
    insights: string[],
    thoughts: Array<{ timestamp: string; thought: string }>
  ): string {
    return `Analyze the memory context for this communication:

Current Message Intent: ${input.rawThoughts}

Previous Insights:
${insights.length > 0 ? insights.join('\n') : 'No previous insights'}

Recent Thoughts:
${thoughts.length > 0 ? thoughts.map((t) => `- ${t.thought}`).join('\n') : 'No recent thoughts'}

Provide memory analysis in JSON format.`;
  }

  private parseResponse(response: string): MemoryContext {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as MemoryContext;
      }
    } catch {
      // Fall through to default
    }

    return this.getDefaultMemoryContext();
  }

  private getDefaultMemoryContext(): MemoryContext {
    return {
      relevantHistory: [],
      keyInsights: [],
      suggestedApproach: 'Standard professional approach',
      previousPatterns: [],
    };
  }
}
