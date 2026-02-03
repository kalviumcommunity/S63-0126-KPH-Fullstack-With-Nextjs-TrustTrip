import Link from "next/link";
import { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `User Profile - ${id}`,
    description: `Viewing profile for user ID: ${id}`,
  };
}

export default async function UserPage({ params }: Props) {
  const { id } = await params;

  // Mock user data - in real app, fetch from database
  const userData = {
    id,
    name: `User ${id}`,
    email: `user${id}@example.com`,
    role: id === "1" ? "Admin" : "Member",
    joinedDate: "2024-01-15",
    bio: `This is the profile page for user ${id}. In a real application, this data would be fetched from a database using the user ID.`,
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span>/</span>
          <Link href="/users" className="hover:text-blue-600">
            Users
          </Link>
          <span>/</span>
          <span className="text-gray-900">Profile {id}</span>
        </nav>

        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {id}
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold">{userData.name}</h1>
              <p className="text-gray-500">{userData.email}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Profile Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">User ID</dt>
                <dd className="text-lg font-medium">{userData.id}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Role</dt>
                <dd className="text-lg font-medium">{userData.role}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Joined Date</dt>
                <dd className="text-lg font-medium">{userData.joinedDate}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Profile URL</dt>
                <dd className="text-lg font-medium">/users/{id}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Bio</h3>
            <p className="text-gray-600">{userData.bio}</p>
          </div>
        </div>

        {/* Navigation to other users */}
        <div className="mt-6 flex gap-4">
          <Link
            href="/users"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            ← Back to Users List
          </Link>
          {id !== "1" && (
            <Link
              href={`/users/${parseInt(id) - 1}`}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              ← Previous User
            </Link>
          )}
          <Link
            href={`/users/${parseInt(id) + 1}`}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Next User →
          </Link>
        </div>
      </div>
    </main>
  );
}
