import { NextRequest, NextResponse } from "next/server";
import { clearRefreshTokenCookie } from "@/lib/tokenManager";
import { addCorsHeaders, handleCorsPreflightRequest } from "@/lib/cors";

/**
 * POST /api/auth/logout
 *
 * Logs out user by clearing refresh token cookie.
 *
 * Process:
 * 1. Clear refresh token HTTP-only cookie
 * 2. Client should also clear localStorage of access token
 * 3. Return success response with CORS headers
 *
 * Note: Access token is not revoked on server (stateless JWT).
 * It will remain valid until expiry (15 minutes).
 * For immediate revocation, implement token blacklist in database/Redis.
 */
export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );

    // Clear refresh token cookie
    clearRefreshTokenCookie(response);

    return addCorsHeaders(response, origin);
  } catch (error) {
    console.error("Logout error:", error);
    const origin = request.headers.get("origin");

    const response = NextResponse.json(
      {
        success: false,
        error: "Logout failed",
      },
      { status: 500 }
    );

    // Still clear cookie on error
    clearRefreshTokenCookie(response);

    return addCorsHeaders(response, origin);
  }
}

/**
 * OPTIONS /api/auth/logout
 * Handles CORS preflight for logout endpoint with secure configuration
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return handleCorsPreflightRequest(origin, {
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  });
}
