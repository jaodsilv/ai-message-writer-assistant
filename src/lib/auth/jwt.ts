/**
 * JWT Authentication Utilities
 * Using jose library for JWT operations (works in Edge runtime)
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export interface UserPayload extends JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return new TextEncoder().encode(secret);
};

const getAccessTokenExpiry = (): string => {
  return process.env.JWT_EXPIRES_IN || '24h';
};

const getRefreshTokenExpiry = (): string => {
  return process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
};

/**
 * Generate an access token for a user
 */
export async function generateAccessToken(payload: UserPayload): Promise<string> {
  const secret = getSecret();

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(getAccessTokenExpiry())
    .setIssuer('ai-message-writer')
    .setAudience('ai-message-writer-client')
    .sign(secret);
}

/**
 * Generate a refresh token for a user
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  const secret = getSecret();

  return new SignJWT({ userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(getRefreshTokenExpiry())
    .setIssuer('ai-message-writer')
    .setAudience('ai-message-writer-refresh')
    .sign(secret);
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokenPair(payload: UserPayload): Promise<TokenPair> {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(payload),
    generateRefreshToken(payload.userId),
  ]);

  return { accessToken, refreshToken };
}

/**
 * Verify and decode an access token
 */
export async function verifyAccessToken(token: string): Promise<UserPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'ai-message-writer',
      audience: 'ai-message-writer-client',
    });

    return payload as UserPayload;
  } catch {
    return null;
  }
}

/**
 * Verify and decode a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'ai-message-writer',
      audience: 'ai-message-writer-refresh',
    });

    if (payload.type !== 'refresh') {
      return null;
    }

    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
