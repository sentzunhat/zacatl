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

### Using Consolidated Dockerfile (Manual Build)

All 8+ examples share a **single Dockerfile** in `examples/Dockerfile` with `--build-arg` for parameterization:

```bash
# Build any example from repo root
docker build \
  --build-arg EXAMPLE=fastify-sqlite-react \
  -t zacatl-fastify-sqlite-react .

docker build \
  --build-arg EXAMPLE=fastify-mongodb-react \
  --build-arg PORT=8082 \
  -t zacatl-fastify-mongodb-react .

docker build \
  --build-arg EXAMPLE=express-postgres-react \
  --build-arg PORT=8183 \
  -t zacatl-express-postgres-react .
```

**Build arguments:**
- `EXAMPLE` (required): Example directory name (e.g., `fastify-sqlite-react`)
- `PORT` (optional, default: 8080): Container port override
- `BACKEND` (default: `apps/backend`): Backend path within example
- `FRONTEND` (default: `apps/frontend`): Frontend path within example

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
examples/
├── Dockerfile              # Consolidated build for all examples (--build-arg EXAMPLE=<name>)
└── {framework}-{database}-{ui}/
    ├── docker-compose.yml  # Compose file (references examples/Dockerfile)
    ├── .dockerignore       # Build optimization
    ├── apps/backend/       # API server source
    └── apps/frontend/      # React or Svelte app (compiled to static)
```

---

## 🔧 Build Process Explained

### Consolidated Multi-Stage Dockerfile

All examples use a **single `examples/Dockerfile`** with parameterized builds:

```dockerfile
# Stage 1: Builder (node:26-alpine)
# - Install build tools (python3, make, g++)
# - npm ci (installs all deps incl. optional ORM drivers)
# - Build zacatl framework
# - npm prune --omit=dev at root (keeps ORM drivers; they're optionalDependencies)

# Stage 2: Install example deps (node:26-alpine)
# Stage 3a/3b: Build backend + frontend
# Stage 4: Lean Runtime (node:26-alpine)
# - Copy pruned root node_modules + zacatl build
# - Copy example's pruned node_modules + dist artifacts
# - RESULT: ~269-282 MB per image
```

**Key Benefits:**
- ✅ **One file to maintain** - Changes apply to all 8+ examples
- ✅ **No duplication** - No individual Dockerfiles per example
- ✅ **Lean alpine base** - ~270-282 MB runtime images (vs 400+ MB before ORM reclassification)
- ✅ **Fast builds** - Alpine layers cache efficiently
- ✅ **Production-ready** - Industry-standard multi-stage pattern

### Image Size Optimization

The consolidated Dockerfile uses **alpine** (lean) base images for both builder and runtime stages:

All 8 examples build from the single consolidated `examples/Dockerfile`.
Sizes below were measured from actual builds **and verified by actually
running each container and exercising its CRUD endpoints** (2026-07-10,
Docker 26.x, `node:26-alpine` builder + runtime, ORM drivers in
`optionalDependencies` so root prune is safe) — not just build success:

| Example | Image size | Verified |
|---------|------------|----------|
| fastify-sqlite-react   | 282 MB | ✅ create/read/delete round trip confirmed |
| fastify-mongodb-react  | 278 MB | ✅ starts cleanly (needs a running MongoDB to complete CRUD) |
| fastify-sqlite-svelte  | 280 MB | ✅ create/read/delete round trip confirmed |
| fastify-postgres-react | 269 MB | ✅ starts, requires a running PostgreSQL to connect |
| express-sqlite-react   | 282 MB | ✅ create/read/delete round trip confirmed |
| express-mongodb-react  | 278 MB | ✅ starts cleanly (needs a running MongoDB to complete CRUD) |
| express-sqlite-svelte  | 280 MB | ✅ create/read/delete round trip confirmed |
| express-postgres-react | 269 MB | ✅ starts, requires a running PostgreSQL to connect |

**Size chart (measured, verified-running containers):**
```
                          0     100    200    300    400 MB
                          |      |      |      |      |
