# Role-Based Access Control (RBAC) Implementation

## Overview

TrustTrip implements a comprehensive **Role-Based Access Control (RBAC)** system that provides secure, granular access to application resources based on user roles. This implementation includes:

- **Role-permission mapping** with hierarchy support
- **API-level access control** with audit logging
- **UI-level component guards** for conditional rendering
- **Middleware enforcement** for route protection
- **JWT-based authentication** with role claims

## Role Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    RBAC Role Hierarchy                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ADMIN (Level 3) ──────────────────────────────────────┐    │
│   • Full access to all resources                        │    │
│   • Can manage users (promote/demote)                  │    │
│   • Can access admin dashboard                         │    │
│   • Can manage payments and refunds                     │    │
│                                                        │    │
│   EDITOR (Level 2) ────────────────────────────────┐  │    │
│   • Can create and read resources                    │  │    │
│   • Can update existing content                      │  │    │
│   • Cannot delete resources                          │  │    │
│   • Cannot manage users                              │  │    │
│                                                    │  │    │
│   VIEWER (Level 1) ────────────────────────────┐  │  │    │
│   • Read-only access to resources               │  │  │    │
│   • Cannot create, update, or delete anything  │  │  │    │
│                                              │  │  │    │
│   DEFAULT (viewer) ◄───────────────────────────┘  │  │    │
│   New users are assigned this role by default    │  │    │
│                                              └──┘  │    │
└─────────────────────────────────────────────────────────────┘
```

## Roles and Permissions Matrix

| Permission | Admin | Editor | Viewer |
|------------|-------|--------|--------|
| `create` | ✅ | ✅ | ❌ |
| `read` | ✅ | ✅ | ✅ |
| `update` | ✅ | ✅ | ❌ |
| `delete` | ✅ | ❌ | ❌ |
| `manage_users` | ✅ | ❌ | ❌ |
| `manage_payments` | ✅ | ❌ | ❌ |
| `manage_refunds` | ✅ | ❌ | ❌ |
| `admin_access` | ✅ | ❌ | ❌ |

## File Structure

```
lib/
├── rbac.ts                    # Core RBAC configuration and utilities
├── auth.ts                    # JWT token generation/verification
middleware.config.ts          # Route protection configuration
app/
├── middleware.ts              # Middleware with RBAC enforcement
├── api/
│   ├── users/route.ts         # User API with RBAC checks
│   ├── bookings/route.ts      # Bookings API with RBAC checks
│   └── admin/route.ts         # Admin-only route
├── rbac-demo/
│   └── page.tsx              # Interactive RBAC demo page
└── dashboard/
    └── page.tsx              # Dashboard with RBAC UI
hooks/
└── useRole.ts                # Client-side role/permission hook
components/
└── RoleGuard.tsx             # UI component for access control
```

## Implementation Details

### 1. RBAC Configuration (`lib/rbac.ts`)

The central configuration defines roles, permissions, and utility functions:

```typescript
// Role definitions
export const ROLES = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
} as const;

// Permission definitions
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

// Role-permission mapping
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

// Check if a role has a specific permission
export function hasPermission(role: string, permission: string): boolean {
  const rolePermissions = roles[role];
  return rolePermissions?.includes(permission) ?? false;
}

// Evaluate access with audit logging
export function evaluateAccess(
  userRole: string,
  requiredPermission: string,
  action: string,
  resource: string
): AccessCheckResult {
  const hasAccess = hasPermission(userRole, requiredPermission);
  
  // Log access attempt
  console.log(
    `[RBAC] ${userRole.toUpperCase()} attempted ${action} on ${resource}: ${
      hasAccess ? "ALLOWED" : "DENIED"
    }`
  );
  
  return {
    allowed: hasAccess,
    reason: hasAccess
      ? `Role '${userRole}' has '${requiredPermission}' permission`
      : `Role '${userRole}' lacks '${requiredPermission}' permission`,
  };
}
```

### 2. JWT Token with Role Claim

When users log in, their role is included in the JWT payload:

```typescript
// Login response includes role
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}

