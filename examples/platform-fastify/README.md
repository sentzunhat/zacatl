# Fastify Platform Examples

⚡ **Production-ready, blazing-fast** full-stack examples using Zacatl on Fastify.

## Why These Examples?

- 🚀 **Simple**: Minimal boilerplate (~50 lines to start)
- ⚡ **Fast**: Optimized for speed (no heavy middleware)
- 🎯 **Clear**: Clean architecture with DI
- 📦 **Complete**: Backend + Frontend + Shared types

## Available Examples

### 1. [SQLite + React (01-with-sqlite)](./01-with-sqlite)

- **Stack**: Fastify, SQLite (Sequelize), React, Tailwind
- **Best for**: Rapid prototyping, small apps, zero-infrastructure setups
- **Startup**: < 1 second
- **Ports**: API: 3001, UI: 5001

### 2. [MongoDB + React (02-with-mongodb)](./02-with-mongodb)

- **Stack**: Fastify, MongoDB (Mongoose), React, Tailwind
- **Best for**: Scalable document-based applications
- **Startup**: < 2 seconds (with MongoDB connection)
- **Ports**: API: 3002, UI: 5002

## 🏗️ Architecture

Both examples use a clean, consistent monorepo structure:

```
example-root/
├── apps/
│   ├── backend/    # Fastify Server (TypeScript)
│   └── frontend/   # React + Vite + Tailwind
└── shared/         # Shared types & domain models
```

**Key Patterns:**

- Class-token DI with `@singleton()` and `@inject()`
- Handler → Service → Repository layers
- Shared TypeScript types between frontend/backend
- Zero config needed (works out of the box)

## 🚀 Quick Start (30 seconds)

```bash
# Choose your example
cd 01-with-sqlite  # or 02-with-mongodb

# Install & run
bun install
bun run dev  # Starts both backend + frontend

# Open http://localhost:5001 (SQLite) or http://localhost:5002 (MongoDB)
```

## 📚 Learn More

- [Quick Start Guide](./QUICK_START.md) - Detailed setup instructions
- [Architecture Details](./01-with-sqlite/README.md) - How it all works
- [Main Documentation](../../docs/) - Full Zacatl framework docs
