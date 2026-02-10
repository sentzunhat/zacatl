# Zacatl Framework Examples

A catalog of standalone, production-ready server applications demonstrating different patterns and use cases. Each example is fully functional, copy-paste deployable, and follows the same domain logic across different server frameworks and databases.

> **🤖 For Agents:** See [AGENTS.md](./AGENTS.md) - Comprehensive guidance for building parallel platform examples.

---

## 🚀 Getting Started

> **Note**: Examples use **Bun** for faster execution and native TypeScript support. The core framework uses **npm** and is compatible with both runtimes.

### Choose Your Framework & Database

**Choose your platform:**

- **[platform-fastify/](./platform-fastify/)** ⭐ **RECOMMENDED** - Fastest & most polished
  - `01-with-sqlite/` - Fastify + SQLite + React (Backend: 8081,Frontend: 8091, < 1s startup)
  - `02-with-mongodb/` - Fastify + MongoDB + React (Backend: 8082, Frontend: 8092, < 2s startup)
- **[platform-express/](./platform-express/)** - Traditional Node.js patterns
  - `01-with-sqlite/` - Express + SQLite (Backend: 8181, backend-only)
  - `02-with-mongodb/` - Express + MongoDB (Backend: 8182, backend-only)

**All examples include:**

- Identical domain logic and API endpoints
- Production-ready architecture (Hexagonal, DI, Layered)
- CRUD operations for Greeting entity
- TypeScript with strict type checking

---

## 📦 Backend Examples - Production Patterns

All tier 2 examples follow **identical architecture and endpoints** but use different HTTP frameworks (Express/Fastify) and database adapters (SQLite/MongoDB).

#### Platform: Express

**[platform-express/](./platform-express/README.md)** - Express.js backend examples

##### 01-with-sqlite

**Stack:** Express + SQLite + Zacatl
**Level:** Intermediate | **Setup:** < 1 minute (no external deps)

```bash
cd platform-express/01-with-sqlite && npm install && npm run dev
# → http://localhost:8083
```

**What it shows:**

- Zacatl Service Framework
- Application/Domain/Infrastructure layers
- tsyringe dependency injection
- SQLite + Sequelize (file-based, perfect for dev)
- Express HTTP platform
- 5 endpoints (CRUD + List)

##### 02-with-mongodb

**Stack:** Express + MongoDB + Zacatl
**Level:** Intermediate | **Setup:** 2 minutes (requires MongoDB)

```bash
docker run -d -p 27017:27017 --name mongo mongo:latest
cd platform-express/02-with-mongodb && npm install && npm run dev
# → http://localhost:8084
```

**What it shows:**

- Same service layer as SQLite example
- Repository pattern swapped for Mongoose adapter
- MongoDB persistence instead of file-based
- Identical API endpoints

---

#### Platform: Fastify ⭐ RECOMMENDED

**[platform-fastify/](./platform-fastify/README.md)** - Fastify backend examples with React frontends

**Why Fastify?** Fastest startup, native TypeScript, excellent performance, included React UIs.

##### 01-with-sqlite

**Stack:** Fastify + SQLite + React + Tailwind
**Level:** Intermediate | **Setup:** < 1 minute

```bash
cd platform-fastify/01-with-sqlite && npm install && npm run dev
# → http://localhost:8081 (full-stack with React UI)
```

**What it shows:**

- Monorepo structure (apps/backend, apps/frontend, shared/)
- Class-token DI with `@singleton()` and `@inject()`
- React + Tailwind CSS frontend included
- SQLite + Knex for persistence
- Full-stack setup in one folder

##### 02-with-mongodb

**Stack:** Fastify + MongoDB + React + Tailwind
**Level:** Intermediate | **Setup:** 2 minutes (MongoDB required)

```bash
docker run -d -p 27017:27017 --name mongo mongo:latest
cd platform-fastify/02-with-mongodb && npm install && npm run dev
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
# Option 1: Learning basics (no framework/database)
cd 01-hello-simple && npm install && npm run dev

# Option 2: Express + SQLite (instant setup)
cd platform-express/01-with-sqlite && npm install && npm run dev

# Option 3: Express + MongoDB (with Docker)
docker run -d -p 27017:27017 --name mongo mongo:latest
cd platform-express/02-with-mongodb && npm install && npm run dev

# Option 4: Fastify + SQLite (coming soon)
cd platform-fastify/01-with-sqlite && npm install && npm run dev
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
