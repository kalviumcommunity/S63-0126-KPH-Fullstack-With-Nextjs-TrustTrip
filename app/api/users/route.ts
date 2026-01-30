import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import {
  sendSuccess,
  sendError,
  sendPaginatedSuccess,
} from "@/lib/responseHandler";
import { ERROR_CODES, HTTP_STATUS_CODES } from "@/lib/errorCodes";

/**
 * GET /api/users
 * List all users with pagination and filtering
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 * - search: string (searches name and email)
 * - verified: boolean
 * - sortBy: string (default: createdAt)
 * - sortOrder: "asc" | "desc" (default: desc)
 */
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

    return sendPaginatedSuccess(
      users,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      "Users fetched successfully"
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching users:", error);
    return sendError(
      "Failed to fetch users",
      ERROR_CODES.USER_FETCH_ERROR,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      error
    );
  }
}

/**
 * POST /api/users
 * Create a new user
 *
 * Request Body:
 * {
 *   email: string (required),
 *   name: string (required),
 *   password: string (required),
 *   bio?: string,
 *   phone?: string,
 *   profileImage?: string
 * }
 */
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
      return sendError(
        "Validation failed: " + errors.join(", "),
        ERROR_CODES.VALIDATION_ERROR,
        HTTP_STATUS_CODES.BAD_REQUEST,
        errors
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendError(
        "Email already in use",
        ERROR_CODES.EMAIL_ALREADY_IN_USE,
        HTTP_STATUS_CODES.CONFLICT
      );
    }

    // Create the user
    // Note: In production, always hash passwords with bcrypt or similar!
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password, // ⚠️ WARNING: This is a demo - always hash passwords in production!
        bio,
        phone,
        profileImage,
      },
    });

    return sendSuccess(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        verified: user.verified,
        createdAt: user.createdAt,
      },
      "User created successfully",
      HTTP_STATUS_CODES.CREATED
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating user:", error);

    // Check for specific Prisma errors
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return sendError(
        "A user with this email already exists",
        ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION,
        HTTP_STATUS_CODES.CONFLICT,
        error.message
      );
    }

    return sendError(
      "Failed to create user",
      ERROR_CODES.USER_CREATION_FAILED,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      error
    );
  }
}
