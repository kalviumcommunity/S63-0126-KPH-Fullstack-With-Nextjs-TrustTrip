t pu# TrustTrip

## Project Title & Problem Statement

**TrustTrip** is a web-based transparency system designed to address the lack of clarity in intercity bus ticket cancellation and refund processes.

Currently, passengers often do not understand how refund amounts are calculated or why deductions occur, which leads to confusion and mistrust. TrustTrip focuses on **explainability** by simulating a rule-based refund system that clearly shows _how_ and _why_ a refund amount is generated.

---

## Folder Structure & Explanation

trusttrip/
├── app/
│   ├── page.tsx                # Main landing page (UI entry point)
│   ├── layout.tsx              # Root layout shared across pages
│   ├── globals.css             # Global styles
│   ├── page.module.css         # Page-specific styles
│   └── api/                    # Backend API routes
│       ├── users/
│       │   └── route.ts        # User management endpoints
│       ├── projects/
│       │   └── route.ts        # Travel project endpoints
│       ├── bookings/
│       │   └── route.ts        # Booking management endpoints
│       ├── payments/
│       │   └── route.ts        # Payment processing endpoints
│       ├── refunds/
│       │   └── route.ts        # Refund request endpoints
│       ├── reviews/
│       │   └── route.ts        # Review/submission endpoints
│       └── test/
│           └── route.ts        # Database connection test
├── public/                     # Static assets
├── lib/
│   └── prisma.ts               # Prisma client singleton
├── prisma/
│   ├── schema.prisma           # Database schema definition
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Database seeding
├── notes/                      # Project notes and documentation
├── .github/                    # GitHub configuration
├── docker-compose.yml          # Docker services configuration
├── Dockerfile                  # Next.js app containerization
├── package.json                # Project dependencies
├── tsconfig.json               # TypeScript configuration
├── next.config.ts              # Next.js configuration
└── README.md                   # Project documentation

**Explanation:**

- `app/` contains both frontend pages and backend API routes using the Next.js App Router.
- `app/api/` contains all RESTful API endpoints organized by resource type.
- Each route file handles multiple HTTP verbs (GET, POST) for its corresponding resource.
- `lib/prisma.ts` provides the Prisma client singleton for database access.
- `prisma/schema.prisma` defines the database models and relationships.
- `public/` is reserved for static assets if required in later sprints.
- Configuration files ensure consistency and scalability as the project grows.

---

## Setup Instructions

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd trusttrip
npm install
```

### Development

```bash
npm run dev
```

### Building & Starting Production

```bash
npm run build
npm run start
```

---

## API Reference

TrustTrip provides a comprehensive RESTful API for managing all platform resources. The API is organized following REST conventions with proper HTTP verbs, pagination, and error handling.

### API Endpoints

| Resource | Endpoint | Methods | Description |
|----------|----------|---------|-------------|
| Users | `/api/users` | GET, POST | User management |
| Projects | `/api/projects` | GET, POST | Travel project management |
| Bookings | `/api/bookings` | GET, POST | Booking management |
| Payments | `/api/payments` | GET, POST | Payment processing |
| Refunds | `/api/refunds` | GET, POST | Refund request handling |
| Reviews | `/api/reviews` | GET, POST | Review submissions |
| Test | `/api/test` | GET | Database connection test |

### Key Features

- **Pagination**: All list endpoints support `page` and `limit` query parameters
- **Filtering**: Filter results by various attributes (userId, status, etc.)
- **Sorting**: Sort results by different fields with ascending/descending order
- **Error Handling**: Consistent error responses with meaningful HTTP status codes

### Detailed Documentation

For complete API documentation including:
- All endpoints and their parameters
- Request/response examples
- Curl commands for testing
- Error response formats
- Pagination details

See the comprehensive [API Documentation](API_DOCUMENTATION.md).

### Quick Start

**List users with pagination:**
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10"
```

**Create a new user:**
```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe","password":"secure123"}'
```

**Test database connection:**
```bash
curl -X GET "http://localhost:3000/api/test"
```

---

## Global API Response Handler

### Overview

TrustTrip implements a **Global API Response Handler** to ensure every API endpoint returns responses in a consistent, structured, and predictable format. This unified response envelope improves developer experience (DX), simplifies error debugging, and strengthens observability in production environments.

### Unified Response Envelope Structure

Every API response follows this standardized structure:

