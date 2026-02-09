/**
 * RoleGuard Component
 * UI-level access control component for conditional rendering
 */

"use client";

import React, { ReactNode } from "react";
import { useRole } from "@/hooks/useRole";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  permission?: string;
  fallback?: ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles,
  permission,
  fallback = null,
}: RoleGuardProps) {
  const { role, hasPermission } = useRole();

  let hasAccess = false;

  if (allowedRoles && allowedRoles.length > 0) {
    hasAccess = allowedRoles.includes(role);
  }

  if (permission && !hasAccess) {
    hasAccess = hasPermission(permission);
  }

  if (process.env.NODE_ENV === "development") {
    const conditions: string[] = [];
    if (allowedRoles) conditions.push(`roles: [${allowedRoles.join(", ")}]`);
    if (permission) conditions.push(`permission: ${permission}`);
    console.log(
      `[RBAC UI] ${role} accessing ${conditions.join(" | ")}: ${
        hasAccess ? "ALLOWED" : "DENIED"
      }`
    );
  }

  return <>{hasAccess ? children : fallback}</>;
}

/**
 * AdminOnly Component - Renders children only for admin users
 */
export function AdminOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["admin"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * EditorAndAbove Component - Renders children for editors and admins
 */
export function EditorAndAbove({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["admin", "editor"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * PermissionGate Component - Renders children if user has the specified permission
 */
export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RoleGuard permission={permission} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export default RoleGuard;

