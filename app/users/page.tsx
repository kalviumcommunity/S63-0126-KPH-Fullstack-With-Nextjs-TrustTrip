/**
 * Users Page with SWR Data Fetching
 *
 * This page demonstrates:
 * - Client-side data fetching with SWR
 * - Cache hits vs misses tracking
 * - Revalidation on focus
 * - Error handling and loading states
 * - Stale-while-revalidate behavior
 */

"use client";

import { useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";
import AddUser from "./AddUser";

// User type definition
interface User {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  role: string;
  createdAt: string;
}

// API Response type
interface UsersResponse {
  data: User[];
  message: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function UsersPage() {
  const { cache, mutate } = useSWRConfig();

  // SWR hook for fetching users
  // Key concepts:
  // - "/api/users" is the cache key
  // - fetcher is the function that performs the actual fetch
  // - SWR immediately returns cached data if available (stale-while-revalidate)
  const { data, error, isLoading, isValidating } = useSWR<UsersResponse>(
    "/api/users",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      revalidateIfStale: true,
      dedupingInterval: 5000,
    }
  );

  // Log cache behavior on mount
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("=== SWR Cache Inspection ===");
    // eslint-disable-next-line no-console
    console.log("Cache keys:", Array.from(cache.keys()));
    const swrCacheKey = "/api/users";
    const cachedValue = cache.get(swrCacheKey);
    if (cachedValue) {
      // eslint-disable-next-line no-console
      console.log("[CACHE HIT] Data found in cache for key:", swrCacheKey);
    } else {
      // eslint-disable-next-line no-console
      console.log("[CACHE MISS] No data in cache for key:", swrCacheKey);
    }
    // eslint-disable-next-line no-console
    console.log("===========================");
  }, [cache]);

  // Force revalidate function for demonstration
  const handleRevalidate = () => {
    // eslint-disable-next-line no-console
    console.log("Manually triggering revalidation...");
    mutate("/api/users");
  };

  // Show loading state
  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold text-lg">
            Failed to load users
          </h2>
          <p className="text-red-600 mt-2">
            {error.message || "Failed to fetch users. Please try again."}
          </p>
          <button
            onClick={() => mutate("/api/users")}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-gray-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRevalidate}
            disabled={isValidating}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded border border-gray-300 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isValidating ? "Revalidating..." : "Refresh Data"}
          </button>
        </div>
      </div>

      {/* SWR Status Indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2">SWR Status</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Loading:</span>{" "}
            <span
              className={
                isLoading ? "font-bold text-blue-600" : "text-gray-800"
              }
            >
              {isLoading ? "Yes" : "No"}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Validating:</span>{" "}
            <span
              className={
                isValidating ? "font-bold text-yellow-600" : "text-gray-800"
              }
            >
              {isValidating ? "Yes" : "No"}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Error:</span>{" "}
            <span
              className={error ? "font-bold text-red-600" : "text-gray-800"}
            >
              {error ? "Yes" : "No"}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Data Available:</span>{" "}
            <span
              className={data ? "font-bold text-green-600" : "text-gray-800"}
            >
              {data ? "Yes" : "No"}
            </span>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          <strong>Stale-While-Revalidate:</strong> SWR immediately returns
          cached data (if available) while revalidating in the background for
          fresh data.
        </p>
      </div>

      {/* Add User Component */}
      <AddUser />

      {/* Users List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          User List{" "}
          {data?.pagination && (
            <span className="text-sm font-normal text-gray-500">
              ({data.pagination.total} total users)
            </span>
          )}
        </h2>

        {!data?.data || data.data.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No users found.</p>
            <p className="text-sm text-gray-400 mt-2">
              Add a user using the form above to get started.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.data.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.verified ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cache Debug Info */}
      {process.env.NODE_ENV === "development" && (
        <details className="mt-8 p-4 bg-gray-100 rounded-lg">
          <summary className="cursor-pointer font-semibold text-gray-700">
            Debug: SWR Cache Inspector
          </summary>
          <pre className="mt-4 text-xs bg-gray-800 text-green-400 p-4 rounded overflow-auto">
            {JSON.stringify(
              {
                cacheKeys: Array.from(cache.keys()),
                dataKey: "/api/users",
                cachedData: cache.get("/api/users")
                  ? {
                      ...cache.get("/api/users"),
                      data: cache.get("/api/users")?.data?.slice(0, 2),
                    }
                  : null,
              },
              null,
              2
            )}
          </pre>
        </details>
      )}

      {/* Revalidation Info */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">
          Revalidation Strategies
        </h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>
            <strong>Focus:</strong> Data refreshes when you return to this tab
          </li>
          <li>
            <strong>Interval:</strong> Auto-refreshes every 30 seconds
          </li>
          <li>
            <strong>Reconnect:</strong> Revalidates when network connection
            recovers
          </li>
          <li>
            <strong>Manual:</strong> Click Refresh Data to force revalidation
          </li>
        </ul>
      </div>
    </div>
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users List",
  description: "List of all users in the system",
};

export default function UsersList() {
  // Mock user data
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com" },
    { id: 4, name: "Alice Williams", email: "alice@example.com" },
    { id: 5, name: "Charlie Brown", email: "charlie@example.com" },
  ];

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Users List</h1>
        <p className="text-gray-600 mb-6">
          This is a protected route. Only authenticated users can see this page.
        </p>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-900">Users</span>
        </nav>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/users/${user.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