#### Success Response

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "id": "user-123",
      "email": "john@example.com",
      "name": "John Doe",
      "verified": true,
      "createdAt": "2025-10-30T10:00:00Z"
    }
  ],
  "timestamp": "2025-10-30T10:00:00.123Z"
}
```

#### Paginated Success Response

```json
{
  "success": true,
  "message": "Projects fetched successfully",
  "data": [
    {
      "id": "project-456",
      "title": "European Tour 2026",
      "destination": "Paris, France",
      "startDate": "2026-06-01T00:00:00Z",
      "endDate": "2026-06-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2025-10-30T10:00:00.123Z"
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Validation failed: email is required, name is required",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": ["email is required", "name is required"]
  },
  "timestamp": "2025-10-30T10:00:00.123Z"
}
```

### Response Envelope Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful (`true`) or failed (`false`) |
| `message` | string | Human-readable message describing the operation or error |
| `data` | any | The actual response data (omitted on errors) |
| `pagination` | object | Pagination metadata (only present on paginated list endpoints) |
| `error` | object | Error details including code and optional details (only on errors) |
| `timestamp` | string | ISO 8601 timestamp when the response was generated |

### Error Codes Reference

The following error codes are used consistently across all endpoints:

**Validation & Client Errors:**
- `VALIDATION_ERROR` - Request validation failed
- `MISSING_REQUIRED_FIELD` - A required field is missing
- `INVALID_FORMAT` - Data format is invalid
- `EMAIL_ALREADY_IN_USE` - Email address already exists

**Authentication & Authorization:**
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `INVALID_CREDENTIALS` - Invalid login credentials

**Resource Errors:**
- `USER_NOT_FOUND` - User resource not found
- `PROJECT_NOT_FOUND` - Project resource not found
- `BOOKING_NOT_FOUND` - Booking not found
- `BOOKING_CONFLICT` - Booking dates conflict

**Database Errors:**
- `DATABASE_ERROR` - Database operation failed
- `UNIQUE_CONSTRAINT_VIOLATION` - Duplicate unique field value
- `QUERY_EXECUTION_FAILED` - Query execution error

**Operation-Specific Errors:**
- `USER_CREATION_FAILED` - User creation failed
- `PROJECT_CREATION_FAILED` - Project creation failed
- `BOOKING_CREATION_FAILED` - Booking creation failed
- `PAYMENT_FAILED` - Payment processing failed
- `REFUND_FAILED` - Refund processing failed

**Server Errors:**
- `INTERNAL_ERROR` - Generic server error
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable
- `REQUEST_TIMEOUT` - Request timeout

### Using the Response Handler in Routes

The response handler is implemented in [lib/responseHandler.ts](lib/responseHandler.ts) and provides three main functions:

#### 1. `sendSuccess()` - For successful responses

```typescript
import { sendSuccess } from "@/lib/responseHandler";
import { HTTP_STATUS_CODES } from "@/lib/errorCodes";

export async function GET() {
  const data = await fetchData();
  return sendSuccess(data, "Data fetched successfully", HTTP_STATUS_CODES.OK);
}
```

#### 2. `sendPaginatedSuccess()` - For paginated list responses

```typescript
import { sendPaginatedSuccess } from "@/lib/responseHandler";

export async function GET(request: NextRequest) {
  const page = 1, limit = 10;
  const total = 42;
  const items = await fetchItems();

  return sendPaginatedSuccess(
    items,
    {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    "Items fetched successfully"
  );
}
```

#### 3. `sendError()` - For error responses

```typescript
import { sendError } from "@/lib/responseHandler";
import { ERROR_CODES, HTTP_STATUS_CODES } from "@/lib/errorCodes";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.email) {
      return sendError(
        "Email is required",
        ERROR_CODES.MISSING_REQUIRED_FIELD,
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

    // Process request...
  } catch (error) {
    return sendError(
      "Failed to process request",
      ERROR_CODES.INTERNAL_ERROR,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      error
    );
  }
}
```

### Implemented Routes

The following API routes currently use the Global Response Handler:

#### Users API - `/api/users`
- **GET**: List users with pagination and filtering
- **POST**: Create a new user

Example Request:
```bash
GET http://localhost:3000/api/users?page=1&limit=10&search=john
POST http://localhost:3000/api/users
{
  "email": "jane@example.com",
  "name": "Jane Doe",
  "password": "secure123"
}
```

#### Projects API - `/api/projects`
- **GET**: List projects with pagination and filtering
- **POST**: Create a new project

Example Request:
```bash
GET http://localhost:3000/api/projects?page=1&destination=Paris
POST http://localhost:3000/api/projects
{
  "title": "Paris Trip",
  "destination": "Paris, France",
  "startDate": "2026-06-01",
  "endDate": "2026-06-15",
  "userId": "user-123"
}
```

### Developer Experience & Observability Benefits

#### 1. **Consistent Structure**
Every endpoint returns the same envelope structure, allowing frontend developers to write generic response handling code without needing route-specific logic.

#### 2. **Predictable Error Handling**
All error responses include:
- A `code` field for programmatic error tracking
- A `message` field for user-friendly explanations
- Optional `details` for additional context
- Timestamps for debugging

This makes it easy to integrate with monitoring tools like Sentry, Datadog, or LogRocket.

#### 3. **Standardized HTTP Status Codes**
Each error includes appropriate HTTP status codes:
- `400` for validation errors
- `401` for authentication failures
- `403` for authorization failures
- `404` for not found
- `409` for conflicts
- `500` for server errors

#### 4. **Built-in Pagination Metadata**
Paginated responses include navigation hints (`hasNext`, `hasPrev`, `totalPages`) allowing frontend apps to implement smart pagination UI without calculating page counts.

#### 5. **Timestamped Responses**
Every response includes an ISO 8601 timestamp, enabling:
- Client-server clock skew detection
- Request-response correlation in distributed systems
- Audit trail generation

#### 6. **Better Logging & Monitoring**
With standardized error codes and timestamps, you can easily:
- Create dashboards tracking error frequencies
- Set up alerts for specific error codes
- Correlate frontend and backend logs
- Generate detailed audit trails

#### 7. **Faster Onboarding**
New team members can understand the API response format immediately without reading route-specific documentation.

---

## Role-Based Access Control (RBAC) & Authorization Middleware

### Overview

TrustTrip implements a **Role-Based Access Control (RBAC)** system with an **Authorization Middleware** to protect routes based on user roles and valid JWT sessions. This ensures that:

- **Authentication** confirms *who* the user is (verified by JWT)
- **Authorization** determines *what* that user can do (verified by role)

Together, they enforce the principle of least privilege: users only have access to resources they need.

### Architecture & Request Flow

The authorization system works through the following flow:

```
Incoming Request
    ↓
Middleware (app/middleware.ts)
    ├─→ Is route public? → Allow (no auth needed)
    ├─→ Is auth required? → Extract JWT from header
    │       ├─→ Token missing? → Return 401 Unauthorized
    │       ├─→ Token invalid/expired? → Return 403 Forbidden
    │       └─→ Token valid? → Extract user info
    │
    └─→ Check Role-Based Access
            ├─→ Does user have required role? → Attach user headers → Allow
            └─→ Insufficient role? → Return 403 Forbidden

Route Handler
    ↓
Use x-user-id, x-user-email, x-user-role from headers
    ↓
Return Response
```

### User Roles

The system supports the following roles (extensible):

| Role | Permissions | Access |
|------|-------------|--------|
| `user` | Standard user operations | `/api/users`, `/api/projects`, `/api/bookings`, `/api/reviews` |
| `admin` | Full platform access, user management | `/api/admin`, `/api/admin/users`, `/api/admin/analytics` |
| `moderator` | Content moderation | Extensible for future use |
| `guest` | No authenticated access | Public routes only |

### Implementation Files

#### 1. **[middleware.config.ts](middleware.config.ts)**
Centralized configuration for route protection. Define which routes need authentication and which require specific roles.

```typescript
// Example: Define protected routes
export const authRequiredRoutes: ProtectedRoute[] = [
  { path: "/api/users", requiredRoles: [] },      // All authenticated users
  { path: "/api/projects", requiredRoles: [] },   // All authenticated users
];

export const roleBasedRoutes: ProtectedRoute[] = [
  { path: "/api/admin", requiredRoles: ["admin"] }, // Admin only
];

export const publicRoutes: string[] = [
  "/api/test",
  "/api/auth/login",
];
```

#### 2. **[app/middleware.ts](app/middleware.ts)**
The core middleware that:
- Validates JWT tokens from the `Authorization: Bearer <token>` header
- Verifies JWT signature and expiration
- Enforces role-based access control
- Attaches user information to request headers for downstream handlers

```typescript
// Middleware validates JWT and checks roles
// If valid: Adds custom headers (x-user-id, x-user-email, x-user-role)
// If invalid: Returns 401 or 403 response
```

#### 3. **[prisma/schema.prisma](prisma/schema.prisma)**
User model includes a `role` field:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  role          String    @default("user")  // Determines access level
  // ... other fields
}
```

#### 4. **[app/api/admin/route.ts](app/api/admin/route.ts)**
Admin-only protected route example:

```typescript
// GET /api/admin
// Only accessible to users with role="admin"
// Returns dashboard statistics and admin controls

export async function GET(request: NextRequest) {
  const userEmail = request.headers.get("x-user-email");
  const userRole = request.headers.get("x-user-role");
  // Role is already verified by middleware
  // Process admin request...
}
```

### Testing Authorization

#### Test Case 1: Access Admin Route as Admin User

```bash
# Create a valid JWT for admin user
JWT_TOKEN="your-admin-jwt-token-here"

curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Admin dashboard data retrieved successfully",
  "data": {
    "message": "Welcome to the Admin Dashboard",
    "user": {
      "email": "admin@example.com",
      "role": "admin"
    },
    "statistics": {
      "totalUsers": 245,
      "activeProjects": 32,
      "pendingBookings": 18,
      "totalRevenue": 45320.5
    }
  },
  "timestamp": "2025-10-30T10:00:00.123Z"
}
```

#### Test Case 2: Access Admin Route as Regular User

```bash
# Use JWT token for regular user
USER_TOKEN="your-user-jwt-token-here"

curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Expected Response (Forbidden):**
```json
{
  "success": false,
  "message": "Your role (user) does not have access to this resource. Required roles: admin",
  "error": {
    "code": "FORBIDDEN",
    "details": "Insufficient permissions to access this resource"
  },
  "timestamp": "2025-10-30T10:00:00.123Z"
}
```

#### Test Case 3: Access Protected Route Without Token

```bash
curl -X GET http://localhost:3000/api/admin
```

**Expected Response (Unauthorized):**
```json
{
  "success": false,
  "message": "Authorization header missing. Use: Authorization: Bearer <token>",
  "error": {
    "code": "UNAUTHORIZED",
    "details": "Please provide a valid authentication token"
  },
  "timestamp": "2025-10-30T10:00:00.123Z"
}
```

#### Test Case 4: Access Protected Route With Invalid Token

```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer invalid.token.here"
```

**Expected Response (Forbidden):**
```json
{
  "success": false,
  "message": "Invalid authentication token. Please provide a valid token.",
  "error": {
    "code": "FORBIDDEN",
    "details": "Insufficient permissions to access this resource"
  },
  "timestamp": "2025-10-30T10:00:00.123Z"
}
```

#### Test Case 5: Access General User Route With Valid Token

```bash
USER_TOKEN="your-user-jwt-token-here"

curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [...],
  "pagination": {...},
  "timestamp": "2025-10-30T10:00:00.123Z"
}
```

### JWT Structure

The JWT token should contain the following claims:

```json
{
  "id": "user-123",
  "email": "user@example.com",
  "role": "user",  // or "admin"
  "iat": 1698667200,
  "exp": 1698753600
}
```

Example of creating a JWT (for testing):

```bash
# Using node-jwt library or online tool
# Header: { "alg": "HS256", "typ": "JWT" }
# Payload: { "id": "user-123", "email": "user@example.com", "role": "user" }
# Secret: your-jwt-secret-key
```

### Accessing User Information in Route Handlers

Once middleware authorizes a request, user information is available via request headers:

```typescript
export async function GET(request: NextRequest) {
  // Middleware attaches these headers after authorization
  const userId = request.headers.get("x-user-id");
  const userEmail = request.headers.get("x-user-email");
  const userRole = request.headers.get("x-user-role");

  // Use these to filter data, log actions, etc.
  console.log(`${userEmail} (${userRole}) accessed this route`);
}
```

### Extending RBAC

To add a new role (e.g., "moderator"):

1. **Update middleware.config.ts:**
   ```typescript
   export const roleBasedRoutes: ProtectedRoute[] = [
     { path: "/api/moderation", requiredRoles: ["moderator"] },
   ];
   ```

2. **Update Prisma User model** (if not already flexible):
   - Role is already a string field, so no schema change needed

3. **Create new protected route:**
   ```typescript
   // app/api/moderation/route.ts
   export async function POST(request: NextRequest) {
     const userRole = request.headers.get("x-user-role");
     // Process moderation request...
   }
   ```

4. **Assign role to users** when creating or updating:
   ```typescript
   const user = await prisma.user.create({
     data: {
       email: "moderator@example.com",
       role: "moderator",
     },
   });
   ```

### Security Considerations

#### 1. **JWT Secret Management**
- Store `JWT_SECRET` in environment variables (`.env.local`)
- Use a strong, randomly generated secret (minimum 32 characters)
- Rotate secrets periodically in production

```env
JWT_SECRET=your-very-long-random-secret-key-minimum-32-characters
```

#### 2. **Token Expiration**
- Set reasonable token expiration times (e.g., 1 hour for access tokens)
- Implement refresh tokens for long-lived sessions
- Logout by invalidating tokens server-side if needed

#### 3. **HTTPS in Production**
- Always use HTTPS to prevent token interception
- Configure secure cookie flags if using cookie-based tokens

#### 4. **Principle of Least Privilege**
- Assign users the minimum role needed for their function
- Regularly audit role assignments
- Create granular roles rather than broad "super-admin" roles

#### 5. **Audit Logging**
The middleware logs all authorization attempts:

```
✓ User admin@example.com (admin) authorized to access /api/admin
⚠ Access denied for user user@example.com (user) to /api/admin
```

Monitor these logs for unauthorized access attempts.

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Token missing" | No Authorization header | Include `Authorization: Bearer <token>` in request |
| "Invalid token" | Token tampered or expired | Generate new JWT token |
| "Access denied" | User role insufficient | Assign higher role or use different route |
| Middleware not running | Route not in config | Add route to `authRequiredRoutes` or `roleBasedRoutes` |

---

## Database Setup & Migrations

TrustTrip uses **Prisma ORM** with **PostgreSQL** for database management, ensuring reproducible schema evolution and data consistency across development, staging, and production environments.

### Prerequisites

- **PostgreSQL** installed locally or accessible via connection string
- **Docker** (optional, recommended for local development)

### Starting the Database

If using Docker Compose:

```bash
# Start PostgreSQL database container
docker-compose up -d db

