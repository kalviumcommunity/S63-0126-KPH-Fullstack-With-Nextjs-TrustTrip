import { NextRequest, NextResponse } from "next/server";
import {
  extractBearerToken,
  verifyAccessToken,
  createAuthErrorResponse,
  getAuthHeader,
} from "@/lib/tokenManager";

/**
 * Auth Middleware
 *
 * Protects API routes by validating access tokens.
 * Validates Bearer token from Authorization header.
 *
 * Usage in route handlers:
 * ```
 * import { withAuth } from "@/lib/middleware";
 *
 * export const POST = withAuth(async (request, payload) => {
 *   // payload contains validated JWT claims
 *   console.log(payload.userId, payload.email);
 *   return NextResponse.json({ success: true });
 * });
 * ```
 *
 * Error responses:
 * - 401: No token, invalid token, or expired token
 * - 401: Malformed Authorization header
 *
 * Token validation includes:
 * - Signature verification (HS256)
 * - Expiry check
 * - Payload validation (userId, email)
 */
export function withAuth(
  handler: (request: NextRequest, payload: any) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      // Get Authorization header
      const authHeader = getAuthHeader(request as any);

      if (!authHeader) {
        return createAuthErrorResponse("Authorization header missing", 401);
      }

      // Extract Bearer token
      const token = extractBearerToken(authHeader);

      if (!token) {
        return createAuthErrorResponse(
          'Invalid Authorization header format. Expected "Bearer <token>"',
          401
        );
      }

      // Verify access token
      const payload = verifyAccessToken(token);

      if (!payload) {
        return createAuthErrorResponse(
          "Invalid or expired access token",
          401
        );
      }

      // Call handler with validated payload
      return await handler(request, payload);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return createAuthErrorResponse("Authentication failed", 401);
    }
  };
}

/**
 * Validation Result Type
 * Returned by validateToken for route handlers
 */
export interface TokenValidationResult {
  valid: boolean;
  payload?: any;
  error?: string;
}

/**
 * Validate Token from Request
 *
 * Manual token validation for route handlers.
 * Useful when you need to handle auth partially or optionally.
 *
 * @param request - NextRequest object
 * @returns TokenValidationResult with payload if valid
 */
export function validateToken(request: NextRequest): TokenValidationResult {
  try {
    const authHeader = getAuthHeader(request as any);

    if (!authHeader) {
      return { valid: false, error: "Authorization header missing" };
    }

    const token = extractBearerToken(authHeader);

    if (!token) {
      return { valid: false, error: "Malformed Authorization header" };
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      return { valid: false, error: "Invalid or expired token" };
    }

    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: "Token validation error" };
  }
}

/**
 * Optional Auth Middleware
 *
 * Like withAuth but doesn't require valid token.
 * Passes payload to handler if token valid, undefined if not.
 *
 * Useful for routes that work both authenticated and unauthenticated.
 */
export function withOptionalAuth(
  handler: (request: NextRequest, payload?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const authHeader = getAuthHeader(request as any);
      let payload;

      if (authHeader) {
        const token = extractBearerToken(authHeader);
        if (token) {
          payload = verifyAccessToken(token);
        }
      }

      return await handler(request, payload);
    } catch (error) {
      console.error("Optional auth middleware error:", error);
      return handler(request, undefined);
    }
  };
}
