import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createReviewSchema } from "@/lib/schemas/api-schemas";
import {
  createValidationErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/utils/api-response";
import { ZodError } from "zod";

// GET /api/reviews - List all reviews with pagination and filtering
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
    const minRating = searchParams.get("minRating");
    const maxRating = searchParams.get("maxRating");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Build where clause
    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (projectId) where.projectId = projectId;
    if (minRating || maxRating) {
      where.rating = {};
      if (minRating)
        (where.rating as Record<string, number>).gte = Number(minRating);
      if (maxRating)
        (where.rating as Record<string, number>).lte = Number(maxRating);
    }

    // Get total count for pagination
    const total = await prisma.review.count({ where });

    // Fetch reviews
    const reviews = await prisma.review.findMany({
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
      },
    });

    return NextResponse.json({
      success: true,
      data: reviews,
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
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review with Zod validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body using Zod schema
    const validatedData = createReviewSchema.parse(body);
    const { rating, comment, userId, projectId } = validatedData;

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

    // Check for duplicate review (user can only review a project once)
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (existingReview) {
      return createErrorResponse("You have already reviewed this project", 409);
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
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

    return createSuccessResponse(review, "Review created successfully", 201);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    
    console.error("Error creating review:", error);
    return createErrorResponse("Failed to create review");
  }
}

