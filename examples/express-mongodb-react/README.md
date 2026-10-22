# Express + MongoDB + React Example

Production-grade Zacatl example with scalable MongoDB database.

## Quick Start

### Start MongoDB

```bash
# From the repository root; initializes the local:local user and appdb.
EXPRESS_MONGODB_HOST_PORT=27017 docker compose \
  -f examples/express-mongodb-react/docker-compose.yml up -d mongodb
```

### Run Example

```bash
cd examples/express-mongodb-react
npm install
npm run dev
```

**Ports**: Backend: 8182, Frontend: 5002

## Database Setup

- **Connection**: `mongodb://local:local@localhost:27017/appdb`
- **Connection config**: `apps/backend/src/config.ts`
- **Database**: `appdb` (the `/api` prefix applies to HTTP routes, not MongoDB)

## What's Included

✅ **Zod validation** - Type-safe request schemas
✅ **DTO pattern** - Clean domain/API separation
✅ **Repository pattern** - Swappable data layer
✅ **Dependency injection** - Auto-wired with tsyringe
✅ **Error handling** - Centralized handler
✅ **MongoDB + Mongoose** - Scalable, production-ready

## Project Structure

```
apps/backend/         # Express API
└── src/
  ├── application/    # Handlers, schemas
  ├── domain/         # Services, models, ports
  └── infrastructure/ # Repositories, Mongoose models
apps/frontend/        # React + Vite
```

## API Endpoints

- `GET /api/greetings` - All greetings (optional `?language=en`)
- `GET /api/greetings/:id` - Single greeting
- `GET /api/greetings/random/:language` - Random greeting
- `POST /api/greetings` - Create: `{"message": "...", "language": "..."}`
- `DELETE /api/greetings/:id` - Delete greeting

## Test It

```bash
curl -X POST http://localhost:8182/api/greetings \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World", "language": "en"}'

curl http://localhost:8182/api/greetings
```

## 🐳 Docker Deployment

**Single image** includes both backend + frontend (not separate containers).

### Build & Run

```bash
# From repository root
docker build --build-arg EXAMPLE=express-mongodb-react \
  -f examples/Dockerfile -t zacatl-express-mongodb-react .

# Or use docker-compose
cd examples/express-mongodb-react
docker compose up -d
```

### Access

- **Backend API**: http://localhost:8182/api/greetings
- **Frontend**: Served by backend (static files)

### Notes

- MongoDB runs in a separate container via docker-compose
- Backend connects to `mongodb://local:local@mongodb:27017/appdb`
- See [docker.md](../docker.md) for multi-example setup

## Documentation

- **Examples Catalog**: [../README.md](../README.md)
- **Start Here**: [../../docs/start-here.md](../../docs/start-here.md)
- **Framework Overview**: [../../docs/guidelines/framework-overview.md](../../docs/guidelines/framework-overview.md)
- **Framework Database Guide**: [../../docs/third-party/orm/database-setup.md](../../docs/third-party/orm/database-setup.md)
- **Service Module**: [../../docs/service/README.md](../../docs/service/README.md)

## Why MongoDB?

✅ Horizontally scalable via replica sets
✅ Flexible schema evolution
✅ Production-proven (Atlas, DocumentDB)
✅ Cloud-native

⚠️ Requires MongoDB server (but Docker makes it easy)

Compare with [Express + SQLite + React](../express-sqlite-react/) for zero-config alternative.

## Next Steps

- Start from [Fastify + SQLite + React](../fastify-sqlite-react/) as the minimal baseline
- Review the [framework database guide](../../docs/third-party/orm/database-setup.md) for shared ORM patterns
- Use the [service module docs](../../docs/service/README.md) when extending platform wiring
