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

### Compose Database Defaults

The example compose files favor copy-paste local use:

- Shared database defaults live in `examples/compose/databases/`.
- Each example's `docker-compose.yml` extends the relevant shared defaults,
  then keeps only example-specific ports, container names, build args, and
  initialization files.
- MongoDB sidecars default to `mongo:latest`.
- PostgreSQL sidecars default to `postgres:latest`.
- SQLite examples default to an example-local `./data` folder mounted at
  `/app/data` so the distroless non-root runtime can write the SQLite file.
- MongoDB and PostgreSQL data use Docker-managed named volumes
  (`mongo-data`, `postgres-data`).
- PostgreSQL mounts `postgres-data` at `/var/lib/postgresql`, which is the
  current official-image layout for `postgres:latest` / PostgreSQL 18+.

Before deploying outside local examples, choose the Docker host/platform and pin
database images intentionally. You can override the defaults without editing the
compose files:

```bash
# Pin a database image for a compose run
ZACATL_EXAMPLE_MONGO_IMAGE='mongo@sha256:<digest>' docker compose up -d
ZACATL_EXAMPLE_POSTGRES_IMAGE='postgres@sha256:<digest>' docker compose up -d

# Avoid host-port collisions while keeping app-to-database networking unchanged
EXPRESS_MONGODB_HOST_PORT=0 docker compose up -d
FASTIFY_MONGODB_HOST_PORT=0 docker compose up -d
EXPRESS_POSTGRES_HOST_PORT=0 docker compose up -d
FASTIFY_POSTGRES_HOST_PORT=0 docker compose up -d

# Move SQLite data outside the example folder if needed
ZACATL_EXAMPLE_SQLITE_DATA_DIR=/path/to/sqlite-data docker compose up -d
```

Use `docker compose down -v` when you want to delete the example database volume
and start with empty MongoDB/PostgreSQL data again. For SQLite, delete the
selected data folder after stopping the stack if you want an empty database.

### Using Consolidated Dockerfile (Manual Build)

All 8+ examples share a **single Dockerfile** in `examples/Dockerfile` with `--build-arg` for parameterization:

Build and test on the host architecture by default. On this machine that means the local `linux/arm64` images and digests are the source of truth; do not assume amd64 unless you intentionally override the platform.

If you need to change the Docker host or target platform, make that decision before deploying. Changing the host after a build can invalidate the pinned digest assumptions and the runtime verification you just performed.

```bash
# Build any example from repo root
docker build \
  --build-arg EXAMPLE=fastify-sqlite-react \
  --build-arg DATABASE_DRIVER=sqlite3 \
  -t zacatl-fastify-sqlite-react .

docker build \
  --build-arg EXAMPLE=fastify-mongodb-react \
  --build-arg DATABASE_DRIVER=mongoose \
  --build-arg PORT=8082 \
  -t zacatl-fastify-mongodb-react .

docker build \
  --build-arg EXAMPLE=express-postgres-react \
  --build-arg DATABASE_DRIVER=pg \
  --build-arg PORT=8183 \
  -t zacatl-express-postgres-react .
```

**Build arguments:**
- `EXAMPLE` (required): Example directory name (e.g., `fastify-sqlite-react`)
- `DATABASE_DRIVER` (required for non-SQLite examples): `sqlite3`, `mongoose`, `mongodb`, or `pg`; defaults to `sqlite3`
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
# Stage 1: Builder (node:26-trixie-slim)
# - Install build tools (python3, make, g++)
# - npm ci (installs all deps incl. optional ORM drivers)
# - Build zacatl framework
# - npm prune --omit=dev at root (keeps ORM drivers; they're optionalDependencies)

