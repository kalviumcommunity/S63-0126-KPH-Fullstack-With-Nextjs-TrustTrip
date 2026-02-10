import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import {
  isAuthRequired,
  isPublicRoute,
  getRequiredRoles,
  hasRequiredRole,
} from "@/middleware.config";
import {
  hasPermission,
  getRolePermissions,
  evaluateAccess,
  PERMISSIONS,
} from "@/lib/rbac";

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
 * Frontend routes that require authentication (cookie-based)
 */
const FRONTEND_PROTECTED_ROUTES = ["/dashboard", "/users", "/rbac-demo"];

/**
 * Check if the request is for a frontend protected route
 */
function isFrontendProtectedRoute(pathname: string): boolean {
  return FRONTEND_PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Get token from cookies for frontend routes
 */
function getTokenFromCookies(req: NextRequest): string | undefined {
  return req.cookies.get("token")?.value;
}

/**
 * Extract JWT token from Authorization header
 * Expected format: "Bearer <token>"
 */
function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }
  return parts[1];
}

/**
 * Build a redirect response to login page
 */
function redirectToLogin(req: NextRequest): NextResponse {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * Build a standardized forbidden response (403) for API routes
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
      rbac: {
        status: "DENIED",
        reason: message,
      },
    },
    { status: 403 }
  );
}

/**
 * Verify JWT token and return decoded payload
 */
function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Log RBAC access attempt with detailed information
 */
function logRBACAccess(
  email: string,
  role: string,
  pathname: string,
  action: string,
  allowed: boolean
): void {
  const status = allowed ? "ALLOWED" : "DENIED";
  const permissions = getRolePermissions(role);
  
  console.log(
    `[RBAC Middleware] ${role.toUpperCase()} ${email} | Action: ${action} | Path: ${pathname} | Status: ${status} | Permissions: [${permissions.join(", ")}]`
  );
}

/**
 * Authorization Middleware with RBAC Support
 *
 * This middleware intercepts all requests and:
 * 1. Allows public routes without checking authentication
 * 2. For API routes: Checks Authorization header for JWT token
 * 3. For frontend routes (/dashboard, /users, /rbac-demo): Checks cookies for token
 * 4. Validates JWT signature and expiration
 * 5. Enforces role-based access control (RBAC) with audit logging
 * 6. Redirects unauthorized frontend users to login page
 *
 * RBAC Features:
 * - Role-permission mapping validation
 * - Detailed access logging for auditing
 * - Permission-based route protection
 *
 * Flow:
 * Public Route? → Allow
 * Frontend Protected Route? → Check Cookie Token → Valid? → Allow/Redirect
 * API Protected Route? → Check Header Token → Validate JWT → Check Role → Allow/Deny
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Handle frontend protected routes (cookie-based auth)
  if (isFrontendProtectedRoute(pathname)) {
    const token = getTokenFromCookies(req);

    if (!token) {
      // Log denied access
      console.log(`[RBAC] UNAUTHENTICATED access to ${pathname}: DENIED`);
      return redirectToLogin(req);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      // Log invalid token
      console.log(`[RBAC] INVALID TOKEN for ${pathname}: DENIED`);
      return redirectToLogin(req);
    }

    // Log successful frontend access
    const role = decoded.role || "viewer";
    console.log(
      `[RBAC] ${role.toUpperCase()} ${decoded.email} accessed frontend: ${pathname}: ALLOWED`
    );

    // Attach user info to request headers for route handlers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", decoded.id);
    requestHeaders.set("x-user-email", decoded.email);
    requestHeaders.set("x-user-role", role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Handle API protected routes (header-based auth)
  if (isAuthRequired(pathname)) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      // Log missing authorization
      const missingAuthResult = evaluateAccess(
        "unknown",
        PERMISSIONS.READ,
        "access",
        pathname
      );
      return buildForbiddenResponse(
        "Authorization header missing. Use: Authorization: Bearer <token>"
      );
    }

    const token = extractToken(authHeader);

    if (!token) {
      return buildForbiddenResponse(
        "Invalid authorization header format. Use: Authorization: Bearer <token>"
      );
    }

    try {
      // Verify and decode JWT
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      const userRole = decoded.role || "viewer";
      const userEmail = decoded.email || "unknown";

      // Determine the action based on HTTP method
      const method = req.method;
      let action = "read";
      if (method === "POST") action = "create";
      else if (method === "PUT" || method === "PATCH") action = "update";
      else if (method === "DELETE") action = "delete";

      // Check for role-based access control (existing functionality)
      const requiredRoles = getRequiredRoles(pathname);

      if (
        requiredRoles &&
        requiredRoles.length > 0 &&
        !hasRequiredRole(userRole, requiredRoles)
      ) {
        // Log role-based denial
        logRBACAccess(userEmail, userRole, pathname, action, false);

        console.warn(
          `Access DENIED: User ${userEmail} (role: ${userRole}) attempted ${action} on ${pathname}. Required roles: ${requiredRoles.join(", ")}`
        );

        return buildForbiddenResponse(
          `Your role (${userRole}) does not have access to this resource. Required roles: ${requiredRoles.join(", ")}`
        );
      }

      // Additional permission-based access check for enhanced RBAC
      // Map HTTP methods to permissions
      const permissionMap: Record<string, string> = {
        GET: PERMISSIONS.READ,
        POST: PERMISSIONS.CREATE,
        PUT: PERMISSIONS.UPDATE,
        PATCH: PERMISSIONS.UPDATE,
        DELETE: PERMISSIONS.DELETE,
      };

      const requiredPermission = permissionMap[method] || PERMISSIONS.READ;

      // Evaluate access with RBAC
      const accessResult = evaluateAccess(
        userRole,
        requiredPermission,
        action,
        pathname
      );

      if (!accessResult.allowed) {
        // Log permission-based denial
        logRBACAccess(userEmail, userRole, pathname, action, false);
        
        console.warn(
          `RBAC Access DENIED: User ${userEmail} (role: ${userRole}) lacks '${requiredPermission}' permission for ${method} ${pathname}`
        );
        
        return buildForbiddenResponse(accessResult.reason);
      }

      // Log successful access
      logRBACAccess(userEmail, userRole, pathname, action, true);

      // Attach user info to request headers for route handlers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-id", decoded.id);
      requestHeaders.set("x-user-email", decoded.email);
      requestHeaders.set("x-user-role", userRole);
      requestHeaders.set(
        "x-user-permissions",
        getRolePermissions(userRole).join(",")
      );

      console.info(
        `✓ RBAC Access ALLOWED: ${userEmail} (${userRole}) | ${method} ${pathname} | Required: ${requiredPermission}`
      );

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // Log expired token
        console.warn("[RBAC] Token expired: DENIED");
        return buildForbiddenResponse(
          "Your authentication token has expired. Please log in again."
        );
      }

      if (error instanceof jwt.JsonWebTokenError) {
        // Log invalid token
        console.warn("[RBAC] Invalid token:", error.message);
        return buildForbiddenResponse(
          "Invalid authentication token. Please provide a valid token."
        );
      }

      // Log unexpected error
      console.error(
        "[RBAC] Unexpected error during token verification:",
        error
      );
      return buildForbiddenResponse("An error occurred during authentication.");
    }
  }

  return NextResponse.next();
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
