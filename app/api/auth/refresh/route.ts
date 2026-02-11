import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  createAuthErrorResponse,
} from "@/lib/tokenManager";
import { NextRequest, NextResponse } from "next/server";
import { handleAsyncError } from "@/lib/errorHandler";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/lib/cors";

/**
 * POST /api/auth/refresh
 *
 * Refreshes access token using valid refresh token.
 *
 * Security features:
 * - Validates refresh token from HTTP-only cookie
 * - Issues new access token (15m) and refresh token (7d)
 * - Rotates refresh token on use
 * - Returns 401 if refresh token invalid/expired
 * - Clears cookie on token expiration for cleanup
 * - CORS headers for cross-origin requests
 *
 * Process:
 * 1. Extract refresh token from HTTP-only cookie
 * 2. Verify refresh token signature and expiry
 * 3. Generate new access token
 * 4. Generate new refresh token (rotation)
 * 5. Set new refresh token in cookie
 * 6. Return new access token in response body
 */
export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");

    // Extract refresh token from cookie
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      const response = createAuthErrorResponse("No refresh token found", 401);
      return addCorsHeaders(response, origin);
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      // Token invalid or expired
      const response = createAuthErrorResponse(
        "Refresh token invalid or expired",
        401
      );

      // Clear expired token cookie
      clearRefreshTokenCookie(response);

      return addCorsHeaders(response, origin);
    }

    // Generate new tokens
    const accessToken = generateAccessToken(
      payload.userId,
      payload.email,
      payload.role
    );
    const newRefreshToken = generateRefreshToken(
      payload.userId,
      payload.email
    );

    // Create response with new access token
    const response = NextResponse.json(
      {
        success: true,
        data: {
          accessToken,
        },
        message: "Token refreshed successfully",
      },
      { status: 200 }
    );

    // Set new refresh token in HTTP-only cookie (rotation)
    setRefreshTokenCookie(response, newRefreshToken);

    return addCorsHeaders(response, origin);
  } catch (error) {
    const response = await handleAsyncError(error, "POST", "/api/auth/refresh");
    const origin = request.headers.get("origin");
    return addCorsHeaders(response, origin);
  }
}

/**
 * OPTIONS /api/auth/refresh
 * Handles CORS preflight for refresh endpoint with secure configuration
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return handleCorsPreflightRequest(origin, {
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  });
}
