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
    // Extract refresh token from cookie
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return createAuthErrorResponse("No refresh token found", 401);
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

      return response;
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

    return response;
  } catch (error) {
    return handleAsyncError(error, "POST", "/api/auth/refresh");
  }
}

/**
 * OPTIONS /api/auth/refresh
 * Handles CORS preflight for refresh endpoint
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
