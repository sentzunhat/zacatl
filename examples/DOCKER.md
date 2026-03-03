# Docker Deployment Guide

Comprehensive guide to deploying Zacatl examples with Docker.

## 🏗️ Architecture Overview

### Single Image = Backend + Frontend

**IMPORTANT**: Each example builds **ONE Docker image** that contains:

- ✅ Compiled backend (Express or Fastify)
- ✅ Compiled frontend (React or Svelte static files)
- ✅ All dependencies (including native modules like sqlite3)

**NOT** two separate images. The backend serves the static frontend files.

### Why This Matters

```
❌ WRONG ASSUMPTION:
   - One image for backend
   - Separate image for frontend
   - Two containers communicating

✅ ACTUAL ARCHITECTURE:
   - One image containing both
   - Backend serves frontend static files
   - One container running
```

---

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# SQLite examples (no database container needed)
cd examples/express-sqlite-react && docker compose up -d
cd examples/fastify-sqlite-react && docker compose up -d
cd examples/express-sqlite-svelte && docker compose up -d
cd examples/fastify-sqlite-svelte && docker compose up -d

# MongoDB examples (includes MongoDB container)
cd examples/express-mongodb-react && docker compose up -d
cd examples/fastify-mongodb-react && docker compose up -d

# PostgreSQL examples (includes PostgreSQL container)
cd examples/express-postgres-react && docker compose up -d
cd examples/fastify-postgres-react && docker compose up -d
```

### Test Endpoints

```bash
# Express SQLite (8181)
curl http://localhost:8181/greetings

# Fastify SQLite (8081)
curl http://localhost:8081/greetings
```

> **Note**: Svelte examples use the same ports as React examples (Express: 8181, Fastify: 8081)

# Express MongoDB (8182)

curl http://localhost:8182/greetings

# Fastify MongoDB (8082)

curl http://localhost:8082/greetings

# Express PostgreSQL (8183)

curl http://localhost:8183/greetings

# Fastify PostgreSQL (8083)

curl http://localhost:8083/greetings

````

---

## 📁 File Structure

Each example includes:

```text
{framework}-{database}-{ui}/
├── Dockerfile              # Multi-stage build
├── docker-compose.yml      # Single service definition
├── .dockerignore          # Build optimization
├── backend/               # API server
└── frontend/              # React or Svelte app (compiled to static)
````

---

## 🔧 Build Process Explained

### Multi-Stage Dockerfile

```dockerfile
# Stage 1: Builder (node:24-slim)
# - Install build tools (python3, make, g++)
# - Build framework (zacatl)
# - Build example backend + frontend
# - Rebuild native modules (sqlite3)

# Stage 2: Runtime (distroless)
# - Copy compiled code only
# - Copy framework build into node_modules
# - Copy framework dependencies
# - Copy source files needed at runtime (locales, eslint)
```

### Critical Build Script Detail

**⚠️ IMPORTANT**: The backend build script **MUST** include `dist` argument:

```json
// backend/package.json
{
  "scripts": {
    "build": "tsc && node ../../node_modules/@sentzunhat/zacatl/scripts/fix-esm.mjs dist"
  }
}
```

**Why?**

- `fix-esm.mjs` adds `.js` extensions to ESM imports
- Without `dist` argument, it scans wrong directory
- Missing `.js` extensions cause `ERR_MODULE_NOT_FOUND` in containers

### Native Modules

SQLite3 requires native compilation:

```dockerfile
# Install build tools
RUN apt-get update && apt-get install -y python3 make g++

# Rebuild for container architecture
RUN npm rebuild sqlite3
```

---

## 🌐 Port Configuration

| Framework | Database   | Backend Port | Container Name           | Example Path             |
| --------- | ---------- | ------------ | ------------------------ | ------------------------ |
| Fastify   | SQLite     | 8081         | fastify-sqlite-backend   | `fastify-sqlite-react`   |
| Express   | SQLite     | 8181         | express-sqlite-backend   | `express-sqlite-react`   |
| Fastify   | MongoDB    | 8082         | fastify-mongodb-backend  | `fastify-mongodb-react`  |
| Express   | MongoDB    | 8182         | express-mongodb-backend  | `express-mongodb-react`  |
| Fastify   | PostgreSQL | 8083         | fastify-postgres-backend | `fastify-postgres-react` |
| Express   | PostgreSQL | 8183         | express-postgres-backend | `express-postgres-react` |

