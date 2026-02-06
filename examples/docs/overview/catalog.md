# Zacatl Examples - Visual Catalog

> **Quick visual guide** showing all available examples and helping you choose what to use.

---

## 🗺️ Current Catalog

```
BACKEND APPLICATIONS
│
├─ platform-fastify/01-with-sqlite/      ⭐ START HERE
│  ├─ Category: Full-Stack
│  ├─ Stack: Fastify + SQLite + React + Zacatl
│  ├─ Framework: Full Zacatl (Layers + DI)
│  ├─ Setup: < 1 min (zero external deps)
│  ├─ Startup: < 1 second
│  └─ Use: Production-ready, fastest development
│
├─ platform-fastify/02-with-mongodb/
│  ├─ Category: Full-Stack
│  ├─ Stack: Fastify + MongoDB + React + Zacatl
│  ├─ Framework: Full Zacatl (Layers + DI)
│  ├─ Setup: 2 min (requires MongoDB)
│  ├─ Startup: < 2 seconds
│  └─ Use: Production document database apps
│
├─ platform-express/01-with-sqlite/
│  ├─ Category: Backend-Only
│  ├─ Stack: Express + SQLite + Zacatl
│  ├─ Framework: Full Zacatl (Layers + DI)
│  ├─ Setup: < 1 min (file-based DB)
│  └─ Use: Traditional Node.js patterns
│
├─ platform-express/02-with-mongodb/
│  ├─ Category: Backend-Only
│  ├─ Stack: Express + MongoDB + Zacatl
│  ├─ Framework: Full Zacatl (Layers + DI)
│  ├─ Setup: 2 min (requires MongoDB)
│  └─ Use: Express + NoSQL patterns
│
SHARED CODE
│
└─ shared/domain/
   ├─ Models: Greeting entity
   ├─ Ports: GreetingRepository interface
   ├─ Services: GreetingService (business logic)
   └─ Use: Reusable across all backend examples
```

---

## 🎯 Decision Matrix - Choose Your Example

| Need                    | Recommendation                      | Why                                |
| ----------------------- | ----------------------------------- | ---------------------------------- |
| **Get started fastest** | `platform-fastify/01-with-sqlite/`  | < 1s startup, zero infrastructure  |
| **See Zacatl patterns** | `platform-fastify/01-with-sqlite/`  | Clear DI, monorepo, full-stack     |
| **Build NoSQL app**     | `platform-fastify/02-with-mongodb/` | MongoDB patterns, production-ready |
| **Build SQL app**       | `platform-express/01-with-sqlite/`  | Relational database patterns       |
| **Full-stack with UI**  | `platform-fastify/01-with-sqlite/`  | React frontend included            |
| **Backend API only**    | `platform-express/01-with-sqlite/`  | Minimal overhead                   |
| **Learn from examples** | `platform-fastify/`                 | Best practices, clean code         |
| **Avoid external deps** | `platform-fastify/01-with-sqlite/`  | SQLite is file-based               |

---

## 📦 Technology Matrix

| Example           | HTTP Server | Database | Runtime | Frontend | DI Framework | DB Lib    |
| ----------------- | ----------- | -------- | ------- | -------- | ------------ | --------- |
| fastify/01-sqlite | Fastify     | SQLite   | Bun     | React    | tsyringe     | Knex      |
| fastify/02-mongo  | Fastify     | MongoDB  | Bun     | React    | tsyringe     | Mongoose  |
| express/01-sqlite | Express     | SQLite   | Node    | ❌ None  | tsyringe     | Sequelize |
| express/02-mongo  | Express     | MongoDB  | Node    | ❌ None  | tsyringe     | Mongoose  |

---

## 🏗️ Architecture Pattern

### All Production Examples (Fastify & Express)

```
HTTP Layer (Fastify/Express)
    ↓
Application Layer
├─ HTTP Handlers
    ↓
Domain Layer (shared/domain)
├─ GreetingService (business logic)
    ↓
Infrastructure Layer
├─ Repository (MongoDB/SQLite adapter)
```

**Pattern:** Hexagonal Architecture with Dependency Injection

**DI Container:** tsyringe with class decorators (`@singleton()`, `@inject()`)

---

## 🚀 Quick Start by Framework

### Fastify (⭐ Recommended)

```bash
# SQLite - Fastest to run
cd platform-fastify/01-with-sqlite
npm install && npm run dev
# → http://localhost:8081

# MongoDB - Full production setup
cd platform-fastify/02-with-mongodb
npm install && npm run dev
# → http://localhost:8082
```

### Express

```bash
# SQLite - Traditional Node patterns
cd platform-express/01-with-sqlite
npm install && npm run dev
# → http://localhost:8083

# MongoDB - NoSQL patterns
cd platform-express/02-with-mongodb
npm install && npm run dev
# → http://localhost:8084
```

---

## 📊 Complexity Levels

