"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // Simulate login - set a mock JWT token in cookies
    Cookies.set("token", "mock.jwt.token", { expires: 1 });
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Login Page</h1>
        <p className="text-gray-600 text-center mb-6">
          Click the button below to simulate login. This will set a mock JWT
          token in your browser cookies and redirect you to the dashboard.
        </p>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </main>
  );
}
