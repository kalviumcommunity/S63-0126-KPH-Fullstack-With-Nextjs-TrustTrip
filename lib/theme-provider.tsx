"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

/**
 * ThemeProvider Component
 *
 * Manages theme state (light/dark mode) for the application.
 * Features:
 * - Persists theme preference in localStorage
 * - Syncs with system preference on initial load
 * - Prevents hydration mismatch by only applying theme after mount
 * - Smooth transitions between themes
 */
export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "trusttrip-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Apply theme to document
  const applyTheme = (themeToApply: Theme) => {
    const html = document.documentElement;

    if (themeToApply === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  };

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    // Check localStorage first
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;

    if (storedTheme) {
      setTheme(storedTheme);
      applyTheme(storedTheme);
    } else {
      // Check system preference
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      setTheme(systemTheme);
      applyTheme(systemTheme);
    }

    // Mark as mounted after applying initial theme
    setMounted(true);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? "dark" : "light";
      // Only update if user hasn't set a preference
      if (!localStorage.getItem(storageKey)) {
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [storageKey]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  const setThemeDirect = (themeToSet: Theme) => {
    setTheme(themeToSet);
    applyTheme(themeToSet);
    localStorage.setItem(storageKey, themeToSet);
  };

  // Prevent hydration mismatch by rendering with default theme until mounted
  if (!mounted) {
    return (
      <ThemeContext.Provider
        value={{ theme: defaultTheme, toggleTheme, setTheme: setThemeDirect }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, setTheme: setThemeDirect }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme Hook
 *
 * Custom hook to access theme context.
 * Must be used within a ThemeProvider.
 *
 * @returns {ThemeContextType} Theme context with theme state and toggle function
 * @throws {Error} If used outside ThemeProvider
 *
 * @example
 * const { theme, toggleTheme } = useTheme();
 * console.log(theme); // 'light' or 'dark'
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

/**
 * useThemeEffect Hook (Optional)
 *
 * For components that need to respond to theme changes.
 * Returns both the current theme and a previous theme value.
 */
export function useThemeEffect(): {
  theme: Theme;
  previousTheme: Theme | null;
} {
  const { theme } = useTheme();
  const [previousTheme, setPreviousTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setPreviousTheme(theme);
  }, [theme]);

  return { theme, previousTheme };
}

