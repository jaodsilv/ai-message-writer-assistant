/**
 * Authentication Middleware
 * Protects API routes and pages that require authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader, type UserPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: UserPayload;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest, user: UserPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }

  const user = await verifyAccessToken(token);

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid or expired token', code: 'INVALID_TOKEN' },
      { status: 401 }
    );
  }

  return handler(request as AuthenticatedRequest, user);
}

/**
 * Helper to create an authenticated API route handler
 */
export function createAuthenticatedHandler(
  handler: (req: AuthenticatedRequest, user: UserPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    return withAuth(request, handler);
  };
}

/**
 * Get user from request (for use in server components)
 */
export async function getUserFromRequest(request: NextRequest): Promise<UserPayload | null> {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return null;
  }

  return verifyAccessToken(token);
}
