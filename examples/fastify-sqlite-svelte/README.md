# Fastify + SQLite + Svelte Example

Production-grade Zacatl example with zero-config SQLite database and Svelte 5 frontend.

## Quick Start

```bash
cd examples/fastify-sqlite-svelte
npm install
npm run dev
```

**Ports**: Backend: 8081, Frontend: 5001

## Database Setup

- **Storage**: SQLite file at `backend/database.sqlite`
- **Auto-init**: Schema is created on app start
- **Connection**: `backend/src/infrastructure/database/connection.ts`

## What's Included

✅ **Zod validation** - Type-safe request schemas
✅ **DTO pattern** - Clean domain/API separation
✅ **Repository pattern** - Swappable data layer
✅ **Dependency injection** - Auto-wired with tsyringe
✅ **Error handling** - Centralized handler
✅ **SQLite + Sequelize** - File-based, zero setup
✅ **Svelte 5** - Modern reactive frontend with runes

## Project Structure

```
backend/              # Fastify API
└── src/
  ├── application/    # Handlers, schemas
  ├── domain/         # Services, models, ports
  └── infrastructure/ # Repositories, DB models
frontend/             # Svelte 5 + Vite
```

## API Endpoints

- `GET /greetings` - All greetings (optional `?language=en`)
- `GET /greetings/:id` - Single greeting
- `GET /greetings/random/:language` - Random greeting
- `POST /greetings` - Create: `{"message": "...", "language": "..."}`
- `DELETE /greetings/:id` - Delete greeting

## Test It

```bash
curl -X POST http://localhost:8081/greetings \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World", "language": "en"}'

curl http://localhost:8081/greetings
```

## 🐳 Docker Deployment

**Single image** includes both backend + frontend (not separate containers).

### Build & Run

```bash
# From repository root
docker build -f examples/fastify-sqlite-svelte/Dockerfile \
  -t zacatl-fastify-sqlite-svelte .

# Or use docker-compose
cd examples/fastify-sqlite-svelte
docker compose up -d
```

### Access

- **Backend API**: http://localhost:8081/greetings
- **Frontend**: Served by backend (static files)

### Architecture Notes

- ✅ One image = backend + compiled frontend
- ✅ Native module support (sqlite3 rebuilt in container)
- ✅ Distroless base image (production-ready)
- ✅ Health checks included
- ⚠️ `fix-esm.mjs dist` required in build script (see package.json)

## Documentation

- **Production Patterns**: [../docs/production-patterns.md](../docs/production-patterns.md)
- **Quick Start Guide**: [../docs/quick-start.md](../docs/quick-start.md)
- **Framework Database Guide**: [../../../docs/third-party/orm/database-setup.md](../../../docs/third-party/orm/database-setup.md)

## Why SQLite?

✅ Zero infrastructure - no database server
✅ < 1s startup time
✅ Perfect for learning, prototyping, edge deployments

⚠️ Single connection limit - not ideal for high concurrency

Compare with the [React version](../with-sqlite-react/) or [MongoDB example](../with-mongodb-react/) for alternatives.

## Next Steps

- Read [production patterns](../docs/production-patterns.md) to understand the architecture
- Review the [framework database guide](../../../docs/third-party/orm/database-setup.md) for shared ORM patterns
- Add features using the [extension guide](../docs/production-patterns.md#adding-new-features)
