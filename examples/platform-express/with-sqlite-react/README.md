# Express + SQLite + React Example

Production-grade Zacatl example with zero-config SQLite database.

## Quick Start

```bash
cd examples/platform-express/with-sqlite
npm install
npm run dev
```

**Ports**: Backend: 8082, Frontend: 5001

## Database Setup

- **Storage**: SQLite file at `apps/backend/database.sqlite`
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
├── backend/          # Express API
│   └── src/
│       ├── application/    # Handlers, schemas
│       ├── domain/         # Services, models, ports
│       └── infrastructure/ # Repositories, DB models
└── frontend/         # React + Vite
shared/               # Shared types
```

## API Endpoints

- `GET /greetings` - All greetings (optional `?language=en`)
- `GET /greetings/:id` - Single greeting
- `GET /greetings/random/:language` - Random greeting
- `POST /greetings` - Create: `{"message": "...", "language": "..."}`
- `DELETE /greetings/:id` - Delete greeting

## Test It

```bash
curl -X POST http://localhost:8082/greetings \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World", "language": "en"}'

curl http://localhost:8082/greetings
```

## 🐳 Docker Deployment

**Single image** includes both backend + frontend (not separate containers).

### Build & Run

```bash
# From repository root
docker build -f examples/platform-express/with-sqlite-react/Dockerfile \
  -t zacatl-express-sqlite .

# Or use docker-compose
cd examples/platform-express/with-sqlite-react
docker compose up -d
```

### Access

- **Backend API**: http://localhost:8082/greetings
- **Frontend**: Served by backend (static files)

### Architecture Notes

- ✅ One image = backend + compiled frontend
- ✅ Native module support (sqlite3 rebuilt in container)
- ✅ Distroless base image (production-ready)
- ✅ Health checks included
- ⚠️ `fix-esm.mjs dist` required in build script (see package.json)

## Documentation

- **Framework Database Guide**: [../../../docs/third-party/orm/database-setup.md](../../../docs/third-party/orm/database-setup.md)
- **Main Framework Docs**: [../../../docs/service/README.md](../../../docs/service/README.md)
- **Architecture Patterns**: [../../../docs/guidelines/framework-overview.md](../../../docs/guidelines/framework-overview.md)

## Why SQLite?

✅ Zero infrastructure - no database server
✅ < 1s startup time
✅ Perfect for learning, prototyping, edge deployments

⚠️ Single connection limit - not ideal for high concurrency

Compare with [MongoDB example](../with-mongodb-react/) for scalable alternative.

## Next Steps

- Review the [framework database guide](../../../docs/third-party/orm/database-setup.md) for ORM patterns
- Explore the [Zacatl architecture](../../../docs/guidelines/framework-overview.md) to understand the layered design
- Compare with [MongoDB example](../with-mongodb-react/) for scalable databases
