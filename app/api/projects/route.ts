import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import {
  sendSuccess,
  sendError,
  sendPaginatedSuccess,
} from "@/lib/responseHandler";
import { ERROR_CODES, HTTP_STATUS_CODES } from "@/lib/errorCodes";

/**
 * GET /api/projects
 * List all projects with pagination and filtering
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 * - userId: string
 * - status: string
 * - destination: string
 * - search: string (searches title, description, destination)
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
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const destination = searchParams.get("destination");
    const search = searchParams.get("search");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Build where clause
    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (destination)
      where.destination = { contains: destination, mode: "insensitive" };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { destination: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.project.count({ where });

    // Fetch projects
    const projects = await prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { tasks: true, reviews: true, bookings: true },
        },
      },
    });

    return sendPaginatedSuccess(
      projects,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      "Projects fetched successfully"
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching projects:", error);
    return sendError(
      "Failed to fetch projects",
      ERROR_CODES.PROJECT_NOT_FOUND,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      error
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 *
 * Request Body:
 * {
 *   title: string (required),
 *   description?: string,
 *   destination: string (required),
 *   startDate: string (ISO date, required),
 *   endDate: string (ISO date, required),
 *   budget?: number,
 *   currency?: string,
 *   userId: string (required),
 *   imageUrl?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      destination,
      startDate,
      endDate,
      budget,
      currency,
      userId,
      imageUrl,
    } = body;

    // Validate required fields
    const errors: string[] = [];
    if (!title) errors.push("title is required");
    if (!destination) errors.push("destination is required");
    if (!startDate) errors.push("startDate is required");
    if (!endDate) errors.push("endDate is required");
    if (!userId) errors.push("userId is required");

    if (errors.length > 0) {
      return sendError(
        "Validation failed: " + errors.join(", "),
        ERROR_CODES.VALIDATION_ERROR,
        HTTP_STATUS_CODES.BAD_REQUEST,
        errors
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(
        "User not found",
        ERROR_CODES.USER_NOT_FOUND,
        HTTP_STATUS_CODES.NOT_FOUND
      );
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        title,
        description,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: budget ? parseFloat(budget) : null,
        currency: currency || "USD",
        userId,
        imageUrl,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return sendSuccess(
      project,
      "Project created successfully",
      HTTP_STATUS_CODES.CREATED
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating project:", error);

    // Check for specific Prisma errors
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return sendError(
        "A project with this configuration already exists",
        ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION,
        HTTP_STATUS_CODES.CONFLICT,
        error.message
      );
    }

    return sendError(
      "Failed to create project",
      ERROR_CODES.PROJECT_CREATION_FAILED,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      error
    );
  }
}
