# Fastify + SQLite + React Example

Production-grade Zacatl example with zero-config SQLite database.

## Quick Start

```bash
cd examples/fastify-sqlite-react
npm install
npm run dev
```

**Ports**: Backend: 8081, Frontend: 5001

## Database Setup

- **Storage**: SQLite file at `database.sqlite` (example root)
- **Auto-init**: Schema is created on app start
- **Connection**: `apps/backend/src/config.ts`

## What's Included

✅ **Zod validation** - Type-safe request schemas
✅ **DTO pattern** - Clean domain/API separation
✅ **Repository pattern** - Swappable data layer
✅ **Dependency injection** - Auto-wired with tsyringe
✅ **Error handling** - Centralized handler
✅ **SQLite + Sequelize** - File-based, zero setup

## Project Structure

```
apps/
├── backend/          # Fastify API
│   ├── locales/      # Backend locale overrides
│   └── src/
│     ├── application/    # Handlers, schemas
│     ├── domain/         # Services, models, ports
│     └── infrastructure/ # Repositories, DB models
└── frontend/         # React + Vite
```

## API Endpoints

- `GET /api/greetings` - All greetings (optional `?language=en`)
- `GET /api/greetings/:id` - Single greeting
- `GET /api/greetings/random/:language` - Random greeting
- `POST /api/greetings` - Create: `{"message": "...", "language": "..."}`
- `DELETE /api/greetings/:id` - Delete greeting

## Test It

```bash
curl -X POST http://localhost:8081/api/greetings \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World", "language": "en"}'

curl http://localhost:8081/api/greetings
```

## 🐳 Docker Deployment

**Single image** includes both backend + frontend (not separate containers).

### Build & Run

```bash
# From repository root
docker build -f examples/fastify-sqlite-react/Dockerfile \
  -t zacatl-fastify-sqlite .
```

The Docker build is self-contained: it compiles required Zacatl framework artifacts in-container.

### Access

- **Backend API**: http://localhost:8081/api/greetings
- **Frontend**: Served by backend (static files)

### Architecture Notes

- ✅ One image = backend + compiled frontend
- ✅ Native module support via `sqlite3` workspace dependency
- ✅ Distroless base image (production-ready)
- ✅ Backend runs from `apps/backend/`, so `apps/backend/locales/` is discovered in dev and Docker
- ⚠️ `node ../../../../build-scripts-esm/build/fix-esm.js dist` required in build script (see `apps/backend/package.json`)

### Localization

- Backend server locale files live in `apps/backend/locales/`
- Zacatl built-in locales remain packaged with the library
- Add project-specific locale files in `apps/backend/locales/` and they are picked up automatically when the backend runs

## Documentation

- **Examples Catalog**: [../README.md](../README.md)
- **Start Here**: [../../docs/START_HERE.md](../../docs/START_HERE.md)
- **Framework Overview**: [../../docs/guidelines/framework-overview.md](../../docs/guidelines/framework-overview.md)
- **Framework Database Guide**: [../../docs/third-party/orm/database-setup.md](../../docs/third-party/orm/database-setup.md)
- **Service Module**: [../../docs/service/README.md](../../docs/service/README.md)

## Why SQLite?

✅ Zero infrastructure - no database server
✅ < 1s startup time
✅ Perfect for learning, prototyping, edge deployments

⚠️ Single connection limit - not ideal for high concurrency

Compare with [Fastify + MongoDB + React](../fastify-mongodb-react/) for scalable alternative.

## Next Steps

- Use this as the baseline minimal example for release cleanup and onboarding
- Compare with [Fastify + MongoDB + React](../fastify-mongodb-react/) for scalable persistence
- Review the [service module docs](../../docs/service/README.md) for platform wiring
