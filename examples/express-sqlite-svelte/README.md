# Express + SQLite + Svelte

Production-ready full-stack example using Zacatl framework with Express, SQLite, and Svelte.

## Stack

- **Backend**: Express + Zacatl Framework
- **Database**: SQLite (via Sequelize ORM)
- **Frontend**: Svelte 5 + TypeScript + Tailwind CSS
- **Architecture**: Hexagonal (Ports & Adapters) + DI

## Quick Start

```bash
# From this directory
npm install
npm run dev
```

- **Backend API**: http://localhost:8181
- **Frontend**: http://localhost:5001

## What's Inside

- ✅ Express HTTP server with Zacatl Service framework
- ✅ SQLite database (file-based, zero setup)
- ✅ Full CRUD REST API for "Greetings"
- ✅ Svelte 5 frontend with modern reactivity
- ✅ Dependency Injection with tsyringe
- ✅ Layered architecture (Application/Domain/Infrastructure)
- ✅ TypeScript throughout
- ✅ Tailwind CSS styling

## API Endpoints

- `GET /greetings` - List all greetings (optional `?language=` filter)
- `GET /greetings/:id` - Get greeting by ID
- `POST /greetings` - Create greeting
- `DELETE /greetings/:id` - Delete greeting
- `GET /greetings/random/:language` - Get random greeting

## Frontend Features

- **Svelte 5 Reactivity**: Uses modern `$state` and `$derived` runes
- **TypeScript**: Full type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast dev server with HMR

## Compare with React Version

See [express-sqlite-react](../express-sqlite-react/) for the same example using React instead of Svelte. The backend is identical - only the frontend framework differs.

## Documentation

- **Examples Catalog**: [../README.md](../README.md)
- **Start Here**: [../../START_HERE.md](../../START_HERE.md)
- **Framework Overview**: [../../docs/guidelines/framework-overview.md](../../docs/guidelines/framework-overview.md)
- **Framework Database Guide**: [../../docs/third-party/orm/database-setup.md](../../docs/third-party/orm/database-setup.md)
- **Service Module**: [../../docs/service/README.md](../../docs/service/README.md)

## Next Steps

- Start from [Fastify + SQLite + React](../fastify-sqlite-react/) as the minimal baseline
- Compare this variant with [Express + SQLite + React](../express-sqlite-react/)
- Use the [service module docs](../../docs/service/README.md) when extending platform wiring

## Why Svelte + SQLite?

- **Svelte**: Smaller bundle sizes, simpler syntax, compiler-based reactivity
- **SQLite**: Zero infrastructure, instant setup, perfect for prototyping
- **Express**: Traditional Node.js framework, battle-tested, wide ecosystem
- **Zacatl**: Clean architecture patterns, dependency injection, framework-agnostic domain logic
