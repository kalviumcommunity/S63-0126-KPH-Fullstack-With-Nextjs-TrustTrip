/**
 * useRole Hook
 * Client-side hook for accessing user role and permissions
 */

"use client";

import { useMemo } from "react";

interface UseRoleReturn {
  role: string;
  permissions: string[];
  isAdmin: boolean;
  isEditor: boolean;
  isViewer: boolean;
  hasPermission: (permission: string) => boolean;
}

interface DecodedToken {
  userId: string;
  email: string;
  name: string;
  role: string;
  exp: number;
  iat: number;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "create",
    "read",
    "update",
    "delete",
    "manage_users",
    "manage_payments",
    "manage_refunds",
    "admin_access",
  ],
  editor: ["create", "read", "update"],
  viewer: ["read"],
};

function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload as DecodedToken;
  } catch {
    return null;
  }
}

function getTokenFromCookies(): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "token") return value;
  }
  return null;
}

export function useRole(): UseRoleReturn {
  const token = getTokenFromCookies();
  const decoded = token ? decodeToken(token) : null;
  const userRole = (decoded?.role as string) || "viewer";

  const role = userRole;
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  return {
    role,
    permissions,
    isAdmin: role === "admin",
    isEditor: role === "editor",
    isViewer: role === "viewer",
    hasPermission,
  };
}

export default useRole;

