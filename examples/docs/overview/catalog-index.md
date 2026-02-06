# Zacatl Examples - Catalog

> **TL;DR:** Start with **Fastify + SQLite** (fastest!), then scale to MongoDB when needed. All examples are production-ready.

**📖 Detailed Guide:** [README.md](./README.md)  
**🗺️ Visual Map:** [CATALOG.md](./CATALOG.md)  
**🤖 AI Agent Guide:** [AGENTS.md](./AGENTS.md)  
**⚡ Best Practices:** [COMPARISON_GUIDE.md](./COMPARISON_GUIDE.md) ← **NEW!**

---

## ⚡ Recommended Starting Point

### 🏆 Fastify + SQLite (Fastest & Simplest)

**Location:** `platform-fastify/01-with-sqlite/`

**Why Start Here:**

- ✅ **50 lines** to get running
- ✅ **< 1 second** startup
- ✅ **Zero infrastructure** needed
- ✅ **Best practices** demonstrated
- ✅ **Full-stack** with React frontend

```bash
cd platform-fastify/01-with-sqlite
bun install && bun run dev
# → Backend: http://localhost:8081
# → Frontend: http://localhost:5173
```

---

## 📦 All Examples

### Platform: Fastify (Recommended)

### Platform: Fastify (Recommended)

**Location:** `platform-fastify/`

**Why Fastify?** Fastest HTTP server for Node.js, optimized for performance, used in production by Netflix, Microsoft, and more.

#### [01-with-sqlite](./platform-fastify/01-with-sqlite/) ⚡ **START HERE**

**Stack:** Fastify + SQLite + Sequelize + React + Zacatl  
**Ports:** Backend: 8081, Frontend: 5173  
**Setup Time:** 30 seconds  
**External Deps:** None (zero infrastructure!)

```bash
cd platform-fastify/01-with-sqlite
bun install && bun run dev
# → Backend: http://localhost:8081/greetings
# → Frontend: http://localhost:5173
```

**What it shows:**

- ⚡ Minimal entry point (~50 lines)
- 🎯 Clean DI with `@singleton()` and `@inject()`
- 📦 Monorepo with shared types
- 🚀 Blazing fast startup (< 1s)

---

#### [02-with-mongodb](./platform-fastify/02-with-mongodb/)

**Stack:** Fastify + MongoDB + Mongoose + React + Zacatl  
**Ports:** Backend: 8082, Frontend: 5174  
**Setup Time:** 2 minutes (with Docker)  
**External Deps:** MongoDB

```bash
# Start MongoDB
docker run -d -p 27017:27017 --name mongo \
  -e MONGO_INITDB_ROOT_USERNAME=local \
  -e MONGO_INITDB_ROOT_PASSWORD=local \
  mongo:latest

cd platform-fastify/02-with-mongodb
bun install && bun run dev
# → Backend: http://localhost:8082/greetings
# → Frontend: http://localhost:5174
```

**What it shows:**

- 🎯 Same clean pattern as SQLite
- 📈 Production-ready MongoDB setup
- 🔄 Easy migration path (just config change)

---

### Platform: Express.js

#### [01-with-sqlite](./platform-express/01-with-sqlite/)

**Stack:** Express + SQLite + Sequelize + Zacatl  
**Port:** 8083  
**Setup Time:** < 1 minute  
**External Deps:** None (file-based database)

```bash
cd platform-express/01-with-sqlite && npm install && npm run dev
# → http://localhost:8083/greetings
```

**What it shows:** Zacatl framework with Express, file-based SQLite database, service-repository pattern.

---

#### [02-with-mongodb](./platform-express/02-with-mongodb/)

**Stack:** Express + MongoDB + Mongoose + Zacatl  
**Port:** 8084  
**Setup Time:** 2 minutes (requires MongoDB)  
**External Deps:** MongoDB server

```bash
docker run -d -p 27017:27017 --name mongo mongo:latest
cd platform-express/02-with-mongodb && npm install && npm run dev
# → http://localhost:8084/greetings
```

**What it shows:** Same service layer as SQLite example, swapped database adapter (Mongoose vs Sequelize).

---

### Platform: Fastify (Coming Soon)

**Location:** `platform-fastify/`

#### [01-with-sqlite](./platform-fastify/01-with-sqlite/)

**Stack:** Fastify + SQLite + Sequelize + Zacatl  
**Port:** 8081  
**Setup Time:** < 1 minute

Same pattern as Express/SQLite, different HTTP framework.

```bash
cd platform-fastify/01-with-sqlite && npm install && npm run dev
# → http://localhost:8081/greetings
```

---

#### [02-with-mongodb](./platform-fastify/02-with-mongodb/)

**Stack:** Fastify + MongoDB + Mongoose + Zacatl  
**Port:** 8082  
**Setup Time:** 2 minutes

Same pattern as Express/MongoDB, different HTTP framework.

```bash
cd platform-fastify/02-with-mongodb && npm install && npm run dev
# → http://localhost:8082/greetings
```

---

## 🚀 Tier 1: Learning Foundation

### [01-hello-simple](./01-hello-simple/)

**Stack:** Express + In-Memory Storage  
**Level:** Beginner  
**Setup Time:** < 1 minute  
**Port:** 3000

Minimal backend without framework dependencies. Learn core patterns before adopting Zacatl.

```bash
cd 01-hello-simple && npm install && npm run dev
# → http://localhost:3000
```

**What it shows:**

- Pure TypeScript REST API
- Repository + Service patterns
- Manual dependency injection
- Zero external dependencies

---

