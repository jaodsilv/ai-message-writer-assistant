/**
 * Token Refresh API Route
 * POST /api/auth/refresh
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findUserById } from '@/lib/auth/user-store';
import { verifyRefreshToken, generateTokenPair } from '@/lib/auth/jwt';

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = refreshSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { refreshToken } = result.data;

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Get user
    const user = await findUserById(payload.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate new token pair (rotating refresh token)
    const tokens = await generateTokenPair({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      message: 'Token refreshed',
      ...tokens,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
