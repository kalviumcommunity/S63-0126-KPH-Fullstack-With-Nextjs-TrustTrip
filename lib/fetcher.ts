/**
 * SWR Fetcher Helper
 *
 * Centralized fetching logic for consistent API calls with SWR.
 * This ensures uniform error handling and response processing across all fetches.
 *
 * Key Benefits:
 * - Centralized error handling
 * - Consistent response parsing
 * - Easier to manage retries and error logging
 */

export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the data."
    ) as Error & {
      status: number;
      info: unknown;
    };
    error.status = res.status;
    try {
      error.info = await res.json();
    } catch {
      error.info = await res.text();
    }
    throw error;
  }

  return res.json();
};

/**
 * Fetcher with caching control
 * Allows bypassing cache when needed
 */
export const fetcherNoCache = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the data."
    ) as Error & {
      status: number;
      info: unknown;
    };
    error.status = res.status;
    try {
      error.info = await res.json();
    } catch {
      error.info = await res.text();
    }
    throw error;
  }

  return res.json();
};

/**
 * Fetcher with longer cache TTL for stable data
 */
export const fetcherLongCache = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the data."
    ) as Error & {
      status: number;
      info: unknown;
    };
    error.status = res.status;
    try {
      error.info = await res.json();
    } catch {
      error.info = await res.text();
    }
    throw error;
  }

  return res.json();
};
