/**
 * RBAC Demo Page
 * 
 * This page demonstrates the Role-Based Access Control (RBAC) system
 * with interactive testing for different roles and permissions.
 * 
 * Access this page at /rbac-demo after logging in.
 */

"use client";

import { useState, useEffect } from "react";
import { useRole } from "@/hooks/useRole";
import { RoleGuard } from "@/components/RoleGuard";
import { AdminOnly } from "@/components/RoleGuard";
import { EditorAndAbove } from "@/components/RoleGuard";
import { PermissionGate } from "@/components/RoleGuard";

interface TestResult {
  role: string;
  action: string;
  allowed: boolean;
  timestamp: string;
}

export default function RBACDemoPage() {
  const { role, permissions, isAdmin, isEditor, isViewer, hasPermission } = useRole();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState<"info" | "test" | "logs">("info");

  // Log when component mounts
  useEffect(() => {
    console.log(`[RBAC Demo] Page loaded with role: ${role}`);
    console.log(`[RBAC Demo] Permissions: ${permissions.join(", ")}`);
  }, [role, permissions]);

  const runTest = (action: string, permission: string) => {
    const allowed = hasPermission(permission);
    const result: TestResult = {
      role,
      action,
      allowed,
      timestamp: new Date().toISOString(),
    };

    console.log(
      `[RBAC Test] ${role.toUpperCase()} attempted ${action} (${permission}): ${allowed ? "ALLOWED" : "DENIED"}`
    );

    setTestResults((prev) => [result, ...prev].slice(0, 50)); // Keep last 50 results
    return allowed;
  };

  const allActions = [
    { name: "Create User", permission: "create" },
    { name: "Read Users", permission: "read" },
    { name: "Update User", permission: "update" },
    { name: "Delete User", permission: "delete" },
    { name: "Manage Users", permission: "manage_users" },
    { name: "Manage Payments", permission: "manage_payments" },
    { name: "Manage Refunds", permission: "manage_refunds" },
    { name: "Admin Access", permission: "admin_access" },
  ];

  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Role-Based Access Control (RBAC) Demo
          </h1>
          <p className="text-gray-600">
            Test and verify the RBAC implementation with different user roles
          </p>
        </div>

        {/* Role Badge */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Current User Role
              </h2>
              <p className="text-gray-600">
                Log in with different accounts to test different roles
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`px-6 py-3 rounded-full text-lg font-semibold ${
                  isAdmin
                    ? "bg-red-100 text-red-800"
                    : isEditor
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {role.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Role Permissions */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Your Permissions:
            </h3>
            <div className="flex flex-wrap gap-2">
              {permissions.map((perm) => (
                <span
                  key={perm}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "info"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Role Info
          </button>
          <button
            onClick={() => setActiveTab("test")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "test"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Permission Tests
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "logs"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Access Logs ({testResults.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "info" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Role Hierarchy & Permissions
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Admin */}
              <div className="border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h3 className="font-semibold text-red-800">ADMIN</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Full system access with all permissions
                </p>
                <ul className="text-sm space-y-1">
                  <li>✓ Create, Read, Update, Delete</li>
                  <li>✓ Manage Users</li>
                  <li>✓ Manage Payments</li>
                  <li>✓ Manage Refunds</li>
                  <li>✓ Admin Access</li>
                </ul>
              </div>

              {/* Editor */}
              <div className="border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h3 className="font-semibold text-yellow-800">EDITOR</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Content management with limited permissions
                </p>
                <ul className="text-sm space-y-1">
                  <li>✓ Create, Read, Update</li>
                  <li>✗ Delete</li>
                  <li>✗ Manage Users</li>
                  <li>✗ Manage Payments</li>
                  <li>✗ Admin Access</li>
                </ul>
              </div>

              {/* Viewer */}
              <div className="border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="font-semibold text-green-800">VIEWER</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Read-only access to resources
                </p>
                <ul className="text-sm space-y-1">
                  <li>✓ Read</li>
                  <li>✗ Create</li>
                  <li>✗ Update</li>
                  <li>✗ Delete</li>
                  <li>✗ All Management</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "test" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Permission Tests
            </h2>
            <p className="text-gray-600 mb-4">
              Click on each action to test if your role allows it. Check the
              console for detailed logs.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {allActions.map(({ name, permission }) => {
                const allowed = hasPermission(permission);
                return (
                  <button
                    key={permission}
                    onClick={() => runTest(name, permission)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      allowed
                        ? "border-green-300 bg-green-50 hover:bg-green-100"
                        : "border-red-300 bg-red-50 hover:bg-red-100"
                    }`}
                  >
                    <div className="font-medium text-gray-800">{name}</div>
                    <div
                      className={`text-sm mt-1 ${
                        allowed ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {allowed ? "✓ ALLOWED" : "✗ DENIED"}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* UI Component Tests */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                UI Component Tests
              </h3>
              <p className="text-gray-600 mb-4">
                These components are conditionally rendered based on your role:
              </p>

              <div className="space-y-4">
                {/* Admin Only */}
                <AdminOnly
                  fallback={
                    <div className="p-4 bg-gray-100 rounded-lg text-gray-500">
                      ✗ Admin-only content (hidden for {role})
                    </div>
                  }
                >
                  <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                    ✓ ADMIN-ONLY CONTENT - Only visible to admins
                  </div>
                </AdminOnly>

                {/* Editor and Above */}
                <EditorAndAbove
                  fallback={
                    <div className="p-4 bg-gray-100 rounded-lg text-gray-500">
                      ✗ Editor content (hidden for {role})
                    </div>
                  }
                >
                  <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                    ✓ EDITOR CONTENT - Visible to editors and admins
                  </div>
                </EditorAndAbove>

                {/* Permission Gate */}
                <PermissionGate
                  permission="delete"
                  fallback={
                    <div className="p-4 bg-gray-100 rounded-lg text-gray-500">
                      ✗ Delete button (hidden for {role})
                    </div>
                  }
                >
                  <div className="p-4 bg-red-100 border border-red-300 rounded-lg flex items-center gap-2">
                    <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                      Delete Item
                    </button>
                    <span className="text-red-700">
                      (Visible because you have delete permission)
                    </span>
                  </div>
                </PermissionGate>
              </div>
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Access Logs
              </h2>
              <button
                onClick={() => setTestResults([])}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Clear Logs
              </button>
            </div>

            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No access logs yet. Go to the Permission Tests tab and click
                some actions to generate logs.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.allowed
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className={`font-medium ${
                            result.allowed ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {result.allowed ? "✓ ALLOWED" : "✗ DENIED"}
                        </span>
                        <span className="text-gray-600 ml-2">
                          {result.action}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Role: {result.role} | Permission: {result.action.toLowerCase().replace(" ", "_")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Console Output Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            📝 Console Logging
          </h3>
          <p className="text-sm text-blue-700">
            All RBAC access attempts are logged to the browser console with
            detailed information. Open your browser&apos;s developer tools (F12) to
            see the logs.
          </p>
          <div className="mt-2 text-xs text-blue-600">
            <p>Look for logs prefixed with:</p>
            <ul className="list-disc list-inside ml-2">
              <li>[RBAC] - Access control events</li>
              <li>[RBAC Test] - Permission test results</li>
              <li>[RBAC UI] - UI component access</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>RBAC Demo - TrustTrip Application</p>
          <p>
            Try logging in with different roles to see how permissions change
          </p>
        </div>
      </div>
    </main>
  );
}

