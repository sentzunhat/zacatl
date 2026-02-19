# Fastify Platform Examples

⚡ **Production-ready, blazing-fast** full-stack examples using Zacatl on Fastify.

## Why These Examples?

- 🚀 **Simple**: Minimal boilerplate (~50 lines to start)
- ⚡ **Fast**: Optimized for speed (no heavy middleware)
- 🎯 **Clear**: Clean architecture with DI
- 📦 **Complete**: Backend + Frontend + Shared types

## Available Examples

### 1. [SQLite + React (with-sqlite-react)](./with-sqlite-react)

- **Stack**: Fastify, SQLite (Sequelize), React, Tailwind
- **Best for**: Rapid prototyping, small apps, zero-infrastructure setups
- **Startup**: < 1 second
- **Ports**: Backend: 8081, Frontend: 5001

### 1b. [SQLite + Svelte (with-sqlite-svelte)](./with-sqlite-svelte)

- **Stack**: Fastify, SQLite (Sequelize), Svelte 5, Tailwind
- **Best for**: Smaller bundles, simpler reactivity, rapid prototyping
- **Startup**: < 1 second
- **Ports**: Backend: 8081, Frontend: 5001
- **Note**: Same backend as React version, different frontend framework

### 2. [MongoDB + React (with-mongodb-react)](./with-mongodb-react)

- **Stack**: Fastify, MongoDB (Mongoose), React, Tailwind
- **Best for**: Scalable document-based applications
- **Startup**: < 2 seconds (with MongoDB connection)
- **Ports**: Backend: 8082, Frontend: 5002

### 3. [PostgreSQL + React (with-postgres-react)](./with-postgres-react)

- **Stack**: Fastify, PostgreSQL (Sequelize), React, Tailwind
- **Best for**: Relational workflows and production SQL
- **Startup**: < 2 seconds (with PostgreSQL connection)
- **Ports**: Backend: 8083, Frontend: 5003

## 🏗️ Architecture & Folder Structure

All examples follow the same clean, scalable architecture:

```
apps/backend/src/
├── application/        # HTTP handlers (entry points)
│   └── handlers/
│       └── greetings/  # Feature: Greetings CRUD
├── domain/             # Business logic (framework-independent)
│   ├── greetings/      # Feature: Greetings
│   │   ├── greeting.model.ts
│   │   ├── greeting.service.ts
│   │   └── greeting.service.port.ts
│   └── models/
├── infrastructure/     # Database & external services
│   ├── greetings/
│   │   ├── models/
│   │   └── repositories/
│   └── database/
├── config.ts
└── index.ts
```

**See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed patterns, best practices, and how to add new features.**

**Key Architectural Principles:**

- **Layered Architecture**: Clear separation of concerns (application, domain, infrastructure)
- **Hexagonal/Ports-and-Adapters**: Domain defines contracts, infrastructure provides implementations
- **Feature-Based Organization**: Group related code by business domain/feature
- **Type Safety**: Full TypeScript with strict typing throughout
- **Dependency Injection**: Class-token DI with `@singleton()` and `@inject()`
- Shared TypeScript types between frontend/backend
- Zero config needed (works out of the box)

## 🚀 Quick Start (30 seconds)

```bash
# Choose your example
cd with-sqlite-react  # or with-mongodb-react or with-postgres-react

# Install & run
npm install
npm run dev  # Starts both backend + frontend

# Open http://localhost:5001 (SQLite) or http://localhost:5002 (MongoDB) or http://localhost:5003 (PostgreSQL)
```

## 📚 Documentation

- **[Quick Start Guide](./docs/quick-start.md)** - Complete setup walkthrough
- **[Production Patterns](./docs/production-patterns.md)** - Framework-agnostic patterns
- **[Validation Checklist](./docs/validation-checklist.md)** - Transformation details
- **Database Setup**: See each example README under "Database Setup"
- **[Framework Docs](../../docs/)** - Full Zacatl documentation