# Verify database is running
docker-compose ps
```

Or configure your `.env` file with a remote database:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

### Creating & Applying Migrations

#### First-Time Setup

When the schema is first created, Prisma generates a migration:

```bash
# Create the initial migration (only run once)
npx prisma migrate dev --name init_schema
```

This command:
1. Generates the migration SQL file in `prisma/migrations/`
2. Applies all pending migrations to your database
3. Generates the Prisma Client for type-safe database access

#### Adding New Models or Fields

When you modify `prisma/schema.prisma`, create a new migration:

```bash
# Example: Adding a new field or model
npx prisma migrate dev --name add_project_table
```

This creates a new timestamped migration folder with the SQL changes.

#### Applying Migrations in Production

Use `migrate deploy` instead of `migrate dev` to safely apply migrations without generating a new schema:

```bash
npx prisma migrate deploy
```

### Understanding Migrations

Each migration is stored in `prisma/migrations/` with:
- **Folder name**: Timestamp + description (e.g., `20260128084603_init_schema/`)
- **migration.sql**: SQL DDL statements for schema changes
- **migration_lock.toml**: Lock file to ensure consistency

**Example Migration Structure:**
```
prisma/migrations/
├── 20260128084603_init_schema/
│   └── migration.sql          # CREATE TABLE, ALTER TABLE statements
└── 20260128085000_seed_data/
    └── migration.sql          # INSERT seed records
```

### Database Schema Overview

The TrustTrip database includes the following models:

- **User**: Traveler and operator profiles
- **Project**: Trip/travel projects with destination and budget
- **Review**: User ratings and feedback on projects
- **Booking**: Trip reservations with pricing
- **Payment**: Transaction records
- **Refund**: Refund requests and tracking

For detailed schema, see [prisma/schema.prisma](prisma/schema.prisma).

### Seeding the Database

#### Automatic Seeding After Migration

Seed data is applied through a dedicated migration:

```bash
# Migrations are applied automatically when running migrate deploy
npx prisma migrate deploy
```

The seed migration (`20260128085000_seed_data`) inserts sample data:
- **5 Users**: Alice, Bob, Carol, David, Emma (with different verified statuses)
- **4 Projects**: Europe Tour, Asia Backpacking, Japan Experience, Caribbean Escape
- **4 Reviews**: Various ratings (3-5 stars)
- **3 Bookings**: Confirmed and pending states
- **3 Payments**: Different payment methods
- **1 Refund**: Sample refund request

#### Viewing Seeded Data

Use Prisma Studio to explore the database:

```bash
npx prisma studio
```

This opens an interactive UI at `http://localhost:5555` where you can:
- Browse all tables and records
- Filter and sort data
- Edit or delete records manually
- Export data

### Rolling Back Migrations

#### Reverting the Last Migration

To roll back the most recent migration:

```bash
# Revert the last migration (removes the schema changes)
npx prisma migrate resolve --rolled-back <migration-name>
```

Example:
```bash
npx prisma migrate resolve --rolled-back 20260128085000_seed_data
```

#### Full Database Reset (Development Only)

**⚠️ WARNING**: This deletes all data. Only use in development:

```bash
# Reset database completely (deletes all data and re-runs all migrations)
npx prisma migrate reset
```

### Production Safety Considerations

**Protecting Production Data:**

1. **Staging Environment Testing**
   - Always test migrations in a staging environment first
   - Run `npx prisma migrate deploy` in staging before production

2. **Backup Before Migration**
   ```bash
   # PostgreSQL backup
   pg_dump mydb > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

3. **Review Migration SQL**
   ```bash
   # Inspect the SQL before applying
   cat prisma/migrations/<migration-name>/migration.sql
   ```

4. **Use Read Replicas**
   - In production, use read replicas to isolate write locks
   - Apply migrations during low-traffic windows

5. **Monitor Migration Execution**
   ```bash
   # Check migration status
   npx prisma migrate status
   ```

6. **Implement CI/CD Guards**
   - Require code review for schema changes
   - Automated schema validation in pull requests
   - Gradual rollout using feature flags

### Troubleshooting

#### Connection Issues

```bash
# Test database connection
npx prisma db execute --stdin < /dev/null
```

#### Out-of-Sync Schema

If your database is out of sync:

```bash
# Repair the connection
npx prisma migrate resolve --rolled-back <migration-name>
npx prisma migrate deploy
```

#### Generate Updated Client

After schema changes:

```bash
npx prisma generate
```

---

## Reflection

This project follows Next.js best practices by combining frontend and backend logic in a single codebase.
This structure helps the team scale the application in future sprints by:
- Enabling parallel development of UI and API layers
- Reducing context switching between multiple repositories
- Making it easier to integrate databases, caching, and authentication later
- Keeping the codebase modular, clean, and maintainable

By starting with a minimal but structured foundation, TrustTrip is well-prepared for iterative feature additions.

---

## Prisma ORM Setup & Database Integration

TrustTrip integrates **Prisma ORM** as the type-safe database access layer for PostgreSQL. This provides a modern, developer-friendly alternative to raw SQL while maintaining full type safety and query validation.

### Database Schema

The application defines four core models with proper relationships and constraints:

#### User Model
```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String
  password  String    // hashed password
  bio       String?
  avatar    String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  projects  Project[]
  tasks     Task[]
  reviews   Review[]
}
```

#### Project Model (Trip/Journey)
```prisma
model Project {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  destination String
  startDate   DateTime
  endDate     DateTime
  budget      Float?
  status      ProjectStatus @default(PLANNING)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  userId      Int
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  tasks       Task[]
  reviews     Review[]
  
  @@index([userId])
}
```

#### Task Model
```prisma
model Task {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  projectId   Int
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  userId      Int
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  reviews     Review[]
  
  @@index([projectId])
  @@index([userId])
}
```

#### Review Model
```prisma
model Review {
  id          Int       @id @default(autoincrement())
  rating      Int       // 1-5 star rating
  comment     String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  userId      Int
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  projectId   Int?
  project     Project?  @relation(fields: [projectId], references: [id], onDelete: SetNull)
  
  taskId      Int?
  task        Task?     @relation(fields: [taskId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([projectId])
  @@index([taskId])
}
```

### Key Schema Features

- **Primary Keys**: Autoincrement integer IDs for simplicity and performance
- **Foreign Keys**: Proper relationship constraints with `@relation` directives
- **Cascading Deletes**: User deletion cascades to owned projects and tasks
- **Timestamps**: Automatic `createdAt` and `updatedAt` tracking
- **Indexes**: Strategic indexes on frequently queried foreign keys for performance
- **Enums**: Type-safe status and priority fields

### PostgreSQL Connection

The application connects to PostgreSQL via the `DATABASE_URL` environment variable:

```bash
# Local development
DATABASE_URL="postgresql://username:password@localhost:5432/trusttrip_db"

# Production (Vercel Postgres, Railway, etc.)
DATABASE_URL="postgresql://user:password@host.com:5432/database"
```

### Prisma Client Setup

The singleton Prisma Client instance is configured in [`lib/prisma.ts`](lib/prisma.ts):

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

**Why Singleton Pattern?**
- Prevents multiple Prisma instances during hot reload in development
- Ensures connection pooling efficiency
- Reduces database connection overhead

### Example API Routes Using Prisma

#### Fetch All Users
```typescript
// GET /api/users
const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true, createdAt: true }
});
```

#### Create a User
```typescript
// POST /api/users
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: 'hashed_password_here', // Always hash in production!
  },
});
```

#### Find User with Projects
```typescript
// Get a user with all their projects
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { projects: true, tasks: true }
});
```

#### Complex Query with Relations
```typescript
// Get all projects for a user with tasks and reviews
const projects = await prisma.project.findMany({
  where: { userId: 1 },
  include: {
    tasks: { include: { reviews: true } },
    reviews: true
  }
});
```

### Database Migration Workflow

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name add_new_fields

# Apply migrations in production
npx prisma migrate deploy

# Seed database with test data
npx prisma db seed

# View database in visual studio
npx prisma studio
```