fastify-sqlite-react      ████████████████████████▌    282 MB
fastify-mongodb-react     ███████████████████████▌     278 MB
fastify-sqlite-svelte     ████████████████████████     280 MB
fastify-postgres-react    ██████████████████████       269 MB
express-sqlite-react      ████████████████████████▌    282 MB
express-mongodb-react     ███████████████████████▌     278 MB
express-sqlite-svelte     ████████████████████████     280 MB
express-postgres-react    ██████████████████████       269 MB
```

**Why Alpine?**
- Distroless doesn't have Node.js 26 support yet
- Alpine is the practical alternative (~150 MB vs ~250 MB for Debian)
- Minimal attack surface, no shell by default
- Fast downloads and container startup
- Industry standard for production containerization

### Security: Non-Root Runtime User

The final runtime stage runs as the unprivileged `node` user (uid 1000,
shipped by the `node:26-alpine` base image) rather than root — a
container-escape or dependency-RCE scenario is strictly worse running as
root. `COPY --chown=node:node` on every artifact plus a final `chown` on
the per-example WORKDIR (needed for the SQLite examples' `database.sqlite`
write) keep the non-root user able to read and write everything it needs;
`USER node` is set right before `CMD`.

Verify with `docker run --rm <image> id` — expect
`uid=1000(node) gid=1000(node) groups=1000(node)`.

**Size Breakdown (measured alpine runtime):**
```
Alpine Runtime (node:26-alpine):
├─ Node.js binary + alpine libs:         ~130 MB
├─ Root production deps (zacatl + ORMs): ~90-100 MB
├─ Example production deps:              ~40-50 MB
├─ App dist + frontend static:           ~5 MB
└─ Total:                                ~269-282 MB

Old images (before STAB-024, ORM drivers in devDependencies, root not pruned):
└─ Total:                                ~404-417 MB
```

### Critical Build Script Detail

**⚠️ IMPORTANT**: The backend build script **MUST** include `dist` argument:

```json
// apps/backend/package.json
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
      dockerfile: examples/Dockerfile  # Single consolidated Dockerfile
      args:
        EXAMPLE: fastify-sqlite-react  # Use build args instead of per-example Dockerfile
    image: zacatl-fastify-sqlite-react
    container_name: fastify-sqlite-backend
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
    build:
      context: ../../..
      dockerfile: examples/Dockerfile
      args:
        EXAMPLE: fastify-mongodb-react
        PORT: 8082
    image: zacatl-fastify-mongodb-react
    container_name: fastify-mongodb-backend
    ports:
      - "8082:8082"
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
    build:
      context: ../../..
      dockerfile: examples/Dockerfile
      args:
        EXAMPLE: fastify-postgres-react
        PORT: 8083
    image: zacatl-fastify-postgres-react
    container_name: fastify-postgres-backend
    ports:
      - "8083:8083"
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

### "Cannot find module 'reflect-metadata'" (or any zacatl runtime dep) at container startup

**Problem**: `ERR_MODULE_NOT_FOUND: Cannot find package 'reflect-metadata' imported from /app/build-src-esm/third-party/dependency-injection/reflect-metadata.js`
— the container builds fine and `docker images` shows a reasonable size,
but it crashes immediately on `docker run`.

**Root cause**: zacatl's compiled output (`build-src-esm/**`) resolves its
own runtime dependencies (`reflect-metadata`, `tsyringe`) and the optional
ORM peers (`sqlite3`, `mongoose`, `pg`, `better-sqlite3`) by walking up from
its own file location to `/app/node_modules` — the **root** node_modules
tree, not the example's own. If the final runtime stage only copies the
example's `node_modules` and not `/app/node_modules`, this resolution fails
even though the build itself succeeded.

**Solution**: `examples/Dockerfile`'s final stage must copy both:

```dockerfile
COPY --from=build-backend /app/package.json  /app/package.json
COPY --from=build-backend /app/node_modules  /app/node_modules
COPY --from=build-backend /app/examples/${EXAMPLE}/node_modules ./node_modules
```

The root `/app/node_modules` is pruned (`npm prune --omit=dev`) during the
builder stage — ORM drivers (`sqlite3`, `mongoose`, `pg`, `better-sqlite3`)
are declared as `optionalDependencies` so they survive the prune.

**Always verify a Docker fix by running the container and hitting an
endpoint** — `docker images` size and a successful `docker build` do not
prove the app actually starts.

### "Cannot find module" Errors

**Problem**: `ERR_MODULE_NOT_FOUND: Cannot find module './init-di'`

**Solution**: Check backend build script includes `dist`:

```bash
grep "fix-esm.mjs" apps/backend/package.json
# Should output: "build": "tsc && node ../../node_modules/@sentzunhat/zacatl/scripts/fix-esm.mjs dist"
```

### "Cannot locate built-in locales directory"

**Problem**: Missing source files in Docker image

**Solution**: Dockerfile must copy source directories:

```dockerfile
COPY --from=build-backend /app/src/localization/locales /app/src/localization/locales
COPY --from=build-backend /app/src/eslint               /app/src/eslint
```

### Native Module Binding Errors (sqlite3)

**Problem**: `Error: Could not locate the bindings file`

**Solution**: Rebuild in Dockerfile:

```dockerfile
RUN apk add --no-cache python3 make g++
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
- [Fastify SQLite React](./fastify-sqlite-react/README.md) - Fastify baseline example
- [Express SQLite React](./express-sqlite-react/README.md) - Express parity example
- [Main Framework Docs](../docs/service/README.md) - Zacatl service framework
