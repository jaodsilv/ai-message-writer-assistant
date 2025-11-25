/**
 * Multi-Model Comparison API Route
 * POST /api/compare
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/auth/middleware';
import type { UserPayload } from '@/lib/auth/jwt';
import { parallelExecutor, recordVote, getVoteStatistics } from '@/lib/comparison';
import type { ComparisonRequest, ProviderName } from '@/types/provider';

const compareSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  systemPrompt: z.string().optional(),
  providers: z.array(
    z.enum(['claude', 'openai', 'gemini', 'groq', 'mistral', 'cohere'])
  ).min(1, 'At least one provider is required'),
  options: z.object({
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(8192).optional(),
  }).optional(),
});

const voteSchema = z.object({
  comparisonId: z.string(),
  winner: z.enum(['claude', 'openai', 'gemini', 'groq', 'mistral', 'cohere']),
  context: z.object({
    prompt: z.string(),
    scenario: z.string(),
    tone: z.string(),
  }).optional(),
});

async function handleCompare(request: NextRequest, user: UserPayload) {
  try {
    const body = await request.json();

    // Validate input
    const result = compareSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Build comparison request
    const comparisonRequest: ComparisonRequest = {
      prompt: data.prompt,
      systemPrompt: data.systemPrompt,
      providers: data.providers as ProviderName[],
      options: data.options,
    };

    // Execute parallel comparison
    const comparisonResult = await parallelExecutor.execute(comparisonRequest);

    // Get provider info for response
    const providerInfo = parallelExecutor.getProviderInfo();

    return NextResponse.json({
      success: true,
      comparison: comparisonResult,
      providerInfo,
      availableProviders: parallelExecutor.getAvailableProviders(),
    });
  } catch (error) {
    console.error('Comparison error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return withAuth(request, handleCompare);
}

// Vote endpoint
async function handleVote(request: NextRequest, user: UserPayload) {
  try {
    const body = await request.json();

    // Validate input
    const result = voteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Record the vote
    const vote = await recordVote({
      userId: user.userId,
      comparisonId: data.comparisonId,
      winner: data.winner as ProviderName,
      context: data.context,
    });

    // Get updated statistics
    const stats = await getVoteStatistics(user.userId);

    return NextResponse.json({
      success: true,
      vote,
      statistics: stats,
    });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return withAuth(request, handleVote);
}

// Get available providers and statistics
async function handleGet(request: NextRequest, user: UserPayload) {
  try {
    const stats = await getVoteStatistics(user.userId);
    const providerInfo = parallelExecutor.getProviderInfo();
    const availableProviders = parallelExecutor.getAvailableProviders();

    return NextResponse.json({
      availableProviders,
      providerInfo,
      statistics: stats,
    });
  } catch (error) {
    console.error('Get providers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return withAuth(request, handleGet);
}
