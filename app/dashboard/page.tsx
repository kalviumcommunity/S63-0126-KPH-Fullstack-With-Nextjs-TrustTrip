import Cookies from "js-cookie";
import { redirect } from "next/navigation";

export default function Dashboard() {
  const token = Cookies.get("token");

  // Redirect to login if no token (additional client-side check)
  if (!token) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            Welcome to the protected dashboard! This page is only accessible to
            authenticated users.
          </p>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              ✓ You are currently logged in with token: {token}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
