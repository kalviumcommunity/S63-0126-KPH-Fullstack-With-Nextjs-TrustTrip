import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResponseData = any;

/**
 * Global API Response Handler Utility
 *
 * Ensures all API endpoints return consistent, structured responses.
 * This improves developer experience, simplifies error debugging,
 * and strengthens observability in production environments.
 *
 * Response Envelope Structure:
 * {
 *   success: boolean,
 *   message: string,
 *   data?: any,
 *   error?: { code: string, details?: string },
 *   timestamp: string
 * }
 */

/**
 * Send a success response
 * @param data - The data to return
 * @param message - Optional message describing the operation
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with standardized success envelope
 */
export const sendSuccess = (
  data: ResponseData,
  message = "Success",
  status = 200
) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Send an error response
 * @param message - Error message
 * @param code - Error code for tracking (e.g., "VALIDATION_ERROR")
 * @param status - HTTP status code (default: 500)
 * @param details - Optional detailed error information
 * @returns NextResponse with standardized error envelope
 */
export const sendError = (
  message = "Something went wrong",
  code = "INTERNAL_ERROR",
  status = 500,
  details?: ResponseData
) => {
  return NextResponse.json(
    {
      success: false,
      message,
      error: { code, details },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};

/**
 * Send a paginated response
 * @param data - Array of data items
 * @param pagination - Pagination metadata
 * @param message - Optional message
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with standardized success envelope including pagination
 */
export const sendPaginatedSuccess = (
  data: ResponseData[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  },
  message = "Success",
  status = 200
) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};
