# Zacatl Framework Examples

A catalog of standalone, production-ready server applications demonstrating different patterns and use cases. Each example is fully functional, copy-paste deployable, and follows the same domain logic across different server frameworks and databases.

> **🤖 For Agents:** See [AGENTS.md](./AGENTS.md) - Comprehensive guidance for building parallel platform examples.
> **🐳 For Docker:** See [DOCKER.md](./DOCKER.md) - Complete Docker deployment guide and architecture explanation.
> **💾 For Databases:** Use [dev-env](../dev-env/) to run MongoDB + PostgreSQL containers for local development.
> **Note**: Examples use **Node.js 24+** with **npm**.
> **📦 Dependencies:** All examples import from `@sentzunhat/zacatl` exports—see [Unified Dependency Strategy](../docs/service/dependency-exports.md) for details.

### Choose Your Framework & Database

**Choose your platform:**

- **[platform-fastify/](./platform-fastify/)** ⭐ **RECOMMENDED** - Fastest & most polished
  - `with-sqlite-react/` - Fastify + SQLite + React (Backend: 8081, Frontend: 5001, < 1s startup)
  - `with-sqlite-svelte/` - Fastify + SQLite + Svelte (Backend: 8081, Frontend: 5001, < 1s startup)
  - `with-mongodb-react/` - Fastify + MongoDB + React (Backend: 8082, Frontend: 5002, < 2s startup)
  - `with-postgres-react/` - Fastify + PostgreSQL + React (Backend: 8083, Frontend: 5003, < 2s startup)
- **[platform-express/](./platform-express/)** - Traditional Node.js patterns
  - `with-sqlite-react/` - Express + SQLite + React (Backend: 8181, Frontend: 5001)
  - `with-sqlite-svelte/` - Express + SQLite + Svelte (Backend: 8181, Frontend: 5001)
  - `with-mongodb-react/` - Express + MongoDB + React (Backend: 8182, Frontend: 5002)
  - `with-postgres-react/` - Express + PostgreSQL + React (Backend: 8183, Frontend: 5003)

**All examples include:**

- Identical domain logic and API endpoints
- Production-ready architecture (Hexagonal, DI, Layered)
- CRUD operations for Greeting entity
- TypeScript with strict type checking
- 🐳 Docker Compose support (single image = backend + frontend)

---

## 📦 Backend Examples - Production Patterns

All tier 2 examples follow **identical architecture and endpoints** but use different HTTP frameworks (Express/Fastify) and database adapters (SQLite/MongoDB).

#### Platform: Express

**[platform-express/](./platform-express/README.md)** - Express.js backend examples

##### with-sqlite

**Stack:** Express + SQLite + Zacatl
**Level:** Intermediate | **Setup:** < 1 minute (no external deps)

```bash
cd platform-express/with-sqlite-react && npm install && npm run dev
# → http://localhost:8181
```

**What it shows:**

- Zacatl Service Framework
- Application/Domain/Infrastructure layers
- tsyringe dependency injection
- SQLite + Sequelize (file-based, perfect for dev)
- Express HTTP platform
- CRUD REST API
- 🐳 Docker Compose support

##### with-mongodb

**Stack:** Express + MongoDB + Zacatl
**Level:** Intermediate | **Setup:** 2 minutes (requires MongoDB)

```bash
docker run -d -p 27017:27017 --name mongo mongo:latest
cd platform-express/with-mongodb-react && npm install && npm run dev
# → http://localhost:8182
```

**What it shows:**

- Same service layer as SQLite example
- Repository pattern with Mongoose adapter
- MongoDB document persistence
- Identical API endpoints

##### with-postgres

**Stack:** Express + PostgreSQL + Zacatl
**Level:** Intermediate | **Setup:** 2 minutes (requires PostgreSQL)

```bash
docker run -d --name pg \
  -e POSTGRES_USER=local -e POSTGRES_PASSWORD=local \
  -e POSTGRES_DB=appdb -p 5432:5432 postgres:16
cd platform-express/with-postgres-react && npm install && npm run dev
# → http://localhost:8183
```

**What it shows:**

- Relational database with PostgreSQL
- Sequelize ORM for SQL queries
- Production-grade SQL patterns

---

#### Platform: Fastify ⭐ RECOMMENDED

**[platform-fastify/](./platform-fastify/README.md)** - Fastify backend examples with React frontends

**Why Fastify?** Fastest startup, native TypeScript, excellent performance, included React UIs.

##### with-sqlite

**Stack:** Fastify + SQLite + React + Tailwind
**Level:** Intermediate | **Setup:** < 1 minute

```bash
cd platform-fastify/with-sqlite-react && npm install && npm run dev
# → http://localhost:8081 (full-stack with React UI)
```

**What it shows:**

- Monorepo structure (apps/backend, apps/frontend, shared/)
- Class-token DI with `@singleton()` and `@inject()`
- React + Tailwind CSS frontend included
- SQLite + Knex for persistence
- Full-stack setup in one folder

##### with-mongodb

**Stack:** Fastify + MongoDB + React + Tailwind
**Level:** Intermediate | **Setup:** 2 minutes (MongoDB required)

