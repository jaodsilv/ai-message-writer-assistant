/**
 * Get Current User API Route
 * GET /api/auth/me
 */

import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '@/lib/auth/user-store';
import { withAuth } from '@/lib/auth/middleware';
import type { UserPayload } from '@/lib/auth/jwt';

async function handler(_request: NextRequest, user: UserPayload) {
  // Get full user data
  const fullUser = await findUserById(user.userId);

  if (!fullUser) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    user: {
      id: fullUser.id,
      email: fullUser.email,
      name: fullUser.name,
      settings: fullUser.settings,
      createdAt: fullUser.createdAt,
    },
  });
}

export async function GET(request: NextRequest) {
  return withAuth(request, handler);
}
