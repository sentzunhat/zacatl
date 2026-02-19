# Fastify + PostgreSQL + React Example

Production-grade Zacatl example with a PostgreSQL database and Sequelize ORM.

## Quick Start

```bash
cd examples/platform-fastify/with-postgres
npm install
npm run dev
```

**Ports**: Backend: 8083, Frontend: 5003

## Database Setup

- **Env var**: `DATABASE_URL`
- **Example**: `postgres://local:local@localhost:5432/appdb`
- **Connection file**: `apps/backend/src/index.ts`

## What's Included

✅ **Zod validation** - Type-safe request schemas
✅ **Repository pattern** - Swappable data layer
✅ **Dependency injection** - Auto-wired with tsyringe
✅ **Error handling** - Centralized handler
✅ **PostgreSQL + Sequelize** - Configure `DATABASE_URL` and go

## Project Structure

```
apps/
├── backend/          # Fastify API
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
curl -X POST http://localhost:8083/greetings \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World", "language": "en"}'

curl http://localhost:8083/greetings
```

## 🐳 Docker Deployment

**Single image** includes both backend + frontend (not separate containers).

### Build & Run

```bash
# From repository root
docker build -f examples/platform-fastify/with-postgres-react/Dockerfile \
  -t zacatl-fastify-postgres .

# Or use docker-compose
cd examples/platform-fastify/with-postgres-react
docker compose up -d
```

### Access

- **Backend API**: http://localhost:8083/greetings
- **Frontend**: Served by backend (static files)

### Notes

- PostgreSQL runs in a separate container via docker-compose
- Backend connects using `DATABASE_URL` environment variable
- See [DOCKER.md](../../DOCKER.md) for multi-example setup

## Documentation

- **Production Patterns**: [../docs/production-patterns.md](../docs/production-patterns.md)
- **Quick Start Guide**: [../docs/quick-start.md](../docs/quick-start.md)
- **Framework Database Guide**: [../../../docs/third-party/orm/database-setup.md](../../../docs/third-party/orm/database-setup.md)

## Why PostgreSQL?

✅ Production-grade relational database
✅ Strong transactional guarantees
✅ Widely supported in managed hosting

Compare with [MongoDB example](../with-mongodb-react/) for document workflows.

## Next Steps

- Read [production patterns](../docs/production-patterns.md) to understand the architecture
- Review the [framework database guide](../../../docs/third-party/orm/database-setup.md) for shared ORM patterns
- Add features using the [extension guide](../docs/production-patterns.md#adding-new-features)
