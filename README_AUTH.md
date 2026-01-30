---

## Secure User Authentication (bcrypt + JWT)

This section documents the secure authentication implementation using **bcrypt** for password hashing and **JWT (JSON Web Tokens)** for session management.

### Overview

TrustTrip implements a secure authentication system with the following features:
- **Password Hashing**: Using bcrypt with salt rounds of 10
- **Token-Based Sessions**: Using JWT with configurable expiry
- **Protected Routes**: Middleware to verify tokens on private endpoints
- **Secure Password Storage**: Never store plain text passwords

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐      │
│  │  Signup  │───►│  Hash    │───►│  Store in DB     │      │
│  │  Form    │    │  (bcrypt)│    │  (hashed password)│     │
│  └──────────┘    └──────────┘    └──────────────────┘      │
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐      │
│  │  Login   │───►│ Compare  │───►│  Generate JWT    │      │
│  │  Form    │    │ (bcrypt) │    │  (userId, email) │      │
│  └──────────┘    └──────────┘    └──────────────────┘      │
│                                              │               │
│                      ┌───────────────────────▼──────────┐   │
│                      │  Include in Authorization Header │   │
│                      │  Bearer <JWT_TOKEN>              │   │
│                      └───────────────────────▲──────────┘   │
│                                              │               │
│                      ┌───────────────────────┴──────────┐   │
│                      │  Protected Routes Verify Token   │   │
│                      └──────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Dependencies

The following packages are used for authentication:

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.7"
  }
}
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/trusttrip_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars"
JWT_EXPIRY="1h"
REFRESH_TOKEN_EXPIRY="7d"

# Node Environment
NODE_ENV="development"
```

**⚠️ Important**: Generate a strong JWT secret:
```bash
openssl rand -base64 32
```

---

### Signup API

**Endpoint**: `POST /api/auth/signup`

Creates a new user with a securely hashed password.

#### Request

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice",
    "email": "alice@example.com",
    "password": "mypassword123",
    "bio": "Travel enthusiast",
    "phone": "+1234567890"
  }'
```

#### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | User's display name |
| email | string | Yes | User's email (must be unique) |
| password | string | Yes | Min 8 characters |
| bio | string | No | User biography |
| phone | string | No | Phone number |
| profileImage | string | No | URL to profile image |

#### Response - Success (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "user_abc123",
    "email": "alice@example.com",
    "name": "Alice",
    "verified": false,
    "createdAt": "2024-01-30T10:00:00.000Z"
  },
  "message": "User registered successfully"
}
```

#### Response - Validation Error (400 Bad Request)

```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["email is required", "password is required"]
}
```

#### Response - Email Already Exists (409 Conflict)

```json
{
  "success": false,
  "error": "Email already in use"
}
```

#### Password Strength Validation

The signup endpoint enforces password strength:
- Minimum 8 characters
- Returns error if password is too short

#### Code Implementation

```typescript
// app/api/auth/signup/route.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already in use" },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: user.id, email: user.email, name: user.name },
      message: "User registered successfully",
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
```

---

### Login API

**Endpoint**: `POST /api/auth/login`

Authenticates user credentials and returns a JWT token.

#### Request

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "mypassword123"
  }'
```

#### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | User's registered email |
| password | string | Yes | User's password |

#### Response - Success (200 OK)

```json
{
  "success": true,
  data: {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_abc123",
      "email": "alice@example.com",
      "name": "Alice",
      "verified": false
    }
  },
  "message": "Login successful"
}
```

#### Response - Invalid Credentials (401 Unauthorized)

```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

#### Response - Missing Fields (400 Bad Request)

```json
{
  "success": false,
  "error": "Email and password are required"
}
```

#### Code Implementation

```typescript
// app/api/auth/login/route.ts
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password with bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      data: { token, user: { id: user.id, email: user.email, name: user.name } },
      message: "Login successful",
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to authenticate user" },
      { status: 500 }
    );
  }
}
```

---

### Protected Routes

**Endpoint**: `GET /api/users`

Returns user data only if a valid JWT token is provided.

#### Request

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Request Headers

| Header | Value | Description |
|--------|-------|-------------|
| Authorization | Bearer `<token>` | JWT token from login response |

#### Response - Success (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "user_abc123",
      "email": "alice@example.com",
      "name": "Alice",
      "profileImage": null,
      "bio": "Travel enthusiast",
      "phone": "+1234567890",
      "verified": false,
      "createdAt": "2024-01-30T10:00:00.000Z",
      "updatedAt": "2024-01-30T10:00:00.000Z",
      "_count": {
        "projects": 2,
        "reviews": 5,
        "bookings": 3
      }
    }
  ],
  "authenticatedUser": {
    "userId": "user_abc123",
    "email": "alice@example.com"
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### Response - Missing Token (401 Unauthorized)

```json
{
  "success": false,
  "error": "Authorization token is required"
}
```

#### Response - Invalid Token (401 Unauthorized)

```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

