# Express Platform Examples

This directory contains examples demonstrating the Zacatl framework with the Express web framework.

## Examples

### 1. Express + SQLite (Sequelize)

**Location:** `with-sqlite-react/`

- **Framework:** Express
- **Database:** SQLite
- **Frontend:** React
- **Port:** 8181
- **Setup:** < 1 minute (no external dependencies)

### 1b. Express + SQLite + Svelte

**Location:** `with-sqlite-svelte/`

- **Framework:** Express
- **Database:** SQLite
- **Frontend:** Svelte 5
- **Port:** 8181
- **Setup:** < 1 minute (no external dependencies)
- **Note:** Same backend as React version, different frontend framework

### 2. Express + MongoDB (Mongoose)

**Location:** `with-mongodb-react/`

- **Framework:** Express
- **Database:** MongoDB
- **Port:** 8182
- **Setup:** 2 minutes (requires MongoDB)

### 3. Express + PostgreSQL (Sequelize)

**Location:** `with-postgres-react/`

- **Framework:** Express
- **Database:** PostgreSQL
- **Port:** 8183
- **Setup:** 2 minutes (requires PostgreSQL)

## Key Concepts

All examples demonstrate:

- **Hexagonal Architecture**: Domain logic separated from infrastructure
- **Shared Domain Layer**: Cross-database compatibility
- **Dependency Injection**: Using tsyringe for IoC
- **Repository Pattern**: Database adapter for different ORMs
- **RESTful API**: Identical endpoints across all examples
- **Production-Ready**: Error handling, validation, logging

## Running Examples

Each example can be run independently:

```bash
# SQLite (no external services needed)
cd with-sqlite-react
npm install
npm run dev
# → http://localhost:8181

# MongoDB (requires Docker/MongoDB)
docker run -d -p 27017:27017 --name mongo mongo:latest
cd with-mongodb-react
npm install
npm run dev
# → http://localhost:8182

# PostgreSQL (requires Docker/PostgreSQL)
docker run -d --name pg \
  -e POSTGRES_USER=local \
  -e POSTGRES_PASSWORD=local \
  -e POSTGRES_DB=appdb \
  -p 5432:5432 postgres:16
cd with-postgres-react
export DATABASE_URL=postgres://local:local@localhost:5432/appdb
npm install
npm run dev
# → http://localhost:8183
```

## API Endpoints

All examples expose the same REST API:

- `GET /greetings` - Get all greetings (optional `?language=` filter)
- `GET /greetings/:id` - Get greeting by ID
- `POST /greetings` - Create a new greeting
- `DELETE /greetings/:id` - Delete a greeting
- `GET /greetings/random?language=` - Get random greeting by language
- `GET /health` - Health check

## Architecture

All examples follow the same **layered architecture**:

```
apps/backend/src/
├── application/        # HTTP Handlers (Express middleware-free)
│   └── handlers/
│       └── greetings/  # Resource-based organization
├── domain/             # Pure business logic
│   ├── greetings/      # Domain model & service
│   └── models/         # Types & repository ports
└── infrastructure/     # Repository implementations
    └── greetings/      # Database adapters
```

## Design Patterns

- **Dependency Injection**: `@singleton()` + `@inject()` decorators
- **Repository Pattern**: Abstract database operations
- **Service Layer**: Isolated business logic
- **DTO Pattern**: Request/Response separation
- **Port & Adapter**: Hexagonal architecture principles

## Comparing Express vs Fastify

Both platforms implement identical domain logic but with different HTTP frameworks:

| Aspect              | Express                      | Fastify               |
| ------------------- | ---------------------------- | --------------------- |
| **Framework**       | Traditional middleware-based | Modern schema-first   |
| **Handler Pattern** | Function-based               | Function-based        |
| **Validation**      | Manual (Zod schemas)         | Native Zod provider   |
| **Performance**     | Good                         | Excellent             |
| **Best for**        | Traditional projects         | High-performance APIs |

The **domain logic is identical** across both, demonstrating how clean architecture enables framework switching.

## Documentation

- [Service API Reference](../../../docs/service/README.md)
- [Database ORM Patterns](../../../docs/third-party/orm/database-setup.md)
- [Architecture Overview](../../../docs/guidelines/framework-overview.md)
