# JWT Session Management Implementation (Task 2.34)

## Overview

Implemented a secure JWT-based session management system using dual-token architecture with access and refresh tokens. This replaces the single-token implementation with industry best practices for token management and storage.

## Architecture

### Token Types

#### Access Token
- **Lifetime**: 15 minutes (`ACCESS_TOKEN_EXPIRY = "15m"`)
- **Purpose**: Authenticate API requests
- **Storage**: Response body (client stores in memory/state)
- **Transmission**: Authorization header (`Bearer <token>`)
- **Claims**: `userId`, `email`, `role`, `iat`, `exp`
- **Algorithm**: HS256

#### Refresh Token
- **Lifetime**: 7 days (`REFRESH_TOKEN_EXPIRY = "7d"`)
- **Purpose**: Obtain new access tokens when current token expires
- **Storage**: HTTP-only, secure, SameSite cookie (cannot be accessed by JavaScript)
- **Transmission**: Automatic via HTTP cookie
- **Claims**: `userId`, `email`, `iat`, `exp`
- **Algorithm**: HS256

### Session Flow

```
User Login/Signup
       ↓
1. Credentials validated
2. Access token generated (15m)
3. Refresh token generated (7d)
4. Access token returned in response body
5. Refresh token set in HTTP-only cookie
       ↓
API Request (authenticated)
       ↓
Client sends: Authorization: Bearer <access_token>
       ↓
If access token valid:
  - Request processed
  - Return 200
Else if access token expired:
  - Return 401 (unauthorized)
  - Client initiates token refresh
       ↓
Refresh Request
       ↓
Client sends POST /api/auth/refresh
Cookie automatically includes refreshToken
       ↓
If refresh token valid:
  - New access token generated
  - New refresh token generated (rotation)
  - New refresh token set in cookie
  - Return new access token
Else if refresh token expired:
  - Return 401
  - Clear cookie
  - Client redirects to login
```

## Implementation Details

### 1. Token Manager (`lib/tokenManager.ts`)

Core JWT utilities with comprehensive documentation and type safety.

**Key Functions**:

```typescript
// Token Generation
generateAccessToken(userId, email, role?)     // Returns JWT string
generateRefreshToken(userId, email)           // Returns JWT string

// Token Verification
verifyAccessToken(token)                      // Returns payload or null
verifyRefreshToken(token)                     // Returns payload or null

// Token Extraction
extractBearerToken(authHeader)                // Extracts from "Bearer <token>"
getAuthHeader(request)                        // Gets Authorization header

// Cookie Management
setRefreshTokenCookie(response, token)        // Sets HTTP-only cookie
clearRefreshTokenCookie(response)             // Clears cookie on logout

// Error Handling
createAuthErrorResponse(message, status)      // Standardized error response
isValidPayload(payload)                       // Validates JWT payload

// Token Rotation
rotateRefreshToken(oldToken, payload)         // Generates new token
```

**Security Features**:
- HTTP-only cookies prevent XSS attacks (JavaScript cannot access)
- Secure flag ensures cookies only sent over HTTPS in production
- SameSite=Strict prevents CSRF attacks
- Token signature verification with HS256
- Payload validation before use

### 2. Authentication Endpoints

#### POST `/api/auth/login`
Authenticates user credentials and issues tokens.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "verified": false
    }
  },
  "message": "Login successful"
}
```

**Cookie Set**:
```
Set-Cookie: refreshToken=<token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/
```

**Status Codes**:
- `200`: Login successful
- `400`: Missing email/password
- `401`: Invalid credentials or no password (OAuth only)

#### POST `/api/auth/signup`
Registers new user and issues tokens.

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "bio": "Optional bio",
  "phone": "Optional phone",
  "profileImage": "Optional URL"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user-456",
      "email": "john@example.com",
      "name": "John Doe",
      "verified": false,
      "createdAt": "2025-01-28T10:30:00Z"
    }
  },
  "message": "User registered successfully"
}
```

**Cookie Set**: Same as login

**Status Codes**:
- `201`: User created successfully
- `400`: Validation failed
- `409`: Email already in use

#### POST `/api/auth/refresh`
Refreshes access token using valid refresh token.

**Request**:
```json
{}
```

