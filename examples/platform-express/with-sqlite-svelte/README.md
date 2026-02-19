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

See [with-sqlite-react](../with-sqlite-react/) for the same example using React instead of Svelte. The backend is identical - only the frontend framework differs.

## Documentation

- **[Main Examples README](../../README.md)** - All available examples
- **[Framework Docs](../../../docs/)** - Full Zacatl documentation

## Why Svelte + SQLite?

- **Svelte**: Smaller bundle sizes, simpler syntax, compiler-based reactivity
- **SQLite**: Zero infrastructure, instant setup, perfect for prototyping
- **Express**: Traditional Node.js framework, battle-tested, wide ecosystem
- **Zacatl**: Clean architecture patterns, dependency injection, framework-agnostic domain logic
