import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";
import { handleAsyncError } from "@/lib/errorHandler";
import { logger } from "@/lib/logger";
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
} from "@/lib/tokenManager";

/**
 * POST /api/auth/signup
 *
 * Registers a new user and issues tokens:
 * - Access token (15m): Returned in response body
 * - Refresh token (7d): Set in HTTP-only cookie
 *
 * Process:
 * 1. Validate input (email, name, password)
 * 2. Check email uniqueness
 * 3. Hash password with bcrypt (10 salt rounds)
 * 4. Create user in database
 * 5. Generate and return tokens (dual-token system)
 * 6. Send welcome email asynchronously
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, bio, phone, profileImage } = body;

    // Validate required fields
    const errors: string[] = [];
    if (!email) errors.push("email is required");
    if (!name) errors.push("name is required");
    if (!password) errors.push("password is required");

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already in use" },
        { status: 409 }
      );
    }

    // Hash password using bcrypt with salt rounds of 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user with hashed password
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        bio,
        phone,
        profileImage,
        verified: false,
      },
    });

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
            createdAt: user.createdAt,
          },
        },
        message: "User registered successfully",
      },
      { status: 201 }
    );

    // Set refresh token in HTTP-only cookie
    setRefreshTokenCookie(response, refreshToken);

    // Send welcome email (non-blocking)
    // Note: We don't await this to avoid blocking the response
    // Email failures won't affect user registration success
    sendWelcomeEmail(user.email, user.name)
      .then((emailResult) => {
        if (emailResult.success) {
          logger.info(`Welcome email sent to ${user.email}`, {
            messageId: emailResult.messageId,
            developmentMode: emailResult.developmentMode,
            correlationId: logger.generateCorrelationId(),
          });
        } else {
          logger.error(
            `Failed to send welcome email to ${user.email}: ${emailResult.error}`,
            undefined,
            {
              correlationId: logger.generateCorrelationId(),
            }
          );
        }
      })
      .catch((error) => {
        logger.error(
          `Welcome email error for ${user.email}: ${error}`,
          error as Error,
          {
            correlationId: logger.generateCorrelationId(),
          }
        );
      });

    return response;
  } catch (error) {
    return handleAsyncError(error, "POST", "/api/auth/signup");
  }
}
