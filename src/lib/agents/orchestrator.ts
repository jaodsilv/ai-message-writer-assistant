/**
 * Message Generation Orchestrator
 * Coordinates all specialized agents to generate messages
 */

import { BaseAgent } from './base-agent';
import type {
  AgentInput,
  AgentOutput,
  AgentRole,
  OrchestrationPlan,
  OrchestrationResult,
} from '@/types/agent';
import { ContextAnalyzer } from './context-analyzer';
import { ToneCalibrator } from './tone-calibrator';
import { ContentGenerator } from './content-generator';
import { PlatformFormatter } from './platform-formatter';
import { QualityReviewer } from './quality-reviewer';
import { JobHuntingSpecialist } from './job-hunting-specialist';
import { MemoryManager } from './memory-manager';
import { ResultCombiner } from './result-combiner';

interface OrchestratorConfig {
  enableJobHunting?: boolean;
  enableMemory?: boolean;
}

export class Orchestrator extends BaseAgent {
  readonly role: AgentRole = 'orchestrator';

  private agents: Map<AgentRole, BaseAgent> = new Map();
  private orchestratorConfig: OrchestratorConfig;

  constructor(config: OrchestratorConfig = {}) {
    super({
      role: 'orchestrator',
      priority: 0,
      systemPrompt: 'You are the orchestrator agent that coordinates message generation.',
    });

    this.orchestratorConfig = {
      enableJobHunting: true,
      enableMemory: true,
      ...config,
    };

    this.initializeAgents();
  }

  private initializeAgents(): void {
    // Core agents
    this.agents.set('context-analyzer', new ContextAnalyzer());
    this.agents.set('tone-calibrator', new ToneCalibrator());
    this.agents.set('content-generator', new ContentGenerator());
    this.agents.set('platform-formatter', new PlatformFormatter());
    this.agents.set('quality-reviewer', new QualityReviewer());
    this.agents.set('result-combiner', new ResultCombiner());

    // Optional agents
    if (this.orchestratorConfig.enableJobHunting) {
      this.agents.set('job-hunting-specialist', new JobHuntingSpecialist());
    }

    if (this.orchestratorConfig.enableMemory) {
      this.agents.set('memory-manager', new MemoryManager());
    }
  }

  async process(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.setStatus('running');

    try {
      // Create execution plan
      const plan = this.createPlan(input);

      // Execute agents according to plan
      const agentOutputs: AgentOutput[] = [];

      for (const group of plan.parallelGroups) {
        // Execute agents in parallel within each group
        const groupResults = await Promise.all(
          group.map(async (role) => {
            const agent = this.agents.get(role);
            if (!agent) {
              throw new Error(`Agent not found: ${role}`);
            }

            // Build input with previous agent outputs
            const enrichedInput = this.enrichInput(input, agentOutputs);
            return agent.process(enrichedInput);
          })
        );

        agentOutputs.push(...groupResults);

        // Check for errors
        const errors = groupResults.filter((r) => r.status === 'error');
        if (errors.length > 0) {
          const errorMessages = errors.map((e) => e.error).join('; ');
          throw new Error(`Agent errors: ${errorMessages}`);
        }
      }

      // Build final result
      const result = this.buildResult(plan, agentOutputs, startTime);

      this.setStatus('completed');
      return this.createSuccessOutput(result, startTime);
    } catch (error) {
      this.setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return this.createErrorOutput(errorMessage, startTime);
    }
  }

  private createPlan(input: AgentInput): OrchestrationPlan {
    const agents: AgentRole[] = [];
    const parallelGroups: AgentRole[][] = [];

    // Group 1: Analysis (can run in parallel)
    const analysisGroup: AgentRole[] = ['context-analyzer', 'tone-calibrator'];

    if (this.orchestratorConfig.enableMemory) {
      analysisGroup.push('memory-manager');
    }

    if (this.orchestratorConfig.enableJobHunting && input.scenario === 'job-hunting') {
      analysisGroup.push('job-hunting-specialist');
    }

    parallelGroups.push(analysisGroup);
    agents.push(...analysisGroup);

    // Group 2: Content generation (sequential after analysis)
    const generationGroup: AgentRole[] = ['content-generator'];
    parallelGroups.push(generationGroup);
    agents.push(...generationGroup);

    // Group 3: Formatting and review (can run in parallel)
    const postProcessGroup: AgentRole[] = ['platform-formatter', 'quality-reviewer'];
    parallelGroups.push(postProcessGroup);
    agents.push(...postProcessGroup);

    // Group 4: Result combination
    const finalGroup: AgentRole[] = ['result-combiner'];
    parallelGroups.push(finalGroup);
    agents.push(...finalGroup);

    return {
      agents,
      parallelGroups,
      estimatedTimeMs: agents.length * 1000, // Rough estimate
    };
  }

  private enrichInput(
    baseInput: AgentInput,
    previousOutputs: AgentOutput[]
  ): AgentInput {
    const additionalContext: Record<string, unknown> = {
      ...baseInput.additionalContext,
      previousAgentOutputs: previousOutputs.map((o) => ({
        role: o.role,
        result: o.result,
      })),
    };

    return {
      ...baseInput,
      additionalContext,
    };
  }

  private buildResult(
    plan: OrchestrationPlan,
    agentOutputs: AgentOutput[],
    startTime: number
  ): OrchestrationResult {
    // Find the result combiner output
    const combinerOutput = agentOutputs.find(
      (o) => o.role === 'result-combiner'
    );

    const finalResult = combinerOutput?.result as {
      generatedMessage: string;
      timingRecommendation?: string;
      alternatives?: string[];
      qualityScore?: number;
      improvements?: string[];
    } || {
      generatedMessage: '',
    };

    return {
      planId: this.id,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date().toISOString(),
      totalTimeMs: Date.now() - startTime,
      agentOutputs,
      finalResult,
    };
  }

  getAgent(role: AgentRole): BaseAgent | undefined {
    return this.agents.get(role);
  }

  getAvailableAgents(): AgentRole[] {
    return Array.from(this.agents.keys());
  }
}
