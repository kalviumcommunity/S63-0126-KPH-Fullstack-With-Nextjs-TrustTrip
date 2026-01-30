/**
 * Middleware Configuration
 *
 * Defines which routes are protected and what role is required for each.
 * This allows for easy management of authorization rules without modifying middleware.ts
 */

export interface ProtectedRoute {
  path: string;
  requiredRoles?: string[];
}

/**
 * Routes that require authentication (all routes)
 * Leave requiredRoles empty to allow any authenticated user
 */
export const authRequiredRoutes: ProtectedRoute[] = [
  {
    path: "/api/users",
    requiredRoles: [], // All authenticated users can access
  },
  {
    path: "/api/projects",
    requiredRoles: [], // All authenticated users can access
  },
  {
    path: "/api/bookings",
    requiredRoles: [], // All authenticated users can access
  },
  {
    path: "/api/payments",
    requiredRoles: [], // All authenticated users can access
  },
  {
    path: "/api/reviews",
    requiredRoles: [], // All authenticated users can access
  },
  {
    path: "/api/refund",
    requiredRoles: [], // All authenticated users can access
  },
];

/**
 * Routes that require specific roles
 */
export const roleBasedRoutes: ProtectedRoute[] = [
  {
    path: "/api/admin",
    requiredRoles: ["admin"],
  },
  {
    path: "/api/admin/users",
    requiredRoles: ["admin"],
  },
  {
    path: "/api/admin/projects",
    requiredRoles: ["admin"],
  },
  {
    path: "/api/admin/analytics",
    requiredRoles: ["admin"],
  },
];

/**
 * Public routes that don't require authentication
 */
export const publicRoutes: string[] = [
  "/api/test",
  "/api/auth/login",
  "/api/auth/register",
];

/**
 * Check if a route requires authentication
 */
export function isAuthRequired(pathname: string): boolean {
  return (
    authRequiredRoutes.some((route) => pathname.startsWith(route.path)) ||
    roleBasedRoutes.some((route) => pathname.startsWith(route.path))
  );
}

/**
 * Check if a route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Get required roles for a specific path
 */
export function getRequiredRoles(pathname: string): string[] | null {
  const route = roleBasedRoutes.find((route) =>
    pathname.startsWith(route.path)
  );
  return route?.requiredRoles || null;
}

/**
 * Check if user has required role for a route
 */
export function hasRequiredRole(
  userRole: string,
  requiredRoles: string[]
): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No specific role required
  }
  return requiredRoles.includes(userRole);
}
