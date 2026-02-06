"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./AuthDemo.module.css";

/**
 * AuthDemo Component
 * Demonstrates the usage of AuthContext for authentication
 *
 * Features:
 * - Login form
 * - Signup form
 * - User profile display
 * - Logout functionality
 * - Loading states
 * - Error handling
 */
export default function AuthDemo() {
  const { user, isAuthenticated, isLoading, login, signup, logout } = useAuth();

  const [formMode, setFormMode] = useState<"login" | "signup">("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle form input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error on input change
  };

  /**
   * Handle login form submission
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
      // Clear form on success
      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle signup form submission
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signup(formData.name, formData.email, formData.password);
      // Clear form on success
      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    setFormData({ name: "", email: "", password: "" });
    setError("");
  };

  /**
   * Show loading state while initializing
   */
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading authentication...</div>
      </div>
    );
  }

  /**
   * Authenticated User View
   */
  if (isAuthenticated && user) {
    return (
      <div className={styles.container}>
        <div className={styles.profileCard}>
          <h2 className={styles.title}>Welcome Back!</h2>
          <div className={styles.userInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{user.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{user.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Role:</span>
              <span className={styles.value}>{user.role}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Status:</span>
              <span
                className={`${styles.badge} ${user.verified ? styles.verified : styles.unverified}`}
              >
                {user.verified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  /**
   * Login/Signup Form View
   */
  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <h2 className={styles.title}>
          {formMode === "login" ? "Login" : "Sign Up"}
        </h2>

        <div className={styles.formToggle}>
          <button
            className={formMode === "login" ? styles.active : ""}
            onClick={() => {
              setFormMode("login");
              setError("");
            }}
          >
            Login
          </button>
          <button
            className={formMode === "signup" ? styles.active : ""}
            onClick={() => {
              setFormMode("signup");
              setError("");
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={formMode === "login" ? handleLogin : handleSignup}>
          {formMode === "signup" && (
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              minLength={6}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Processing..."
              : formMode === "login"
                ? "Login"
                : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