### Testing the Connection

The application includes test endpoints to verify database connectivity:

**GET `/api/test`** - Basic connection test
```json
{
  "success": true,
  "message": "Database connection successful!",
  "data": {
    "usersCount": 0,
    "projectsCount": 0,
    "timestamp": "2026-01-28T10:00:00Z"
  }
}
```

**GET `/api/users`** - List all users

**POST `/api/users`** - Create a new user
```json
{
  "email": "test@example.com",
  "name": "Test User",
  "password": "secure_password"
}
```

### Type Safety Benefits

With Prisma, all database operations are type-safe:

```typescript
// TypeScript catches this error at compile time!
const user = await prisma.user.findUnique({
  where: { id: 1 }
});

// user.id is correctly typed as number
// user.email is correctly typed as string
// IDE provides full autocomplete
```

### Advantages Over Raw SQL

| Feature | Prisma | Raw SQL |
|---------|--------|---------|
| Type Safety | ✅ Full TypeScript support | ❌ No type checking |
| IDE Autocomplete | ✅ Full intellisense | ❌ Limited support |
| SQL Injection Prevention | ✅ Parameterized by default | ⚠️ Requires careful handling |
| Schema Synchronization | ✅ Auto-generated from schema | ❌ Manual keeping in sync |
| Migration Tracking | ✅ Built-in versioning | ❌ Manual version control |
| Multi-Database Support | ✅ PostgreSQL, MySQL, SQLite, etc. | ❌ Database-specific SQL |

**When to Use Raw SQL (with Prisma):**
- Complex aggregations and GROUP BY queries
- Custom window functions
- Performance-critical analytical queries

```typescript
// Prisma raw SQL for complex queries
const result = await prisma.$queryRaw`
  SELECT user_id, COUNT(*) as task_count
  FROM Task
  GROUP BY user_id
  HAVING COUNT(*) > 5
`;
```

### Key Learnings: Why Prisma Improves Development Speed

1. **Developer Experience**
   - Auto-generated types eliminate runtime errors
   - IDE autocomplete speeds up query writing
   - Natural JavaScript/TypeScript API feels intuitive

2. **Type Safety**
   - Compile-time validation of database operations
   - Safe refactoring with TypeScript checking
   - Documentation embedded in type definitions

3. **Query Reliability**
   - Built-in parameterization prevents SQL injection
   - Proper handling of relationships and foreign keys
   - Native transaction support for complex operations

4. **Maintainability**
   - Single source of truth: `schema.prisma`
   - Clear relationship definitions and constraints
   - Automatic migration tracking and versioning

---

## GitHub Workflow

This project follows a standardized GitHub branching and pull-request workflow to ensure smoother collaboration, consistent code quality, and clear version control practices.

### Branching Strategy

We follow a consistent naming convention for branches to maintain clarity and organization:

- `feature/<feature-name>` - For new features (e.g., `feature/login-auth`)
- `fix/<bug-name>` - For bug fixes (e.g., `fix/navbar-alignment`)
- `chore/<task-name>` - For maintenance tasks (e.g., `chore/update-dependencies`)
- `docs/<update-name>` - For documentation updates (e.g., `docs/readme-improvements`)

**Example Branch Lifecycle:**
```bash
# Create a feature branch
git checkout -b feature/refund-calculator

# Make your changes, then push
git add .
git commit -m "feat: add refund calculation logic"
git push origin feature/refund-calculator

# Create PR on GitHub and request review
# After approval, merge using GitHub UI (not direct push)
```

### Pull Request Process

All changes must go through a pull request review process:

1. Create a branch following the naming convention above
2. Make your changes and commit them with descriptive messages
3. Push your branch to the repository
4. Create a pull request on GitHub using our [PR template](.github/pull_request_template.md)
5. Ensure all checks pass (lint, build, tests)
6. Request review from team members
7. Address any feedback and push updates
8. Merge after approval (protected branch rules apply)

### Code Review Checklist

All reviewers must verify these points before approving a PR:

- [ ] Lint and build pass successfully
- [ ] No console errors or warnings
- [ ] Functionality tested locally
- [ ] Code follows naming conventions and style guidelines
- [ ] Code follows security best practices
- [ ] No hardcoded credentials or sensitive data
- [ ] Comments and documentation are clear
- [ ] Tests added/updated (if applicable)
- [ ] No unnecessary dependencies added

### Branch Protection Rules

The `main` branch is protected with the following rules to ensure code quality:

- **Required Reviews**: At least 1 approval required before merge
- **Required Checks**: All status checks (lint, build, tests) must pass
- **Direct Pushes**: Disallowed - all changes must come through PRs
- **Stale PRs**: Automatically dismiss old reviews if new commits are pushed
- **Require Branches Up to Date**: Branch must be up to date with main before merging

**Configuration in GitHub:**
1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable "Require a pull request before merging"
4. Enable "Require approval reviews" (set to 1)
5. Enable "Require status checks to pass before merging"
6. Enable "Require branches to be up to date before merging"

These rules ensure code quality and prevent accidental breaking changes to the main branch.

---

## Docker & Docker Compose Setup

This project is containerized to ensure consistent development and production environments across all team members' machines. This eliminates the classic "it works on my machine" problem.

### Overview

The containerized stack consists of three interconnected services:

1. **Next.js App** - The main application running on port 3000
2. **PostgreSQL Database** - Data persistence on port 5432
3. **Redis Cache** - In-memory caching on port 6379

All services communicate via a Docker bridge network (`localnet`) and can be managed together using Docker Compose.

### Docker Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Network (localnet)               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │   Next.js App    │    │  PostgreSQL DB   │              │
│  │  Port: 3000      │    │   Port: 5432     │              │
│  │  Environment:    │◄──►│  Volume: db_data │              │
│  │  - DATABASE_URL  │    │  Health: OK      │              │
│  │  - REDIS_URL     │    │                  │              │
│  └──────────────────┘    └──────────────────┘              │
│         ▲                                                   │
│         │                                                   │
│  ┌──────▼──────────────┐                                   │
│  │   Redis Cache       │                                   │
│  │   Port: 6379        │                                   │
│  │   Health: OK        │                                   │
│  └─────────────────────┘                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Project Files

#### `Dockerfile`

The Dockerfile defines how the Next.js application is containerized:

```dockerfile
# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files and build the app
COPY . .
RUN npm run build

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]
```

**Explanation:**
- **Base Image**: `node:20-alpine` - Lightweight Node.js image (~150MB vs ~900MB for standard)
- **WORKDIR**: Sets `/app` as the working directory inside the container
- **Dependencies**: Copies `package*.json` and installs dependencies
- **Build**: Copies application code and runs the Next.js build process
- **Expose**: Declares port 3000 for the application
- **Start**: Runs production server with `npm run start`

#### `docker-compose.yml`

The Docker Compose file orchestrates three services:

```yaml
version: '3.9'

services:
  app:
    build: .
    container_name: nextjs_app
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://postgres:password@db:5432/mydb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - localnet
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    container_name: postgres_db
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - localnet
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: redis_cache
    ports:
      - "6379:6379"
    networks:
      - localnet
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  localnet:
    driver: bridge

volumes:
  db_data:
```

**Service Descriptions:**

- **app Service**
  - Builds from the Dockerfile in the project root
  - Exposes port 3000 for web access
  - Environment variables configure database and cache connections
  - `depends_on` ensures the database and Redis start before the app
  - `restart: unless-stopped` keeps the app running after crashes

- **db Service (PostgreSQL)**
  - Uses official `postgres:15-alpine` image
  - Stores data in the `db_data` named volume for persistence
  - Credentials: username `postgres`, password `password`, database `mydb`
  - Healthcheck confirms the database is ready before dependent services start

- **redis Service**
  - Uses official `redis:7-alpine` image
  - Provides in-memory caching for improved application performance
  - Healthcheck pings Redis to verify operational status