| Level                 | Examples                     | Best For                           |
| --------------------- | ---------------------------- | ---------------------------------- |
| **⭐ Beginner**       | fastify/01-sqlite            | First-time Zacatl users            |
| **⭐⭐ Intermediate** | fastify/02-mongo, express/\* | Production apps, learning patterns |

---

## ✨ What's Included in Each Example

### fastify/01-with-sqlite

- 🎯 **Monorepo:** apps/backend, apps/frontend, shared/
- 📦 **Frontend:** React + Tailwind CSS
- 💾 **Database:** SQLite (file-based, zero setup)
- ⚡ **Speed:** < 1 second startup
- 🔌 **DI:** Class-token pattern with @singleton()/@inject()
- 📝 **Code:** ~500 lines, well-documented

### fastify/02-with-mongodb

- 🎯 **Monorepo:** apps/backend, apps/frontend, shared/
- 📦 **Frontend:** React + Tailwind CSS
- 💾 **Database:** MongoDB (document)
- ⚡ **Speed:** < 2 seconds startup
- 🔌 **DI:** Class-token pattern with @singleton()/@inject()
- 📝 **Code:** ~600 lines, production-ready

### express/01-with-sqlite

- 🎯 **Backend-only:** No frontend
- 💾 **Database:** SQLite + Sequelize ORM
- 🔌 **DI:** tsyringe dependency injection
- 📝 **Code:** ~400 lines, simple

### express/02-with-mongodb

```bash
docker run -d -p 27017:27017 --name mongo mongo:latest
cd 02-with-mongodb && npm install && npm start
# → http://localhost:8080
```

### 03-with-sqlite

```bash
cd 03-with-sqlite && npm install && npm start
# → http://localhost:8081
```

### 04-react-frontend

```bash
cd 04-react-frontend && npm install && npm run dev
# → http://localhost:5173
```

---

## 📊 Feature Matrix

| Feature                       | 01     | 02       | 03       | 04  |
| ----------------------------- | ------ | -------- | -------- | --- |
| **Backend**                   | ✅     | ✅       | ✅       | ❌  |
| **Frontend**                  | ❌     | ❌       | ❌       | ✅  |
| **REST API**                  | ✅     | ✅       | ✅       | -   |
| **Persistence**               | Memory | MongoDB  | SQLite   | -   |
| **Layers (App/Domain/Infra)** | Basic  | Full     | Full     | -   |
| **DI Container**              | Manual | tsyringe | tsyringe | -   |
| **Zacatl Framework**          | ❌     | ✅       | ✅       | ❌  |
| **Docker Ready**              | ✅     | ✅       | ✅       | ✅  |
| **Copy-Paste Deployable**     | ✅     | ✅       | ✅       | ✅  |

---

## 💡 Patterns Demonstrated

### All Examples

- ✅ TypeScript
- ✅ Environment configuration
- ✅ Error handling
- ✅ Docker support
- ✅ Production-ready structure

### Backend Examples

- ✅ Repository pattern
- ✅ Service layer (business logic)
- ✅ REST API design
- ✅ CRUD operations

### Zacatl Examples (02, 03)

- ✅ Layered architecture
- ✅ Dependency injection
- ✅ Port-adapter pattern
- ✅ Declarative service configuration
- ✅ Framework-agnostic domain

---

## 🗂️ File Structure Patterns

### Simple Example (01)

```
src/
├── types.ts           # Type definitions
├── greeting-repository.ts  # Data access
├── greeting-service.ts     # Business logic
└── server.ts          # HTTP server + routes
```

### Zacatl Examples (02, 03)

```
src/
├── application/       # HTTP handlers
│   └── handlers/
├── infrastructure/    # Database adapters
│   ├── models/       # ORM/ODM models
│   └── repositories/ # Repository implementations
├── config/           # Service configuration
│   └── service.config.ts
└── index.ts          # Entry point
```

Plus shared domain in `../shared/domain/`:

```
shared/domain/
├── models/           # Domain entities
│   └── greeting.ts
├── ports/            # Interfaces
│   └── greeting-repository.port.ts
└── services/         # Business logic
    └── greeting.service.ts
```

---

## 🎓 Learning Progression

1. **Start:** `01-hello-simple`
   - Understand: Repository, Service, Routes
   - Practice: Make changes, add features

2. **Level Up:** `02-with-mongodb` OR `03-with-sqlite`
   - Understand: Layers, DI, Port-Adapter
   - Practice: Swap databases, modify config

3. **Integrate:** `04-react-frontend`
   - Understand: Frontend-backend communication
   - Practice: Add features end-to-end

4. **Build:** Your own app
   - Use examples as templates
   - Mix patterns as needed

---

## 📚 Related Documentation

- [README.md](./README.md) - Full examples guide
- [INDEX.md](./INDEX.md) - Quick reference
- [COMPARISON.md](./COMPARISON.md) - Architecture deep-dive
- Individual example READMEs - Specific details

---

**Choose your path and start building!** 🚀
