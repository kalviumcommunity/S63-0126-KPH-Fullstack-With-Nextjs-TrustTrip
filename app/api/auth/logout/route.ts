import { NextRequest, NextResponse } from "next/server";
import { clearRefreshTokenCookie } from "@/lib/tokenManager";

/**
 * POST /api/auth/logout
 *
 * Logs out user by clearing refresh token cookie.
 *
 * Process:
 * 1. Clear refresh token HTTP-only cookie
 * 2. Client should also clear localStorage of access token
 * 3. Return success response
 *
 * Note: Access token is not revoked on server (stateless JWT).
 * It will remain valid until expiry (15 minutes).
 * For immediate revocation, implement token blacklist in database/Redis.
 */
export async function POST(request: NextRequest) {
  try {
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

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    const response = NextResponse.json(
      {
        success: false,
        error: "Logout failed",
      },
      { status: 500 }
    );

    // Still clear cookie on error
    clearRefreshTokenCookie(response);

    return response;
  }
}

/**
 * OPTIONS /api/auth/logout
 * Handles CORS preflight for logout endpoint
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
