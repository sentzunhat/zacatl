# Fastify + PostgreSQL + React Example

Production-grade Zacatl example with a PostgreSQL database and Sequelize ORM.

## Quick Start

```bash
cd examples/platform-fastify/03-with-postgres
bun install
bun run dev
```

**Ports**: Backend: 8083, Frontend: 8093

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
curl -X POST http://localhost:3001/greetings \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World", "language": "en"}'

curl http://localhost:3001/greetings
```

## Documentation

- **Production Patterns**: [../docs/production-patterns.md](../docs/production-patterns.md)
- **Quick Start Guide**: [../docs/quick-start.md](../docs/quick-start.md)
- **Framework Database Guide**: [../../../docs/tutorials/database-setup.md](../../../docs/tutorials/database-setup.md)

## Why PostgreSQL?

✅ Production-grade relational database
✅ Strong transactional guarantees
✅ Widely supported in managed hosting

Compare with [MongoDB example](../02-with-mongodb/) for document workflows.

## Next Steps

- Read [production patterns](../docs/production-patterns.md) to understand the architecture
- Review the [framework database guide](../../../docs/tutorials/database-setup.md) for shared ORM patterns
- Add features using the [extension guide](../docs/production-patterns.md#adding-new-features)
