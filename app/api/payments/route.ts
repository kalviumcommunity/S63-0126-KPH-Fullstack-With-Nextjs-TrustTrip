import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createPaymentSchema } from "@/lib/schemas/api-schemas";
import {
  createValidationErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/utils/api-response";
import { ZodError } from "zod";

// GET /api/payments - List all payments with pagination and filtering
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
    const total = await prisma.payment.count({ where });

    // Fetch payments
    const payments = await prisma.payment.findMany({
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
        booking: {
          select: { id: true, quantity: true, totalPrice: true },
        },
        refund: {
          select: { id: true, status: true, refundAmount: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: payments,
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
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST /api/payments - Create a new payment with Zod validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body using Zod schema
    const validatedData = createPaymentSchema.parse(body);
    const {
      amount,
      currency,
      paymentMethod,
      transactionId,
      userId,
      projectId,
      bookingId,
    } = validatedData;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return createErrorResponse("User not found", 404);
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return createErrorResponse("Booking not found", 404);
    }

    // Check if transactionId is unique
    const existingPayment = await prisma.payment.findUnique({
      where: { transactionId },
    });

    if (existingPayment) {
      return createErrorResponse("Transaction ID already exists", 409);
    }

    // Create the payment
    const payment = await prisma.payment.create({
      data: {
        amount,
        currency,
        paymentMethod,
        transactionId,
        userId,
        projectId,
        bookingId,
        status: "COMPLETED",
        paidAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, title: true, destination: true },
        },
        booking: {
          select: { id: true, quantity: true, totalPrice: true },
        },
      },
    });

    // Update booking status to CONFIRMED
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    });

    return createSuccessResponse(payment, "Payment created successfully", 201);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    
    console.error("Error creating payment:", error);
    return createErrorResponse("Failed to create payment");
  }
}

