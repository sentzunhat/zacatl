# Fastify + SQLite + React Example

Production-grade Zacatl example with zero-config SQLite database.

## Quick Start

```bash
cd examples/platform-fastify/01-with-sqlite
bun install
bun run dev
```

**Ports**: Backend: 8081, Frontend: 8091

## Database Setup

- **Storage**: SQLite file at `apps/backend/database.sqlite`
- **Auto-init**: Schema is created on app start
- **Connection**: `apps/backend/src/infrastructure/database/connection.ts`

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

## Why SQLite?

✅ Zero infrastructure - no database server
✅ < 1s startup time
✅ Perfect for learning, prototyping, edge deployments

⚠️ Single connection limit - not ideal for high concurrency

Compare with [MongoDB example](../02-with-mongodb/) for scalable alternative.

## Next Steps

- Read [production patterns](../docs/production-patterns.md) to understand the architecture
- Review the [framework database guide](../../../docs/tutorials/database-setup.md) for shared ORM patterns
- Add features using the [extension guide](../docs/production-patterns.md#adding-new-features)
