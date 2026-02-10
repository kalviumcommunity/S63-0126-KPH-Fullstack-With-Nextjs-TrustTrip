import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "@/lib/auth";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

// POST /api/auth/login - Authenticate user and return JWT token
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

    // Generate access and refresh tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const { token: refreshToken, jti } = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    // Store hashed refresh token in Redis keyed by userId and jti
    const key = `refresh:${user.id}:${jti}`;
    const hashed = await hashToken(refreshToken);
    // expire after 7 days (604800 seconds)
    await redis.set(key, hashed, "EX", 60 * 60 * 24 * 7);

    // Build response and set cookies (httpOnly, secure, SameSite)
    const res = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            verified: user.verified,
          },
        },
        message: "Login successful",
        // include jti as a proof of rotation for demo/logging (not sensitive)
        rotation: { refresh_jti: jti },
      },
      { status: 200 }
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set({
      name: "accessToken",
      value: accessToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15, // 15 minutes
    });

    res.cookies.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to authenticate user" },
      { status: 500 }
    );
  }
}