## 🎨 Frontend Apps

### [04-react-frontend](./04-react-frontend/) (Coming Soon)

**Stack:** React + TypeScript + Vite  
**Level:** Intermediate  
**Setup Time:** < 1 minute  
**Port:** 5173

Modern React frontend that connects to any backend above.

```bash
cd 04-react-frontend && npm install && npm run dev
# → http://localhost:5173
```

Configure API base URL to connect to any backend (8081-8084).

---

## 🏗️ Shared Code

### [shared/domain/](./shared/domain/)

Reusable business logic and data models:

- `GreetingService` - Business logic shared across all backends
- `GreetingRepository` interface - Storage abstraction
- `Greeting` models - Data structures

---

## 🎯 Quick Decision Matrix

**What should I run?**

| I want to...              | Start with                       | Port      | Setup Time |
| ------------------------- | -------------------------------- | --------- | ---------- |
| Learn TypeScript patterns | 01-hello-simple                  | 3000      | ⚡ 1 min   |
| See Zacatl with SQL       | platform-express/01-with-sqlite  | 8083      | ⚡ 1 min   |
| See Zacatl with NoSQL     | platform-express/02-with-mongodb | 8084      | 🐳 2 min   |
| Full-stack app            | 01 backend + 04-react-frontend   | 3000/5173 | ⚡ 2 min   |

---

## 📋 All Endpoints (Identical Across Examples)

Each backend implements these 5 endpoints:

### Create Greeting

```
POST /greetings
{ "message": "Hello" }
→ { "id": "uuid", "message": "Hello", "createdAt": "..." }
```

### List Greetings

```
GET /greetings
→ { "data": [ { "id": "uuid", ... } ] }
```

### Get Greeting

```
GET /greetings/{id}
→ { "id": "uuid", "message": "Hello", ... }
```

### Update Greeting

```
PATCH /greetings/{id}
{ "message": "Updated" }
→ { "id": "uuid", "message": "Updated", ... }
```

### Delete Greeting

```
DELETE /greetings/{id}
→ { "id": "uuid", "deleted": true }
```

---

## 🗺️ Shared Resources

### [shared/domain](./shared/)

---

## 🎯 Learning Path

```
1. Start with 01-hello-simple
   ↓
2. Understand the architecture
   ↓
3. Try platform-express/01-with-sqlite OR platform-express/02-with-mongodb
   ↓
4. See how repositories are swappable
   ↓
5. Add 04-react-frontend
   ↓
6. Build your own!
```

**Time Estimate:**

- Path 1 (Simple example): ~15 minutes
- Path 2 (Add database): ~30 minutes
- Path 3 (Add frontend): ~20 minutes
- Total: ~1 hour to see the full stack

---

## 🔍 Platform Comparison

| Feature            | Express             | Fastify                  |
| ------------------ | ------------------- | ------------------------ |
| **Framework**      | Lightweight, mature | Modern, high-performance |
| **Learning Curve** | Easy                | Easy                     |
| **Port (SQLite)**  | 8083                | 8081                     |
| **Port (MongoDB)** | 8084                | 8082                     |
| **Status**         | Available           | Coming Soon              |

---

## 🛠️ Running Multiple Examples

You can run all backend examples simultaneously (different ports):

```bash
# Terminal 1: Simple example
cd 01-hello-simple && npm run dev        # http://localhost:3000

# Terminal 2: Express + SQLite
cd platform-express/01-with-sqlite && npm run dev   # http://localhost:8083

# Terminal 3: Express + MongoDB
cd platform-express/02-with-mongodb && npm run dev  # http://localhost:8084

# Terminal 4: React frontend (connect to any backend)
cd 04-react-frontend && npm run dev    # http://localhost:5173
```

---

## 🧪 Testing All Backends

```bash
# Test Express + SQLite
curl http://localhost:8083/greetings
curl -X POST http://localhost:8083/greetings \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello Express"}'

# Test Express + MongoDB
curl http://localhost:8084/greetings
curl -X POST http://localhost:8084/greetings \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello MongoDB"}'
```

---

## 📖 More Resources

- **[README.md](./README.md)** - Full examples guide
- **[AGENTS.md](./AGENTS.md)** - Agent guidance for building examples
- **[COMPARISON.md](./COMPARISON.md)** - Detailed architecture comparison
- **[CATALOG.md](./CATALOG.md)** - Visual catalog map
- **[Framework Docs](../docs/)** - Complete framework documentation

---

**Last Updated:** February 4, 2026
-H "Content-Type: application/json" \
 -d '{"message":"Hello SQLite"}'

````

### Clean All Examples

```bash
# From examples directory
cd 01-hello-simple && rm -rf node_modules
cd ../02-with-mongodb && rm -rf node_modules
cd ../03-with-sqlite && rm -rf node_modules database.sqlite
cd ../04-react-frontend && rm -rf node_modules dist
````

---

**Pro Tip**: Start with `01-hello-simple` - it works immediately with zero setup! 🚀

## 💡 Tips

- **Start Simple**: Begin with `01-hello-simple` - no database, runs instantly
- **Compare Side-by-Side**: Open examples in split view to see what changes between them
- **Reuse Domain Logic**: Copy `shared/domain/` to your projects as a starting point
- **Mix and Match**: Try different combinations once you understand the patterns

## 📚 Additional Resources

- **[Framework Architecture](../docs/reference/architecture/framework-overview.md)** (if exists)
- **[Dependency Injection Guide](../docs/guides/dependency-injection.md)** (if exists)
- **[Main Framework README](../README.md)** - Project overview
