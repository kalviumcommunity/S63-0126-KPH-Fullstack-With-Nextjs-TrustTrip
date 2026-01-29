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

## Input Validation with Zod

TrustTrip implements comprehensive **runtime input validation** using **Zod** for all POST API endpoints. This ensures data integrity, prevents invalid data from reaching the database, and provides clear, actionable error messages to API consumers.

### Why Input Validation Matters

In team projects, robust input validation is critical for:

- **Data Integrity**: Prevents corrupt or invalid data from entering the system
- **Security**: Blocks malicious payloads and injection attacks  
- **User Experience**: Provides clear error messages instead of cryptic database errors
- **Team Productivity**: Catches integration issues early in development
- **API Reliability**: Ensures consistent behavior across all endpoints
- **Documentation**: Validation schemas serve as living API documentation

### Validation Architecture

#### Shared Schema Location
All validation schemas are centralized in `lib/schemas/api-schemas.ts`:

```typescript
// Example: User creation schema
export const createUserSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, "Please provide a valid phone number").optional(),
});
```

#### Error Response Structure
All validation errors follow a consistent format:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "name", 
      "message": "Name must be at least 2 characters long"
    }
  ]
}
```

### Validation Rules by Endpoint

#### POST /api/users
- **email**: Required, valid email format
- **name**: Required, 2-100 characters
- **password**: Required, 6-100 characters
- **bio**: Optional, max 500 characters
- **phone**: Optional, valid phone number format
- **profileImage**: Optional, valid URL format

#### POST /api/projects
- **title**: Required, 3-200 characters
- **destination**: Required, 2-100 characters  
- **startDate**: Required, valid date, must be in future
- **endDate**: Required, valid date, must be after startDate
- **budget**: Optional, positive number, max $1,000,000
- **currency**: Optional, valid 3-letter currency code (default: USD)
- **userId**: Required, valid CUID format

#### POST /api/bookings
- **quantity**: Required, positive integer, max 50
- **totalPrice**: Required, positive number, max $100,000
- **userId**: Required, valid CUID format
- **projectId**: Required, valid CUID format

#### POST /api/payments
- **amount**: Required, positive number, max $100,000
- **paymentMethod**: Required, one of: credit_card, debit_card, paypal, bank_transfer, cash
- **transactionId**: Required, 10-100 characters, must be unique
- **currency**: Optional, valid 3-letter currency code
- **userId**, **projectId**, **bookingId**: Required, valid CUID format

#### POST /api/reviews  
- **rating**: Required, integer between 1-5
- **comment**: Optional, max 1000 characters
- **userId**, **projectId**: Required, valid CUID format

#### POST /api/refund
- **reason**: Required, 10-500 characters
- **paymentId**, **userId**: Required, valid CUID format

### Schema Reuse & Type Safety

Zod schemas provide **TypeScript type inference** for both server and client code:

```typescript
// Inferred TypeScript types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// Usage in API routes
const validatedData: CreateUserInput = createUserSchema.parse(body);

// Usage in client code (future implementation)
const userData: CreateUserInput = {
  email: "user@example.com",
  name: "John Doe", 
  password: "secure123"
};
```

### Example Validation Scenarios

**Valid Request:**
```bash
curl -X POST http://localhost:3000/api/users \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "password123"
  }'
```

**Invalid Request (multiple errors):**
```bash
curl -X POST http://localhost:3000/api/users \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "invalid-email",
    "name": "J", 
    "password": "123"
  }'
```

**Validation Error Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "name",
      "message": "Name must be at least 2 characters long" 
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters long"
    }
  ]
}
```

### Testing Validation

For comprehensive validation testing examples, see [ZOD_VALIDATION_EXAMPLES.md](ZOD_VALIDATION_EXAMPLES.md).

### Benefits of This Implementation

1. **Prevents Invalid Data**: No corrupt data reaches the database
2. **Consistent Error Format**: All endpoints return errors in the same structure
3. **Type Safety**: Full TypeScript integration with inferred types
4. **Reusable Schemas**: Same validation logic can be used across server and client
5. **Clear Error Messages**: Users get specific, actionable feedback
6. **Schema Evolution**: Easy to update validation rules as requirements change
7. **Team Collaboration**: Schemas serve as API contracts between frontend/backend teams

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
