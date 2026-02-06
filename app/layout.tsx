import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "App Router Demo",
  description: "Public, Protected, and Dynamic Routes in Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="light" storageKey="trusttrip-theme">
          {/* Navigation */}
          <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo Section */}
                <div className="flex items-center gap-6">
                  <Link
                    href="/"
                    className="text-xl font-bold text-gray-900 dark:text-white hover:text-brand transition-colors"
                  >
                    TrustTrip
                  </Link>
                  <div className="hidden md:flex items-center gap-4">
                    <Link
                      href="/"
                      className="text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand-light transition-colors"
                    >
                      Home
                    </Link>
                    <Link
                      href="/login"
                      className="text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand-light transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/dashboard"
                      className="text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand-light transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/users"
                      className="text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand-light transition-colors"
                    >
                      Users
                    </Link>
                    <Link
                      href="/users/1"
                      className="text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand-light transition-colors"
                    >
                      User 1
                    </Link>
                  </div>
                </div>

                {/* Right Section - Theme Toggle */}
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-around py-2">
                <Link
                  href="/"
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand-light transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand-light transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand-light transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/users"
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-brand dark:hover:text-brand-light transition-colors"
                >
                  Users
                </Link>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          {children}

          {/* Footer */}
          <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  © {new Date().getFullYear()} TrustTrip. All rights reserved.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Built with Next.js & Tailwind CSS</span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span>Responsive & Themed</span>
                </div>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}

