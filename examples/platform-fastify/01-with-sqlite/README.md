# Fastify + SQLite + React Example

⚡ **The simplest, fastest way** to start with Zacatl.

- **Backend**: Fastify + SQLite (Sequelize) - ~50 lines to start
- **Frontend**: React + Tailwind CSS + Vite
- **Architecture**: Clean monorepo with shared types
- **Performance**: < 1 second startup, zero config

## ⚡ Why This Example?

- ✅ **Zero Infrastructure**: No database servers needed (SQLite file)
- ✅ **InstanOptimized for **Bun\*\* for maximum speed. Zacatl works with any runtime
- ✅ **Type Safe**: Full TypeScript with shared types
- ✅ **Clean DI**: Class-token injection, no manual wiring
- ✅ **Minimal**: Only essential features, nothing extra

## 🚀 Quick Start

**Prerequisites**: Bun 1.x (recommended) or Node.js 18+

> **Note**: This example is optimized for **Bun**. The Zacatl framework uses npm for development and is tested with Vitest.

1. **Install dependencies**:

   ```bash
   bun install
   ```

2. **Start Development (Frontend + Backend)**:
   ```bash
   # Starts both in parallel
   bun run dev
   ```
   _Or run individually:_
   ```bash
   bun run backend:dev   # Port 3001
   bun run frontend:dev  # Port 5001
   ```

## 📂 Project Structure

```
01-with-sqlite/
├── apps/
│   ├── backend/      # Fastify API (Port 3001)
│   └── frontend/     # React Dashboard (Port 5001)
├── shared/           # Shared types & domain logic
└── package.json      # Workspace configuration
```

## 🔥 Features

- **DI System**: Class-token injection using `tsyringe`
- **Simplified Layering**: Minimal hexagonal architecture
- **Type Safety**: Shared types between frontend and backend
- **Zero Config**: SQLite file created automatically

## 🧩 Dependency Injection

Classes use class-token injection with `@singleton()` and `@inject(Class)`.

````ts
import { singleton, inject } from "tsyringe";

@singleton()
export class GreetingService {
  constructor( - Get all greetings
- `GET /greetings/:id` - Get greeting by ID
- `GET /greetings/random/:language` - Get random greeting
- `POST /greetings` - Create greeting: `{ "message": string, "language": string }`
- `DELETE /greetings/:id` - Delete greeting

**Note**: This example uses `message` in the request payload. The MongoDB example uses `text` instead.

## 🎯 Why This is Simple & Fast

**Minimal Entry Point** ([apps/backend/src/index.ts](apps/backend/src/index.ts)):
```typescript
import "reflect-metadata";
import "./init-di";
import Fastify from "fastify";
import { Sequelize } from "sequelize";
import { Service } from "@sentzunhat/zacatl/service";
import { config, createServiceConfig } from "./config";

const fastify = Fastify({ logger: false });
const sequelize = new Sequelize({ dialect: "sqlite", storage: "database.sqlite" });
const service = new Service(createServiceConfig(fastify, sequelize));

await service.start({ port: 3001 });
````

**That's it!** No middleware, no complex setup. Zacatl handles:

- ✅ DI container registration (via config layers)
- ✅ Route registration (from handlers)
- ✅ Database connection & sync
- ✅ Graceful shutdown

**Performance Tips:**

- Use Bun for 2-3x faster startup vs Node.js
- SQLite is in-memory fast (no network latency)
- No logger in production = faster responses
- Minimal dependencies = smaller bundle

## 📚 API Endpoints

- `GET /greetings`
- `GET /greetings/:id`
- `GET /greetings/random/:language`
- `POST /greetings` - Body: `{ "message": string, "language": string }`
- `DELETE /greetings/:id`

**Note**: This example uses `message` in the request payload. The MongoDB example uses `text` instead.