#### Code Implementation

```typescript
// app/api/users/route.ts
import { prisma } from "@/lib/prisma";
import { extractTokenFromHeader, verifyToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authorization token is required" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Token is valid, proceed with protected operation
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        // ... other fields (exclude password)
      },
    });

    return NextResponse.json({
      success: true,
      data: users,
      authenticatedUser: { userId: decoded.userId, email: decoded.email },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
```

---

### JWT Library

**File**: `lib/auth.ts`

Helper functions for JWT token management.

#### Functions

| Function | Description |
|----------|-------------|
| `generateToken(payload, expiresIn)` | Create a JWT token |
| `verifyToken(token)` | Verify and decode a token |
| `extractTokenFromHeader(header)` | Extract token from Bearer header |
| `decodeToken(token)` | Decode without verification |

#### Code Implementation

```typescript
// lib/auth.ts
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
export const JWT_EXPIRY = "1h";
export const REFRESH_TOKEN_EXPIRY = "7d";

export function generateToken(
  payload: Record<string, unknown>,
  expiresIn: string = JWT_EXPIRY
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as Record<string, unknown>;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}
```

---

### bcrypt Usage

#### Password Hashing

```typescript
import bcrypt from "bcryptjs";

// Hash a password with 10 salt rounds
const hashedPassword = await bcrypt.hash(password, 10);
// Result: "$2a$10$X7VH7HFsY7VH7HFsY7VH7HFsY7VH7HFsY7VH7HFsY7VH7HFsY7VH7HFs"
```

#### Password Comparison

```typescript
// Compare plain password with hashed password
const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
// Returns: true if passwords match, false otherwise
```

#### Why bcrypt?

1. **Salted Hashes**: Each password gets a unique salt, preventing rainbow table attacks
2. **Work Factor**: Configurable iterations (default 10) to slow down brute-force attacks
3. **Adaptive Cost**: Can increase work factor as hardware improves
4. **Secure by Design**: Specifically designed for password hashing

#### Security Best Practices

- **Always hash passwords** - Never store plain text
- **Use adequate salt rounds** - 10-12 is recommended
- **Validate password strength** - Minimum length, consider complexity
- **Use constant-time comparison** - bcrypt.compare does this automatically

---

### JWT Token Structure

A JWT consists of three parts separated by dots:

```
header.payload.signature
```

#### Example Token Decoded

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (contains user data):**
```json
{
  "userId": "user_abc123",
  "email": "alice@example.com",
  "name": "Alice",
  "iat": 1706611200,
  "exp": 1706614800
}
```

**Signature:**
```
HMAC-SHA256(header.payload, JWT_SECRET)
```

#### Token Claims

| Claim | Description |
|-------|-------------|
| `iat` | Issued at timestamp |
| `exp` | Expiration timestamp |
| `userId` | User's unique identifier |
| `email` | User's email address |

---

### Security Considerations

#### Token Expiry and Refresh

**Current Implementation:**
- Access Token: Expires in 1 hour
- Refresh Token: Expires in 7 days (can be implemented)

**Why Token Expiry?**
1. **Limits exposure time** if token is compromised
2. **Forces re-authentication** periodically
3. **Enables forced logout** by clearing stored tokens

**Refresh Token Flow (Recommended Enhancement):**

