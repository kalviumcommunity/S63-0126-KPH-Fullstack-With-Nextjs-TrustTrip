import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createRefundSchema } from "@/lib/schemas/api-schemas";
import {
  createValidationErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/utils/api-response";
import { ZodError } from "zod";

// GET /api/refunds - List all refunds with pagination and filtering
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

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Build where clause
    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (status) where.status = status;

    // Get total count for pagination
    const total = await prisma.refund.count({ where });

    // Fetch refunds
    const refunds = await prisma.refund.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            transactionId: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: refunds,
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
    console.error("Error fetching refunds:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch refunds" },
      { status: 500 }
    );
  }
}

// POST /api/refund - Create a new refund request with Zod validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body using Zod schema
    const validatedData = createRefundSchema.parse(body);
    const { reason, paymentId, userId } = validatedData;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return createErrorResponse("User not found", 404);
    }

    // Check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        refund: true,
      },
    });

    if (!payment) {
      return createErrorResponse("Payment not found", 404);
    }

    // Check if payment already has a refund
    if (payment.refund) {
      return createErrorResponse("This payment already has a refund request", 409);
    }

    // Check if payment is completed
    if (payment.status !== "COMPLETED") {
      return createErrorResponse("Only completed payments can be refunded", 400);
    }

    // Create the refund request
    const refund = await prisma.refund.create({
      data: {
        reason,
        refundAmount: payment.amount,
        paymentId,
        userId,
        status: "REQUESTED",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            transactionId: true,
            status: true,
          },
        },
      },
    });

    return createSuccessResponse(refund, "Refund request created successfully", 201);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    
    console.error("Error creating refund:", error);
    return createErrorResponse("Failed to create refund request");
  }
}

