import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
} from "@/lib/tokenManager";
import { NextRequest, NextResponse } from "next/server";
import { handleAsyncError } from "@/lib/errorHandler";

/**
 * POST /api/auth/login
 *
 * Authenticates user and issues tokens:
 * - Access token (15m): Returned in response body, used for API requests
 * - Refresh token (7d): Set in HTTP-only cookie, used to refresh access token
 *
 * Security features:
 * - HTTP-only cookies for refresh token (prevents XSS)
 * - HTTPS only in production
 * - SameSite=Strict for CSRF protection
 * - Bcrypt password hashing with salt rounds
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // User not found
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user has a password (might be OAuth users)
    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This account uses social login. Please sign in with your provider.",
        },
        { status: 401 }
      );
    }

    // Verify password using bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Invalid password
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // Create response with access token
    const response = NextResponse.json(
      {
        success: true,
        data: {
          accessToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            verified: user.verified,
          },
        },
        message: "Login successful",
      },
      { status: 200 }
    );

    // Set refresh token in HTTP-only cookie
    setRefreshTokenCookie(response, refreshToken);

    return response;
  } catch (error) {
    return handleAsyncError(error, "POST", "/api/auth/login");
  }
}