- **localnet Network**
  - Bridge network enables all three services to communicate using service names as hostnames
  - Example: The app accesses PostgreSQL at `db:5432` and Redis at `redis:6379`

- **db_data Volume**
  - Named volume persists PostgreSQL data even if containers are removed
  - Ensures database recovery across container restarts

### Getting Started with Docker

#### Prerequisites

Ensure you have installed:
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker Compose)
- Git (for cloning the repository)

#### Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd trusttrip
   ```

2. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

   The `--build` flag rebuilds the Next.js app image. On subsequent runs:
   ```bash
   docker-compose up
   ```

3. **Verify all services are running:**
   ```bash
   docker ps
   ```

   Expected output:
   ```
   CONTAINER ID   IMAGE              NAMES
   abc123def456   nextjs_app         nextjs_app
   def456ghi789   postgres:15-alpine postgres_db
   ghi789jkl012   redis:7-alpine     redis_cache
   ```

4. **Access the application:**
   - **Application**: http://localhost:3000
   - **PostgreSQL**: `localhost:5432` (use psql or DBeaver)
   - **Redis**: `localhost:6379` (use redis-cli)

5. **Stop all services:**
   ```bash
   docker-compose down
   ```

#### Useful Docker Compose Commands

| Command | Purpose |
|---------|---------|
| `docker-compose up` | Start all services |
| `docker-compose up --build` | Rebuild and start services |
| `docker-compose down` | Stop all services |
| `docker-compose down -v` | Stop and remove volumes (clears DB) |
| `docker-compose logs -f app` | Stream app logs |
| `docker-compose logs -f db` | Stream database logs |
| `docker ps` | List running containers |
| `docker-compose build app` | Rebuild a specific service |
| `docker-compose exec db psql -U postgres -d mydb` | Connect to PostgreSQL |
| `docker-compose exec redis redis-cli` | Connect to Redis |

### Environment Variables

For development, credentials are hardcoded in `docker-compose.yml`. For production deployments:

1. **Create a `.env` file** in the root directory:
   ```
   DATABASE_URL=postgres://postgres:secure_password@db:5432/mydb
   REDIS_URL=redis://redis:6379
   NODE_ENV=production
   ```

2. **Update `docker-compose.yml`** to reference the file:
   ```yaml
   env_file:
     - .env
   ```

3. **Add to `.gitignore`** to prevent committing secrets:
   ```
   .env
   .env.local
   .env.*.local
   ```

### Troubleshooting & Solutions

#### Port Already in Use

**Error:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution:**
```bash
# Find what's using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# Option 1: Change the port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead

# Option 2: Stop the conflicting service
```

#### Database Connection Errors

**Error:** App cannot connect to PostgreSQL

**Solutions:**
```bash
# 1. Check if database container is running
docker ps | grep postgres_db

# 2. View database logs
docker-compose logs db

# 3. Verify DATABASE_URL matches the configuration
# Should be: postgres://postgres:password@db:5432/mydb
```

#### Slow Docker Builds

**Solution:** Create a `.dockerignore` file to exclude unnecessary files:
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.next
.env
```

#### Container Exits Immediately

**Solution:**
```bash
# 1. Check logs
docker-compose logs app

# 2. Verify build works locally
npm run build
npm run start

# 3. Check Node.js version compatibility
```

#### Disk Space Issues

**Solution:**
```bash
# Check Docker disk usage
docker system df

# Clean up unused images and volumes
docker system prune -a
```

### Reflection & Learning Outcomes

#### Key Benefits Achieved

1. **Environment Consistency**
   - All developers use identical versions of Node.js, PostgreSQL, and Redis
   - Eliminates "works on my machine" problems
   - Production environment mirrors local development setup

2. **Simplified Onboarding**
   - New team members can be productive in minutes
   - One command (`docker-compose up`) sets up the entire stack
   - No manual installation of databases or cache systems

3. **Service Isolation**
   - Each component runs independently in its own container
   - Easy to debug and scale individual services
   - Network isolation provides security guarantees

4. **Data Persistence**
   - PostgreSQL data persists across container restarts
   - No data loss during development cycles
   - Volumes enable local backups

#### Challenges Encountered

1. **Build Time**
   - Initial builds took 2-3 minutes
   - **Solution**: Used Alpine images (lightweight), optimized Dockerfile layers

2. **Port Conflicts**
   - Default ports (3000, 5432, 6379) already in use
   - **Solution**: Documented port flexibility in compose file

3. **Service Startup Order**
   - App connecting to database before it was ready
   - **Solution**: Added healthchecks and `depends_on` configuration

4. **Credential Management**
   - Hardcoded passwords in docker-compose.yml
   - **Solution**: Documented `.env` approach for production

#### Future Enhancements

1. **Multi-Stage Builds** - Separate build and runtime stages for smaller images
2. **Docker Secrets** - Secure credential storage for production
3. **CI/CD Integration** - Automated builds and registry pushes
4. **Monitoring** - ELK stack or Prometheus for logging and metrics
5. **Development Hot Reload** - Volume mounts for live code updates

---

## Prisma ORM Integration

### Overview

This project uses **Prisma ORM** as the type-safe database abstraction layer, providing:
- **Type Safety**: Automatically generated TypeScript types from the database schema
- **Query Builder**: Intuitive API for database operations without writing raw SQL
- **Schema Management**: Declarative schema with automatic migrations
- **Developer Experience**: Prisma Studio for visual database exploration

### Architecture & Setup

#### 1. Installation

Prisma is already installed via npm:

```bash
npm install prisma --save-dev
npm install @prisma/client
```

#### 2. Database Configuration

The PostgreSQL connection string is configured in `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/trusttrip_db"
```

**Connection String Format:**
```
postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
```

**Local Development Example:**
```
postgresql://postgres:password@localhost:5432/trusttrip_db
```

**Production (e.g., Vercel Postgres):**
```
postgresql://user:password@example.compute-1.amazonaws.com:5432/database
```

#### 3. Schema Definition

The Prisma schema is defined in `prisma/schema.prisma` with the following models:

**Models Overview:**
- **User**: Platform users with email authentication
- **Project**: Trip/project planning entities
- **Task**: Individual tasks within a project
- **Review**: User reviews and feedback system

**Key Schema Features:**

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique                          // Enforces unique emails
  name      String
  password  String    // Always hash in production!
  bio       String?
  avatar    String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  projects  Project[]  // One-to-many relationship
  tasks     Task[]     // One-to-many relationship
  reviews   Review[]   // One-to-many relationship
}

model Project {
  id          Int       @id @default(autoincrement())
  title       String
  destination String
  startDate   DateTime
  endDate     DateTime
  budget      Float?
  status      ProjectStatus @default(PLANNING)  // Enum type
  
  userId      Int
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  tasks       Task[]
  reviews     Review[]
  
  @@index([userId])  // Database index for performance
}

model Task {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  
  projectId   Int
  userId      Int
  
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([projectId])
  @@index([userId])
}

