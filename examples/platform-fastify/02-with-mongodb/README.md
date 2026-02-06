# Fastify + MongoDB + React Example

⚡ **Production-ready with scalable NoSQL** - Fast setup with Zacatl.

- **Backend**: Fastify + MongoDB (Mongoose) - ~50 lines to start
- **Frontend**: React + Tailwind CSS + Vite
- **Architecture**: Clean monorepo with shared types
- **Performance**: < 2 seconds startup with MongoDB

## ⚡ Why This Example?

- ✅ **Scalable**: MongoDB for production workloads
- ✅ **Simple Setup**: Same clean pattern as SQLite example
- ✅ **Type Safe**: Full TypeScript with shared types
- ✅ **Clean DI**: Class-token injection, auto-wired
- ✅ **Production Ready**: Mongoose models + validation

## 🚀 Quick Start

**Prerequisites**: Node.js 18+ or Bun, MongoDB running locally or Docker.

**Quick MongoDB Setup:**

```bash
# Option 1: Docker (recommended)
docker run -d -p 27017:27017 --name mongo \
  -e MONGO_INITDB_ROOT_USERNAME=local \
  -e MONGO_INITDB_ROOT_PASSWORD=local \
  mongo:latest

# Option 2: Local MongoDB
brew install mongodb-community  # macOS
# or follow https://www.mongodb.com/docs/manual/installation/
```

1. **Install dependencies**:

   ```bash
   bun install
   # or npm install
   ```

2. **Start Development (Frontend + Backend)**:
   ```bash
   # Starts both in parallel
   bun run dev
   ```
   _Or run individually:_
   ```bash
   bun run backend:dev   # Port 3002
   bun run frontend:dev  # Port 5002
   ```

## 📂 Project Structure (same as SQLite)

- **Mongoose Integration**: Document models with schema validation
- **Type Safety**: Shared types between frontend and backend
- **Scalable**: Ready for production workloads

## 🎯 Differences from SQLite Example

| Feature       | SQLite Example         | MongoDB Example              |
| ------------- | ---------------------- | ---------------------------- |
| Database      | SQLite (Sequelize)     | MongoDB (Mongoose)           |
| Payload field | `message`              | `text`                       |
| Connection    | File-based             | Network (localhost or cloud) |
| Best for      | Prototypes, small apps | Production, scalable apps    |
| Startup time  | < 1s                   | < 2s                         |

├── apps/
│ ├── backend/ # Fastify API (Port 3002)
│ └── frontend/ # React Dashboard (Port 5002)
├── shared/ # Shared types & domain logic
└── package.json # Workspace configuration

````

## 🔥 Features

- **DI System**: Class-token injection using `tsyringe`
- **Simplified Layering**: Hexagonal architecture with local service adapters
- **Type Safety**: Shared types between frontend and backend
- **Resilient UI**: React frontend with Tailwind CSS

## 🧩 Dependency Injection

Classes use class-token injection with `@singleton()` and `@inject(Class)`.

```ts
import { singleton, inject } from "tsyringe";

@singleton()
export class Greet - Get all greetings
- `GET /greetings/:id` - Get greeting by ID
- `GET /greetings/random/:language` - Get random greeting
- `POST /greetings` - Create greeting: `{ "text": string, "language": string }`
- `DELETE /greetings/:id` - Delete greeting

**Note**: This example uses `text` in the request payload. The SQLite example uses `message` instead.

## 🎯 Minimal Entry Point

**Same simplicity as SQLite** ([apps/backend/src/index.ts](apps/backend/src/index.ts)):
```typescript
import "reflect-metadata";
import "./di";
import { Fastify } from "@sentzunhat/zacatl/third-party/fastify";
import mongoose from "mongoose";
import { Service } from "@sentzunhat/zacatl/service";
import { config, createServiceConfig } from "./config";

const fastify = Fastify({ logger: false });
const serviceConfig = createServiceConfig(fastify, mongoose);
const service = new Service(serviceConfig);

await service.start({ port: 8082 });
````

**Performance Tips:**

- Use connection pooling for production
- Enable MongoDB indexing on frequently queried fields
- Consider MongoDB Atlas for cloud deployments
- Use Bun for faster cold starts

## 📚 API Endpoints

- `GET /greetings`
- `GET /greetings/:id`
- `GET /greetings/random/:language`
- `POST /greetings` - Body: `{ "text": string, "language": string }`
- `DELETE /greetings/:id`

**Note**: This example uses `text` in the request payload. The SQLite example uses `message` instead.
