import { NextResponse } from "next/server";

/**
 * CORS Configuration Utility
 *
 * Provides centralized CORS header management for API routes.
 * Implements secure CORS policies with configurable origins.
 *
 * Security Features:
 * - Whitelist-based origin validation (no wildcards in production)
 * - Configurable allowed methods
 * - Credential support for cookie-based auth
 * - Preflight request handling
 */

/**
 * CORS Configuration Interface
 */
export interface CorsOptions {
  origin?: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Default CORS Configuration
 *
 * Production-ready defaults:
 * - Restricts origins to known domains
 * - Allows common HTTP methods
 * - Enables credentials for cookie-based auth
 * - 1-hour preflight cache
 */
const DEFAULT_CORS_OPTIONS: CorsOptions = {
  origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Length", "X-Request-Id"],
  credentials: true,
  maxAge: 3600, // 1 hour
};

/**
 * Get Allowed Origins
 *
 * Returns array of allowed origins from environment or defaults.
 *
 * Environment Variables:
 * - ALLOWED_ORIGINS: Comma-separated list of allowed origins
 *   Example: "https://trusttrip.com,https://app.trusttrip.com"
 *
 * @returns Array of allowed origin URLs
 */
export function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS;

  if (envOrigins) {
    return envOrigins.split(",").map((origin) => origin.trim());
  }

  // Development/fallback origins
  return [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3000",
  ];
}

/**
 * Check if Origin is Allowed
 *
 * Validates request origin against whitelist.
 *
 * @param origin - Origin from request header
 * @param allowedOrigins - Array of whitelisted origins
 * @returns true if origin is allowed, false otherwise
 */
export function isOriginAllowed(
  origin: string | null,
  allowedOrigins: string[]
): boolean {
  if (!origin) return false;

  // Exact match check
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // For development, allow localhost with any port
  if (
    process.env.NODE_ENV === "development" &&
    origin.startsWith("http://localhost")
  ) {
    return true;
  }

  return false;
}

/**
 * Create CORS Headers
 *
 * Generates CORS headers based on request origin and configuration.
 *
 * @param request - NextRequest object
 * @param options - CORS configuration options
 * @returns Headers object with CORS headers
 */
export function createCorsHeaders(
  requestOrigin: string | null,
  options: CorsOptions = {}
): Headers {
  const config = { ...DEFAULT_CORS_OPTIONS, ...options };
  const headers = new Headers();

  // Determine allowed origins
  const allowedOrigins =
    typeof config.origin === "string" ? [config.origin] : getAllowedOrigins();

  // Set Access-Control-Allow-Origin
  if (requestOrigin && isOriginAllowed(requestOrigin, allowedOrigins)) {
    headers.set("Access-Control-Allow-Origin", requestOrigin);
  } else if (
    typeof config.origin === "string" &&
    !requestOrigin &&
    process.env.NODE_ENV === "development"
  ) {
    // Allow configured origin in development if no origin header
    headers.set("Access-Control-Allow-Origin", config.origin);
  }

  // Set other CORS headers
  if (config.methods) {
    headers.set("Access-Control-Allow-Methods", config.methods.join(", "));
  }

  if (config.allowedHeaders) {
    headers.set(
      "Access-Control-Allow-Headers",
      config.allowedHeaders.join(", ")
    );
  }

  if (config.exposedHeaders) {
    headers.set(
      "Access-Control-Expose-Headers",
      config.exposedHeaders.join(", ")
    );
  }

  if (config.credentials) {
    headers.set("Access-Control-Allow-Credentials", "true");
  }

  if (config.maxAge) {
    headers.set("Access-Control-Max-Age", config.maxAge.toString());
  }

  return headers;
}

/**
 * Add CORS Headers to Response
 *
 * Adds CORS headers to existing NextResponse.
 *
 * @param response - NextResponse object
 * @param requestOrigin - Origin from request header
 * @param options - CORS configuration options
 * @returns Response with CORS headers
 */
export function addCorsHeaders(
  response: NextResponse,
  requestOrigin: string | null,
  options: CorsOptions = {}
): NextResponse {
  const corsHeaders = createCorsHeaders(requestOrigin, options);

  corsHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Handle CORS Preflight Request
 *
 * Handles OPTIONS requests for CORS preflight.
 *
 * @param requestOrigin - Origin from request header
 * @param options - CORS configuration options
 * @returns NextResponse with CORS headers (204 No Content)
 */
export function handleCorsPreflightRequest(
  requestOrigin: string | null,
  options: CorsOptions = {}
): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response, requestOrigin, options);
}

/**
 * CORS Middleware Wrapper
 *
 * Higher-order function to wrap API route handlers with CORS.
 *
 * Usage:
 * ```typescript
 * export const GET = withCors(async (request) => {
 *   return NextResponse.json({ data: "Hello" });
 * });
 * ```
 *
 * @param handler - Route handler function
 * @param options - CORS configuration options
 * @returns Wrapped handler with CORS support
 */
export function withCors(
  handler: (request: Request) => Promise<NextResponse>,
  options: CorsOptions = {}
) {
  return async (request: Request) => {
    const origin = request.headers.get("origin");

    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      return handleCorsPreflightRequest(origin, options);
    }

    // Execute handler and add CORS headers to response
    const response = await handler(request);
    return addCorsHeaders(response, origin, options);
  };
}

/**
 * Validate CORS Request
 *
 * Checks if request origin is allowed.
 * Returns error response if origin is not whitelisted.
 *
 * @param requestOrigin - Origin from request header
 * @returns NextResponse with error if invalid, null if valid
 */
export function validateCorsOrigin(
  requestOrigin: string | null
): NextResponse | null {
  const allowedOrigins = getAllowedOrigins();

  if (requestOrigin && !isOriginAllowed(requestOrigin, allowedOrigins)) {
    return NextResponse.json(
      {
        success: false,
        error: "CORS policy: Origin not allowed",
        timestamp: new Date().toISOString(),
      },
      { status: 403 }
    );
  }

  return null;
}
