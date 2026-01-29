import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Utility functions for consistent error handling across API routes

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: ValidationErrorDetail[];
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Formats Zod validation errors into a consistent structure
 * @param error - ZodError from schema validation
 * @returns Array of validation error details
 */
export function formatZodErrors(error: ZodError): ValidationErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}

/**
 * Creates a standardized validation error response
 * @param zodError - ZodError from schema validation
 * @returns NextResponse with validation error details
 */
export function createValidationErrorResponse(zodError: ZodError): NextResponse {
  const details = formatZodErrors(zodError);
  
  return NextResponse.json(
    {
      success: false,
      error: "Validation failed",
      details,
    } as ApiErrorResponse,
    { status: 400 }
  );
}

/**
 * Creates a standardized success response
 * @param data - The data to return
 * @param message - Optional success message
 * @param status - HTTP status code (defaults to 200)
 * @returns NextResponse with success data
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    } as ApiSuccessResponse<T>,
    { status }
  );
}

/**
 * Creates a standardized error response
 * @param error - Error message
 * @param status - HTTP status code (defaults to 500)
 * @returns NextResponse with error details
 */
export function createErrorResponse(
  error: string,
  status = 500
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
    } as ApiErrorResponse,
    { status }
  );
}