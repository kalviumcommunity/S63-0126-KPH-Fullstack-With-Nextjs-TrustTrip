import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

/**
 * JWT Token Management System
 *
 * Implements secure token generation and validation with:
 * - Short-lived access tokens for API requests
 * - Long-lived refresh tokens for session renewal
 * - HTTP-only cookie storage for refresh tokens
 * - Strict payload validation
 */

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || "trusttrip-secret-key-change-production";
const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET;

// Token expiry times
export const ACCESS_TOKEN_EXPIRY = "15m";        // Short-lived: 15 minutes
export const REFRESH_TOKEN_EXPIRY = "7d";        // Long-lived: 7 days
export const COOKIE_EXPIRY = 7 * 24 * 60 * 60;   // 7 days in seconds

/**
 * JWT Payload Interface
 * Contains only non-sensitive claims for security
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate Access Token
 *
 * Short-lived token (15 minutes) used for API request authentication.
 * Passed via Authorization header as Bearer token.
 *
 * @param userId - User ID
 * @param email - User email
 * @param role - Optional user role
 * @returns Access token string
 */
export function generateAccessToken(
  userId: string,
  email: string,
  role?: string
): string {
  const payload: JWTPayload = {
    userId,
    email,
    ...(role && { role }),
  };

  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      algorithm: "HS256",
    });
  } catch (error) {
    console.error("Failed to generate access token:", error);
    throw new Error("Token generation failed");
  }
}

/**
 * Generate Refresh Token
 *
 * Long-lived token (7 days) used to obtain new access tokens.
 * Stored in HTTP-only, secure, SameSite cookie.
 *
 * @param userId - User ID
 * @param email - User email
 * @returns Refresh token string
 */
export function generateRefreshToken(userId: string, email: string): string {
  const payload: JWTPayload = {
    userId,
    email,
    tokenType: "refresh",
  };

  try {
    return jwt.sign(payload, REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      algorithm: "HS256",
    });
  } catch (error) {
    console.error("Failed to generate refresh token:", error);
    throw new Error("Refresh token generation failed");
  }
}

/**
 * Verify Access Token
 *
 * Validates access token signature and expiry.
 *
 * @param token - Access token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return decoded as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn("Access token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn("Invalid access token:", error.message);
    }
    return null;
  }
}

/**
 * Verify Refresh Token
 *
 * Validates refresh token signature and expiry.
 *
 * @param token - Refresh token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET, {
      algorithms: ["HS256"],
    });
    return decoded as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn("Refresh token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn("Invalid refresh token:", error.message);
    }
    return null;
  }
}

/**
 * Extract Token from Authorization Header
 *
 * Extracts Bearer token from "Authorization: Bearer <token>" header.
 *
 * @param authHeader - Authorization header value
 * @returns Token string or null if not found
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Set Refresh Token Cookie
 *
 * Sets HTTP-only, secure, SameSite cookie for refresh token.
 * Protects against XSS and CSRF attacks.
 *
 * @param response - NextResponse object
 * @param token - Refresh token to store
 */
export function setRefreshTokenCookie(
  response: NextResponse,
  token: string
): void {
  response.cookies.set({
    name: "refreshToken",
    value: token,
    httpOnly: true,           // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict",       // CSRF protection
    maxAge: COOKIE_EXPIRY,    // 7 days
    path: "/",
  });
}

/**
 * Clear Refresh Token Cookie
 *
 * Removes refresh token cookie on logout.
 *
 * @param response - NextResponse object
 */
export function clearRefreshTokenCookie(response: NextResponse): void {
  response.cookies.set({
    name: "refreshToken",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0, // Immediately expires the cookie
    path: "/",
  });
}

/**
 * Parse Authentication Header
 *
 * Extracts Authorization header from request.
 * Handles both Next.js ServerRequest and NextRequest types.
 *
 * @param request - Request object
 * @returns Authorization header value or null
 */
export function getAuthHeader(request: {
  headers?: {
    get?: (name: string) => string | null;
    authorization?: string;
  };
}): string | null {
  // NextRequest style
  if (request.headers?.get) {
    return request.headers.get("authorization");
  }

  // Plain object style
  return request.headers?.authorization || null;
}

/**
 * Validate Token Payload
 *
 * Ensures token contains required claims.
 *
 * @param payload - Decoded JWT payload
 * @returns true if valid, false otherwise
 */
export function isValidPayload(payload: unknown): payload is JWTPayload {
  if (typeof payload !== "object" || payload === null) return false;

  const p = payload as Record<string, unknown>;
  return (
    typeof p.userId === "string" &&
    typeof p.email === "string" &&
    (p.role === undefined || typeof p.role === "string")
  );
}

/**
 * Create Error Response for Token Issues
 *
 * Returns standardized error responses for auth failures.
 *
 * @param message - Error message
 * @param status - HTTP status code
 * @returns NextResponse with error
 */
export function createAuthErrorResponse(
  message: string,
  status: number = 401
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Refresh Token Rotation
 *
 * Utility to rotate refresh tokens on each use.
 * Improves security by limiting token lifetime.
 *
 * @param oldRefreshToken - Current refresh token
 * @param payload - Original token payload
 * @returns New refresh token
 */
export function rotateRefreshToken(
  oldRefreshToken: string,
  payload: JWTPayload
): string {
  // In production, you might want to invalidate old token in database
  // For now, simply generate a new one
  return generateRefreshToken(payload.userId, payload.email);
}