// JWT Payload structure
{
  "userId": "user-123",
  "email": "admin@example.com",
  "role": "admin",          // RBAC: Role claim
  "iat": 1698667200,
  "exp": 1698753600
}
```

### 3. Middleware Enforcement (`app/middleware.ts`)

The middleware intercepts all requests and enforces RBAC:

```typescript
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Extract and verify JWT
  const token = extractToken(authHeader);
  const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
  const userRole = decoded.role || "viewer";
  
  // Map HTTP methods to permissions
  const permissionMap: Record<string, string> = {
    GET: PERMISSIONS.READ,
    POST: PERMISSIONS.CREATE,
    PUT: PERMISSIONS.UPDATE,
    PATCH: PERMISSIONS.UPDATE,
    DELETE: PERMISSIONS.DELETE,
  };
  
  const requiredPermission = permissionMap[method];
  
  // Check permission
  const hasAccess = hasPermission(userRole, requiredPermission);
  
  console.log(
    `[RBAC] ${userRole} | ${method} ${pathname} | ${requiredPermission}: ${
      hasAccess ? "ALLOWED" : "DENIED"
    }`
  );
  
  if (!hasAccess) {
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden",
        message: `Role '${userRole}' lacks '${requiredPermission}' permission`,
        rbac: { status: "DENIED" },
      },
      { status: 403 }
    );
  }
  
  return NextResponse.next();
}
```

### 4. API Route Protection (`app/api/users/route.ts`)

Individual API routes include explicit RBAC checks:

```typescript
export async function GET(request: NextRequest) {
  // Get role from middleware headers
  const userRole = request.headers.get("x-user-role") || "viewer";
  
  // Log access attempt
  logAccessAttempt(userRole, "read", "/api/users", 
    hasPermission(userRole, PERMISSIONS.READ));
  
  // Enforce access control
  const accessDenied = enforceAccessControl(
    userRole,
    PERMISSIONS.READ,
    "list_users",
    "/api/users"
  );
  if (accessDenied) return accessDenied;
  
  // Process request...
  return sendPaginatedSuccess(users, pagination, "Users fetched successfully");
}

export async function DELETE(request: NextRequest) {
  const userRole = request.headers.get("x-user-role") || "viewer";
  
  // Only admins can delete users
  const accessDenied = enforceAccessControl(
    userRole,
    PERMISSIONS.DELETE,
    "delete_users",
    "/api/users"
  );
  if (accessDenied) return accessDenied;
  
  // Process deletion...
}
```

### 5. UI-Level Access Control

#### useRole Hook (`hooks/useRole.ts`)

```typescript
export function useRole(): UseRoleReturn {
  const token = getTokenFromCookies();
  const decoded = decodeToken(token);
  const userRole = decoded?.role || "viewer";
  
  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.viewer;
  
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };
  
  return {
    role: userRole,
    permissions,
    isAdmin: userRole === "admin",
    isEditor: userRole === "editor",
    isViewer: userRole === "viewer",
    hasPermission,
  };
}

// Usage in component
function UserList() {
  const { isAdmin, hasPermission } = useRole();
  
  return (
    <div>
      <h1>User Management</h1>
      {isAdmin && <button>Add User</button>}
      {hasPermission("delete") && <button>Delete Selected</button>}
    </div>
  );
}
```

#### RoleGuard Component (`components/RoleGuard.tsx`)

```typescript
// Conditional rendering based on role
<RoleGuard allowedRoles={["admin"]}>
  <AdminPanel />
</RoleGuard>

// Permission-based rendering
<PermissionGate permission="delete">
  <DeleteButton />
</PermissionGate>

// Specialized components
<AdminOnly fallback={<p>Admin access required</p>}>
  <AdminDashboard />
</AdminOnly>

<EditorAndAbove>
  <EditButton />
</EditorAndAbove>
```

## Testing RBAC

### Using the Login Page

1. Navigate to `/login`
2. Select a role from the dropdown (Admin, Editor, Viewer)
3. Click "Login" to create a JWT with that role
4. Visit `/rbac-demo` to test permissions

### Console Logging

All access attempts are logged to the browser console:

```
[RBAC] ADMIN attempted create_user on /api/users: ALLOWED
[RBAC] VIEWER attempted delete on /api/users: DENIED
[RBAC UI] admin accessing roles: [admin]: ALLOWED
[RBAC UI] viewer accessing permission: delete: DENIED
```

### API Testing Examples

```bash
# Test with admin token (should succeed)
curl -X DELETE http://localhost:3000/api/users \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"ids": ["user-1", "user-2"]}'

# Response (200 OK)
{
  "success": true,
  "message": "2 user(s) deleted successfully"
}

# Test with viewer token (should fail - 403 Forbidden)
curl -X DELETE http://localhost:3000/api/users \
  -H "Authorization: Bearer <viewer-token>"

