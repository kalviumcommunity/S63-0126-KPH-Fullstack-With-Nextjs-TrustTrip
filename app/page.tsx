import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "App Router Demo - Home",
  description: "Welcome to the Next.js App Router routing demo",
};

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to the App 🚀</h1>
        <p className="text-xl text-gray-600 mb-8">
          This demo showcases Next.js App Router with public and protected
          routes, dynamic segments, and custom error handling.
        </p>

        {/* Route Information Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 text-left">
          <h2 className="text-2xl font-bold mb-4">Route Structure</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Public Routes */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">
                ✓ Public Routes
              </h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li>
                  <code className="bg-green-100 px-2 py-1 rounded">/</code> -
                  Home page
                </li>
                <li>
                  <code className="bg-green-100 px-2 py-1 rounded">/login</code>{" "}
                  - Login page
                </li>
              </ul>
              <p className="mt-3 text-xs text-green-600">
                Accessible to all users without authentication
              </p>
            </div>

            {/* Protected Routes */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">
                🔒 Protected Routes
              </h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>
                  <code className="bg-blue-100 px-2 py-1 rounded">
                    /dashboard
                  </code>{" "}
                  - Dashboard
                </li>
                <li>
                  <code className="bg-blue-100 px-2 py-1 rounded">/users</code>{" "}
                  - Users list
                </li>
                <li>
                  <code className="bg-blue-100 px-2 py-1 rounded">
                    /users/[id]
                  </code>{" "}
                  - User profile
                </li>
              </ul>
              <p className="mt-3 text-xs text-blue-600">
                Require authentication - redirect to /login if not authenticated
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Try Dashboard (Protected)
          </Link>
          <Link
            href="/users/1"
            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            View User 1 Profile
          </Link>
        </div>

        {/* Features Info */}
        <div className="mt-12 text-left">
          <h2 className="text-2xl font-bold mb-4">Features Implemented</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">🛡️ Middleware Protection</h3>
              <p className="text-sm text-gray-600">
                Routes are protected server-side using Next.js middleware with
                JWT validation
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">🔗 Dynamic Routes</h3>
              <p className="text-sm text-gray-600">
                User profiles use dynamic segments [id] to render parameterized
                pages
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">🍞 Breadcrumbs</h3>
              <p className="text-sm text-gray-600">
                Navigation breadcrumbs improve user experience and SEO
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