# Stage 2: Install example deps (node:26-trixie-slim)
# Stage 3a/3b: Build backend + frontend
# Stage 4: Runtime (gcr.io/distroless/nodejs26-debian13:nonroot)
# - Copy pruned root node_modules + zacatl build
# - Copy example's pruned node_modules + dist artifacts
# - Run as distroless uid 65532 without a shell or package manager
```

**Key Benefits:**
- ✅ **One file to maintain** - Changes apply to all 8+ examples
- ✅ **No duplication** - No individual Dockerfiles per example
- ✅ **ABI-matched stages** - Debian 13 glibc in the builder and runtime
- ✅ **Minimal runtime** - Distroless contains no shell or package manager
- ✅ **Production-ready** - Industry-standard multi-stage pattern

### Image Size Optimization

The consolidated Dockerfile uses `node:26-trixie-slim` for build and install
stages, then `gcr.io/distroless/nodejs26-debian13:nonroot` for runtime. Both
use Debian 13 glibc, so native modules such as `sqlite3` remain ABI-compatible.

The following runtime comparison was measured on 2026-07-12 on the host
architecture. Each candidate built
`fastify-sqlite-react`; the Alpine and distroless containers both started and
returned HTTP 200 from `/api/greetings`.

| Builder and runtime | Docker Desktop expanded size | Exported gzip size | Runtime result |
| ------------------- | ---------------------------: | -----------------: | -------------- |
| `node:26-trixie-slim` + distroless Node 26 Debian 13 | 426 MB | **88.3 MB** | HTTP 200 |
| `node:26-alpine` + `node:26-alpine` | **423 MB** | 93.0 MB | HTTP 200 |
| `node:26-trixie-slim` + `node:26-trixie-slim` | 547 MB | 114.0 MB | Candidate failed its non-root runtime check |

Docker Desktop's expanded size is not the registry transfer size. The
distroless image appears 3 MB larger than Alpine in the expanded view, but its
exported compressed image is about 4.7 MB smaller. Use the exported or registry
size when comparing distribution cost, and always pair it with a runtime smoke
test.

The older 269-282 MB Alpine figures were recorded under a different Docker
environment and are not reproducible with the current checkout and Docker
Desktop. They must not be used as current expectations.

### Current Example Image Sizes

All eight examples were rebuilt from the current database-specialized
`examples/Dockerfile` on 2026-07-13 on the host architecture.
The root production tree omits unused optional drivers and installs only the
driver selected by `DATABASE_DRIVER`.

| Example | Docker Desktop expanded size | Exported gzip size | Verification |
| ------- | ---------------------------: | -----------------: | ------------ |
| `express-mongodb-react` | 377 MB | 73.8 MB | Built with `mongoose` only |
| `express-postgres-react` | 351 MB | 70.2 MB | Built with `pg` only |
| `express-sqlite-react` | 389 MB | 81.6 MB | HTTP 200 from `/api/greetings` |
| `express-sqlite-svelte` | 389 MB | 81.4 MB | HTTP 200 from `/api/greetings` |
| `fastify-mongodb-react` | 377 MB | 73.8 MB | Built with `mongoose` only |
| `fastify-postgres-react` | 351 MB | 70.2 MB | HTTP 200 with PostgreSQL sidecar |
| `fastify-sqlite-react` | 389 MB | 81.6 MB | HTTP 200 from `/api/greetings` |
| `fastify-sqlite-svelte` | 389 MB | 81.4 MB | HTTP 200 from `/api/greetings` |

The expanded size is useful for comparing local Docker Desktop storage. The
exported gzip size approximates compressed distribution cost. Neither metric
should be silently substituted for the other.

### Container Vulnerability Scanning

Docker Scout is installed with Docker Desktop but requires Docker Hub
authentication. Log in from an interactive terminal so credentials are handled
by Docker Desktop's credential store:

```bash
docker login
docker scout cves zacatl-specialized:fastify-sqlite-react
docker scout cves --only-severity critical,high zacatl-specialized:fastify-sqlite-react
```

For machine or CI authentication, provide a scoped Docker Hub personal access
token through standard input rather than putting it in shell history:

```bash
printf '%s' "$DOCKERHUB_TOKEN" | docker login --username "$DOCKERHUB_USERNAME" --password-stdin
docker scout cves --only-severity critical,high <image>
```

Do not treat `npm audit` as a replacement for this scan: npm advisories cover
JavaScript dependencies, while Scout also analyzes the image's OS packages.

All eight `zacatl-specialized:*` images were scanned on 2026-07-13 with Docker
Scout 1.20.4 on the host architecture. Scout detected **zero vulnerabilities** in every
image. The Fastify SQLite React scan indexed 275 packages, verified build
provenance, and reported `0C 0H 0M 0L` with an analyzed size of 82 MB.

Run Scout scans serially with version 1.20.4. Concurrent scans can contend for
the local indexing cache and fail with `cache may be in use by another process`.

### Security: Non-Root Runtime User

The runtime uses distroless's unprivileged `nonroot` user (uid/gid 65532).
Every runtime artifact is copied with `--chown=65532:65532`, and the example
work directory is writable so SQLite examples can create their database file.
Distroless has no shell, so verify identity with Docker inspection:

```bash
docker image inspect <image> --format '{{.Config.User}}'
# Expected: 65532
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
# Install build tools in the Debian 13 build/install stage
RUN apt-get update && apt-get install -y python3 make g++
```

Do not compile native modules in Alpine and copy them into the distroless
Debian runtime. Alpine uses musl while the runtime uses glibc.

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
    extends:
      file: ../compose/databases/sqlite.yml
      service: backend
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
      NODE_ENV: production
      PORT: {port}
      HEALTHCHECK_PATH: /greetings
    volumes:
      - ${ZACATL_EXAMPLE_SQLITE_DATA_DIR:-./data}:/app/data  # Persist SQLite database
    healthcheck:
      test:
        [
          "CMD",
          "/nodejs/bin/node",
          "-e",
          "const path=process.env.HEALTHCHECK_PATH||'/greetings'; const url=`http://127.0.0.1:$${process.env.PORT || '{port}'}$${path}`; const controller=new AbortController(); const timer=setTimeout(() => controller.abort(), 4000); fetch(url, { signal: controller.signal }).then((r) => { clearTimeout(timer); if (!r.ok) process.exit(1); }).catch(() => process.exit(1));",
        ]
    restart: unless-stopped

