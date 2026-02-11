# Security Headers Implementation (Task 2.37)

## Overview

TrustTrip implements **production-grade security headers** to protect against common web vulnerabilities including XSS, clickjacking, MIME sniffing, and insecure connections. This implementation follows OWASP security best practices and modern web security standards.

**Key Security Measures:**
- **HSTS**: Forces HTTPS connections for 2 years
- **CSP**: Prevents XSS and code injection attacks
- **CORS**: Restricts cross-origin requests to whitelisted domains
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information leakage
- **Permissions-Policy**: Restricts browser feature access

---

## Security Headers Configuration

### 1. HSTS (HTTP Strict Transport Security)

**Purpose**: Forces browsers to use HTTPS exclusively, preventing protocol downgrade attacks and cookie hijacking.

**Configuration**:
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**Parameters**:
- `max-age=63072000`: 2 years (730 days) in seconds
- `includeSubDomains`: Applies to all subdomains (e.g., api.trusttrip.com)
- `preload`: Eligible for browser preload lists

**Security Benefits**:
- ✅ Prevents man-in-the-middle attacks
- ✅ Blocks protocol downgrade attacks (HTTPS → HTTP)
- ✅ Protects against SSL stripping
- ✅ Ensures secure cookie transmission

**Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

**Important Notes**:
- Only send over HTTPS (browsers ignore on HTTP)
- Long max-age is recommended (minimum 1 year for preload)
- Cannot be removed quickly (user must wait for expiry)
- Test thoroughly before adding to preload list

---

### 2. CSP (Content Security Policy)

**Purpose**: Prevents XSS attacks, code injection, and unauthorized resource loading by defining trusted content sources.

**Configuration**:
```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-eval' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https:; 
  font-src 'self' data:; 
  connect-src 'self'; 
  frame-ancestors 'none'; 
  base-uri 'self'; 
  form-action 'self'
```

**Directive Breakdown**:

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | `'self'` | Default policy: only load from same origin |
| `script-src` | `'self' 'unsafe-eval' 'unsafe-inline'` | Allow scripts from same origin, eval(), and inline scripts (required for Next.js) |
| `style-src` | `'self' 'unsafe-inline'` | Allow styles from same origin and inline styles (required for React) |
| `img-src` | `'self' data: https:` | Allow images from same origin, data URIs, and any HTTPS URL |
| `font-src` | `'self' data:` | Allow fonts from same origin and data URIs |
| `connect-src` | `'self'` | Restrict AJAX/fetch/WebSocket to same origin |
| `frame-ancestors` | `'none'` | Prevent embedding in iframes (clickjacking protection) |
| `base-uri` | `'self'` | Restrict `<base>` tag to same origin |
| `form-action` | `'self'` | Only allow form submissions to same origin |

**Security Benefits**:
- ✅ Blocks XSS attacks from injected scripts
- ✅ Prevents unauthorized resource loading
- ✅ Stops data exfiltration to external domains
- ✅ Protects against clickjacking
- ✅ Prevents code injection via `<base>` tag hijacking

**Trade-offs**:
- ⚠️ `'unsafe-eval'`: Required for Next.js hot reload in development
- ⚠️ `'unsafe-inline'`: Required for React inline styles (CSS-in-JS)
- ⚠️ Consider removing unsafe directives in production with nonce/hash approach

**Stricter Production CSP** (Future Enhancement):
```
script-src 'self' 'nonce-{random}';  // Use nonces instead of 'unsafe-inline'
style-src 'self' 'nonce-{random}';   // Use nonces for inline styles
```

**Browser Support**: All modern browsers

---

### 3. CORS (Cross-Origin Resource Sharing)

**Purpose**: Controls which external domains can access API resources, preventing unauthorized cross-origin requests.

**Configuration** (via `lib/cors.ts`):
```typescript
// Default Configuration
{
  origin: whitelisted domains only,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,  // Allow cookies
  maxAge: 3600        // Cache preflight for 1 hour
}
```

**Origin Whitelist**:
- Production: `ALLOWED_ORIGINS` environment variable
- Development: `localhost:3000`, `localhost:3001`
- **No wildcards (`*`) in production**

**CORS Headers**:
```
Access-Control-Allow-Origin: https://trusttrip.com
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

**Security Benefits**:
- ✅ Prevents unauthorized API access from external sites
- ✅ Protects user data from CSRF attacks
- ✅ Allows legitimate cross-origin requests (e.g., mobile app)
- ✅ Supports cookie-based authentication securely

**Implementation**:
```typescript
// Example: Apply CORS to API route
import { addCorsHeaders } from "@/lib/cors";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const response = NextResponse.json({ data: "success" });
  return addCorsHeaders(response, origin);
}

