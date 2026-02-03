import Redis from "ioredis";

/**
 * Redis Connection Utility
 *
 * Provides a singleton Redis client for caching operations.
 * Supports connection via REDIS_URL environment variable.
 */

// Use global to prevent multiple instances in development (hot reload)
const globalForRedis = global as unknown as { redis: Redis | undefined };

/**
 * Create and return Redis client instance
 * - Uses REDIS_URL env var if available (e.g., from Docker Compose: redis://redis:6379)
 * - Falls back to localhost:6379 for local development
 */
export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    // Retry strategy for connection resilience
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    // Enable lazy connect for better startup handling
    lazyConnect: true,
  });

// Set global reference in non-production environments
if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

/**
 * Cache key prefixes for different resources
 */
export const CACHE_KEYS = {
  USERS: "users",
  BOOKINGS: "bookings",
  PROJECTS: "projects",
  REVIEWS: "reviews",
} as const;

/**
 * Default TTL values (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 30, // 30 seconds - for frequently changing data
  MEDIUM: 60, // 1 minute - for moderately changing data
  LONG: 300, // 5 minutes - for rarely changing data
  DAY: 86400, // 24 hours - for reference data
} as const;

export default redis;
