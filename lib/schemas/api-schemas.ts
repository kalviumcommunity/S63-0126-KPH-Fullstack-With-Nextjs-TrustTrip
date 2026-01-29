import { z } from "zod";

// Shared validation schemas for API requests using Zod
// These schemas provide runtime type checking and validation with meaningful error messages

// User schema for POST /api/users
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid email address"),
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must be less than 100 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password must be less than 100 characters"),
  bio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, "Please provide a valid phone number")
    .optional(),
  profileImage: z
    .string()
    .url("Please provide a valid URL for profile image")
    .optional(),
});

// Project schema for POST /api/projects
export const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters long")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  destination: z
    .string()
    .min(1, "Destination is required")
    .min(2, "Destination must be at least 2 characters long")
    .max(100, "Destination must be less than 100 characters"),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine(
      (date) => !isNaN(Date.parse(date)),
      "Please provide a valid start date"
    )
    .transform((date) => new Date(date))
    .refine(
      (date) => date > new Date(),
      "Start date must be in the future"
    ),
  endDate: z
    .string()
    .min(1, "End date is required")
    .refine(
      (date) => !isNaN(Date.parse(date)),
      "Please provide a valid end date"
    )
    .transform((date) => new Date(date)),
  budget: z
    .number()
    .positive("Budget must be a positive number")
    .max(1000000, "Budget must be less than $1,000,000")
    .optional(),
  currency: z
    .string()
    .length(3, "Currency must be a valid 3-letter code (e.g., USD)")
    .regex(/^[A-Z]{3}$/, "Currency must be uppercase letters only")
    .default("USD"),
  userId: z
    .string()
    .min(1, "User ID is required")
    .cuid("Please provide a valid user ID"),
  imageUrl: z
    .string()
    .url("Please provide a valid URL for image")
    .optional(),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"],
  }
);

// Booking schema for POST /api/bookings
export const createBookingSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be at least 1")
    .max(50, "Quantity cannot exceed 50"),
  totalPrice: z
    .number()
    .positive("Total price must be greater than 0")
    .max(100000, "Total price cannot exceed $100,000"),
  userId: z
    .string()
    .min(1, "User ID is required")
    .cuid("Please provide a valid user ID"),
  projectId: z
    .string()
    .min(1, "Project ID is required")
    .cuid("Please provide a valid project ID"),
});

// Payment schema for POST /api/payments
export const createPaymentSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .max(100000, "Amount cannot exceed $100,000"),
  currency: z
    .string()
    .length(3, "Currency must be a valid 3-letter code (e.g., USD)")
    .regex(/^[A-Z]{3}$/, "Currency must be uppercase letters only")
    .default("USD"),
  paymentMethod: z
    .string()
    .min(1, "Payment method is required")
    .regex(
      /^(credit_card|debit_card|paypal|bank_transfer|cash)$/,
      "Payment method must be one of: credit_card, debit_card, paypal, bank_transfer, cash"
    ),
  transactionId: z
    .string()
    .min(1, "Transaction ID is required")
    .min(10, "Transaction ID must be at least 10 characters long")
    .max(100, "Transaction ID must be less than 100 characters"),
  userId: z
    .string()
    .min(1, "User ID is required")
    .cuid("Please provide a valid user ID"),
  projectId: z
    .string()
    .min(1, "Project ID is required")
    .cuid("Please provide a valid project ID"),
  bookingId: z
    .string()
    .min(1, "Booking ID is required")
    .cuid("Please provide a valid booking ID"),
});

// Review schema for POST /api/reviews
export const createReviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
  comment: z
    .string()
    .max(1000, "Comment must be less than 1000 characters")
    .optional(),
  userId: z
    .string()
    .min(1, "User ID is required")
    .cuid("Please provide a valid user ID"),
  projectId: z
    .string()
    .min(1, "Project ID is required")
    .cuid("Please provide a valid project ID"),
});

// Refund schema for POST /api/refund
export const createRefundSchema = z.object({
  reason: z
    .string()
    .min(1, "Reason is required")
    .min(10, "Reason must be at least 10 characters long")
    .max(500, "Reason must be less than 500 characters"),
  paymentId: z
    .string()
    .min(1, "Payment ID is required")
    .cuid("Please provide a valid payment ID"),
  userId: z
    .string()
    .min(1, "User ID is required")
    .cuid("Please provide a valid user ID"),
});

// Type inference for TypeScript types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type CreateRefundInput = z.infer<typeof createRefundSchema>;