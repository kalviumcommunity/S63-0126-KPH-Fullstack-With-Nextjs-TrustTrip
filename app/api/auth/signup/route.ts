import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { getDefaultRole } from "@/lib/rbac";

// POST /api/auth/signup - Register a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, bio, phone, profileImage, role } = body;

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

    // Assign default role (viewer) if not provided
    const assignedRole = role || getDefaultRole();

    // Create the user with hashed password and role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        bio,
        phone,
        profileImage,
        verified: false,
        role: assignedRole,
      },
    });

    // Log user registration with role
    console.log(`[AUTH] New user registered: ${email} with role: ${assignedRole}`);

    // Return success response (without password)
    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          verified: user.verified,
          role: user.role,
          createdAt: user.createdAt,
        },
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
