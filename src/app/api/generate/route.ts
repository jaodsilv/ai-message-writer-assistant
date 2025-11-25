/**
 * Message Generation API Route
 * POST /api/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth/middleware';
import type { UserPayload } from '@/lib/auth/jwt';
import { Orchestrator } from '@/lib/agents';
import type { AgentInput } from '@/types/agent';

const generateSchema = z.object({
  rawThoughts: z.string().min(1, 'Raw thoughts are required'),
  platform: z.enum(['email', 'linkedin', 'whatsapp', 'custom']),
  tone: z.enum(['professional', 'warm', 'concise', 'formal', 'casual', 'persuasive']),
  scenario: z.enum(['job-hunting', 'work', 'personal']),
  conversationContext: z.string().optional(),
  conversationId: z.string().uuid().optional(),
  additionalContext: z.record(z.unknown()).optional(),
});

async function handler(request: NextRequest, user: UserPayload) {
  try {
    const body = await request.json();

    // Validate input
    const result = generateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Build agent input
    const agentInput: AgentInput = {
      rawThoughts: data.rawThoughts,
      platform: data.platform,
      tone: data.tone,
      scenario: data.scenario,
      conversationContext: data.conversationContext,
      additionalContext: {
        ...data.additionalContext,
        conversationId: data.conversationId,
        userId: user.userId,
      },
    };

    // Create orchestrator and process
    const orchestrator = new Orchestrator({
      enableJobHunting: data.scenario === 'job-hunting',
      enableMemory: !!data.conversationId,
    });

    const output = await orchestrator.process(agentInput);

    if (output.status === 'error') {
      return NextResponse.json(
        { error: output.error || 'Generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      result: output.result,
      metadata: {
        agentId: output.agentId,
        processingTimeMs: output.processingTimeMs,
      },
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, handler);
}
