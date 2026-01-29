import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createUserSchema } from "@/lib/schemas/api-schemas";
import {
  createValidationErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/utils/api-response";
import { ZodError } from "zod";

// GET /api/users - List all users with pagination and filtering
export async function GET(request: NextRequest) {
  try {
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

    // Fetch users
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        email: true,
        name: true,
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
    return createErrorResponse("Failed to fetch users");
  }
}

// POST /api/users - Create a new user with Zod validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body using Zod schema
    const validatedData = createUserSchema.parse(body);
    const { email, name, password, bio, phone, profileImage } = validatedData;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return createErrorResponse("Email already in use", 409);
    }

    // Create the user (Note: In production, always hash passwords!)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password, // Note: This is a demo - always hash passwords in production!
        bio,
        phone,
        profileImage,
      },
    });

    // Return user data without password
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      bio: user.bio,
      phone: user.phone,
      verified: user.verified,
      createdAt: user.createdAt,
    };

    return createSuccessResponse(userData, "User created successfully", 201);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    
    console.error("Error creating user:", error);
    return createErrorResponse("Failed to create user");
  }
}

