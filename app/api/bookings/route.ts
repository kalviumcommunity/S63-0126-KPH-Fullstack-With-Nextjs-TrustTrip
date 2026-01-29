import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createBookingSchema } from "@/lib/schemas/api-schemas";
import {
  createValidationErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/utils/api-response";
import { ZodError } from "zod";

// GET /api/bookings - List all bookings with pagination and filtering
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
    const userId = searchParams.get("userId");
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

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

    return NextResponse.json({
      success: true,
      data: bookings,
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
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking with Zod validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body using Zod schema
    const validatedData = createBookingSchema.parse(body);
    const { quantity, totalPrice, userId, projectId } = validatedData;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return createErrorResponse("User not found", 404);
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return createErrorResponse("Project not found", 404);
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        quantity,
        totalPrice,
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

    return createSuccessResponse(booking, "Booking created successfully", 201);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    
    console.error("Error creating booking:", error);
    return createErrorResponse("Failed to create booking");
  }
}

