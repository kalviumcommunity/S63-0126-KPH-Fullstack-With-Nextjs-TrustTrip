import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import {
  sendSuccess,
  sendError,
  sendPaginatedSuccess,
} from "@/lib/responseHandler";
import { ERROR_CODES, HTTP_STATUS_CODES } from "@/lib/errorCodes";
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

/**
 * Generate a unique cache key based on query parameters
 * @param params - Query parameters for the request
 * @returns A unique cache key string
 */
function generateUsersCacheKey(params: {
  page: number;
  limit: number;
  search?: string | null;
  verified?: string | null;
  sortBy: string;
  sortOrder: string;
}): string {
  const { page, limit, search, verified, sortBy, sortOrder } = params;
  return `${CACHE_KEYS.USERS}:list:${page}:${limit}:${search || "none"}:${verified || "none"}:${sortBy}:${sortOrder}`;
}

/**
 * Invalidate all users list cache entries
 * Call this when users are created, updated, or deleted
 */
async function invalidateUsersCache(): Promise<void> {
  // Delete the main users list cache key pattern
  // For simplicity, we delete all keys matching the pattern
  const keys = await redis.keys(`${CACHE_KEYS.USERS}:list:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

/**
 * GET /api/users
 * List all users with pagination and filtering
 * Protected Route: Requires valid JWT token with any role
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 * - search: string (searches name and email)
 * - verified: boolean
 * - sortBy: string (default: createdAt)
 * - sortOrder: "asc" | "desc" (default: desc)
 *
 * Authorization: Bearer <JWT_TOKEN>
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
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

    // Build cache key
    const cacheKey = generateUsersCacheKey({
      page,
      limit,
      search,
      verified,
      sortBy,
      sortOrder,
    });

    // Try to get from cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      const cachedData = JSON.parse(cached);
      const responseTime = Date.now() - startTime;
      // eslint-disable-next-line no-console
      console.log(`[CACHE HIT] Users list - Response time: ${responseTime}ms`);
      return sendPaginatedSuccess(
        cachedData.users,
        cachedData.pagination,
        "Users fetched successfully (from cache)"
      );
    }

    // Cache miss - fetch from database
    // eslint-disable-next-line no-console
    console.log(`[CACHE MISS] Users list - Fetching from database`);

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
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { projects: true, reviews: true, bookings: true },
        },
      },
    });

    const paginationData = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };

    // Cache the result with TTL
    await redis.setex(
      cacheKey,
      CACHE_TTL.MEDIUM,
      JSON.stringify({ users, pagination: paginationData })
    );

    const responseTime = Date.now() - startTime;
    // eslint-disable-next-line no-console
    console.log(`[CACHE MISS] Users list - Response time: ${responseTime}ms`);

    return sendPaginatedSuccess(
      users,
      paginationData,
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
 * Note: In production, use /api/auth/signup for user registration
 *
 * Request Body:
 * {
 *   email: string (required),
 *   name: string (required),
 *   password: string (required, should be hashed),
 *   bio?: string,
 *   phone?: string,
 *   profileImage?: string,
 *   role?: string (default: "user")
 * }
 *
 * Authorization: Bearer <JWT_TOKEN> (admin role recommended)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, bio, phone, profileImage, role } = body;

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
    // ⚠️ WARNING: In production, always hash passwords with bcrypt or similar!
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password, // Should be hashed in production!
        bio,
        phone,
        profileImage,
        role: role || "user",
      },
    });

    // Invalidate cache after user creation
    await invalidateUsersCache();
    // eslint-disable-next-line no-console
    console.log("[CACHE INVALIDATED] Users list cache cleared");

    return sendSuccess(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
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