**Database Container Ports:**

- MongoDB: 27017
- PostgreSQL: 5432

---

## 📝 docker-compose.yml Structure

### SQLite (No Database Container)

```yaml
services:
  backend:  # Name is "backend" but includes frontend too
    build:
      context: ../../..  # Repository root
      dockerfile: examples/{framework}-{database}-react/Dockerfile
    image: zacatl-{framework}-{database}
    container_name: {framework}-{database}-backend
    ports:
      - "{port}:{port}"
    environment:
      - NODE_ENV=production
      - PORT={port}
      - DATABASE_URL=sqlite:database.sqlite
    volumes:
      - ./data:/app/data  # Persist SQLite database
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:{port}/greetings').catch(() => process.exit(1))"]
    restart: unless-stopped

# No separate frontend service!
```

### MongoDB (With Database Container)

```yaml
services:
  mongodb:
    image: mongo:latest
    container_name: {framework}-mongodb-db
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: root
      MONGO_INITDB_DATABASE: appdb
    volumes:
      - mongo-data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
    restart: unless-stopped

  backend:
    image: zacatl-{framework}-mongodb
    container_name: {framework}-mongodb-backend
    ports:
      - "{port}:{port}"
    environment:
      - NODE_ENV=production
      - PORT={port}
      - MONGO_URI=mongodb://local:local@mongodb:27017/appdb  # Note: mongodb hostname
    depends_on:
      mongodb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:{port}/greetings').catch(() => process.exit(1))"]
    restart: unless-stopped

volumes:
  mongo-data:
```

**MongoDB Init Script (mongo-init.js):**

```javascript
db = db.getSiblingDB('appdb');
db.createUser({
  user: 'local',
  pwd: 'local',
  roles: [{ role: 'readWrite', db: 'appdb' }],
});
```

### PostgreSQL (With Database Container)

```yaml
services:
  postgres:
    image: postgres:16
    container_name: {framework}-postgres-db
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=local
      - POSTGRES_PASSWORD=local
      - POSTGRES_DB=appdb
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U local -d appdb"]
    restart: unless-stopped

  backend:
    image: zacatl-{framework}-postgres
    container_name: {framework}-postgres-backend
    ports:
      - "{port}:{port}"
    environment:
      - NODE_ENV=production
      - PORT={port}
      - DATABASE_URL=postgres://local:local@postgres:5432/appdb  # Note: postgres hostname
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:{port}/greetings').catch(() => process.exit(1))"]
    restart: unless-stopped

volumes:
  postgres-data:
```

**Key Differences from dev-env:**

- Container hostnames (`mongodb`, `postgres`) instead of `localhost`
- Backend depends on database health check
- Volumes for data persistence
- All services in one compose file per example

---

## 💻 Using Standalone dev-env

For local development, use the **`dev-env` docker-compose** to run just the databases:

```bash
# Start MongoDB + PostgreSQL databases
cd dev-env
docker compose up -d

# Run examples locally (they connect to localhost:27017 and localhost:5432)
cd ../examples/express-mongodb-react
npm install
npm run dev  # Connects to localhost:27017

cd ../examples/fastify-postgres-react
npm install
npm run dev  # Connects to localhost:5432
```

**Benefits:**

- ✅ Faster development (no Docker build on code changes)
- ✅ Better debugging (native Node.js process)
- ✅ Shared databases across all examples
- ✅ Matches production credentials (`local/local`)

**When to use example docker-compose instead:**

- Testing full containerized deployment
- Validating Dockerfile changes
- Simulating production environment
- CI/CD pipeline integration

---

## 🔍 Troubleshooting

### "Cannot find module" Errors

**Problem**: `ERR_MODULE_NOT_FOUND: Cannot find module './init-di'`

**Solution**: Check backend build script includes `dist`:

```bash
grep "fix-esm.mjs" backend/package.json
# Should output: "build": "tsc && node ../../node_modules/@sentzunhat/zacatl/scripts/fix-esm.mjs dist"
```

