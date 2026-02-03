import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Navigation */}
        <nav className="flex items-center justify-between p-4 bg-gray-100 border-b">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-blue-600"
            >
              TrustTrip
            </Link>
            <div className="flex gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/users"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Users
              </Link>
              <Link
                href="/users/1"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                User 1
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
