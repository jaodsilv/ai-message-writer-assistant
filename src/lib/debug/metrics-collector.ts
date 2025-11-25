/**
 * Metrics Collector
 * Collects and aggregates metrics for debugging and monitoring
 */

import type { ProviderName } from '@/types/provider';
import type { AgentRole } from '@/types/agent';

interface RequestMetrics {
  timestamp: string;
  provider: ProviderName;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  success: boolean;
  cost: number;
}

interface AgentMetrics {
  timestamp: string;
  role: AgentRole;
  latencyMs: number;
  success: boolean;
}

interface AggregatedMetrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageLatencyMs: number;
    totalTokens: number;
    totalCost: number;
    byProvider: Record<string, {
      total: number;
      successful: number;
      averageLatencyMs: number;
      totalCost: number;
    }>;
  };
  agents: {
    total: number;
    successful: number;
    failed: number;
    averageLatencyMs: number;
    byRole: Record<string, {
      total: number;
      successful: number;
      averageLatencyMs: number;
    }>;
  };
  period: {
    start: string;
    end: string;
  };
}

class MetricsCollector {
  private requestMetrics: RequestMetrics[] = [];
  private agentMetrics: AgentMetrics[] = [];
  private maxMetrics: number = 1000;
  private enabled: boolean = true;

  /**
   * Record a request metric
   */
  recordRequest(metric: RequestMetrics): void {
    if (!this.enabled) return;

    this.requestMetrics.push(metric);

    // Trim old metrics if needed
    if (this.requestMetrics.length > this.maxMetrics) {
      this.requestMetrics = this.requestMetrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Record an agent metric
   */
  recordAgent(metric: AgentMetrics): void {
    if (!this.enabled) return;

    this.agentMetrics.push(metric);

    // Trim old metrics if needed
    if (this.agentMetrics.length > this.maxMetrics) {
      this.agentMetrics = this.agentMetrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics(since?: Date): AggregatedMetrics {
    const sinceTime = since?.getTime() || 0;

    // Filter metrics by time
    const requests = this.requestMetrics.filter(
      (m) => new Date(m.timestamp).getTime() >= sinceTime
    );
    const agents = this.agentMetrics.filter(
      (m) => new Date(m.timestamp).getTime() >= sinceTime
    );

    // Calculate request metrics
    const successfulRequests = requests.filter((r) => r.success);
    const totalLatency = requests.reduce((sum, r) => sum + r.latencyMs, 0);
    const totalTokens = requests.reduce(
      (sum, r) => sum + r.inputTokens + r.outputTokens,
      0
    );
    const totalCost = requests.reduce((sum, r) => sum + r.cost, 0);

    // Group by provider
    const byProvider: Record<string, {
      total: number;
      successful: number;
      averageLatencyMs: number;
      totalCost: number;
    }> = {};

    for (const req of requests) {
      if (!byProvider[req.provider]) {
        byProvider[req.provider] = {
          total: 0,
          successful: 0,
          averageLatencyMs: 0,
          totalCost: 0,
        };
      }

      const p = byProvider[req.provider];
      p.total++;
      if (req.success) p.successful++;
      p.averageLatencyMs =
        (p.averageLatencyMs * (p.total - 1) + req.latencyMs) / p.total;
      p.totalCost += req.cost;
    }

    // Calculate agent metrics
    const successfulAgents = agents.filter((a) => a.success);
    const totalAgentLatency = agents.reduce((sum, a) => sum + a.latencyMs, 0);

    // Group by role
    const byRole: Record<string, {
      total: number;
      successful: number;
      averageLatencyMs: number;
    }> = {};

    for (const agent of agents) {
      if (!byRole[agent.role]) {
        byRole[agent.role] = {
          total: 0,
          successful: 0,
          averageLatencyMs: 0,
        };
      }

      const r = byRole[agent.role];
      r.total++;
      if (agent.success) r.successful++;
      r.averageLatencyMs =
        (r.averageLatencyMs * (r.total - 1) + agent.latencyMs) / r.total;
    }

    // Determine period
    const allTimestamps = [
      ...requests.map((r) => r.timestamp),
      ...agents.map((a) => a.timestamp),
    ];

    const start = allTimestamps.length > 0
      ? allTimestamps.sort()[0]
      : new Date().toISOString();
    const end = allTimestamps.length > 0
      ? allTimestamps.sort().reverse()[0]
      : new Date().toISOString();

    return {
      requests: {
        total: requests.length,
        successful: successfulRequests.length,
        failed: requests.length - successfulRequests.length,
        averageLatencyMs: requests.length > 0 ? totalLatency / requests.length : 0,
        totalTokens,
        totalCost,
        byProvider,
      },
      agents: {
        total: agents.length,
        successful: successfulAgents.length,
        failed: agents.length - successfulAgents.length,
        averageLatencyMs: agents.length > 0 ? totalAgentLatency / agents.length : 0,
        byRole,
      },
      period: { start, end },
    };
  }

  /**
   * Get recent request metrics
   */
  getRecentRequests(limit: number = 50): RequestMetrics[] {
    return this.requestMetrics.slice(-limit);
  }

  /**
   * Get recent agent metrics
   */
  getRecentAgents(limit: number = 50): AgentMetrics[] {
    return this.agentMetrics.slice(-limit);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.requestMetrics = [];
    this.agentMetrics = [];
  }

  /**
   * Enable or disable metrics collection
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

export const metricsCollector = new MetricsCollector();
