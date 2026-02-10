import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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


      userId: user.id,
      email: user.email,
      name: user.name,
      role: userRole,
    });


      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            verified: user.verified,
            role: userRole,
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
