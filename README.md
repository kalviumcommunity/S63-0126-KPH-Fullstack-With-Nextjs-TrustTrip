# TrustTrip

## Project Title & Problem Statement

**TrustTrip** is a web-based transparency system designed to address the lack of clarity in intercity bus ticket cancellation and refund processes.

Currently, passengers often do not understand how refund amounts are calculated or why deductions occur, which leads to confusion and mistrust. TrustTrip focuses on **explainability** by simulating a rule-based refund system that clearly shows _how_ and _why_ a refund amount is generated.

---

## Folder Structure & Explanation

trusttrip/
├── app/
│ ├── page.tsx # Main landing page (UI entry point)
│ ├── layout.tsx # Root layout shared across pages
│ └── api/
│ └── refund/
│ └── route.ts # Backend API route for refund logic
├── public/ # Static assets (kept minimal)
├── README.md # Project documentation
├── package.json # Project dependencies and scripts
├── tsconfig.json # TypeScript configuration
└── next.config.js # Next.js configuration

**Explanation:**

- `app/` contains both frontend pages and backend API routes using the Next.js App Router.
- `app/api/refund/route.ts` serves as the backend entry point for refund-related operations.
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

## Reflection

This project follows Next.js best practices by combining frontend and backend logic in a single codebase.
This structure helps the team scale the application in future sprints by:
- Enabling parallel development of UI and API layers
- Reducing context switching between multiple repositories
- Making it easier to integrate databases, caching, and authentication later
- Keeping the codebase modular, clean, and maintainable

By starting with a minimal but structured foundation, TrustTrip is well-prepared for iterative feature additions.

---

<<<<<<< HEAD
## GitHub Workflow

This project follows a standardized GitHub branching and pull-request workflow to ensure smoother collaboration, consistent code quality, and clear version control practices.

### Branching Strategy

We follow a consistent naming convention for branches:

- `feature/<feature-name>` - For new features (e.g., `feature/login-auth`)
- `fix/<bug-name>` - For bug fixes (e.g., `fix/navbar-alignment`)
- `chore/<task-name>` - For maintenance tasks (e.g., `chore/update-dependencies`)
- `docs/<update-name>` - For documentation updates (e.g., `docs/readme-improvements`)

### Pull Request Process

All changes must go through a pull request review process:

1. Create a branch following the naming convention above
2. Make your changes and commit them
3. Push your branch to the repository
4. Create a pull request using our template
5. Request review from team members
6. Address any feedback
7. Merge after approval (protected branch rules apply)

### Code Review Checklist

All reviewers must verify these points before approving a PR:

- [ ] Lint and build pass successfully
- [ ] No console errors or warnings
- [ ] Functionality tested locally
- [ ] Code follows naming conventions and style guidelines
- [ ] Code follows security best practices
- [ ] Documentation updated (if applicable)
- [ ] Tests added/updated (if applicable)

### Branch Protection Rules

The `main` branch is protected with the following rules:

- Required reviews before merge (at least 1 approval)
- Required passing checks (lint, test, build)
- Disallowing direct pushes to main

These rules ensure code quality and prevent accidental breaking changes to the main branch.
=======
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
>>>>>>> db4900354b5db96a30776a8011e8ac25ff94d0e9

⸻
```
