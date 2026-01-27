# Docker Quick Reference Guide

## TrustTrip Container Setup

### Essential Commands

```bash
# Start all containers (build if needed)
docker-compose up --build

# Start containers (existing images)
docker-compose up

# Stop all containers
docker-compose down

# Stop and remove data volumes
docker-compose down -v

# View running containers
docker ps

# View container logs
docker-compose logs -f          # All services
docker-compose logs -f app      # Just the app
docker-compose logs -f db       # Just the database
docker-compose logs -f redis    # Just Redis

# Connect to services
docker-compose exec db psql -U postgres -d mydb
docker-compose exec redis redis-cli

# Rebuild a specific service
docker-compose build app
```

### Service Endpoints (Local Development)

| Service | Host | Port | Connection String |
|---------|------|------|-------------------|
| **Next.js App** | http://localhost | 3000 | http://localhost:3000 |
| **PostgreSQL** | localhost | 5432 | `postgres://postgres:password@db:5432/mydb` |
| **Redis** | localhost | 6379 | `redis://localhost:6379` |

### Environment Variables

```
DATABASE_URL=postgres://postgres:password@db:5432/mydb
REDIS_URL=redis://redis:6379
```

### File Structure

```
project-root/
├── Dockerfile              # App containerization recipe
├── docker-compose.yml      # Multi-service orchestration
├── .dockerignore          # Files excluded from Docker build
├── README.md              # Full documentation
└── app/
    ├── page.tsx           # Frontend
    └── api/
        └── refund/
            └── route.ts   # Backend API
```

### Common Issues & Quick Fixes

| Issue | Command |
|-------|---------|
| Port 3000 in use | Change `"3001:3000"` in docker-compose.yml |
| Database won't connect | `docker-compose logs db` to see errors |
| Slow builds | Create `.dockerignore` to exclude unnecessary files |
| Container exits | `docker-compose logs app` to check error |
| Disk full | `docker system prune -a` to clean up |

### Health Checks

All services include health checks. Verify status:

```bash
docker-compose ps
```

Services should show `running` with healthy status.

### First-Time Setup

1. Clone repository
2. Run `docker-compose up --build`
3. Wait for "ready to accept connections" message in logs
4. Open http://localhost:3000
5. Done! ✅

### Stopping & Cleaning

```bash
# Graceful shutdown
docker-compose down

# Full cleanup (removes data)
docker-compose down -v

# Remove unused Docker resources
docker system prune -a
```

### For Production

See README.md section "Environment Variables" for securing credentials with `.env` files.
