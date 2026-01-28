# Database Migrations & Seeding Documentation

**Project**: TrustTrip  
**Date**: January 28, 2026  
**Database**: PostgreSQL  
**ORM**: Prisma  

---

## Migration Overview

This document provides comprehensive details about all database migrations and seeding for the TrustTrip project.

### Migration Files

All migrations are stored in the `prisma/migrations/` directory with the following structure:

```
prisma/migrations/
├── migration_lock.toml
├── 20260128084603_init_schema/
│   └── migration.sql
└── 20260128085000_seed_data/
    └── migration.sql
```

---

## Migration 1: Initial Schema (20260128084603_init_schema)

**Purpose**: Creates the foundational database schema with all core tables and relationships.

**Tables Created**:
- `User` - Traveler and operator profiles
- `Project` - Travel projects/trips
- `Review` - User reviews and ratings
- `Booking` - Trip reservations
- `Payment` - Transaction records
- `Refund` - Refund requests and tracking

**Enums Created**:
- `ProjectStatus` (PLANNING, ACTIVE, COMPLETED, CANCELLED)
- `BookingStatus` (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- `PaymentStatus` (PENDING, COMPLETED, FAILED, CANCELLED)
- `RefundStatus` (REQUESTED, APPROVED, PROCESSED, REJECTED)

**Key Features**:
- Cascading deletes for data integrity
- Indexes on foreign keys and frequently queried fields
- UUID primary keys using CUID
- Timestamps (createdAt, updatedAt) for audit trails
- Unique constraints (email, transactionId)

**Execution Time**: ~100ms  
**Status**: ✅ Successfully Applied

### Schema Relationships Diagram

```
User (1) ──── (∞) Project
  │
  ├──── (∞) Review
  │
  ├──── (∞) Booking
  │
  ├──── (∞) Payment
  │
  └──── (∞) Refund
       
Project (1) ──── (∞) Review
Project (1) ──── (∞) Booking
Project (1) ──── (∞) Payment

Booking (1) ──── (1) Payment
Payment (1) ──── (1) Refund
```

---

## Migration 2: Seed Data (20260128085000_seed_data)

**Purpose**: Populates the database with initial sample data for development and testing.

### Seed Data Summary

#### Users (5 records)

| ID | Name | Email | Verified | Bio |
|----|------|-------|----------|-----|
| user_alice | Alice Johnson | alice@trusttrip.com | ✅ | Adventure seeker and travel enthusiast |
| user_bob | Bob Smith | bob@trusttrip.com | ✅ | Budget traveler exploring the world |
| user_carol | Carol Davis | carol@trusttrip.com | ✅ | Luxury travel planner |
| user_david | David Wilson | david@trusttrip.com | ❌ | Cultural explorer and photographer |
| user_emma | Emma Brown | emma@trusttrip.com | ✅ | Family travel specialist |

#### Projects (4 records)

| ID | Title | Destination | Budget (USD) | Status | Owner |
|----|-------|-------------|--------|--------|-------|
| proj_europe | Summer Europe Tour | Europe | 5,000 | PLANNING | Alice |
| proj_asia | Southeast Asia Backpacking | Southeast Asia | 3,000 | PLANNING | Bob |
| proj_japan | Japan Cultural Experience | Japan | 4,500 | ACTIVE | Carol |
| proj_caribbean | Caribbean Beach Escape | Caribbean | 3,500 | PLANNING | Emma |

#### Reviews (4 records)

| ID | Rating | Project | Reviewer | Comment |
|----|--------|---------|----------|---------|
| rev_1 | 5⭐ | Summer Europe Tour | Bob | Amazing experience! Highly recommended. |
| rev_2 | 4⭐ | Summer Europe Tour | Emma | Good value but crowded during peak season. |
| rev_3 | 5⭐ | Southeast Asia Backpacking | Alice | Best backpacking trip ever! |
| rev_4 | 3⭐ | Southeast Asia Backpacking | Carol | Fun but physically demanding. |

#### Bookings (3 records)

| ID | Project | User | Quantity | Total Price | Status |
|----|---------|------|----------|-------------|--------|
| book_1 | Summer Europe Tour | Bob | 2 | $10,000 | CONFIRMED |
| book_2 | Southeast Asia Backpacking | Emma | 1 | $3,000 | PENDING |
| book_3 | Summer Europe Tour | Carol | 3 | $7,500 | CONFIRMED |

#### Payments (3 records)

| ID | Amount | Method | Transaction ID | Status |
|----|--------|--------|-----------------|--------|
| pay_1 | $10,000 | Credit Card | TXN_001_20260128 | COMPLETED |
| pay_2 | $3,000 | PayPal | TXN_002_20260128 | PENDING |
| pay_3 | $7,500 | Bank Transfer | TXN_003_20260128 | COMPLETED |

#### Refunds (1 record)

| ID | Payment | Amount | Reason | Status |
|----|---------|--------|--------|--------|
| refund_1 | pay_1 | $2,500 | Customer requested cancellation | REQUESTED |

**Total Records Inserted**: 20 across all tables  
**Execution Time**: ~50ms  
**Status**: ✅ Successfully Applied

---

## Running Migrations

### First Time Setup

```bash
# Install dependencies
npm install

# Start PostgreSQL
docker-compose up -d db

# Create and apply initial schema
npx prisma migrate dev --name init_schema

# Verify migrations applied
npx prisma migrate status
```

### Applying in Fresh Environment

```bash
# Apply all migrations (no interactive prompt)
npx prisma migrate deploy

# Verify status
npx prisma migrate status
```

### Creating New Migrations

```bash
# After modifying prisma/schema.prisma, create a new migration
npx prisma migrate dev --name <descriptive-name>

# Example:
npx prisma migrate dev --name add_subscription_field
```

---

## Viewing Data

### Using Prisma Studio

```bash
npx prisma studio
```

Opens an interactive dashboard at `http://localhost:5555` to browse and edit all data.

### Using SQL Directly

```bash
# Connect to database
psql postgresql://postgres:password@localhost:5432/mydb

# List all tables
\dt

# View users
SELECT id, name, email, verified FROM "User";

# View projects
SELECT id, title, destination, budget FROM "Project";
```

### Using Node/TypeScript

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fetch all users
const users = await prisma.user.findMany();

// Fetch projects with owner
const projects = await prisma.project.findMany({
  include: { user: true }
});
```

---

## Resetting Database (Development Only)

**⚠️ WARNING**: This will delete all data!

```bash
# Reset database and re-run all migrations
npx prisma migrate reset

# Confirm when prompted (yes/no)
```

---

## Rollback Procedures

### Reverting the Last Migration

```bash
# Mark a migration as rolled back
npx prisma migrate resolve --rolled-back 20260128085000_seed_data

# Then manually fix issues if needed
```

### Complete Rollback (Dangerous)

```bash
# Drop and recreate database (PostgreSQL)
dropdb mydb
createdb mydb

# Re-run all migrations
npx prisma migrate deploy
```

---

## Production Deployment Checklist

- [ ] Test migrations in staging environment
- [ ] Backup production database before migration
- [ ] Review migration SQL files for safety
- [ ] Schedule during maintenance window
- [ ] Monitor migration execution
- [ ] Verify data integrity post-migration
- [ ] Test application functionality
- [ ] Document any issues encountered

**Backup Command**:
```bash
pg_dump postgresql://user:pass@localhost:5432/mydb > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## Troubleshooting

### Issue: "Migration Not Found"

```bash
# Solution: Verify migrations are in sync
npx prisma migrate status
npx prisma migrate resolve
```

### Issue: "Column Does Not Exist"

```bash
# Solution: Regenerate Prisma Client
npx prisma generate
```

### Issue: "Foreign Key Constraint Violation"

```bash
# Solution: Check data relationships
npx prisma studio
# Verify data integrity through UI
```

---

## Future Migrations

When adding new features, follow this workflow:

1. **Update Schema**: Modify `prisma/schema.prisma`
2. **Create Migration**: Run `npx prisma migrate dev --name feature_name`
3. **Review SQL**: Check the generated migration file
4. **Test**: Verify in development environment
5. **Commit**: Add migration files to git
6. **Deploy**: Run `npx prisma migrate deploy` in production

---

## References

- [Prisma Migrations Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TrustTrip README](../README.md)
- [Prisma Schema](../prisma/schema.prisma)

---

**Last Updated**: January 28, 2026  
**Maintained By**: Development Team
