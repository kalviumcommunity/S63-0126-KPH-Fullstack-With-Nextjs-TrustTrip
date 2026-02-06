"use client";

import React from "react";
import { useTheme } from "@/lib/theme-provider";

/**
 * ThemeToggle Component
 *
 * A button component that toggles between light and dark themes.
 * Features:
 * - Smooth transition animations
 * - Accessible with proper ARIA attributes
 * - Visual feedback with sun/moon icons
 * - Loading state handling
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Currently in ${theme} mode. Click to switch.`}
    >
      {/* Sun Icon (visible in light mode) */}
      <svg
        className={`w-5 h-5 text-yellow-500 transition-all duration-300 ${
          theme === "light"
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-75 rotate-90"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Moon Icon (visible in dark mode) */}
      <svg
        className={`absolute w-5 h-5 text-blue-300 transition-all duration-300 ${
          theme === "dark"
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-75 -rotate-90"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 24.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>

      {/* Background pill animation */}
      <span
        className={`absolute inset-0 rounded-lg overflow-hidden transition-transform duration-300 ${
          theme === "dark" ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <span className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20" />
      </span>
    </button>
  );
}

/**
 * ThemeToggleWithLabel Component
 *
 * Theme toggle button with a text label.
 * Useful for mobile menus or compact navigation.
 */
export function ThemeToggleWithLabel() {
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
        {theme} Mode
      </span>
    </div>
  );
}

/**
 * ThemeToggleIconOnly Component
 *
 * Compact icon-only version for space-constrained areas.
 */
export function ThemeToggleIconOnly() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        // Moon icon for dark mode switch
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 24.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        // Sun icon for light mode switch
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );
}

/**
 * ThemeStatus Component
 *
 * Displays current theme status with visual indicator.
 * Useful for settings pages or footer.
 */
export function ThemeStatus() {
  const { theme } = useTheme();

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-gray-600 dark:text-gray-400">
        Currently in <strong className="capitalize">{theme}</strong> mode
      </span>
    </div>
  );
}

export default ThemeToggle;