### "Cannot locate built-in locales directory"

**Problem**: Missing source files in Docker image

**Solution**: Dockerfile must copy source directories:

```dockerfile
COPY --from=builder /app/src/localization/locales ./node_modules/@sentzunhat/zacatl/src/localization/locales
COPY --from=builder /app/src/eslint ./node_modules/@sentzunhat/zacatl/src/eslint
```

### Native Module Binding Errors (sqlite3)

**Problem**: `Error: Could not locate the bindings file`

**Solution**: Rebuild in Dockerfile:

```dockerfile
RUN apt-get install -y python3 make g++
RUN npm rebuild sqlite3
```

### "version is obsolete" Warning

**Fix**: Remove `version: "3.8"` from docker-compose.yml (now handled automatically)

### Database Connection Refused

**Problem**: Backend can't connect to database container

**Solutions**:

1. **Check hostname in connection string:**

   - Docker Compose: Use container name (`mongodb`, `postgres`)
   - Local dev-env: Use `localhost`

   ```bash
   # Example docker-compose (containers talking to each other)
   MONGO_URI=mongodb://local:local@mongodb:27017/appdb

   # Local dev (app on host, database in container)
   MONGO_URI=mongodb://local:local@localhost:27017/appdb
   ```

2. **Wait for database health check:**

   ```yaml
   depends_on:
     mongodb:
       condition: service_healthy # ← This is critical
   ```

3. **Check database logs:**
   ```bash
   docker compose logs mongodb
   docker compose logs postgres
   ```

### Port Conflicts

**Problem**: `Bind for 0.0.0.0:{port} failed: port is already allocated`

**Solutions**:

- Another service is using that port (check with `lsof -i :{port}`)
- Another example is running (stop with `docker compose down`)
- dev-env database is running on same port (acceptable for databases, conflicts for backends)

---

## ✅ Validation Checklist

### SQLite Examples (Standalone)

```bash
cd examples/platform-{framework}/with-sqlite

# Build
docker compose build

# Start
docker compose up -d

# Wait for startup
sleep 5

# Check logs
docker compose logs backend

# Test API
curl -X POST http://localhost:{port}/greetings \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Docker", "language": "en"}'

curl http://localhost:{port}/greetings

# Cleanup
docker compose down
```

### MongoDB Examples (With Database)

```bash
cd examples/platform-{framework}/with-mongodb

# Build and start (database + backend)
docker compose up -d

# Wait for both services
sleep 10

# Check both logs
docker compose logs mongodb
docker compose logs backend

# Test API
curl -X POST http://localhost:{port}/greetings \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Docker MongoDB", "language": "en"}'

curl http://localhost:{port}/greetings

# Cleanup (removes containers and volumes)
docker compose down -v
```

### PostgreSQL Examples (With Database)

```bash
cd examples/platform-{framework}/with-postgres

# Build and start (database + backend)
docker compose up -d

# Wait for both services
sleep 10

# Check both logs
docker compose logs postgres
docker compose logs backend

# Test API
curl -X POST http://localhost:{port}/greetings \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Docker PostgreSQL", "language": "en"}'

curl http://localhost:{port}/greetings

# Cleanup (removes containers and volumes)
docker compose down -v
```

**Expected**: All endpoints return JSON responses with `"ok": true`

---

## 🎯 Key Takeaways for Agents/Developers

1. **One image per example** - not one for backend + one for frontend
2. **Build script must include `dist`** - critical for ESM imports
3. **Native modules need rebuild** - sqlite3 requires compilation in container
4. **Source files needed at runtime** - locales and eslint directories
5. **Framework dependencies must be copied** - node_modules from root
6. **Build from repository root** - context is `../../..` from example folder
7. **Container name says "backend"** - but it includes frontend too (legacy naming, monolithic architecture)

---

## 📚 Related Documentation

- [Examples README](./README.md) - Overview of all examples
- [Platform Fastify](./platform-fastify/README.md) - Fastify-specific patterns
- [Platform Express](./platform-express/README.md) - Express-specific patterns
- [Main Framework Docs](../docs/service/README.md) - Zacatl service framework
