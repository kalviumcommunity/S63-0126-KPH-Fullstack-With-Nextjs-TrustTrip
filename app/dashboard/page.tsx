import Link from "next/link";
import { Metadata } from "next";
import { AdminOnly } from "@/components/RoleGuard";
import { EditorAndAbove } from "@/components/RoleGuard";
import { PermissionGate } from "@/components/RoleGuard";

export const metadata: Metadata = {
  title: "Dashboard - TrustTrip",
  description: "Protected dashboard with RBAC",
};

export default function Dashboard() {
  return (
    <main className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to the protected dashboard! This page demonstrates RBAC
            features.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/users"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg text-gray-800">User Management</h3>
            <p className="text-gray-600 mt-2">
              View and manage users in the system
            </p>
          </Link>
          <Link
            href="/rbac-demo"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg text-gray-800">RBAC Demo</h3>
            <p className="text-gray-600 mt-2">
              Test role-based access control features
            </p>
          </Link>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg text-gray-800">API Test</h3>
            <p className="text-gray-600 mt-2">
              Test API endpoints with different roles
            </p>
          </div>
        </div>

        {/* RBAC Features */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Role-Based Access Control Features
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Admin Section */}
            <AdminOnly>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">
                  ✓ Admin Features
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  This section is only visible to administrators
                </p>
                <ul className="text-sm space-y-2">
                  <li>• User Management (Full Access)</li>
                  <li>• System Configuration</li>
                  <li>• Analytics Dashboard</li>
                  <li>• Payment Management</li>
                  <li>• Refund Processing</li>
                </ul>
              </div>
            </AdminOnly>

            {/* Editor Section */}
            <EditorAndAbove>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  ✓ Editor Features
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  This section is visible to editors and admins
                </p>
                <ul className="text-sm space-y-2">
                  <li>• Create New Content</li>
                  <li>• Edit Existing Content</li>
                  <li>• View Reports</li>
                  <li>• Manage Reviews</li>
                </ul>
              </div>
            </EditorAndAbove>
          </div>

          {/* Permission Gates */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-800 mb-4">
              Permission-Based Actions
            </h3>

            <div className="flex flex-wrap gap-3">
              <PermissionGate permission="create">
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Create New Item
                </button>
              </PermissionGate>

              <PermissionGate permission="update">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Edit Item
                </button>
              </PermissionGate>

              <PermissionGate permission="delete">
                <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                  Delete Item
                </button>
              </PermissionGate>

              <PermissionGate permission="manage_users">
                <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                  Manage Users
                </button>
              </PermissionGate>

              <PermissionGate permission="admin_access">
                <button className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
                  Admin Panel
                </button>
              </PermissionGate>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Buttons above are only visible if you have the corresponding
              permission
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2">
            How to Test RBAC
          </h3>
          <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
            <li>
              Go to the <Link href="/login" className="underline">Login</Link> page
            </li>
            <li>Select a role (Admin, Editor, or Viewer)</li>
            <li>
              Return to this dashboard to see what features are visible
            </li>
            <li>
              Visit the <Link href="/rbac-demo" className="underline">RBAC Demo</Link> page
              for detailed testing
            </li>
            <li>Check browser console for access logs</li>
          </ol>
        </div>
      </div>
    </main>
  );
}