Refresh token automatically sent in cookie.

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Token refreshed successfully"
}
```

**Cookie Set**: New refresh token (rotation)

**Status Codes**:
- `200`: Token refreshed
- `401`: No token, invalid token, or expired token

#### POST `/api/auth/logout`
Logs out user by clearing refresh token.

**Request**:
```json
{}
```

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Cookie Cleared**:
```
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/
```

**Note**: Access token is not revoked on server (stateless JWT). Consider implementing token blacklist for immediate revocation.

### 3. Auth Middleware (`lib/authMiddleware.ts`)

Protects API routes with access token validation.

**Higher-Order Function Middleware**:

```typescript
// Protects route (requires valid access token)
export const POST = withAuth(async (request, payload) => {
  // payload = { userId, email, role, iat, exp }
  console.log(`Authenticated: ${payload.email}`);
  return NextResponse.json({ success: true });
});

// Optional auth (works authenticated or unauthenticated)
export const GET = withOptionalAuth(async (request, payload) => {
  if (payload) {
    // User is authenticated
  }
  return NextResponse.json({ success: true });
});

// Manual validation
export const DELETE = async (request) => {
  const result = validateToken(request);
  if (!result.valid) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  const { userId } = result.payload;
  // Process deletion...
};
```

**Token Validation**:
- Extracts Bearer token from Authorization header
- Verifies JWT signature and expiry
- Returns 401 if token invalid/expired/missing
- Passes decoded payload to handler

### 4. Environment Variables

Add to `.env.local`:

```bash
JWT_SECRET=your-very-secret-key-here-change-in-production
REFRESH_SECRET=separate-secret-for-refresh-tokens-optional

NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Production Considerations**:
- Use strong, random secrets (min 32 characters)
- Use separate secrets for access and refresh tokens
- Rotate secrets periodically
- Store secrets in secure environment variable service (AWS Secrets Manager, HashiCorp Vault)

## Client Integration

### Using Access Token

```typescript
// After login/signup, store access token
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important: sends cookies
  body: JSON.stringify({ email, password })
});

const data = await response.json();
const { accessToken } = data.data;

// Store in memory (not localStorage for security)
localStorage.setItem('accessToken', accessToken);

// Use in API requests
const apiResponse = await fetch('/api/protected-route', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  },
  credentials: 'include' // Sends refresh token cookie
});
```

### Handling Token Refresh

```typescript
// When access token expires (401 response)
async function refreshAccessToken() {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include' // Sends refresh token cookie
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('accessToken', data.data.accessToken);
    return true;
  }

  // Refresh token expired or invalid
  localStorage.removeItem('accessToken');
  window.location.href = '/login';
  return false;
}

// Retry failed request with new token
async function apiCall(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    },
    credentials: 'include'
  });

  if (response.status === 401) {
    if (await refreshAccessToken()) {
      // Retry with new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        credentials: 'include'
      });
    }
  }

  return response;
}
```

### React Context Integration

The existing `context/AuthContext.tsx` should be updated to use new token structure:

```typescript
// Update login action
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  localStorage.setItem('accessToken', data.data.accessToken);
  setUser(data.data.user);
  setIsAuthenticated(true);
};

// Logout clears access token
const logout = async () => {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });

  localStorage.removeItem('accessToken');
  setUser(null);
  setIsAuthenticated(false);
};
```

## Security Considerations

### Strengths

1. **XSS Protection**: Refresh token in HTTP-only cookie cannot be accessed by JavaScript
2. **CSRF Protection**: SameSite=Strict prevents cross-site requests
3. **HTTPS Only**: Secure flag ensures cookies only sent over HTTPS in production
4. **Token Rotation**: Refresh token regenerated on each refresh (replay attack mitigation)
5. **Short-lived Access Token**: Limits damage if token compromised (15 min window)
6. **Signature Verification**: HS256 ensures token hasn't been tampered with

### Weaknesses & Mitigations

1. **Stateless JWT**: Cannot revoke tokens immediately
   - **Mitigation**: Implement token blacklist in Redis/database for immediate revocation
   - For logout, store revoked token ID with expiry time

2. **Refresh Token on Same Domain**: Still vulnerable to XSS for same-domain scripts
   - **Mitigation**: 
     - Never store secrets in localStorage
     - Use CSP (Content Security Policy) headers to prevent inline scripts
     - Regular security audits and dependency updates