// Preflight handling
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return handleCorsPreflightRequest(origin);
}
```

**Browser Support**: All modern browsers

---

### 4. X-Frame-Options

**Purpose**: Prevents clickjacking attacks by controlling whether the page can be embedded in `<iframe>`, `<frame>`, or `<object>`.

**Configuration**:
```
X-Frame-Options: DENY
```

**Options**:
- `DENY`: Cannot be embedded anywhere (most secure)
- `SAMEORIGIN`: Can only be embedded by same origin
- `ALLOW-FROM uri`: Can be embedded by specific URI (deprecated)

**Security Benefits**:
- ✅ Prevents clickjacking attacks
- ✅ Stops UI redressing attacks
- ✅ Protects against malicious iframe embedding

**Note**: CSP `frame-ancestors 'none'` provides the same protection with better browser support.

---

### 5. X-Content-Type-Options

**Purpose**: Prevents browsers from MIME-sniffing a response away from the declared content type.

**Configuration**:
```
X-Content-Type-Options: nosniff
```

**Security Benefits**:
- ✅ Prevents MIME confusion attacks
- ✅ Stops browsers from executing files as scripts if Content-Type is wrong
- ✅ Protects against polyglot file attacks

**Example Attack Prevented**:
```
// Without nosniff:
// Browser sees: Content-Type: text/plain
// Browser executes: <script>alert('XSS')</script>

// With nosniff:
// Browser respects Content-Type and doesn't execute
```

---

### 6. Referrer-Policy

**Purpose**: Controls how much referrer information is sent with requests.

**Configuration**:
```
Referrer-Policy: strict-origin-when-cross-origin
```

**Behavior**:
- Same-origin: Full URL sent as referrer
- Cross-origin HTTPS→HTTPS: Only origin sent (e.g., https://trusttrip.com)
- Cross-origin HTTPS→HTTP: No referrer sent (security)

**Security Benefits**:
- ✅ Prevents sensitive URL parameters from leaking
- ✅ Protects user privacy
- ✅ Reduces information disclosure to third parties

**Other Options**:
- `no-referrer`: Never send referrer (most private)
- `origin`: Always send only origin
- `no-referrer-when-downgrade`: Default browser behavior

---

### 7. Permissions-Policy

**Purpose**: Controls which browser features and APIs can be used by the page.

**Configuration**:
```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Features Disabled**:
- `camera=()`: No camera access
- `microphone=()`: No microphone access
- `geolocation=()`: No location tracking

**Security Benefits**:
- ✅ Reduces attack surface
- ✅ Prevents unauthorized feature access
- ✅ Improves user privacy
- ✅ Blocks third-party tracking

**Syntax**:
- `feature=()`: Disable for all origins
- `feature=(self)`: Allow for same origin only
- `feature=(self "https://example.com")`: Allow for self and specific origin

---

## Implementation Details

### 1. Global Headers via `next.config.ts`

All security headers (except CORS) are configured globally in `next.config.ts`:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",  // Apply to all routes
        headers: [
          { key: "Strict-Transport-Security", value: "..." },
          { key: "Content-Security-Policy", value: "..." },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
```

**Advantages**:
- Applied automatically to all pages and API routes
- No need to repeat configuration
- Consistent security posture across entire app

### 2. CORS Headers via `lib/cors.ts`

CORS headers are applied per-route for flexibility:

```typescript
// lib/cors.ts
export function addCorsHeaders(
  response: NextResponse,
  requestOrigin: string | null,
  options: CorsOptions = {}
): NextResponse {
  // Validate origin against whitelist
  // Add appropriate CORS headers
  return response;
}
```

**Usage Example**:
```typescript
// app/api/auth/refresh/route.ts
import { addCorsHeaders } from "@/lib/cors";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const response = NextResponse.json({ success: true });
  return addCorsHeaders(response, origin);
}
```

**Files Modified**:
- ✅ `app/api/auth/refresh/route.ts`: Added CORS support
- ✅ `app/api/auth/logout/route.ts`: Added CORS support

---

## Environment Configuration

Add to `.env.local` or production environment:

```bash
# Allowed CORS Origins (comma-separated)
ALLOWED_ORIGINS=https://trusttrip.com,https://app.trusttrip.com,https://api.trusttrip.com

# App URL (for CORS fallback)
NEXT_PUBLIC_APP_URL=https://trusttrip.com

# Node Environment
NODE_ENV=production
```

**Development Defaults**:
- CORS allows `localhost:3000`, `localhost:3001`
- HSTS is sent but browsers may not enforce over HTTP

**Production Requirements**:
- Set `ALLOWED_ORIGINS` to trusted domains only
- Ensure app runs on HTTPS (HSTS enforced)
- Test headers with browser DevTools

---

## Verification & Testing

### 1. Browser DevTools Verification

**Steps**:
1. Open browser DevTools (F12)
2. Navigate to Network tab
3. Make a request to your app
4. Click on the request
5. View Response Headers

**Expected Headers**:
```
strict-transport-security: max-age=63072000; includeSubDomains; preload
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ...
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=()
access-control-allow-origin: https://trusttrip.com  (on CORS routes)
```

### 2. cURL Testing

**Test All Headers**:
```bash
curl -I https://trusttrip.com/
```

**Test CORS Headers**:
```bash
curl -X OPTIONS https://trusttrip.com/api/auth/refresh \
  -H "Origin: https://trusttrip.com" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Expected CORS Response**:
