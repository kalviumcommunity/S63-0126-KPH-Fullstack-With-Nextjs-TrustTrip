/**
 * Centralized Error Handler
 *
 * Provides consistent error handling across all API routes with:
 * - Environment-aware error responses (detailed in dev, safe in production)
 * - Structured error logging for debugging
 * - Integration with existing sendError response handler
 * - Context-aware error categorization
 *
 * Usage:
 * ```
 * try {
 *   // API logic here
 * } catch (error) {
 *   return handleError(error, 'GET /api/users', { userId, correlationId });
 * }
 * ```
 */

import { NextResponse } from "next/server";
import { logger, LogContext } from "./logger";
import { sendError } from "./responseHandler";
import { ERROR_CODES, HTTP_STATUS_CODES } from "./errorCodes";

// Environment detection
const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Error types for better categorization
 */
interface ErrorDetails {
  code: string;
  statusCode: number;
  category:
    | "validation"
    | "authorization"
    | "resource"
    | "database"
    | "external"
    | "internal";
}

/**
 * Known error patterns and their mappings
 */
const errorMappings: Record<string, ErrorDetails> = {
  // Prisma/Database errors
  "Unique constraint": {
    code: ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION,
    statusCode: HTTP_STATUS_CODES.CONFLICT,
    category: "database",
  },
  "Foreign key constraint": {
    code: ERROR_CODES.DATABASE_ERROR,
    statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
    category: "database",
  },
  "Record to delete does not exist": {
    code: ERROR_CODES.RESOURCE_NOT_FOUND,
    statusCode: HTTP_STATUS_CODES.NOT_FOUND,
    category: "resource",
  },

  // JWT/Auth errors
  JsonWebTokenError: {
    code: ERROR_CODES.UNAUTHORIZED,
    statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
    category: "authorization",
  },
  TokenExpiredError: {
    code: ERROR_CODES.TOKEN_EXPIRED,
    statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
    category: "authorization",
  },

  // Validation errors
  ValidationError: {
    code: ERROR_CODES.VALIDATION_ERROR,
    statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
    category: "validation",
  },
};

/**
 * Analyze error and determine appropriate response details
 */
function analyzeError(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    // Check for known error patterns
    for (const [pattern, details] of Object.entries(errorMappings)) {
      if (error.message.includes(pattern) || error.name === pattern) {
        return details;
      }
    }

    // Check error name for specific types
    if (error.name in errorMappings) {
      return errorMappings[error.name];
    }
  }

  // Default to internal server error
  return {
    code: ERROR_CODES.INTERNAL_ERROR,
    statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    category: "internal",
  };
}

/**
 * Generate user-safe error message based on environment and error type
 */
function generateUserMessage(
  error: unknown,
  errorDetails: ErrorDetails
): string {
  if (isDevelopment) {
    // In development, show detailed error messages
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  // In production, return safe, generic messages based on error category
  switch (errorDetails.category) {
    case "validation":
      return "The provided data is invalid. Please check your input and try again.";
    case "authorization":
      return "You are not authorized to perform this action.";
    case "resource":
      return "The requested resource was not found.";
    case "database":
      return "A database error occurred. Please try again later.";
    case "external":
      return "An external service is currently unavailable. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again later.";
  }
}

/**
 * Main error handling function
 *
 * @param error - The caught error (unknown type for safety)
 * @param context - Context string describing the operation (e.g., "GET /api/users")
 * @param additionalContext - Additional context for logging (userId, correlationId, etc.)
 * @returns NextResponse with appropriate error format
 */
export function handleError(
  error: unknown,
  context: string,
  additionalContext?: LogContext
): NextResponse {
  // Analyze the error to determine response details
  const errorDetails = analyzeError(error);

  // Create comprehensive logging context
  const logContext: LogContext = {
    operation: context,
    errorCategory: errorDetails.category,
    errorCode: errorDetails.code,
    ...additionalContext,
  };

  // Always log the full error details for debugging
  const errorMessage = error instanceof Error ? error.message : String(error);
  logger.error(
    `Error in ${context}: ${errorMessage}`,
    error instanceof Error ? error : new Error(String(error)),
    logContext
  );

  // Generate user-safe message
  const userMessage = generateUserMessage(error, errorDetails);

  // Prepare error details for response
  let responseDetails = undefined;

  if (isDevelopment) {
    // In development, include full error details and stack trace
    responseDetails = {
      originalError: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      errorType: error instanceof Error ? error.name : "Unknown",
      category: errorDetails.category,
      context: additionalContext,
    };
  } else {
    // In production, only include safe, non-sensitive details
    responseDetails = {
      category: errorDetails.category,
      timestamp: new Date().toISOString(),
      // Include correlation ID if available for support tracking
      correlationId: additionalContext?.correlationId,
    };
  }

  // Use existing sendError function for consistent response format
  return sendError(
    userMessage,
    errorDetails.code,
    errorDetails.statusCode,
    responseDetails
  );
}

/**
 * Specialized error handler for async operations with automatic context building
 */
export function handleAsyncError(
  error: unknown,
  method: string,
  path: string,
  additionalContext?: Omit<LogContext, "method" | "path">
): NextResponse {
  const context = `${method} ${path}`;
  return handleError(error, context, {
    method,
    path,
    ...additionalContext,
  });
}

/**
 * Type guard to check if error is a known error type
 */
export function isKnownError(error: unknown): error is Error {
  return error instanceof Error && error.name in errorMappings;
}

/**
 * Export error details type for use in other modules
 */
export type { ErrorDetails };