```

### MongoDB (With Database Container)

```yaml
services:
  mongodb:
    extends:
      file: ../compose/databases/mongodb.yml
      service: mongodb
    container_name: {framework}-mongodb-db
    ports:
      - "${FASTIFY_MONGODB_HOST_PORT:-27017}:27017"
    volumes:
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro

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
      - PORT=8082
      - MONGO_URI=mongodb://local:local@mongodb:27017/appdb  # Note: mongodb hostname
      - HEALTHCHECK_PATH=/greetings
    depends_on:
      mongodb:
        condition: service_healthy
    healthcheck:
      test:
        [
          "CMD",
          "/nodejs/bin/node",
          "-e",
          "const path=process.env.HEALTHCHECK_PATH||'/greetings'; const url=`http://127.0.0.1:$${process.env.PORT || '8082'}$${path}`; const controller=new AbortController(); const timer=setTimeout(() => controller.abort(), 4000); fetch(url, { signal: controller.signal }).then((r) => { clearTimeout(timer); if (!r.ok) process.exit(1); }).catch(() => process.exit(1));",
        ]
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
    extends:
      file: ../compose/databases/postgres.yml
      service: postgres
    container_name: {framework}-postgres-db
    ports:
      - "${FASTIFY_POSTGRES_HOST_PORT:-5433}:5432"

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
      test:
        [
          "CMD",
          "/nodejs/bin/node",
          "-e",
          "const path=process.env.HEALTHCHECK_PATH||'/greetings'; const url=`http://127.0.0.1:$${process.env.PORT || '{port}'}$${path}`; const controller=new AbortController(); const timer=setTimeout(() => controller.abort(), 4000); fetch(url, { signal: controller.signal }).then((r) => { clearTimeout(timer); if (!r.ok) process.exit(1); }).catch(() => process.exit(1));",
        ]
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
ORM peers (`sequelize`, `sqlite3`, `mongoose`, `pg`, `mongodb`) by walking up from
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
builder stage. The Dockerfile installs only the ORM packages needed by the
selected `DATABASE_DRIVER`; SQL examples install `sequelize` plus `pg` or
`sqlite3`.

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

Build and install native dependencies in `node:26-trixie-slim`, matching the
distroless Debian 13 runtime ABI. Do not rebuild them in Alpine.

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
