import Link from "next/link";
import { Metadata } from "next";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "App Router Demo - Home",
  description:
    "Welcome to the Next.js App Router routing demo with responsive and themed design",
};

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Responsive Layout Demo */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
          {/* Responsive text sizing: text-2xl -> md:text-4xl -> lg:text-5xl */}
          <div className="text-center mb-12">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
              Welcome to the App 🚀
            </h1>
            
            {/* Responsive paragraph: text-base -> md:text-lg */}
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              This demo showcases Next.js App Router with public and protected
              routes, dynamic segments, custom error handling, and now...
              <span className="font-semibold text-brand dark:text-brand-light">
                {" "}
                Responsive & Themed Design!
              </span>
            </p>

            {/* Quick Actions - Responsive flex layout */}
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <Link
                href="/login"
                className="px-5 py-2.5 md:px-6 md:py-3 bg-brand hover:bg-brand-dark text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                Go to Login
              </Link>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 md:px-6 md:py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Try Dashboard (Protected)
              </Link>
              <Link
                href="/users/1"
                className="px-5 py-2.5 md:px-6 md:py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
              >
                View User 1 Profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Route Information Section - Responsive Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Route Structure
          </h2>

          {/* Responsive grid: 1 col -> md:2 cols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Public Routes Card */}
            <div className="p-4 md:p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl transition-colors duration-300">
              <h3 className="font-semibold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
                <span className="text-xl">✓</span> Public Routes
              </h3>
              <ul className="space-y-3 text-sm md:text-base text-green-700 dark:text-green-300">
                <li className="flex items-start gap-2">
                  <code className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 rounded text-xs md:text-sm font-mono">
                    /
                  </code>
                  - Home page
                </li>
                <li className="flex items-start gap-2">
                  <code className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 rounded text-xs md:text-sm font-mono">
                    /login
                  </code>
                  - Login page
                </li>
              </ul>
              <p className="mt-4 text-xs md:text-sm text-green-600 dark:text-green-400">
                Accessible to all users without authentication
              </p>
            </div>

            {/* Protected Routes Card */}
            <div className="p-4 md:p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl transition-colors duration-300">
              <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2">
                <span className="text-xl">🔒</span> Protected Routes
              </h3>
              <ul className="space-y-3 text-sm md:text-base text-blue-700 dark:text-blue-300">
                <li className="flex items-start gap-2">
                  <code className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded text-xs md:text-sm font-mono">
                    /dashboard
                  </code>
                  - Dashboard
                </li>
                <li className="flex items-start gap-2">
                  <code className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded text-xs md:text-sm font-mono">
                    /users
                  </code>
                  - Users list
                </li>
                <li className="flex items-start gap-2">
                  <code className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded text-xs md:text-sm font-mono">
                    /users/[id]
                  </code>
                  - User profile
                </li>
              </ul>
              <p className="mt-4 text-xs md:text-sm text-blue-600 dark:text-blue-400">
                Require authentication - redirect to /login if not authenticated
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Responsive Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Features Implemented
          </h2>

          {/* Responsive grid: 1 col -> md:2 cols -> lg:3 cols */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Feature Card 1 */}
            <div className="p-4 md:p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                🛡️ Middleware Protection
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Routes are protected server-side using Next.js middleware with
                JWT validation
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="p-4 md:p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                🔗 Dynamic Routes
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                User profiles use dynamic segments [id] to render parameterized
                pages
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="p-4 md:p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                🎨 Responsive Design
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Tailwind CSS with custom breakpoints and theme support for all
                devices
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="p-4 md:p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                🌙 Dark/Light Mode
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Toggle between themes with localStorage persistence and system
                preference sync
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="p-4 md:p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                ♿ Accessibility
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                WCAG compliant color contrast and keyboard navigation support
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="p-4 md:p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                ⚡ Fast Performance
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Optimized with Next.js App Router and Tailwind CSS v4 for
                lightning-fast loads
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Demo Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🎨 Theme Demo Section
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-8">
            This section demonstrates how the theme switching works. The colors
            adapt seamlessly between light and dark modes!
          </p>

          {/* Color Palette Demo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="w-full h-12 rounded bg-brand-light mb-2" />
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Brand Light
              </p>
              <p className="text-xs text-gray-500">#93C5FD</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="w-full h-12 rounded bg-brand mb-2" />
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Brand Default
              </p>
              <p className="text-xs text-gray-500">#3B82F6</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="w-full h-12 rounded bg-brand-dark mb-2" />
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Brand Dark
              </p>
              <p className="text-xs text-gray-500">#1E40AF</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="w-full h-12 rounded bg-gradient-to-r from-brand-light via-brand to-brand-dark mb-2" />
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Gradient
              </p>
              <p className="text-xs text-gray-500">Full Range</p>
            </div>
          </div>

          {/* Responsive Padding Demo */}
          <div className="bg-brand/10 dark:bg-brand/20 border-2 border-dashed border-brand rounded-lg">
            {/* Responsive padding: p-4 -> md:p-8 -> lg:p-12 */}
            <div className="p-4 md:p-8 lg:p-12 text-center">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Responsive Padding Demo
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                Padding adapts: <code className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">p-4</code> →{" "}
                <code className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">md:p-8</code> →{" "}
                <code className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">lg:p-12</code>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

