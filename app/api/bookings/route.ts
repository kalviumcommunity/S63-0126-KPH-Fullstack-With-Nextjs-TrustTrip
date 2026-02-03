import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

/**
 * Generate a unique cache key based on query parameters
 * @param params - Query parameters for the request
 * @returns A unique cache key string
 */
function generateBookingsCacheKey(params: {
  page: number;
  limit: number;
  userId?: string | null;
  projectId?: string | null;
  status?: string | null;
  sortBy: string;
  sortOrder: string;
}): string {
  const { page, limit, userId, projectId, status, sortBy, sortOrder } = params;
  return `${CACHE_KEYS.BOOKINGS}:list:${page}:${limit}:${userId || "none"}:${projectId || "none"}:${status || "none"}:${sortBy}:${sortOrder}`;
}

/**
 * Invalidate all bookings list cache entries
 * Call this when bookings are created, updated, or deleted
 */
async function invalidateBookingsCache(): Promise<void> {
  // Delete all keys matching the bookings list pattern
  const keys = await redis.keys(`${CACHE_KEYS.BOOKINGS}:list:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// GET /api/bookings - List all bookings with pagination and filtering
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
    const userId = searchParams.get("userId");
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Build cache key
    const cacheKey = generateBookingsCacheKey({
      page,
      limit,
      userId,
      projectId,
      status,
      sortBy,
      sortOrder,
    });

    // Try to get from cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      const cachedData = JSON.parse(cached);
      const responseTime = Date.now() - startTime;
      // eslint-disable-next-line no-console
      console.log(
        `[CACHE HIT] Bookings list - Response time: ${responseTime}ms`
      );
      return NextResponse.json({
        success: true,
        data: cachedData.bookings,
        pagination: cachedData.pagination,
        message: "Bookings fetched successfully (from cache)",
        responseTime,
      });
    }

    // Cache miss - fetch from database
    // eslint-disable-next-line no-console
    console.log(`[CACHE MISS] Bookings list - Fetching from database`);

    // Build where clause
    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    // Get total count for pagination
    const total = await prisma.booking.count({ where });

    // Fetch bookings
    const bookings = await prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, title: true, destination: true },
        },
        payment: {
          select: { id: true, amount: true, status: true },
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
      JSON.stringify({ bookings, pagination: paginationData })
    );

    const responseTime = Date.now() - startTime;
    // eslint-disable-next-line no-console
    console.log(
      `[CACHE MISS] Bookings list - Response time: ${responseTime}ms`
    );

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: paginationData,
      message: "Bookings fetched successfully",
      responseTime,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quantity, totalPrice, userId, projectId } = body;

    // Validate required fields
    const errors: string[] = [];
    if (!quantity) errors.push("quantity is required");
    if (!totalPrice) errors.push("totalPrice is required");
    if (!userId) errors.push("userId is required");
    if (!projectId) errors.push("projectId is required");

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        quantity: Number(quantity),
        totalPrice: parseFloat(totalPrice),
        userId,
        projectId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, title: true, destination: true },
        },
      },
    });

    // Invalidate cache after booking creation
    await invalidateBookingsCache();
    // eslint-disable-next-line no-console
    console.log("[CACHE INVALIDATED] Bookings list cache cleared");

    return NextResponse.json(
      {
        success: true,
        data: booking,
        message: "Booking created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