```
┌─────────────────────────────────────────────────────────────┐
│                   Token Refresh Flow                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User logs in                                             │
│     ◄── Returns: access_token (1h), refresh_token (7d)      │
│                                                              │
│  2. Access token expires                                     │
│     ──► Client sends refresh_token to /api/auth/refresh     │
│                                                              │
│  3. Server validates refresh_token                           │
│     ◄── Returns: new access_token                           │
│                                                              │
│  4. If refresh token also expired                           │
│     ──► Client must re-authenticate with email/password     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Token Storage Options

| Storage | Pros | Cons |
|---------|------|------|
| **HTTPOnly Cookie** | ✅ Protected from XSS | ❌ Vulnerable to CSRF |
| **localStorage** | ✅ Easy to access | ❌ Vulnerable to XSS |
| **sessionStorage** | ✅ Tab-specific | ❌ Lost on tab close |

**Recommendation:**
- **For web apps**: Use HTTPOnly cookies with CSRF protection
- **For APIs**: Accept tokens in Authorization header (Bearer scheme)
- **Never store JWT in localStorage** if possible (XSS risk)

#### Creative Reflection: Handling Token Leaks and Expiration

**Scenario**: "Imagine a token leaks or expires unexpectedly"

**How the authentication system handles this:**

1. **Token Leak Detection**
   - Implement token blacklisting (store revoked tokens in Redis)
   - Monitor for suspicious activity (multiple IPs, unusual patterns)
   - Use short-lived access tokens (15-60 minutes)

2. **Unexpected Expiration**
   - Client detects 401 status code
   - Attempts token refresh (if refresh token available)
   - Redirects to login if refresh also fails

3. **User Safety Measures**
   ```typescript
   // Automatic handling on 401
   async function handleUnauthorized() {
     // 1. Try to refresh the token
     const newToken = await refreshAccessToken();
     
     if (newToken) {
       // Retry original request with new token
       return retryRequest(newToken);
     }
     
     // 2. Clear all tokens and redirect to login
     clearTokens();
     window.location.href = '/login?reason=session_expired';
   }
   ```

4. **Security Hardening**
   - **IP binding**: Include IP in token claims, reject if changed
   - **Device fingerprinting**: Validate device characteristics
   - **Rate limiting**: Prevent brute-force token guessing
   - **Audit logging**: Log all authentication events

5. **User Communication**
   ```json
   {
     "error": "session_expired",
     "message": "Your session has expired. Please log in again.",
     "redirect": "/login"
   }
   ```

**Best Practices Summary:**
1. Use short-lived access tokens (15-60 min)
2. Implement refresh token rotation
3. Store tokens securely (HTTPOnly cookies preferred)
4. Implement token blacklisting for immediate revocation
5. Always validate tokens on every protected request
6. Log authentication events for security monitoring
7. Provide clear user feedback on session issues

---

### Testing Authentication

#### Test Signup

```bash
# Successful signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"testpass123"}'

# Missing fields
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User"}'
```

#### Test Login

```bash
# Successful login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Invalid credentials
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpassword"}'
```

#### Test Protected Route

```bash
# Without token (should fail)
curl -X GET http://localhost:3000/api/users

# With invalid token (should fail)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer invalid_token_here"

# With valid token (should succeed)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_VALID_TOKEN"
```

#### Decode JWT Token

```bash
# Using jwt.io or online decoder
# Paste your token at https://jwt.io

# Or using command line (for debugging)
echo "YOUR_TOKEN" | cut -d. -f2 | base64 -d | jq .
```

---

### Troubleshooting

#### Common Issues

**1. "Invalid or expired token"**
- Token has expired (check `exp` claim)
- Token was tampered with
- JWT_SECRET mismatch

**2. "Authorization token is required"**
- Missing `Authorization` header
- Header doesn't start with "Bearer "

**3. Password hash mismatch**
- Password was not hashed before storage
- Different bcrypt salt rounds used

**4. "Email already in use"**
- User already exists with that email
- Case-sensitive email comparison

#### Debugging Tips

1. **Check token expiration:**
   ```javascript
   const decoded = jwt.decode(token);
   console.log("Expires:", new Date(decoded.exp * 1000));
   ```

2. **Verify JWT_SECRET:**
   ```javascript
   // Ensure same secret is used for sign/verify
   console.log("Secret length:", JWT_SECRET.length);
   ```

3. **Test bcrypt hashing:**
   ```javascript
   const hash = await bcrypt.hash("testpassword", 10);
   const match = await bcrypt.compare("testpassword", hash);
   console.log("Match:", match); // Should be true
   ```

---

### Reflection: How Authentication Strengthens App Security

Implementing secure authentication provides multiple layers of protection:

1. **Data Protection**
   - Passwords are never stored in plain text
   - User data is only accessible to authenticated users
   - Sensitive information is protected by token verification

2. **Access Control**
   - Granular access to API endpoints
   - Prevents unauthorized data access
   - Enables role-based access control (RBAC)

3. **Audit Trail**
   - Track who accessed what and when
   - Detect suspicious login patterns
   - Support compliance requirements

4. **User Trust**
   - Users feel secure sharing personal information
   - Protects against account takeover attacks
   - Demonstrates security best practices

5. **Business Continuity**
   - Prevent service abuse
   - Protect premium features
   - Maintain service quality

**Key Takeaway**: Authentication is the first line of defense. By combining bcrypt hashing with JWT tokens, we create a robust security foundation that protects both user data and application resources.

---

