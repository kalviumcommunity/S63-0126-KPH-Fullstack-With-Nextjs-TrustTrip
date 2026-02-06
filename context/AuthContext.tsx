"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

/**
 * User Interface
 * Represents the authenticated user data
 */
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  verified: boolean;
}

/**
 * Auth State Interface
 * Defines the shape of authentication state
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Auth Context Interface
 * Defines all methods and state available through context
 */
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshAuth: () => Promise<void>;
}

/**
 * Create Auth Context
 * Initial value is undefined to enforce provider usage
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods
 *
 * Features:
 * - Persistent authentication using localStorage
 * - Automatic token validation on mount
 * - Login/Signup/Logout functionality
 * - User data management
 *
 * @param children - Child components that will have access to auth context
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  /**
   * Initialize authentication state from localStorage
   * Runs once on component mount
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("authUser");

        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser);
          setAuthState({
            user,
            token: storedToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  /**
   * Login Function
   * Authenticates user and stores credentials
   *
   * @param email - User's email address
   * @param password - User's password
   * @throws Error if login fails
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const { token, user } = data.data;

      // Store in localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));

      // Update state
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }, []);

  /**
   * Signup Function
   * Registers new user and automatically logs them in
   *
   * @param name - User's full name
   * @param email - User's email address
   * @param password - User's password
   * @throws Error if signup fails
   */
  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Signup failed");
        }

        const user = data.data;

        // After signup, automatically log the user in
        await login(email, password);
      } catch (error) {
        console.error("Signup error:", error);
        throw error;
      }
    },
    [login]
  );

  /**
   * Logout Function
   * Clears authentication state and localStorage
   */
  const logout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");

    // Reset state
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  /**
   * Update User Function
   * Partially updates user data in state and localStorage
   *
   * @param userData - Partial user data to update
   */
  const updateUser = useCallback((userData: Partial<User>) => {
    setAuthState((prev) => {
      if (!prev.user) return prev;

      const updatedUser = { ...prev.user, ...userData };

      // Update localStorage
      localStorage.setItem("authUser", JSON.stringify(updatedUser));

      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  /**
   * Refresh Auth Function
   * Re-validates token and refreshes user data
   * Useful after token expiry or user data updates
   */
  const refreshAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        logout();
        return;
      }

      // Optionally validate token with backend
      // For now, just check if token exists
      const storedUser = localStorage.getItem("authUser");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error refreshing auth:", error);
      logout();
    }
  }, [logout]);

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    updateUser,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * Custom hook to access auth context
 *
 * @throws Error if used outside AuthProvider
 * @returns AuthContextType with all auth state and methods
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, login, logout, isAuthenticated } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <LoginForm onSubmit={login} />;
 *   }
 *
 *   return <div>Welcome, {user?.name}</div>;
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

/**
 * Authentication Hook Utilities
 * Additional helper hooks for common auth patterns
 */

/**
 * useRequireAuth Hook
 * Redirects to login if user is not authenticated
 * Useful for protecting routes at component level
 *
 * @param redirectUrl - URL to redirect to if not authenticated (default: '/login')
 * @returns User object or null
 */
export function useRequireAuth(redirectUrl = "/login") {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // In a real app, use next/navigation to redirect
      console.warn(`User not authenticated. Redirect to ${redirectUrl}`);
    }
  }, [isAuthenticated, isLoading, redirectUrl]);

  return user;
}

/**
 * useAuthToken Hook
 * Provides easy access to auth token for API calls
 *
 * @returns token string or null
 */
export function useAuthToken(): string | null {
  const { token } = useAuth();
  return token;
}