```
access-control-allow-origin: https://trusttrip.com
access-control-allow-methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
access-control-allow-credentials: true
access-control-max-age: 3600
```

### 3. Security Scanner Tools

**Recommended Tools**:
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [Security Headers](https://securityheaders.com/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [OWASP ZAP](https://www.zaproxy.org/)

**Expected Scores**:
- Mozilla Observatory: A+ (90+)
- Security Headers: A+ (all headers present)
- SSL Labs: A+ (with proper HTTPS config)

---

## Security vs Flexibility Trade-offs

### 1. CSP `'unsafe-inline'` and `'unsafe-eval'`

**Issue**:
- Required for Next.js hot reload and React CSS-in-JS
- Reduces XSS protection effectiveness

**Trade-off**:
- Development: Keep for developer experience
- Production: Consider using nonces or hashes

**Future Enhancement**:
```typescript
// Generate nonce per request
const nonce = crypto.randomBytes(16).toString('base64');
response.headers.set('Content-Security-Policy', 
  `script-src 'self' 'nonce-${nonce}'`
);

// Add nonce to script tags
<script nonce={nonce}>...</script>
```

### 2. CORS Origin Whitelist

**Issue**:
- Strict whitelist may break legitimate integrations
- Wildcard (`*`) is insecure for production

**Trade-off**:
- Development: Allow all localhost ports
- Production: Explicit whitelist only

**Configuration**:
```bash
# Development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Production
ALLOWED_ORIGINS=https://trusttrip.com,https://app.trusttrip.com
```

### 3. HSTS Preload

**Issue**:
- Cannot quickly remove domain from preload list
- Affects all subdomains

**Trade-off**:
- Start with shorter max-age (1 month) for testing
- Gradually increase to 2 years
- Only add to preload list when confident

**Migration Path**:
```
Week 1: max-age=2592000 (1 month)
Week 2-4: Monitor for issues
Month 2: max-age=31536000 (1 year)
Month 3: max-age=63072000 (2 years)
Month 4: Submit to preload list
```

### 4. Referrer-Policy Strictness

**Issue**:
- `strict-origin-when-cross-origin` may break analytics
- `no-referrer` provides more privacy but less analytics data

**Trade-off**:
- Use `strict-origin-when-cross-origin` for balance
- Analytics still get origin information
- Sensitive URL parameters protected

---

## Production Deployment Checklist

### Pre-Deployment

- [ ] Verify HTTPS is configured and working
- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS` environment variable
- [ ] Test all headers locally with `curl -I`
- [ ] Test CORS with different origins

### Post-Deployment

- [ ] Verify headers in browser DevTools
- [ ] Run security scan on [securityheaders.com](https://securityheaders.com/)
- [ ] Test CORS preflight requests
- [ ] Check HSTS is being enforced (browser may cache)
- [ ] Verify CSP doesn't block legitimate resources
- [ ] Test app functionality (ensure CSP doesn't break features)

### Monitoring

- [ ] Monitor logs for CSP violations
- [ ] Track CORS rejection errors
- [ ] Set up alerts for security header changes
- [ ] Regular security audits (quarterly)

### Long-term

- [ ] Consider migrating to CSP nonces (remove `'unsafe-inline'`)
- [ ] Add to HSTS preload list after stable period
- [ ] Implement Content-Security-Policy-Report-Only for testing stricter policies
- [ ] Review and update CORS whitelist as needed

---

## Files Modified/Created

**Created**:
- `lib/cors.ts` - CORS utility functions and middleware
- `SECURITY_HEADERS.md` - This documentation

**Modified**:
- `next.config.ts` - Added global security headers configuration
- `app/api/auth/refresh/route.ts` - Added CORS support
- `app/api/auth/logout/route.ts` - Added CORS support

---

## Security Best Practices Summary

| Header | Purpose | Status |
|--------|---------|--------|
| **HSTS** | Force HTTPS | ✅ Implemented (2 years, preload) |
| **CSP** | Prevent XSS | ✅ Implemented (with Next.js compatibility) |
| **CORS** | Control cross-origin access | ✅ Implemented (whitelist-based) |
| **X-Frame-Options** | Prevent clickjacking | ✅ Implemented (DENY) |
| **X-Content-Type-Options** | Prevent MIME sniffing | ✅ Implemented (nosniff) |
| **Referrer-Policy** | Control referrer info | ✅ Implemented (strict-origin-when-cross-origin) |
| **Permissions-Policy** | Restrict browser features | ✅ Implemented (camera, mic, location disabled) |

**Additional Recommendations**:
- Implement CSP nonces for production (future)
- Add HSTS to preload list after 3 months
- Regular security audits with automated tools
- Monitor CSP violation reports
- Keep dependencies updated for security patches

---

## References

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [HSTS Preload List](https://hstspreload.org/)
- [CORS Specification](https://fetch.spec.whatwg.org/#http-cors-protocol)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [Security Headers Checker](https://securityheaders.com/)
