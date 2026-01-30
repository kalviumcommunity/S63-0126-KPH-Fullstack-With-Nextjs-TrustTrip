import { prisma } from "@/lib/prisma";
import { extractTokenFromHeader, verifyToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// GET /api/users - List all users with pagination and filtering (Protected Route)
export async function GET(request: NextRequest) {
  try {
    // Extract and verify JWT token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authorization token is required" },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Token is valid, proceed with fetching users
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 10)
    );
    const skip = (page - 1) * limit;

    // Filter parameters
    const search = searchParams.get("search");
    const verified = searchParams.get("verified");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (verified !== null && verified !== "") {
      where.verified = verified === "true";
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Fetch users (exclude passwords from response)
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        bio: true,
        phone: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { projects: true, reviews: true, bookings: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: users,
      authenticatedUser: {
        userId: decoded.userId,
        email: decoded.email,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user (Public - for signup via /api/auth/signup)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, bio, phone, profileImage } = body;

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

    // Note: Password hashing is handled in /api/auth/signup
    // This endpoint is for direct user creation if needed
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password, // Should be hashed before passing here
        bio,
        phone,
        profileImage,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          verified: user.verified,
          createdAt: user.createdAt,
        },
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}

