# Express Platform Examples

This directory contains examples demonstrating the Zacatl framework with the Express web framework.

## Examples

### 1. Express + Sequelize + SQLite

**Location:** `01-with-sqlite/`

- **Framework:** Express
- **Database:** SQLite
- **ORM:** Sequelize
- **Port:** 8083

### 2. Express + Mongoose + MongoDB

**Location:** `02-with-mongodb/`

- **Framework:** Express
- **Database:** MongoDB
- **ODM:** Mongoose
- **Port:** 8084

## Key Concepts

Both examples demonstrate:

- **Hexagonal Architecture**: Domain logic separated from infrastructure
- **Shared Domain Layer**: The same business logic works with both databases
- **Dependency Injection**: Using tsyringe for IoC
- **RESTful API**: Consistent API across different implementations

## Shared Components

These examples use shared domain logic from `examples/shared/domain/`:

- **Models**: `Greeting` entity
- **Ports**: `GreetingRepositoryPort` interface
- **Services**: `GreetingService` with business logic

Each example provides its own **adapter** implementation:

- **SQLite**: `SequelizeGreetingRepository`
- **MongoDB**: `MongooseGreetingRepository`

## Running Examples

Each example can be run independently:

```bash
# SQLite example
cd 01-with-sqlite
npm install
npm run dev

# MongoDB example (requires MongoDB running)
cd 02-with-mongodb
npm install
npm run dev
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

```
┌─────────────────────────────────────────────┐
│           Express Application               │
│  (01-with-sqlite or 02-with-mongodb)        │
├─────────────────────────────────────────────┤
│                                             │
│  Handlers (Express Request/Response)        │
│           ↓                                 │
│  GreetingService (Shared Domain)            │
│           ↓                                 │
│  GreetingRepository (Adapter)               │
│           ↓                                 │
│  Sequelize/Mongoose (Infrastructure)        │
│           ↓                                 │
│  SQLite/MongoDB (Database)                  │
└─────────────────────────────────────────────┘
```

## Comparing with Fastify

The `platform-fastify/` examples use the same shared domain logic but with:

- Fastify web framework instead of Express
- Different handler implementations
- Same business logic and API

This demonstrates how the hexagonal architecture allows swapping infrastructure components while keeping domain logic unchanged.
