# Fastify + MongoDB + React Example

Production-grade Zacatl example with scalable MongoDB database.

## Quick Start

### Start MongoDB

```bash
# Docker (recommended)
docker run -d -p 27017:27017 --name mongo mongo:latest

# Or install locally: brew install mongodb-community
```

### Run Example

```bash
cd examples/platform-fastify/with-mongodb
npm install
npm run dev
```

**Ports**: Backend: 8082, Frontend: 5002

## Database Setup

- **Connection**: `mongodb://localhost:27017/greetings-db`
- **Connection file**: `apps/backend/src/infrastructure/database/connection.ts`
- **Local run**: `docker run -d -p 27017:27017 --name mongo mongo:latest`

## What's Included

✅ **Zod validation** - Type-safe request schemas
✅ **DTO pattern** - Clean domain/API separation
✅ **Repository pattern** - Swappable data layer
✅ **Dependency injection** - Auto-wired with tsyringe
✅ **Error handling** - Centralized handler
✅ **MongoDB + Mongoose** - Scalable, production-ready

## Project Structure

```
apps/
├── backend/          # Fastify API
│   └── src/
│       ├── application/    # Handlers, schemas
│       ├── domain/         # Services, models, ports
│       └── infrastructure/ # Repositories, Mongoose models
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
docker build -f examples/platform-fastify/with-mongodb-react/Dockerfile \
  -t zacatl-fastify-mongodb .

# Or use docker-compose
cd examples/platform-fastify/with-mongodb-react
docker compose up -d
```

### Access

- **Backend API**: http://localhost:8082/greetings
- **Frontend**: Served by backend (static files)

### Notes

- MongoDB runs in a separate container via docker-compose
- Backend connects to `mongodb://mongo:27017/greetings-db`
- See [DOCKER.md](../../DOCKER.md) for multi-example setup

## Documentation

- **Production Patterns**: [../docs/production-patterns.md](../docs/production-patterns.md)
- **Quick Start Guide**: [../docs/quick-start.md](../docs/quick-start.md)
- **Framework Database Guide**: [../../../docs/third-party/orm/database-setup.md](../../../docs/third-party/orm/database-setup.md)

## Why MongoDB?

✅ Horizontally scalable via replica sets
✅ Flexible schema evolution
✅ Production-proven (Atlas, DocumentDB)
✅ Cloud-native

⚠️ Requires MongoDB server (but Docker makes it easy)

Compare with [SQLite example](../with-sqlite-react/) for zero-config alternative.

## Next Steps

- Read [production patterns](../docs/production-patterns.md) to understand the architecture
- Review the [framework database guide](../../../docs/third-party/orm/database-setup.md) for shared ORM patterns
- Add features using the [extension guide](../docs/production-patterns.md#adding-new-features)
