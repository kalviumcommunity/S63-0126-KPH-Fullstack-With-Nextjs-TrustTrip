import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import {
  isAuthRequired,
  isPublicRoute,
  getRequiredRoles,
  hasRequiredRole,
} from "@/middleware.config";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

/**
 * Decoded JWT payload structure
 */
interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Authorization Middleware
 *
 * This middleware intercepts all requests and:
 * 1. Allows public routes without checking authentication
 * 2. Checks for valid JWT token in Authorization header for protected routes
 * 3. Validates JWT signature and expiration
 * 4. Enforces role-based access control (RBAC)
 * 5. Attaches user information to request headers for downstream handlers
 *
 * Flow:
 * Public Route? → Allow
 * Protected Route? → Check Token → Validate JWT → Check Role → Allow/Deny
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  if (isAuthRequired(pathname)) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return buildUnauthorizedResponse(
        "Authorization header missing. Use: Authorization: Bearer <token>"
      );
    }

    const token = extractToken(authHeader);

    if (!token) {
      return buildUnauthorizedResponse(
        "Invalid authorization header format. Use: Authorization: Bearer <token>"
      );
    }

    try {
      // Verify and decode JWT
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

      // Check for role-based access control
      const requiredRoles = getRequiredRoles(pathname);

      if (requiredRoles && !hasRequiredRole(decoded.role, requiredRoles)) {
        // eslint-disable-next-line no-console
        console.warn(
          `Access denied for user ${decoded.email} (role: ${decoded.role}) to ${pathname}`
        );
        return buildForbiddenResponse(
          `Your role (${decoded.role}) does not have access to this resource. Required roles: ${requiredRoles.join(", ")}`
        );
      }

      // Attach user info to request headers for route handlers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", decoded.id);
      requestHeaders.set("x-user-email", decoded.email);
      requestHeaders.set("x-user-role", decoded.role);

      // eslint-disable-next-line no-console
      console.info(
        `✓ User ${decoded.email} (${decoded.role}) authorized to access ${pathname}`
      );

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // eslint-disable-next-line no-console
        console.warn("Token expired");
        return buildForbiddenResponse(
          "Your authentication token has expired. Please log in again."
        );
      }

      if (error instanceof jwt.JsonWebTokenError) {
        // eslint-disable-next-line no-console
        console.warn("Invalid token:", error.message);
        return buildForbiddenResponse(
          "Invalid authentication token. Please provide a valid token."
        );
      }

      // eslint-disable-next-line no-console
      console.error("Unexpected error during token verification:", error);
      return buildForbiddenResponse("An error occurred during authentication.");
    }
  }

  return NextResponse.next();
}

/**
 * Extract JWT token from Authorization header
 * Expected format: "Bearer <token>"
 */
function extractToken(authHeader: string): string | null {
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }
  return parts[1];
}

/**
 * Build a standardized unauthorized response (401)
 */
function buildUnauthorizedResponse(message: string) {
  return NextResponse.json(
    {
      success: false,
      message,
      error: {
        code: "UNAUTHORIZED",
        details: "Please provide a valid authentication token",
      },
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}

/**
 * Build a standardized forbidden response (403)
 */
function buildForbiddenResponse(message: string) {
  return NextResponse.json(
    {
      success: false,
      message,
      error: {
        code: "FORBIDDEN",
        details: "Insufficient permissions to access this resource",
      },
      timestamp: new Date().toISOString(),
    },
    { status: 403 }
  );
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