enum ProjectStatus {
  PLANNING
  ACTIVE
  COMPLETED
  CANCELLED
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

### Client Initialization

The Prisma Client is initialized as a singleton in `lib/prisma.ts` to prevent multiple instances in development:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

**Why Singleton Pattern?**
- Prevents multiple PrismaClient instances in development (which would cause memory leaks)
- Reuses the same database connection pool
- Ensures consistent logging across the application

### Usage Examples

#### Get All Users
```typescript
import { prisma } from '@/lib/prisma';

const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
});
```

#### Create a User
```typescript
const newUser = await prisma.user.create({
  data: {
    email: 'john@example.com',
    name: 'John Doe',
    password: hashedPassword, // Always hash!
  },
});
```

#### Get User with All Relations
```typescript
const userWithRelations = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    projects: true,
    tasks: true,
    reviews: true,
  },
});
```

#### Create Project with Tasks
```typescript
const project = await prisma.project.create({
  data: {
    title: 'Summer Road Trip',
    destination: 'California',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-14'),
    userId: 1,
    tasks: {
      create: [
        { title: 'Book flights', userId: 1 },
        { title: 'Reserve hotel', userId: 1 },
      ],
    },
  },
  include: { tasks: true },
});
```

### Database Migrations

#### Initialize Database
```bash
npx prisma migrate dev --name init
```

This creates the initial migration and applies it to your PostgreSQL database.

#### Create New Migration
```bash
npx prisma migrate dev --name add_avatar_field
```

#### Apply Existing Migrations
```bash
npx prisma migrate deploy
```

### Prisma Studio (Visual Explorer)

Explore and manage your database visually:

```bash
npx prisma studio
```

Opens a browser-based interface at `http://localhost:5555`

### Testing the Connection

A test endpoint is available at `/api/test`:

```bash
curl http://localhost:3000/api/test
```

**Response:**
```json
{
  "success": true,
  "message": "Database connection successful!",
  "data": {
    "usersCount": 5,
    "projectsCount": 12,
    "timestamp": "2024-01-28T15:30:45.123Z"
  }
}
```

### API Endpoints Using Prisma

#### List Users
```bash
GET /api/users
```

#### Create User
```bash
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "Jane Doe",
  "password": "hashedpassword"
}
```

### Performance Optimization

#### Database Indexing
All foreign key relationships have `@@index()` annotations:

```prisma
model Task {
  // ... fields ...
  @@index([projectId])
  @@index([userId])
}
```

These indexes improve query performance for:
- Filtering by projectId: `findMany({ where: { projectId: 1 } })`
- Filtering by userId: `findMany({ where: { userId: 1 } })`

#### Pagination Example
```typescript
const users = await prisma.user.findMany({
  skip: 10,        // Skip first 10
  take: 20,        // Take next 20
  orderBy: { createdAt: 'desc' },
});
```

### Best Practices

1. **Always Hash Passwords**
   ```typescript
   import bcrypt from 'bcryptjs';
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Use Transactions for Related Operations**
   ```typescript
   const result = await prisma.$transaction([
     prisma.user.create({ data: userData }),
     prisma.project.create({ data: projectData }),
   ]);
   ```

3. **Select Only Needed Fields**
   ```typescript
   // Good: Only select needed fields
   const user = await prisma.user.findUnique({
     where: { id: 1 },
     select: { id: true, email: true, name: true },
   });
   ```

4. **Handle Null Relations Properly**
   ```typescript
   model Review {
     taskId Int?
     task Task? @relation(fields: [taskId], references: [id])
   }
   ```

### Troubleshooting

#### Connection Failed
```
Error: Can't reach database server
```

**Solutions:**
1. Verify `DATABASE_URL` in `.env` matches PostgreSQL settings
2. Check PostgreSQL is running: `docker ps` or check local installation
3. Test connection: `psql -c "SELECT 1"`

#### Type Generation Issues
```
Error: PrismaClient is not available
```

**Solution:**
```bash
npx prisma generate
npm install
npm run build
```

#### Migration Conflicts
```
Error: Migration <name> already exists
```

**Solution:**
```bash
# Reset database (deletes all data)
npx prisma migrate reset
```

### Advantages Over Raw SQL

**Prisma vs Raw SQL:**

| Feature | Prisma | Raw SQL |
|---------|--------|---------|
| Type Safety | ✅ Full TypeScript support | ❌ No type checking |
| IDE Autocomplete | ✅ Full intellisense | ❌ Limited support |
| SQL Injection | ✅ Parameterized queries | ⚠️ Risk if not careful |
| Schema Sync | ✅ Auto-generated from schema | ❌ Manual keeping in sync |
| Migration Tracking | ✅ Built-in versioning | ❌ Manual version control |
| Multi-DB Support | ✅ PostgreSQL, MySQL, SQLite, etc. | ❌ Database-specific SQL |

**When to Use Raw SQL (with Prisma):**
```typescript
// For complex queries with aggregations
const result = await prisma.$queryRaw`
  SELECT user_id, COUNT(*) as task_count
  FROM Task
  GROUP BY user_id
  HAVING COUNT(*) > 5
`;
```

### Reflection & Learning Outcomes

#### Benefits Achieved

1. **Development Speed**
   - Generated types eliminate runtime errors
   - Autocomplete reduces debugging time
   - Natural API feels like working with native JavaScript objects

2. **Type Safety**
   - Catch database schema mismatches at compile time
   - Refactoring is safe with TypeScript checking
   - Documentation is embedded in type definitions

3. **Query Reliability**
   - Built-in parameterization prevents SQL injection
   - Proper relationship handling with foreign keys
   - Transaction support for complex operations

4. **Maintainability**
   - Single source of truth (schema.prisma)
   - Easy to understand relationships and constraints
   - Clear audit trail with migrations

#### Challenges & Solutions

1. **Learning Curve**
   - Solution: Prisma docs are excellent; reference query patterns

2. **Performance Considerations**
   - Always add `@@index()` for frequently queried fields
   - Use `.select()` to avoid fetching unnecessary data

3. **Migration Conflicts in Teams**
   - Solution: Regularly sync and resolve conflicts early

---
```

## ��� Secure File Uploads with Pre-Signed URLs (AWS S3)

### Overview

This feature enables secure, scalable file uploads using AWS S3 pre-signed URLs. Instead of uploading files through your backend server (which consumes bandwidth and limits throughput), files are uploaded directly to S3 using temporary, cryptographically signed URLs. This approach provides:

✅ **Security**: Files never pass through your backend; credentials are not exposed to clients  
✅ **Scalability**: Direct S3 uploads bypass your server, reducing load  
✅ **Cost Efficiency**: Reduced bandwidth consumption on your backend  
✅ **Audit Trail**: File metadata stored in database for tracking and compliance  

### Architecture Diagram

```
┌─────────────┐                    ┌──────────────┐
│   Frontend  │                    │   Your API   │
│  (Browser)  │                    │   Backend    │
└──────┬──────┘                    └──────┬───────┘
       │                                  │
       │ (1) POST /api/upload             │
       │ {filename, size, type}           │
       ├─────────────────────────────────>│
       │                                  │
       │                    (2) Generate  │
       │              Pre-signed URL      │
       │              (AWS SDK)           │
       │                                  │
       │ (3) Return uploadURL             │
       │<─────────────────────────────────┤
       │                                  │
       │  (4) PUT file directly to S3     │
       │      using uploadURL             │
       ├─────────────────────────────────────────┐
       │                                         │
       │                              ┌──────────▼────────┐
       │                              │   AWS S3 Bucket   │
       │                              │  (Public-Read)    │
       │                              └───────────────────┘
       │
       │ (5) File uploaded successfully
       │ POST /api/files
       │ {fileName, fileURL, fileSize}
       ├─────────────────────────────────────────>
       │                                  │
       │                    (6) Save to   │
       │                    PostgreSQL    │
       │                                  │
       │ (7) Return file metadata        │
       │<─────────────────────────────────┤
       │
```

### Implementation Files

The following files were created/modified for file upload functionality:

- **[app/api/upload/route.ts](app/api/upload/route.ts)** - Generates pre-signed URLs for S3 uploads
- **[app/api/files/route.ts](app/api/files/route.ts)** - Manages file metadata storage and retrieval
- **[prisma/schema.prisma](prisma/schema.prisma)** - Added `File` model for database tracking
- **[.env.example](.env.example)** - AWS configuration template

### Setup Instructions

#### 1. Install Dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

#### 2. Configure AWS Credentials

Create an `.env.local` file with your AWS S3 credentials:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your-bucket-name
```

> **How to get AWS credentials:**
> 1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
> 2. Create a new IAM user with `AmazonS3FullAccess` permissions
> 3. Generate access keys (save them securely)
> 4. Add them to your `.env.local`

#### 3. Update Database

The Prisma schema includes a new `File` model:

```prisma
model File {
  id            String          @id @default(cuid())
  name          String
  url           String          @unique
  size          Int             
  fileType      String          
  uploadedAt    DateTime        @default(now())
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  expiresAt     DateTime?       

  userId        String
  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([uploadedAt])
}
```

Run migration:

```bash
npx prisma migrate dev --name add_file_model
```

### API Endpoints Reference

#### POST /api/upload - Generate Pre-Signed URL

Generates a temporary upload URL for direct S3 upload with validation.

**Request:**
```json
{
  "filename": "profile.png",
  "fileType": "image/png",
  "fileSize": 2048,
  "userId": "user_id_123"
}
```

**Response:**
```json
{
  "success": true,
  "uploadURL": "https://your-bucket.s3.ap-south-1.amazonaws.com/uploads/user_id_123/1234567890-abc123.png?X-Amz-Signature=...",
  "fileURL": "https://your-bucket.s3.ap-south-1.amazonaws.com/uploads/user_id_123/1234567890-abc123.png",
  "s3Key": "uploads/user_id_123/1234567890-abc123.png",
  "expiresIn": 3600
}
```

**Key Features:**
- ✅ File type whitelist validation (JPEG, PNG, GIF, WebP, PDF, TXT, DOC, DOCX)
- ✅ File size validation (1 byte to 10 MB)
- ✅ Unique S3 key generation per user per upload
- ✅ Pre-signed URL valid for 1 hour

#### POST /api/files - Store File Metadata

Saves file metadata to PostgreSQL after successful S3 upload.

**Request:**
```json
{
  "fileName": "profile.png",
  "fileURL": "https://your-bucket.s3.ap-south-1.amazonaws.com/...",
  "fileSize": 2048,
  "fileType": "image/png",
  "userId": "user_id_123",
  "expiresAt": "2026-03-04T10:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file_123",
    "name": "profile.png",
    "url": "https://...",
    "fileType": "image/png",
    "size": 2048,
    "userId": "user_id_123",
    "uploadedAt": "2026-02-02T10:00:00Z"
  }
}
```

#### GET /api/files - List User's Files

Retrieves files for a user with pagination and sorting.

**Query Parameters:**
```
GET /api/files?userId=user_id_123&page=1&limit=10&sortBy=uploadedAt&sortOrder=desc
```

#### DELETE /api/files - Delete File

Removes a file record from database.

**Query Parameters:**
```
DELETE /api/files?fileId=file_id_123
```

### Complete Upload Flow Example

**Frontend Implementation:**

```typescript
// Step 1: Request pre-signed URL
const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: 'profile.png',
    fileType: 'image/png',
    fileSize: file.size,
    userId: 'user_id_123',
  }),
});

