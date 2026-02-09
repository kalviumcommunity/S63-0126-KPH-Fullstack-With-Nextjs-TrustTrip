"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("viewer");

  const handleLogin = () => {
    setLoading(true);

    // Create a mock JWT with the selected role for testing
    const mockPayload = {
      userId: "test-user-123",
      email: `test.${selectedRole}@example.com`,
      name: `Test ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`,
      role: selectedRole,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    };

    // Create a mock JWT token (base64 encoded JSON)
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify(mockPayload));
    const signature = btoa("mock-signature");
    const mockToken = `${header}.${payload}.${signature}`;

    // Set the token in cookies
    Cookies.set("token", mockToken, { expires: 1 });

    console.log(`[AUTH] Test login with role: ${selectedRole}`);
    console.log(`[AUTH] Token created with payload:`, mockPayload);

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Login Page</h1>
        <p className="text-gray-600 text-center mb-6">
          Select a role to test RBAC functionality
        </p>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Role for Testing:
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="admin">Admin (Full Access)</option>
            <option value="editor">Editor (Create, Read, Update)</option>
            <option value="viewer">Viewer (Read Only)</option>
          </select>
        </div>

        {/* Role Description */}
        <div
          className={`p-4 rounded-lg mb-6 ${
            selectedRole === "admin"
              ? "bg-red-50 border border-red-200"
              : selectedRole === "editor"
              ? "bg-yellow-50 border border-yellow-200"
              : "bg-green-50 border border-green-200"
          }`}
        >
          <h3
            className={`font-semibold mb-2 ${
              selectedRole === "admin"
                ? "text-red-800"
                : selectedRole === "editor"
                ? "text-yellow-800"
                : "text-green-800"
            }`}
          >
            {selectedRole.toUpperCase()} Permissions:
          </h3>
          <ul className="text-sm space-y-1">
            {selectedRole === "admin" && (
              <>
                <li>✓ Create, Read, Update, Delete all resources</li>
                <li>✓ Manage users (promote/demote)</li>
                <li>✓ Manage payments and refunds</li>
                <li>✓ Access admin dashboard</li>
              </>
            )}
            {selectedRole === "editor" && (
              <>
                <li>✓ Create new content</li>
                <li>✓ Read all resources</li>
                <li>✓ Update existing content</li>
                <li>✗ Delete resources</li>
                <li>✗ Manage users</li>
              </>
            )}
            {selectedRole === "viewer" && (
              <>
                <li>✓ Read resources only</li>
                <li>✗ Create new content</li>
                <li>✗ Update content</li>
                <li>✗ Delete anything</li>
              </>
            )}
          </ul>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {loading ? "Logging in..." : `Login as ${selectedRole.toUpperCase()}`}
        </button>

        <p className="mt-4 text-xs text-gray-500 text-center">
          This creates a mock JWT token for testing RBAC. In production, tokens
          are issued by the server after authentication.
        </p>
      </div>
    </main>
  );
}
