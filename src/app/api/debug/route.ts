/**
 * Debug API Route
 * GET /api/debug - Get debug information
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import type { UserPayload } from '@/lib/auth/jwt';
import { agentTracer } from '@/lib/debug/agent-tracer';
import { metricsCollector } from '@/lib/debug/metrics-collector';

async function handler(_request: NextRequest, _user: UserPayload) {
  try {
    // Only available in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Debug endpoint not available in production' },
        { status: 403 }
      );
    }

    // Get traces
    const recentTraces = agentTracer.getRecentTraces(10);
    const exportedTraces = recentTraces.map((trace) =>
      agentTracer.exportTrace(trace.requestId)
    );

    // Get metrics
    const metrics = metricsCollector.getAggregatedMetrics();
    const recentRequests = metricsCollector.getRecentRequests(20);
    const recentAgents = metricsCollector.getRecentAgents(20);

    return NextResponse.json({
      success: true,
      debug: {
        traces: exportedTraces,
        metrics,
        recentRequests,
        recentAgents,
        config: {
          tracingEnabled: agentTracer.isEnabled(),
          nodeEnv: process.env.NODE_ENV,
        },
      },
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return withAuth(request, handler);
}