const { uploadURL, fileURL } = await uploadResponse.json();

// Step 2: Upload directly to S3
const s3Response = await fetch(uploadURL, {
  method: 'PUT',
  headers: { 'Content-Type': 'image/png' },
  body: file,
});

// Step 3: Store metadata
if (s3Response.ok) {
  const dbResponse = await fetch('/api/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: 'profile.png',
      fileURL: fileURL,
      fileSize: file.size,
      fileType: 'image/png',
      userId: 'user_id_123',
    }),
  });
  
  const fileData = await dbResponse.json();
  console.log('Upload complete:', fileData);
}
```

### File Type & Size Validation

**Allowed Types:**
- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, TXT, DOC, DOCX

**Size Limits:**
- Minimum: 1 byte
- Maximum: 10 MB

Edit limits in [app/api/upload/route.ts](app/api/upload/route.ts#L16-L35).

### Pre-Signed URL Expiry & Security

**URL Expiration:** 1 hour (3600 seconds)
- Prevents unauthorized access if URL is leaked
- Each request generates a new unique URL

**Cryptographic Signing:**
- URLs signed with AWS private key
- Tampering invalidates signature
- S3 rejects expired/invalid requests

**Access Control:**
- Current: `public-read` (anyone with URL can access)
- Optional: Remove ACL for private files, use signed read URLs

### Lifecycle Management & Cost Optimization

**S3 Lifecycle Policy** automatically deletes old files:

Configure in AWS S3 Console:
1. Select bucket → Management → Lifecycle rules
2. Create rule to expire objects after 30 days
3. Apply to `uploads/` prefix

**Benefits:**
- ��� Reduces storage costs
- ���️ Maintains data hygiene
- ��� Auto-deletes sensitive files
- ♻️ Minimizes S3 bill

**Database Cleanup** (Optional):
```typescript
// Scheduled job to remove expired DB records
const expired = await prisma.file.deleteMany({
  where: { expiresAt: { lt: new Date() } },
});
```

### Security Considerations

#### Public vs. Private File Access

| Aspect | Public | Private |
|--------|--------|---------|
| **Access** | Anyone with URL | Authenticated users only |
| **Use Case** | Profiles, galleries | Invoices, contracts, docs |
| **Setup** | `ACL: "public-read"` | Remove ACL, use read URLs |
| **Cost** | Slightly higher | Lower (controlled) |

#### Key Security Features

- ✅ **SQL Injection Prevention**: Prisma parameterized queries
- ✅ **File Validation**: Whitelist types, validate size server-side
- ✅ **Unique Keys**: Sanitized filenames prevent collisions
- ✅ **HTTPS**: All URLs use HTTPS by default
- ✅ **Rate Limiting**: Add per-user upload limits in production
- ✅ **Access Logs**: Enable S3 access logging for audit trails

### Testing the Upload Feature

**Using cURL:**

```bash
# Step 1: Get pre-signed URL
UPLOAD_RESPONSE=$(curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test.png",
    "fileType": "image/png",
    "fileSize": 2048,
    "userId": "test-user"
  }')

UPLOAD_URL=$(echo $UPLOAD_RESPONSE | jq -r '.uploadURL')
FILE_URL=$(echo $UPLOAD_RESPONSE | jq -r '.fileURL')

# Step 2: Upload to S3
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: image/png" \
  --data-binary @test.png

# Step 3: Save metadata
curl -X POST http://localhost:3000/api/files \
  -H "Content-Type: application/json" \
  -d "{
    \"fileName\": \"test.png\",
    \"fileURL\": \"$FILE_URL\",
    \"fileSize\": 2048,
    \"fileType\": \"image/png\",
    \"userId\": \"test-user\"
  }"
```

**Verify Success:**
- ✅ File accessible in browser (paste fileURL)
- ✅ Visible in AWS S3 console
- ✅ Record in PostgreSQL: `SELECT * FROM "File" WHERE name='test.png'`

### Common Issues & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `AccessDenied` | Invalid credentials | Check `.env.local`, regenerate IAM keys |
| `NoSuchBucket` | Wrong bucket name | Verify `AWS_BUCKET_NAME` |
| `SignatureDoesNotMatch` | Expired/tampered URL | URLs expire in 1h, regenerate |
| `403 Forbidden` | File not public | Add `ACL: "public-read"` |
| `Duplicate URL` | File already exists | Unique constraint prevents duplicates |

### Best Practices

1. ✅ Validate file type & size **server-side** (never trust client)
2. ✅ Use unique file names: `uploads/{userId}/{timestamp}-{random}.ext`
3. ✅ Set short expiry on pre-signed URLs (1 hour is good)
4. ✅ Always store metadata in DB for audit trails
5. ✅ Implement lifecycle policies for cleanup
6. ✅ Monitor S3 costs via CloudWatch
7. ✅ Use HTTPS everywhere (browser → API → S3)
8. ✅ Enable S3 access logging for security audits

### Summary Table

| Feature | Benefit | Implementation |
|---------|---------|-----------------|
| **Pre-signed URLs** | Direct S3 uploads, no server bottleneck | AWS SDK `getSignedUrl()` |
| **File Validation** | Prevents malicious uploads | Type whitelist, size check |
| **DB Tracking** | Audit trail for compliance | Prisma `File` model |
| **Lifecycle Policies** | Auto-delete old files, reduce costs | S3 lifecycle rules |
| **Public Access** | Shareable URLs for collaboration | `ACL: "public-read"` |
| **Signed URLs** | Cryptographic authenticity | AWS signature algorithm |

---

---

## Public & Protected Routing with Dynamic Segments

### Overview

This section documents the Next.js App Router implementation for public and protected routes, including dynamic segments for parameterized pages, navigation with breadcrumbs, and custom error handling.

### Route Structure

```
app/
├── page.tsx                      → Home (public)
├── login/
│    └── page.tsx                 → Public login page
├── dashboard/
│    └── page.tsx                 → Protected dashboard
├── users/
│    ├── page.tsx                 → Protected user list
│    └── [id]/
│         └── page.tsx            → Dynamic user profile (e.g., /users/1, /users/2)
├── not-found.tsx                 → Custom 404 page
└── layout.tsx                    → Root layout with navigation
```

### Route Map

| Route | Type | Description | Access |
|-------|------|-------------|--------|
| `/` | Public | Home page with navigation info | Everyone |
| `/login` | Public | Login page with mock authentication | Everyone |
| `/dashboard` | Protected | Dashboard after login | Authenticated users only |
| `/users` | Protected | List of all users | Authenticated users only |
| `/users/[id]` | Dynamic | Individual user profile | Authenticated users only |
|||||||||||||||||||||||||||||||||||||||||||||||||||||||||ntation Details

###########################################################sx
impoimpoimpoimpoimpoimpliimpoimpoimpoimpoimpoimpliimpoimpoimpoimpoimpoimpliimpoimpoimpoMetadata = {
  title: "App Router Demo - Home",
  description: "Welcome to the Next.js App Router routing demo",
};

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to the App 🚀</h1>
        <p className="text-xl text-gray-600 mb-8">
          This demo showcases Next.js App Router with public and protected routes.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg">
            Go to Login
          </Link>
          <Link href="/dashboard" className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg">
            Try Dashboard (Protected)
          </Link>
        </div>
      </div>
    </main>
  );
}
```

