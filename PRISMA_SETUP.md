# Prisma ORM Setup Guide

## Quick Start

### 1. Initialize Prisma
```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

### 2. Configure Database URL
Edit `.env` with your PostgreSQL connection:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/trusttrip_db"
```

### 3. Define Schema
Edit `prisma/schema.prisma` with your models:
```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String
  // ... relationships
}
```

### 4. Generate & Migrate
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Use in Code
```typescript
import { prisma } from '@/lib/prisma';

const users = await prisma.user.findMany();
```

---

## Schema Design Principles

### 1. Primary Keys
Every model should have a unique identifier:
```prisma
model Entity {
  id  Int  @id @default(autoincrement())
  // or
  id  String  @id @default(cuid())
}
```

### 2. Foreign Keys & Relations
Define relationships with proper cascading:
```prisma
model Task {
  id        Int
  projectId Int          // Foreign key
  project   Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

**Cascade Options:**
- `Cascade`: Delete child when parent is deleted
- `SetNull`: Set to NULL when parent is deleted
- `Restrict`: Prevent deletion of parent if children exist

### 3. Constraints
```prisma
model User {
  email String @unique              // Email must be unique
  name  String
  age   Int?                        // Optional field
  createdAt DateTime @default(now()) // Server-side default
}
```

### 4. Indexes for Performance
```prisma
model Post {
  id      Int
  userId  Int
  
  @@index([userId])  // Create index on userId
  @@unique([slug])   // Enforce unique constraint
}
```

---

## Common Query Patterns

### Read Operations

```typescript
// Find all
const users = await prisma.user.findMany();

// Find with filters
const activeUsers = await prisma.user.findMany({
  where: { status: 'ACTIVE' },
});

// Find with pagination
const page1 = await prisma.user.findMany({
  skip: 0,
  take: 10,
});

// Find with relations
const userWithProjects = await prisma.user.findUnique({
  where: { id: 1 },
  include: { projects: true },
});

// Find first or throw error
const user = await prisma.user.findUniqueOrThrow({
  where: { id: 1 },
});
```

### Write Operations

```typescript
// Create
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John',
  },
});

// Create with relations
const project = await prisma.project.create({
  data: {
    title: 'My Trip',
    userId: 1,
    tasks: {
      create: [
        { title: 'Task 1', userId: 1 },
      ],
    },
  },
});

// Update
const updated = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Jane' },
});

// Delete
await prisma.user.delete({
  where: { id: 1 },
});
```

### Aggregation

```typescript
// Count
const count = await prisma.user.count();

// Count with filter
const activeCount = await prisma.user.count({
  where: { status: 'ACTIVE' },
});

// Aggregate (min, max, avg, sum)
const stats = await prisma.task.aggregate({
  where: { projectId: 1 },
  _count: true,
  _avg: { estimatedHours: true },
});

// Group by
const groupedTasks = await prisma.task.groupBy({
  by: ['status'],
  _count: true,
});
```

---

## Advanced Topics

### Transactions

Execute multiple queries atomically:

```typescript
const result = await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.project.create({ data: projectData }),
]);

// Or with callback
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  const project = await tx.project.create({
    data: { ...projectData, userId: user.id },
  });
  return { user, project };
});
```

### Raw SQL

For complex queries:

```typescript
// Read
const result = await prisma.$queryRaw`
  SELECT u.*, COUNT(p.id) as projectCount
  FROM User u
  LEFT JOIN Project p ON u.id = p.userId
  GROUP BY u.id
`;

// Write
await prisma.$executeRaw`
  UPDATE Task SET status = 'COMPLETED' WHERE projectId = ${projectId}
`;
```

### Middleware (Hooks)

Execute code before/after queries:

```typescript
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  console.log(`Query ${params.action} took ${after - before}ms`);
  return result;
});
```

---

## Database Operations

### Create Database
```bash
# Using psql
psql -U postgres -c "CREATE DATABASE trusttrip_db;"

# Or in docker-compose
docker-compose up -d db
```

### Run Migrations
```bash
# Create and apply migration
npx prisma migrate dev --name init

# Apply existing migrations
npx prisma migrate deploy

# View migration status
npx prisma migrate status

# Reset database (DESTRUCTIVE)
npx prisma migrate reset
```

### Seed Database
Create `prisma/seed.ts`:

```typescript
import { prisma } from '@/lib/prisma';

async function main() {
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed_password',
    },
  });
  console.log('Seeded:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run with:
```bash
npx ts-node prisma/seed.ts
```

---

## Performance Best Practices

### 1. Select Only Needed Columns
```typescript
// ❌ Bad: Fetches all columns
const users = await prisma.user.findMany();

// ✅ Good: Only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
});
```

### 2. Use Indexes
```prisma
model Task {
  id        Int
  projectId Int
  userId    Int
  status    TaskStatus

  @@index([projectId])  // Query by project
  @@index([userId])     // Query by user
  @@index([status])     // Query by status
}
```

### 3. Avoid N+1 Queries
```typescript
// ❌ Bad: N+1 queries
const users = await prisma.user.findMany();
for (const user of users) {
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
  });
}

// ✅ Good: Single query
const users = await prisma.user.findMany({
  include: { projects: true },
});
```

### 4. Use Pagination
```typescript
const pageSize = 10;
const page = 1;

const users = await prisma.user.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' },
});
```

---

## Security Considerations

### 1. Never Hash Passwords in Prisma
```typescript
// ✅ Correct: Hash before storing
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 10);
const user = await prisma.user.create({
  data: { email, password: hashedPassword },
});
```

### 2. Always Use Parameterized Queries
```typescript
// ✅ Safe: Parameterized
const user = await prisma.user.findUnique({
  where: { email: userInput },
});

// ✅ Safe: Using $queryRaw with placeholders
const result = await prisma.$queryRaw`
  SELECT * FROM User WHERE email = ${userEmail}
`;
```

### 3. Never Expose Full Models in API
```typescript
// ❌ Bad: Exposes password
const user = await prisma.user.findUnique({ where: { id } });
res.json(user);

// ✅ Good: Select safe fields
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    name: true,
    // password is NOT selected
  },
});
res.json(user);
```

---

## Troubleshooting

### Issue: "PrismaClient is not available"
**Solution:** Run `npx prisma generate`

### Issue: Migration out of sync
**Solution:** 
```bash
npx prisma migrate resolve --rolled-back <migration-name>
npx prisma migrate dev
```

### Issue: Type errors after schema change
**Solution:**
```bash
npx prisma generate
npm run build
```

### Issue: Performance degradation
**Solution:**
1. Add indexes to frequently queried fields
2. Use `.select()` to fetch only needed columns
3. Use pagination for large result sets
4. Check Prisma logs: `log: ['query']`

---

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Prisma Studio Docs](https://www.prisma.io/docs/concepts/components/prisma-studio)
