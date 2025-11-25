/**
 * Agent Tracer
 * Traces agent execution for debugging
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  AgentRole,
  AgentInput,
  AgentOutput,
  AgentTrace,
  AgentLog,
  ExecutionTrace,
  OrchestrationPlan,
  OrchestrationResult,
} from '@/types/agent';

class AgentTracer {
  private traces: Map<string, ExecutionTrace> = new Map();
  private currentTraceId: string | null = null;
  private enabled: boolean = process.env.NODE_ENV === 'development';

  /**
   * Start a new execution trace
   */
  startTrace(plan: OrchestrationPlan): string {
    if (!this.enabled) return '';

    const traceId = uuidv4();
    const trace: ExecutionTrace = {
      requestId: traceId,
      startTime: new Date().toISOString(),
      endTime: '',
      plan,
      traces: [],
      result: null as unknown as OrchestrationResult,
    };

    this.traces.set(traceId, trace);
    this.currentTraceId = traceId;

    return traceId;
  }

  /**
   * Record an agent execution
   */
  recordAgentExecution(
    traceId: string,
    role: AgentRole,
    input: AgentInput,
    output: AgentOutput
  ): void {
    if (!this.enabled) return;

    const trace = this.traces.get(traceId);
    if (!trace) return;

    const agentTrace: AgentTrace = {
      agentId: output.agentId,
      role,
      startTime: new Date(Date.now() - output.processingTimeMs).toISOString(),
      endTime: new Date().toISOString(),
      input,
      output,
      logs: [],
    };

    trace.traces.push(agentTrace);
  }

  /**
   * Add a log entry to the current agent trace
   */
  log(
    traceId: string,
    agentId: string,
    level: AgentLog['level'],
    message: string,
    data?: unknown
  ): void {
    if (!this.enabled) return;

    const trace = this.traces.get(traceId);
    if (!trace) return;

    const agentTrace = trace.traces.find((t) => t.agentId === agentId);
    if (!agentTrace) return;

    agentTrace.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    });
  }

  /**
   * End the execution trace
   */
  endTrace(traceId: string, result: OrchestrationResult): ExecutionTrace | null {
    if (!this.enabled) return null;

    const trace = this.traces.get(traceId);
    if (!trace) return null;

    trace.endTime = new Date().toISOString();
    trace.result = result;

    if (this.currentTraceId === traceId) {
      this.currentTraceId = null;
    }

    return trace;
  }

  /**
   * Get a trace by ID
   */
  getTrace(traceId: string): ExecutionTrace | null {
    return this.traces.get(traceId) || null;
  }

  /**
   * Get all traces
   */
  getAllTraces(): ExecutionTrace[] {
    return Array.from(this.traces.values());
  }

  /**
   * Get recent traces
   */
  getRecentTraces(limit: number = 10): ExecutionTrace[] {
    const traces = Array.from(this.traces.values());
    return traces
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }

  /**
   * Clear old traces
   */
  clearOldTraces(maxAge: number = 3600000): void {
    const now = Date.now();

    for (const [id, trace] of this.traces.entries()) {
      const age = now - new Date(trace.startTime).getTime();
      if (age > maxAge) {
        this.traces.delete(id);
      }
    }
  }

  /**
   * Enable or disable tracing
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if tracing is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Export trace for visualization
   */
  exportTrace(traceId: string): object | null {
    const trace = this.traces.get(traceId);
    if (!trace) return null;

    return {
      requestId: trace.requestId,
      duration: trace.endTime
        ? new Date(trace.endTime).getTime() - new Date(trace.startTime).getTime()
        : null,
      startTime: trace.startTime,
      endTime: trace.endTime,
      agentCount: trace.traces.length,
      agents: trace.traces.map((t) => ({
        role: t.role,
        duration: new Date(t.endTime).getTime() - new Date(t.startTime).getTime(),
        status: t.output.status,
        logCount: t.logs.length,
      })),
      result: trace.result ? {
        success: trace.result.finalResult.generatedMessage.length > 0,
        qualityScore: trace.result.finalResult.qualityScore,
      } : null,
    };
  }
}

export const agentTracer = new AgentTracer();