**Login Page (`app/login/page.tsx`):**
```tsx
"use client";

impoimpoimpoimpoimpoimpoimpoimpoimpoimpoimpoimpoimpoimpoimpoimpo "js-cookie";
import { useState } from "import { useState } from "import Loimport { useState } from "import { useState } from "import Loiming] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // Simulate login - set a mock JWT token in cookies
    Cookies    Cookies    Cookies    Cookies    Cookies    Cookies    Cookies    Cookid");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Login Page</h1>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
        >
          {loading ? "Logging in..." : "Login"}
        </b             </div>
    </main>
  );
  );
/main>
            </div>
n..." eware

The middleware prThe middleware prThe middleware prThe middleware prThe middleware prTh app/midThe middleware prThe middleware prThe middleware prThe middleware prThe middleware prTh app/midThe middleware prThe middleware prThe middleware prSECRET = process.env.JWT_SECRET |The middleware prThehaThe middleware prThe middleware prThe outes that require authentication (cookie-based)
 */
const FRONTEND_PROTECTED_ROUTES = ["/dashboard", "/users"];

fffffffffisFfffffffffisFfffffffffisFfffffffffisFfffffffffisFfffffffffisFfffffffffisFffffffffOUfffffffffisFfffffffffisFfffffffffisFfffffffffisFfffffffffisFfffffffffisFmCfffffffffisFfffffffffisFfffffffffisFfffffffffisFfffffffffisFfffffffffisFftokfffffffalue;
}



fffffffisFfffffffffisFfff strifffffffisFfffffffffisFff jwt.fffffffisFfffffffffisFfff strifffffffisFfffffffffisFff jwt.fffffffisFfffffffffisFfff strifffffffisFfffft)fffffffisponse {
  const loginUrl = new URL("/login", req.  const loginUrl.searchParams.set("redirect", req.nextUrl.pa  const loginUrl  N  const loe.r  const loginUrl = new URL("/login", req.  const loginUrl.searchParams.set("redirect", req.nextUrl.pa  const loginUrl  N  const loe.r  const loginUrl = new URL("/login", req.  const loginUrl.searchParams.set("redirect", req.nextUrl.pa  const loginUrl  N  const loe.r  const loginUrl = new URL("/login", req.  const loginUrl.searchParams.set("redirect", req.nextUrl.pa  const loginUectToL  const loginUrl = new URL("/login", req.  const loginUrl.     const loginUrl = new URL("/login", req.  const loginUrl.searchParams.set("redirect", req.nextUrl.pa  const loginUrl  N  const loe.r  const loginUrl = new URL("/login", req.  const loginUrl.searchParams.set("redirect", req.nextUrl.pa  const loginUrl  N  ],
};
````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````in````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````in````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````in````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````in````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````in`````````````````````````````````````````````````````````````````````````````````````````````````````umb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/users" className="hover:text-blue-600">Users</Link>
          <span>/</span>
          <span className="text-gray-900">Profile {id}</span>
        </nav>

        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {id}
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold">{userData.name}</h1>
              <p className="text-gray-500">{userData.email}</p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">User ID</dt>
              <dd className="text-lg font-medium">{userData.id}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Role</dt>
              <dd className=              <dd className=              <dd className=                </dl>
        </div>

                                                       className="mt-6 flex gap-4">
                                as                                as                                                          as                      <Link href={`/users/${parseInt(id) + 1}`} className="px-4 py-2 bg-blue-100 text-blue-700 rounded">
            Next User →
          </Link>
        </div>
                                   

*********************************************************************r *************************************************************`pa***************ives***************ram************************************************ m*************ser
---------------------------------------------------------------- Layout

**Root Layout with Navigation (`app/layout.tsx`):**
```tsx
import type { Metadataimport type { Meimimport type { Metadataimport type { Meimimport type { Metadainimport type { Metadataimport type { Meimimport type { Metadataimport type { Meimimport type { MetadainimtMimport type {onoimport type { Metadataimport type { Meimimport type { Metadataimport type { Meimter import type { Metadataimport type { Meimimport type { Metadataimport type { Meimimport type { Metadainimport type { Metadataimport type { Meimimport type { Metadataimport type { Meimimport type { MetadainimtMimport type {onoimport type { Metadatainoimport type { Metadatai}>
        {/* Navigation */}
        <nav className="flex items-center j        <nav className="flex items-center j        <nav className="flex items-center j        <nav className="flex items-center j        <nav className="flex items-center j        <nav className="flex items-center j        <nav className"f        <nav className="flex items-center j        <nav className="fler:t        <nav className="flex items-center j       </     
              <Link href="/login" className="text-gray-600 hover:text-blue-600">
                Login
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/users" className="text-gray-600 hover:text-blue-600">
                Users
              </Link>
              <Link href="/users/1" className="text-gray-600 hover:text-blue-600">
                User 1
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
```

#### 5. Custom 404 Error Page

**Not Found Page (`app/not-found.tsx`):**
```tsx
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you're looking for doesn't exist",
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6"    <main className="min-h-screen flex flex-col items-center justify-center p-6xt-6xl font-bold text-re    <main className=
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Page Not           Page Not                  Page Noext-g          Page Not           Page Not                  Page Noext-g          Pa been moved.
        </p          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                              </Link>
          <Link href="/login" className= px-6          <Link href="/login700          <Link href="/login" className=       to          <Link h</Link>
                                  main>
  );
}
```

### Testing the Routes

#### 1. Test Public Routes

```b```b```b```b```b```b```b```b```b```b```b```b```b```b```b``
# Log# Log# Log# Log# Log# Log# Log# Logocalhost:3000# Log# Log# Log# Log# Log# Log# Log# Logocalhost:3000# Log# Log# Log# Log# Log# Log# Log# Logocalhost:3000# Log# Log# Log# Log# Log# Log# Log# Logocalhost:3000# Log# Log# Log# Log# Log# Log# Log# Logocase# Log# Log# Log# Log# Log# Log# Log# Logocalhttp://localhost:3000/u# Log# Log# Log# Log# Log# Log# Log# Logocalhost:3000# Log# Log# Log# Log# Log# Log# Log# Logocalhost:3000# Log# Log# Log# Log# Log# Log# Log# Logocalho302: HT# Log# Log# Log# Log# Log# Log# Log# Logocalhost:3000# Log# Log# Log# Log# Lo)

**Usin**Usin**Usin**Usin**Usin**Usin**Usin**Usin**Usin**Usin**Usin**Usin**Usin**Usin**Usgate to `/dashboar**Usin**Usin**Usin**Usin**Usin**Usinte**Usin**Usin**Usin**Usin**Usin**Usin**Usin**Usin**Usin**Usin**Usin**Usinh
# Non-existent route
curl http://localhost:3000/non-existent-page
# Response# Response# Response# Response# Reflection: SEO, Navigation, and Error Handl# Response# Response# Resof Next.js App Router

1. **Server-Side Rendering (SSR)**
   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   - Pag   -iptions
   - Improves search engine ranking for individual user profiles

3. **Semantic HTML**
   - Proper heading hierarchy (h1, h2, etc.)
   - Accessible navigation landmarks
   - ARIA labels on interactive elements

4. **Performance**
   - Aut   - Aut   - Aut   - Aut   - Ae
   - Optimized images with `next/image`
   - Faster page loads improve SEO ranking

#### How Breadcrumbs Improve Navigation

1. **User Orientation*1. **User Or can easily understand their current location in the site hierarchy
   - Quick navigation back to parent pages

2. **SEO Benefits**
   - Breadcrumb structured data helps search engines understand site structure
   - Enhanced search result snippets with breadcrumb paths

3. **Implementation Example:**
   ```tsx
   <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
     <Link href="/">Home</Link>
     <span>/</span>
     <Link href="/users">Users</Link>
     <span>/</span>
     <span>Profile {id}</span>
   </nav>
   ```

4. **Accessibility**
   - Screen readers announc   - Screen readers announc   - Screen readers announc   - Scandling Route-Level Error States Gracefully

1. **Custom 404 Page (`app/not-found.tsx`)**
   - Provides mean   - Provides mean   - Provides mean   tio   - Proatives (Hom   - Provides mean   - Provides ent desi   - Provides mean   - Provides mean  ov   - Provides mean   - Provides mean   - 

222222222222222222222222222222222222222nau222222222222222222222222222222222222222nau222222222222222222222222222222222222222nau222222222222222ash22222222222222222222222222222222222on
   - G   - G   - G   - Gn    - G   - G   - G   - Gn    - G   - G   - G   - Gn    - G   - G   - G   - Gnie   - G   - G   - G   - Gn    - G   - G   - G   - Gn    - ata   - G   - G   - G   - Gn    y    - rn**
   ```tsx
   // For client-side errors
   error.tsx (Next.js error boundary)
   ```
   - Catches and display   - Catches and dra   - Catches and display   - Catcheers   - Catches and ope   - Catches and display   back   - Ca- D shboard shows "Not logged in" state instead of error
   - User profiles fall back to basic display when data unavailable
   - No sensitive information exposed in   - No sensitive information expo

| Aspect | Implementation | Benefit |
|--------|---------------|---------|
| **Public Routes** | `/`, `/login` | No auth required, accessible to all |
| **Protected Routes** | `/dashboard`, `/users` | Middleware| **Protected Routes** | `/dashboard`, `/users` | Middleware| **Protected Routes** | `/dashboard`, `/users` | Middleware| **Protected Routes** | `/dashboard`, `/users` | Middlewaved search engine visibility |
| **Navigation** | Breadcrumbs in layout | Better user orientation and UX |
| **Error Handling** | Custom 404, middleware redirects | Graceful degradation, better UX |

---

