# Prisma & Migrations Quick Reference

**Quick Start for TrustTrip Database Operations**

---

## 🚀 Getting Started (First Time)

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL database (Docker)
docker-compose up -d db

# 3. Apply all migrations
npx prisma migrate deploy

# 4. Open data explorer
npx prisma studio
```

---

## 📝 Common Commands

### Viewing Data
```bash
# Interactive dashboard (recommended)
npx prisma studio

# Connect with SQL client
psql postgresql://postgres:password@localhost:5432/mydb
```

### Creating Migrations

```bash
# After modifying prisma/schema.prisma:
npx prisma migrate dev --name brief_description

# Example:
npx prisma migrate dev --name add_newsletter_subscription
```

### Checking Status
```bash
# See all migrations and their status
npx prisma migrate status
```

### Resetting Database (Development Only)
```bash
# ⚠️ DELETES ALL DATA
npx prisma migrate reset

# Then confirms to re-seed
```

---

## 🔍 Quick Queries

### Using TypeScript/Node.js
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all users
const users = await prisma.user.findMany();

// Get projects with owner
const projects = await prisma.project.findMany({
  include: { user: true }
});

// Create a user
const newUser = await prisma.user.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com'
  }
});
```

### Using SQL Directly
```sql
-- Connect first
psql postgresql://postgres:password@localhost:5432/mydb

-- View all users
SELECT * FROM "User";

-- View projects by status
SELECT * FROM "Project" WHERE status = 'PLANNING';

-- Count records
SELECT COUNT(*) FROM "User";
```

---

## 📊 Current Schema

### Tables (6 total)
- **User** - Traveler profiles
- **Project** - Travel projects/trips  
- **Review** - Ratings and feedback
- **Booking** - Trip reservations
- **Payment** - Transaction records
- **Refund** - Refund requests

### Enums (4 total)
- **ProjectStatus**: PLANNING, ACTIVE, COMPLETED, CANCELLED
- **BookingStatus**: PENDING, CONFIRMED, COMPLETED, CANCELLED
- **PaymentStatus**: PENDING, COMPLETED, FAILED, CANCELLED
- **RefundStatus**: REQUESTED, APPROVED, PROCESSED, REJECTED

---

## ⚠️ Important Notes

### Before Production Migration
```bash
# 1. Test in staging
npx prisma migrate deploy --environment staging

# 2. Backup production
pg_dump dbname > backup_$(date +%Y%m%d).sql

# 3. Review the SQL
cat prisma/migrations/<name>/migration.sql

# 4. Deploy during low traffic window
npx prisma migrate deploy
```

### If Something Goes Wrong
```bash
# Check status
npx prisma migrate status

# Regenerate client
npx prisma generate

# Reset (development only)
npx prisma migrate reset
```

---

## 📖 Full Documentation

- **Detailed Guide**: See [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md)
- **Implementation Details**: See [MIGRATIONS_IMPLEMENTATION_SUMMARY.md](MIGRATIONS_IMPLEMENTATION_SUMMARY.md)
- **README Section**: See [README.md#database-setup--migrations](README.md#database-setup--migrations)

---

## 🗂️ File Locations

```
project-root/
├── prisma/
│   ├── schema.prisma          ← Define schema here
│   ├── seed.js                ← Optional seed script
│   └── migrations/            ← Auto-generated SQL files
│       ├── 20260128084603_init_schema/
│       └── 20260128085000_seed_data/
├── .prisma/
│   └── client/                ← Generated Prisma Client
├── .env                       ← Database connection string
└── prisma.config.ts          ← Prisma configuration
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Database connection failed | Check `.env` DATABASE_URL and that `docker-compose up -d db` was run |
| "Migration not found" | Run `npx prisma migrate status` to sync |
| Type errors in code | Run `npx prisma generate` to regenerate client |
| Can't see recent changes | Restart your dev server or IDE TypeScript server |
| Seed data didn't apply | Run `npx prisma migrate deploy` |

---

## 💡 Pro Tips

1. **Always use migrations**: Never modify database directly with SQL
2. **Review SQL**: Read migration files before applying to production
3. **Test staging first**: Deploy to staging environment first
4. **Backup regularly**: Use `pg_dump` before major changes
5. **Use Prisma Studio**: Visual way to explore and edit data
6. **Commit migrations**: Always commit migration files to git

---

**Last Updated**: January 28, 2026  
**For Questions**: See DATABASE_MIGRATIONS.md or check Prisma docs