# Response (403 Forbidden)
{
  "success": false,
  "error": "Forbidden",
  "message": "Role 'viewer' lacks 'delete' permission required for delete_users",
  "rbac": { "status": "DENIED" }
}
```

## Access Evaluation Logic

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Access Evaluation Flow                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. EXTRACT TOKEN                                                │
│     ├─ Authorization: Bearer <token>                             │
│     ├─ Decode JWT payload                                        │
│     └─ Extract user role                                         │
│                                                                  │
│  2. MAP HTTP METHOD → PERMISSION                                 │
│     ├─ GET    → read                                            │
│     ├─ POST   → create                                          │
│     ├─ PUT    → update                                          │
│     ├─ PATCH  → update                                          │
│     └─ DELETE → delete                                          │
│                                                                  │
│  3. CHECK PERMISSION                                            │
│     └─ hasPermission(userRole, requiredPermission)               │
│         ├─ true  → Log "ALLOWED" → Continue with request        │
│         └─ false → Log "DENIED"  → Return 403 Forbidden         │
│                                                                  │
│  4. LOG ACCESS ATTEMPT                                           │
│     └─ console.log(`[RBAC] ${role} attempted ${action}: ${status}`)│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Pseudocode

```
FUNCTION evaluateAccess(userRole, requiredPermission, action, resource):
    // Check if role has permission
    IF roles[userRole] CONTAINS requiredPermission:
        // Log successful access
        LOG "[RBAC] userRole attempted action: ALLOWED"
        RETURN { allowed: true, reason: "Permission granted" }
    ELSE:
        // Log denied access
        LOG "[RBAC] userRole attempted action: DENIED"
        RETURN { 
            allowed: false, 
            reason: "Role userRole lacks requiredPermission permission" 
        }
```

## Reflection: Scalability and Auditing

### How RBAC Supports Scalability

1. **Centralized Configuration**
   - All role-permission mappings are defined in one place (`lib/rbac.ts`)
   - Adding a new role requires changes in one file only
   - New permissions can be added without refactoring API routes

2. **Composable Permissions**
   - Permissions are granular and reusable across routes
   - Same `create` permission works for users, bookings, reviews
   - Reduces duplication and ensures consistency

3. **Extensible Design**
   - Adding new roles doesn't break existing functionality
   - Role hierarchy allows for future RBAC refinements
   - Can easily add custom roles (e.g., "moderator", "premium_user")

4. **Performance Optimized**
   - Permission checks are O(1) array lookups
   - No database queries required for permission evaluation
   - JWT contains role, eliminating database round-trips

### Auditing Benefits

1. **Access Logging**
   - All allow/deny decisions are logged with context
   - Logs include: role, action, resource, timestamp
   - Enables security incident investigation

2. **Traceability**
   - Each request can be traced to a specific user and role
   - Audit trails for compliance requirements
   - Clear documentation of access patterns

3. **Debugging Support**
   - Console logs help identify permission issues
   - Clear error messages indicate why access was denied
   - Reduces time spent on permission-related bugs

### Future Evolution: Policy-Based Access Control (PBAC)

The current RBAC system can evolve into a more sophisticated **Policy-Based Access Control (PBAC)** system:

| Current RBAC | Future PBAC |
|--------------|-------------|
| Static role-permission mapping | Dynamic, context-aware policies |
| Simple allow/deny rules | Conditions, time-based access |
| Hardcoded permissions | External policy engine (OPA, Casbin) |
| Role-based only | Attributes + roles + environment |
| Monolithic configuration | Distributed policy definitions |

**Migration Path:**

1. **Phase 1**: Continue using RBAC, log policy decisions
2. **Phase 2**: Externalize policies to JSON/YAML files
3. **Phase 3**: Introduce policy conditions (time, location, etc.)
4. **Phase 4**: Integrate with policy engine (Open Policy Agent)

**Example PBAC Policy (future):**

```yaml
# policies/booking.yaml
- name: Allow booking creation
  conditions:
    user.role: [admin, editor]
    time.between: ["09:00", "18:00"]
    booking.amount: < 10000
  action: create_booking
```

## Security Best Practices

1. **JWT Security**
   - Use strong, unique `JWT_SECRET`
   - Set reasonable token expiration (1 hour)
   - Always verify tokens server-side

2. **Defense in Depth**
   - Middleware provides first line of defense
   - API routes include explicit permission checks
   - UI components hide unauthorized actions

3. **Least Privilege**
   - Default to minimal permissions (viewer)
   - Grant additional permissions explicitly
   - Regular audit of permission assignments

4. **Audit Logging**
   - Log all access attempts (success and failure)
   - Retain logs for compliance
   - Monitor for suspicious patterns

## Quick Reference

### Key Functions

| Function | Purpose |
|----------|---------|
| `hasPermission(role, permission)` | Check if role has permission |
| `evaluateAccess(role, permission, action, resource)` | Full access evaluation with logging |
| `enforceAccessControl(role, permission, action, resource)` | Returns 403 response if denied |
| `logAccessAttempt(role, action, resource, allowed)` | Audit logging |

### Environment Variables

```env
JWT_SECRET=your-strong-secret-key-min-32-chars
```

### Response Codes

| Code | Meaning |
|------|---------|
| 200 | Request successful |
| 401 | Missing/invalid JWT token |
| 403 | Valid token, insufficient permissions |
| 404 | Resource not found |

## Conclusion

This RBAC implementation provides a solid foundation for access control that:
- ✅ Enforces least privilege principle
- ✅ Scales with application growth
- ✅ Supports comprehensive auditing
- ✅ Offers clear migration path to PBAC
- ✅ Works seamlessly across API and UI layers

