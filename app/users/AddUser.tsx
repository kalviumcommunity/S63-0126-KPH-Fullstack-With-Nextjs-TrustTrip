/**
 * AddUser Component with Optimistic UI
 *
 * This component demonstrates:
 * - Optimistic UI updates using mutate()
 * - Cache manipulation before API call
 * - Revalidation after mutation
 * - Error handling and rollback on failure
 */

"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";

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

export default function AddUser() {
  const { data } = useSWR<UsersResponse>("/api/users", fetcher);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddUser = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Please enter both name and email");
      return;
    }

    setError(null);
    setIsAdding(true);

    try {
      // Create a temporary user for optimistic update
      const tempUser: User = {
        id: `temp-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        verified: false,
        role: "user",
        createdAt: new Date().toISOString(),
      };

      // eslint-disable-next-line no-console
      console.log("=== OPTIMISTIC UI UPDATE ===");
      // eslint-disable-next-line no-console
      console.log("1. Adding temporary user to cache:", tempUser);

      // OPTIMISTIC UPDATE: Update cache immediately before API call
      // This makes the UI feel instant
      mutate(
        "/api/users",
        (currentData: UsersResponse | undefined) => {
          if (!currentData) {
            return {
              data: [tempUser],
              message: "Users fetched successfully",
              pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            };
          }
          const newTotal = (currentData.pagination?.total || 0) + 1;
          const newLimit = currentData.pagination?.limit || 10;
          return {
            ...currentData,
            data: [...currentData.data, tempUser],
            pagination: {
              page: currentData.pagination?.page || 1,
              limit: newLimit,
              total: newTotal,
              totalPages: Math.ceil(newTotal / newLimit),
              hasNext: currentData.pagination?.hasNext || false,
              hasPrev: currentData.pagination?.hasPrev || false,
            },
          };
        },
        false
      );

      // eslint-disable-next-line no-console
      console.log("2. Cache updated with temp user");

      // Actual API call
      // eslint-disable-next-line no-console
      console.log("3. Making API call to create user...");
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: "temp-password",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      const result = await response.json();

      // eslint-disable-next-line no-console
      console.log("4. API call successful:", result);

      // Revalidate to sync with server data
      // eslint-disable-next-line no-console
      console.log("5. Revalidating cache from server...");
      mutate("/api/users");

      // Clear form
      setName("");
      setEmail("");

      // eslint-disable-next-line no-console
      console.log("6. Form reset, user added successfully!");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("OPTIMISTIC UPDATE FAILED:", err);

      // ROLLBACK: Restore previous cache state on error
      // eslint-disable-next-line no-console
      console.log("Rolling back cache to previous state...");
      mutate("/api/users");

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to add user. Please try again.";
      setError(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setEmail("");
    setError(null);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New User</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter user name"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAdding}
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter user email"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAdding}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddUser}
            disabled={isAdding || !name.trim() || !email.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding...
              </span>
            ) : (
              "Add User"
            )}
          </button>

          <button
            onClick={handleCancel}
            disabled={isAdding}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded border border-gray-300 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Optimistic UI Explanation */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
        <p className="text-sm text-green-700">
          <strong>Optimistic UI Flow:</strong>
        </p>
        <ol className="text-xs text-green-600 mt-1 space-y-1 list-decimal list-inside">
          <li>Show temporary user instantly in the list</li>
          <li>Perform the real API call in the background</li>
          <li>If successful: revalidate and sync with server data</li>
          <li>If failed: rollback cache to previous state</li>
        </ol>
      </div>

      {/* Current users count (shows optimistic update) */}
      {data?.data && (
        <p className="text-sm text-gray-500 mt-3">
          Showing {data.data.length} user
          {data.data.length !== 1 ? "s" : ""} (includes optimistic updates)
        </p>
      )}
    </div>
  );
}
