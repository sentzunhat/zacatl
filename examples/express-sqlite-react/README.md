# Express + SQLite + React Example

Production-grade Zacatl example with zero-config SQLite database.

## Quick Start

```bash
cd examples/express-sqlite-react
npm install
npm run dev
```

**Ports**: Backend: 8181, Frontend: 5001

## Database Setup

- **Storage**: SQLite file at `backend/database.sqlite`
- **Auto-init**: Schema is created on app start
- **Connection**: `backend/src/config.ts`

## What's Included

✅ **Zod validation** - Type-safe request schemas
✅ **DTO pattern** - Clean domain/API separation
✅ **Repository pattern** - Swappable data layer
✅ **Dependency injection** - Auto-wired with tsyringe
✅ **Error handling** - Centralized handler
✅ **SQLite + Sequelize** - File-based, zero setup

## Project Structure

```
backend/              # Express API
└── src/
  ├── application/    # Handlers, schemas
  ├── domain/         # Services, models, ports
  └── infrastructure/ # Repositories, DB models
frontend/             # React + Vite
```

## API Endpoints

- `GET /greetings` - All greetings (optional `?language=en`)
- `GET /greetings/:id` - Single greeting
- `GET /greetings/random/:language` - Random greeting
- `POST /greetings` - Create: `{"message": "...", "language": "..."}`
- `DELETE /greetings/:id` - Delete greeting

## Test It

```bash
curl -X POST http://localhost:8181/greetings \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World", "language": "en"}'

curl http://localhost:8181/greetings
```

## 🐳 Docker Deployment

**Single image** includes both backend + frontend (not separate containers).

### Build & Run

```bash
# From repository root
docker build -f examples/express-sqlite-react/Dockerfile \
  -t zacatl-express-sqlite .

# Or use docker-compose
cd examples/express-sqlite-react
docker compose up -d
```

### Access

- **Backend API**: http://localhost:8181/greetings
- **Frontend**: Served by backend (static files)

### Architecture Notes

- ✅ One image = backend + compiled frontend
- ✅ Native module support (sqlite3 rebuilt in container)
- ✅ Distroless base image (production-ready)
- ✅ Health checks included
- ⚠️ `fix-esm.mjs dist` required in build script (see package.json)

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

Compare with [Express + MongoDB + React](../express-mongodb-react/) for scalable alternative.

## Next Steps

- Start from [Fastify + SQLite + React](../fastify-sqlite-react/) as the minimal baseline
- Review the [framework database guide](../../docs/third-party/orm/database-setup.md) for shared ORM patterns
- Use the [service module docs](../../docs/service/README.md) when extending platform wiring
