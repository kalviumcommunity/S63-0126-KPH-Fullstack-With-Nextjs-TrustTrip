# SWR Implementation Guide

This document covers the implementation of SWR (Stale-While-Revalidate) for client-side data fetching in our Next.js application.

## Table of Contents

1. [Overview](#overview)
2. [SWR Key Concept](#swr-key-concept)
3. [Setup and Installation](#setup-and-installation)
4. [Basic Usage](#basic-usage)
5. [Revalidation Strategies](#revalidation-strategies)
6. [Mutation and Optimistic UI](#mutation-and-optimistic-ui)
7. [Cache Hits vs Misses](#cache-hits-vs-misses)
8. [Error Handling and Retry Logic](#error-handling-and-retry-logic)
9. [Trade-offs and UX Impact](#trade-offs-and-ux-impact)
10. [Comparison with Fetch API](#comparison-with-fetch-api)

---

## Overview

SWR is a React hook library for data fetching and caching. It provides:

- **Fast page navigation** with cached data
- **Auto revalidation** to keep data fresh
- **Optimistic updates** for instant UI feedback
- **Error handling and retry** built-in
- **Cache management** with fine-grained control

---

## SWR Key Concept

### What is SWR?

SWR stands for **Stale-While-Revalidate**, a caching strategy that:

1. **Returns cached data immediately** (stale) if available
2. **Fetches fresh data in the background** (revalidate)
3. **Updates UI automatically** when fresh data arrives

### How SWR Keys Work

Each `useSWR` hook uses a **key** to identify cached data:

```typescript
const { data } = useSWR("/api/users", fetcher);
//                 ↑
//                 └── This is the cache key
```

**Key characteristics:**
- Keys are strings that uniquely identify data
- Same key = same cached data across components
- Dynamic keys enable conditional fetching:

```typescript
const { data } = useSWR(
  userId ? `/api/users/${userId}` : null,
  fetcher
);
// If userId is null, SWR pauses fetching
```

### The SWR Flow

```
1. Component mounts
   ↓
2. Check cache for key
   ↓
3. Cache HIT → Return cached data immediately
   Cache MISS → Show loading state
   ↓
4. Fetch fresh data from API
   ↓
5. Update cache with fresh data
   ↓
6. Trigger re-render with new data
```

---

## Setup and Installation

### Install SWR

```bash
npm install swr
```

### Create a Fetcher Helper

Create `lib/fetcher.ts` for centralized fetching logic:

```typescript
export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.") as Error & {
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
```

**Benefits of centralized fetcher:**
- Consistent error handling across all fetches
- Easier to add logging, authentication headers
- Unified response parsing

---

## Basic Usage

### Simple Data Fetching

```typescript
// app/users/page.tsx
"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UsersResponse {
  data: User[];
  message: string;
}

export default function UsersPage() {
  const { data, error, isLoading, isValidating } = useSWR<UsersResponse>(
    "/api/users",
    fetcher
  );

  if (error) return <div>Failed to load users</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data.data.map((user) => (
        <li key={user.id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  );
}
```

### Return Values from useSWR

| Property | Type | Description |
|----------|------|-------------|
| `data` | `T \| undefined` | The fetched data (undefined if loading) |
| `error` | `Error \| undefined` | Any error that occurred |
| `isLoading` | `boolean` | True if no data and currently loading |
| `isValidating` | `boolean` | True if revalidating in background |
| `mutate` | `Function` | Function to update cache manually |
| `isPaused` | `boolean` | True if paused (null key) |

---

## Revalidation Strategies

SWR provides multiple strategies to keep data fresh:

### 1. Revalidate on Focus

When user returns to the tab:

```typescript
const { data } = useSWR("/api/users", fetcher, {
  revalidateOnFocus: true, // Default: true
});
```

### 2. Revalidate on Reconnect

When network connection is restored:

```typescript
const { data } = useSWR("/api/users", fetcher, {
  revalidateOnReconnect: true, // Default: true
});
```

### 3. Polling with refreshInterval

Fetch fresh data at regular intervals:

```typescript
const { data } = useSWR("/api/users", fetcher, {
  refreshInterval: 30000, // Every 30 seconds
});
```

### 4. Manual Revalidation

Force update on user action:

```typescript
import { useSWRConfig } from "swr";

function RefreshButton() {
  const { mutate } = useSWRConfig();

  const handleRefresh = () => {
    mutate("/api/users"); // Force revalidation
  };

  return <button onClick={handleRefresh}>Refresh</button>;
}
```

### Complete Configuration Example

```typescript
const { data, error, isLoading, isValidating } = useSWR<UsersResponse>(
  "/api/users",
  fetcher,
  {
    // Revalidation options
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 30000,

    // Error retry options
    errorRetryCount: 3,
    errorRetryInterval: 2000,

    // Cache options
    revalidateIfStale: true,
    dedupingInterval: 5000,
  }
);
```

---

## Mutation and Optimistic UI

### What is Optimistic UI?

Optimistic UI updates the interface **before** the server confirms the action, making the app feel instant. If the server request fails, we roll back.

### Basic Mutation

```typescript
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";

function AddUserForm() {
  const { data } = useSWR("/api/users", fetcher);

  const handleSubmit = async (userData: { name: string; email: string }) => {
    // 1. Optimistic update
    mutate(
      "/api/users",
      (currentData) => ({
        ...currentData,
        data: [...currentData.data, { ...userData, id: "temp-id" }],
      }),
      false // Don't revalidate yet
    );

    // 2. Make API call
    await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    // 3. Revalidate to sync
    mutate("/api/users");
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Optimistic UI with Rollback

```typescript
const handleAddUser = async () => {
  if (!name || !email) return;

  const tempUser = { id: `temp-${Date.now()}`, name, email };

  try {
    // Optimistic update
    mutate(
      "/api/users",
      (current) => ({
        ...current,
        data: [...current.data, tempUser],
      }),
      false
    );

    // API call
    const response = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify({ name, email }),
    });

    if (!response.ok) throw new Error("Failed");

    // Sync with server
    mutate("/api/users");

    // Clear form
    setName("");
    setEmail("");
  } catch (error) {
    // Rollback on error
    mutate("/api/users");
    setError("Failed to add user");
  }
};
```

### Optimistic UI Flow Diagram

```
User clicks "Add User"
        ↓
Show temp user in list immediately
        ↓
[OPTIMISTIC UPDATE]
        ↓
Make API call (background)
        ↓
    ┌───┴───┐
    │       │
 Success   Failed
    │       │
    ↓       ↓
Revalidate  Rollback
from server cache
    │       │
    ↓       ↓
Update UI   Remove temp user
with real   Show error
data        message
```

---

## Cache Hits vs Misses

### Understanding Cache Behavior

**Cache Hit:** Data exists in cache, returned immediately  
**Cache Miss:** No data in cache, must fetch from API

### Inspecting Cache

```typescript
import { useSWRConfig } from "swr";

function CacheInspector() {
  const { cache } = useSWRConfig();

  useEffect(() => {
    console.log("=== Cache State ===");
    console.log("All cache keys:", Array.from(cache.keys()));

    const key = "/api/users";
    if (cache.has(key)) {
      console.log("[CACHE HIT] Data found for:", key);
      console.log("Cached data:", cache.get(key));
    } else {
      console.log("[CACHE MISS] No data for:", key);
    }
  }, [cache]);

  return <div>Check console for cache info</div>;
}
```

### Cache Hit Demo Steps

1. **First visit:** Cache miss (no data yet)
   ```
   [CACHE MISS] Fetching from API...
   [CACHE HIT] Data stored in cache
   ```

2. **Quick revisit:** Cache hit (data still fresh)
   ```
   [CACHE HIT] Returning cached data immediately
   [CACHE MISS] No - revalidating in background
   ```

3. **After revalidate:** Fresh cache hit
   ```
   [CACHE HIT] Returning fresh cached data
   ```

### Cache Key Pattern

SWR uses the key to organize cache:

```
Cache Map:
{
  "/api/users" → { data, error, isValidating },
  "/api/users/1" → { data, error, isValidating },
  "/api/products" → { data, error, isValidating }
}
```

---

## Error Handling and Retry Logic

### SWR's Built-in Error Retry

```typescript
const { data, error } = useSWR("/api/users", fetcher, {
  // Max retry attempts
  errorRetryCount: 3,

  // Retry interval (ms) - exponential backoff
  errorRetryInterval: 2000,

  // Custom retry logic
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Don't retry if max attempts reached
    if (retryCount >= 3) return;

    // Don't retry on 404 or 401
    if (error.status === 404 || error.status === 401) return;

    // Retry after delay
    setTimeout(() => revalidate({ retryCount }), 2000);
  },
});
```

### Error States

```typescript
const { data, error, isLoading } = useSWR("/api/users", fetcher);

if (error) {
  return (
    <div className="error">
      <p>Error: {error.message}</p>
      <p>Status: {error.status}</p>
      <button onClick={() => mutate("/api/users")}>Retry</button>
    </div>
  );
}
```

### Error Boundary Pattern

```typescript
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function UsersPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <UsersList />
    </ErrorBoundary>
  );
}
```

---

## Trade-offs and UX Impact

### Advantages

| Benefit | Description |
|---------|-------------|
| **Instant Feedback** | Cached data shows immediately |
| **Reduced Spinners** | No loading states on repeat visits |
| **Background Updates** | Data refreshes without user action |
| **Optimistic Updates** | Actions feel instant |
| **Built-in Deduplication** | Same request from multiple components = one fetch |

### Disadvantages / Trade-offs

| Challenge | Mitigation |
|-----------|-----------|
| **Stale Data Display** | Short `refreshInterval` for frequently changing data |
| **Memory Usage** | Cache size limited by number of unique keys |
| **Complexity** | Debugging cache state can be difficult |
| **Over-fetching** | Use `dedupingInterval` to limit requests |

### UX Best Practices

1. **Set appropriate refresh intervals**
   ```typescript
   // Live data: 5-10 seconds
   refreshInterval: 5000

   // Semi-static data: 1-5 minutes
   refreshInterval: 60000

   // Static data: Disable polling
   refreshInterval: 0
   ```

2. **Show data freshness indicators**
   ```typescript
   {data && (
     <p>
       Last updated: {new Date(data.timestamp).toLocaleTimeString()}
       {isValidating && " (refreshing...)"}
     </p>
   )}
   ```

3. **Handle offline states**
   ```typescript
   const { data, isLoading } = useSWR("/api/users", fetcher, {
     revalidateOnReconnect: true,
   });
   ```

4. **Optimistic UI Guidelines**
   - Use for user-initiated actions
   - Show clear rollback on failure
   - Keep temp data visually distinct
   - Set reasonable timeouts

---

## Comparison with Fetch API

| Feature | SWR | Fetch API |
|---------|-----|-----------|
| **Caching** | Automatic | Manual |
| **Revalidation** | Built-in | Manual |
| **Optimistic UI** | Easy with mutate | Manual implementation |
| **Error Retries** | Configurable | Must code manually |
| **Loading States** | Automatic (isLoading) | Manual state |
| **Deduplication** | Built-in | Manual |
| **Type Safety** | Full TypeScript support | Manual |
| **Bundle Size** | ~6kb gzipped | 0 (native) |

### When to Use SWR

✅ **Use SWR when:**
- You need caching and revalidation
- Optimistic UI is important
- Data changes frequently
- Multiple components need same data

### When to Use Fetch API

✅ **Use Fetch API when:**
- One-time requests
- Server-side fetching
- No caching needed
- Minimal bundle size critical

---

## Files Reference

| File | Purpose |
|------|---------|
| `lib/fetcher.ts` | Centralized fetch helper with error handling |
| `app/users/page.tsx` | Users page with SWR data fetching |
| `app/users/AddUser.tsx` | Add user form with optimistic UI |

---

## Testing Cache Behavior

To observe cache hits/misses:

1. Open browser DevTools Console
2. Navigate to `/users`
3. Observe console logs:
   ```
   === SWR Cache Inspection ===
   Cache keys: ["/api/users"]
   [CACHE MISS] No data in cache
   ```
4. Navigate away and back
5. Observe:
   ```
   === SWR Cache Inspection ===
   Cache keys: ["/api/users"]
   [CACHE HIT] Data found in cache
   ```

---

## Conclusion

SWR provides a powerful, declarative approach to client-side data fetching. Key takeaways:

1. **Keys** are fundamental - they identify and cache data
2. **Revalidation** keeps data fresh with multiple strategies
3. **Optimistic updates** create instant, responsive UX
4. **Cache inspection** helps debug and understand behavior
5. **Trade-offs** exist - choose the right strategy for your use case

For more information, visit the [SWR Documentation](https://swr.vercel.app/).