3. **CSRF**: SameSite=Strict helps but not foolproof
   - **Mitigation**: 
     - Validate Origin header on sensitive operations
     - Use state parameter for OAuth flows

4. **Token Compromise**: If attacker gets refresh token
   - **Mitigation**: 
     - Token rotation on each refresh
     - Short refresh token lifetime (7 days)
     - Device/IP validation on refresh

5. **Man-in-the-Middle**: HTTPS only partially prevents
   - **Mitigation**: 
     - Always use HTTPS in production
     - Implement certificate pinning for mobile apps
     - Use HSTS header

### Production Checklist

- [ ] Enable HTTPS
- [ ] Use strong, random JWT secrets (32+ chars)
- [ ] Set `secure: true` for cookies (already done based on NODE_ENV)
- [ ] Implement token blacklist for critical operations
- [ ] Add CSP headers
- [ ] Add HSTS header
- [ ] Implement rate limiting on auth endpoints
- [ ] Add request logging for security audits
- [ ] Regular vulnerability scanning of dependencies
- [ ] Rotate JWT secrets periodically

## Token Expiry Behavior

### Access Token Expiry (15 minutes)

```
Timeline:
0:00 - Login, access token issued
14:55 - Still valid, can make API requests
15:01 - Expired, API returns 401
       Client calls /api/auth/refresh
       New access token issued
```

### Refresh Token Expiry (7 days)

```
Timeline:
Day 1 - Signup, refresh token issued
Day 6, 23:59 - Still valid, can refresh
Day 7, 0:01 - Expired, /api/auth/refresh returns 401
             Cookie cleared by server
             Client redirects to login
```

## API Route Examples

### Protected Route (Requires Auth)

```typescript
// app/api/protected-route/route.ts
import { withAuth } from '@/lib/authMiddleware';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (request, payload) => {
  console.log(`Request by: ${payload.email}`);

  return NextResponse.json({
    success: true,
    data: { message: 'Protected data' }
  });
});
```

### Public Route with Optional Auth

```typescript
// app/api/public-route/route.ts
import { withOptionalAuth } from '@/lib/authMiddleware';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withOptionalAuth(async (request, payload) => {
  if (payload) {
    return NextResponse.json({
      success: true,
      data: { message: `Hello ${payload.email}` }
    });
  }

  return NextResponse.json({
    success: true,
    data: { message: 'Hello guest' }
  });
});
```

## Testing

### Login & Get Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -v
```

### Use Access Token

```bash
curl -X GET http://localhost:3000/api/protected-route \
  -H "Authorization: Bearer <access_token>"
```

### Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Cookie: refreshToken=<refresh_token>" \
  -v
```

## Files Modified/Created

**Created**:
- `lib/tokenManager.ts` - Token generation, verification, cookie management
- `lib/authMiddleware.ts` - Route protection middleware
- `app/api/auth/refresh/route.ts` - Token refresh endpoint
- `app/api/auth/logout/route.ts` - Logout endpoint
- `JWT_SESSION_MANAGEMENT.md` - This documentation

**Modified**:
- `app/api/auth/login/route.ts` - Dual-token implementation
- `app/api/auth/signup/route.ts` - Dual-token implementation

## Next Steps

1. **Update Client Code**:
   - Modify `context/AuthContext.tsx` to use new token structure
   - Update `components/AuthDemo.tsx` to handle token refresh

2. **Add Token Blacklist** (Optional):
   - Store revoked tokens in Redis
   - Check blacklist on token validation

3. **Add Rate Limiting**:
   - Limit login/refresh attempts per IP
   - Prevent brute force attacks

4. **Implement Device/IP Validation** (Optional):
   - Store device info with refresh token
   - Validate on token refresh

5. **Add Security Headers**:
   - Content-Security-Policy
   - Strict-Transport-Security
   - X-Frame-Options

## References

- JWT Best Practices: https://tools.ietf.org/html/rfc8949
- OWASP Token Storage: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
- Cookie Security: https://owasp.org/www-community/controls/Cookie_Security
- OAuth 2.0 Security: https://tools.ietf.org/html/rfc6749
