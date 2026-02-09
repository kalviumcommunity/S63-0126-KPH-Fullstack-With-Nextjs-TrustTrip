/**
 * Role-Based Access Control (RBAC) Configuration
 * TrustTrip Application - Centralized RBAC Management
 */

// =============================================================================
// ROLE-PERMISSION MAPPING
// =============================================================================

export const ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
} as const;

export const PERMISSIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE_USERS: "manage_users",
  MANAGE_PAYMENTS: "manage_payments",
  MANAGE_REFUNDS: "manage_refunds",
  ADMIN_ACCESS: "admin_access",
} as const;

export const roles: Record<string, string[]> = {
  admin: [
    PERMISSIONS.CREATE,
    PERMISSIONS.READ,
    PERMISSIONS.UPDATE,
    PERMISSIONS.DELETE,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.MANAGE_REFUNDS,
    PERMISSIONS.ADMIN_ACCESS,
  ],
  editor: [PERMISSIONS.CREATE, PERMISSIONS.READ, PERMISSIONS.UPDATE],
  viewer: [PERMISSIONS.READ],
};

export const roleHierarchy: Record<string, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
};

export const actionPermissions: Record<string, string> = {
  "user:create": PERMISSIONS.CREATE,
  "user:read": PERMISSIONS.READ,
  "user:update": PERMISSIONS.UPDATE,
  "user:delete": PERMISSIONS.DELETE,
  "user:manage": PERMISSIONS.MANAGE_USERS,
  "booking:create": PERMISSIONS.CREATE,
  "booking:read": PERMISSIONS.READ,
  "booking:update": PERMISSIONS.UPDATE,
  "booking:delete": PERMISSIONS.DELETE,
  "review:create": PERMISSIONS.CREATE,
  "review:read": PERMISSIONS.READ,
  "review:update": PERMISSIONS.UPDATE,
  "review:delete": PERMISSIONS.DELETE,
  "payment:create": PERMISSIONS.CREATE,
  "payment:read": PERMISSIONS.READ,
  "payment:manage": PERMISSIONS.MANAGE_PAYMENTS,
  "refund:create": PERMISSIONS.CREATE,
  "refund:read": PERMISSIONS.READ,
  "refund:manage": PERMISSIONS.MANAGE_REFUNDS,
  "admin:access": PERMISSIONS.ADMIN_ACCESS,
};

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface AccessCheckResult {
  allowed: boolean;
  reason: string;
  requiredPermission?: string;
  userPermission?: string;
}

// =============================================================================
// PERMISSION CHECK FUNCTIONS
// =============================================================================

export function hasPermission(role: string, permission: string): boolean {
  const rolePermissions = roles[role];
  if (!rolePermissions) {
    console.warn(`[RBAC] Unknown role: ${role}`);
    return false;
  }
  return rolePermissions.includes(permission);
}

export function getRolePermissions(role: string): string[] {
  return roles[role] || [];
}

export function hasRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

export function hasMinimumRoleLevel(
  userRole: string,
  requiredLevel: number
): boolean {
  const userLevel = roleHierarchy[userRole] || 0;
  return userLevel >= requiredLevel;
}

export function getRoleLevel(role: string): number {
  return roleHierarchy[role] || 0;
}

// =============================================================================
// AUDIT LOGGING
// =============================================================================

export function logAccessAttempt(
  role: string,
  action: string,
  resource: string,
  allowed: boolean,
  details?: Record<string, unknown>
): void {
  const status = allowed ? "ALLOWED" : "DENIED";
  const logMessage = `[RBAC] ${role.toUpperCase()} attempted ${action} on ${resource}: ${status}`;
  if (allowed) {
    console.log(logMessage, details || "");
  } else {
    console.warn(logMessage, details || "");
  }
}

export function evaluateAccess(
  userRole: string,
  requiredPermission: string,
  action: string,
  resource: string
): AccessCheckResult {
  const hasAccess = hasPermission(userRole, requiredPermission);
  logAccessAttempt(userRole, action, resource, hasAccess, {
    requiredPermission,
    userPermissions: getRolePermissions(userRole),
  });
  if (hasAccess) {
    return {
      allowed: true,
      reason: `Role '${userRole}' has '${requiredPermission}' permission`,
    };
  }
  return {
    allowed: false,
    reason: `Role '${userRole}' lacks '${requiredPermission}' permission required for ${action}`,
    requiredPermission,
    userPermission: getRolePermissions(userRole).join(", "),
  };
}

// =============================================================================
// API ACCESS CONTROL HELPERS
// =============================================================================

export function createForbiddenResponse(message: string) {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Forbidden",
      message,
      timestamp: new Date().toISOString(),
      rbac: { status: "DENIED", reason: message },
    }),
    { status: 403, headers: { "Content-Type": "application/json" } }
  );
}

export function createUnauthorizedResponse(message: string = "Authentication required") {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Unauthorized",
      message,
      timestamp: new Date().toISOString(),
      rbac: { status: "DENIED", reason: message },
    }),
    { status: 401, headers: { "Content-Type": "application/json" } }
  );
}

export function enforceAccessControl(
  userRole: string,
  requiredPermission: string,
  action: string,
  resource: string
): Response | null {
  const result = evaluateAccess(userRole, requiredPermission, action, resource);
  if (!result.allowed) {
    return createForbiddenResponse(result.reason);
  }
  return null;
}

// =============================================================================
// DEFAULT ROLE FOR NEW USERS
// =============================================================================

export function getDefaultRole(): string {
  return ROLES.VIEWER;
}

export function isValidRole(role: string): boolean {
  return Object.values(ROLES).includes(role as Role);
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

const rbac = {
  roles,
  roleHierarchy,
  permissions: PERMISSIONS,
  actions: actionPermissions,
  hasPermission,
  hasRole,
  hasMinimumRoleLevel,
  getRolePermissions,
  evaluateAccess,
  logAccessAttempt,
  enforceAccessControl,
  createForbiddenResponse,
  createUnauthorizedResponse,
  getDefaultRole,
  isValidRole,
  getRoleLevel,
  ROLES,
};

export default rbac;