```bash
docker run -d -p 27017:27017 --name mongo mongo:latest
cd platform-fastify/with-mongodb-react && npm install && npm run dev
# → http://localhost:8082 (full-stack with React UI)
```

**What it shows:**

- Same as SQLite, with MongoDB instead
- Document database patterns
- Mongoose ODM integration

**What you'll learn:**

- React with TypeScript
- API integration patterns
- Configurable backend endpoints
- Vite dev setup

---

## 🏗️ Shared Code

### [shared/domain/](./shared/domain/)

Reusable business logic and data models used across all backend examples.

**Includes:**

- `GreetingService` - Core business logic (create, list, update, delete greetings)
- `GreetingRepository` interface - Storage abstraction (implemented differently per ORM)
- `Greeting` models - Data structures
- Domain ports - Interfaces for adapters

**No dependencies on frameworks or specific databases** - pure domain logic.

---

## � Endpoint Specification

All backend examples implement these 5 identical endpoints:

### Create Greeting

**POST** `/greetings`

```json
Request:  { "message": "Hello" }
Response: { "id": "uuid", "message": "Hello", "createdAt": "2024-01-01T00:00:00Z" }
```

### List Greetings

**GET** `/greetings`

```json
Response: { "data": [ { "id": "uuid", "message": "Hello", "createdAt": "..." } ] }
```

### Get Single Greeting

**GET** `/greetings/{id}`

```json
Response: { "id": "uuid", "message": "Hello", "createdAt": "..." }
```

### Update Greeting

**PATCH** `/greetings/{id}`

```json
Request:  { "message": "Updated" }
Response: { "id": "uuid", "message": "Updated", "createdAt": "..." }
```

### Delete Greeting

**DELETE** `/greetings/{id}`

```json
Response: { "id": "uuid", "deleted": true }
```

---

## 🔄 Architecture: Same Domain, Different Adapters

```
┌─────────────────────────────────────────────────────────────────┐
│                      Shared Domain Logic                         │
│  (GreetingService, Models, Repository Interface)                 │
│                    (shared/domain/)                              │
└──────────────────┬──────────────────────────────┬────────────────┘
                   │                              │
        ┌──────────┴──────────┐        ┌──────────┴──────────┐
        │                     │        │                     │
   ┌────▼─────────────┐  ┌───▼─────────────┐  ┌───▼─────────────┐
   │  Express         │  │  Fastify        │  │  React Frontend │
   │  (HTTP Layer)    │  │  (HTTP Layer)   │  │  (SPA)          │
   └────┬─────────────┘  └───┬─────────────┘  └─────────────────┘
        │                    │
   ┌────┴─────────┐      ┌───┴─────────┐
   │              │      │             │
┌──▼──────┐  ┌───▼─────┐ ┌──▼──────┐  ┌───▼─────┐
│ SQLite  │  │ MongoDB │ │ SQLite  │  │ MongoDB │
│ (via    │  │ (via    │ │ (via    │  │ (via    │
│Sequelize)  │Mongoose)│ │Sequelize)  │Mongoose)│
└─────────┘  └────────┘ └─────────┘  └────────┘
```

**Key principle:** All implementations follow the same domain logic. Framework and database differences are hidden behind repository adapters.

---

## � Quick Start

Pick one and run it:

```bash
# Option 1: Express + SQLite (instant setup)
cd platform-express/with-sqlite-react && npm install && npm run dev

# Option 2: Express + MongoDB (with Docker)
docker run -d -p 27017:27017 --name mongo mongo:latest
cd platform-express/with-mongodb-react && npm install && npm run dev

# Option 3: Fastify + SQLite (full-stack with React)
cd platform-fastify/with-sqlite-react && npm install && npm run dev

# Option 4: Fastify + MongoDB (full-stack with React)
docker run -d -p 27017:27017 --name mongo mongo:latest
cd platform-fastify/with-mongodb-react && npm install && npm run dev
```

---

## 📚 Additional Resources

- **[AGENTS.md](./AGENTS.md)** - Guidance for AI agents building new examples
- **[shared/domain/README.md](./shared/domain/README.md)** - Domain logic documentation

---

## ✅ Validation Checklist

Each example should pass:

- [ ] `npm install` succeeds
- [ ] `npm run dev` starts server on assigned port without errors
- [ ] All 5 endpoints respond with valid JSON
- [ ] Database operations (CRUD) work correctly
- [ ] README.md documents setup and port usage
- [ ] `.env.example` provided with all required variables
- [ ] `npm run build` produces no errors

---

## 🤝 Contributing

To add a new example:

1. Follow the structure in [AGENTS.md](./AGENTS.md)
2. Use identical endpoints as other examples
3. Reuse shared domain logic from `shared/domain/`
4. Document setup steps in README.md
5. Include `.env.example` with all environment variables

---

## 📞 Support

See [AGENTS.md - Quick Diagnosis Checklist](./AGENTS.md#quick-diagnosis-checklist) for common issues and solutions.

---

**Last Updated:** February 4, 2026
