# Zacatl Examples - Catalog Overview

> **Quick visual guide** to help you choose the right example for your needs.

---

## 🗺️ Catalog Map

```
BACKEND APPS (Standalone Servers)
│
├─ 01-hello-simple/
│  ├─ Category: Backend Only
│  ├─ Stack: Express + In-Memory
│  ├─ Framework: None (Vanilla TypeScript)
│  ├─ Setup: < 1 min (zero dependencies)
│  └─ Use: Learning patterns, rapid prototyping
│
├─ 02-with-mongodb/
│  ├─ Category: Backend Only
│  ├─ Stack: Fastify + MongoDB + Zacatl
│  ├─ Framework: Full Zacatl (Layers + DI)
│  ├─ Setup: 2 min (requires MongoDB)
│  └─ Use: Production document database apps
│
└─ 03-with-sqlite/
   ├─ Category: Backend Only
   ├─ Stack: Express + SQLite + Zacatl
   ├─ Framework: Full Zacatl (Layers + DI)
   ├─ Setup: < 1 min (file-based DB)
   └─ Use: Dev/test with relational database

FRONTEND APPS
│
└─ 04-react-frontend/
   ├─ Category: Frontend Only
   ├─ Stack: React + TypeScript + Vite
   ├─ Framework: React
   ├─ Setup: < 1 min
   └─ Use: SPA that connects to any backend above

SHARED CODE
│
└─ shared/domain/
   ├─ Models: Greeting entity
   ├─ Ports: GreetingRepository interface
   ├─ Services: GreetingService (business logic)
   └─ Use: Reusable across all backend examples
```

---

## 🎯 Decision Matrix

### I want to...

**...learn TypeScript server basics**  
→ Start with `01-hello-simple`

**...see Zacatl framework patterns**  
→ Try `02-with-mongodb` or `03-with-sqlite`

**...build a NoSQL app**  
→ Use `02-with-mongodb` as template

**...build a SQL app**  
→ Use `03-with-sqlite` as template

**...avoid database setup during development**  
→ Use `03-with-sqlite` (file-based)

**...build a full-stack app**  
→ Combine any backend with `04-react-frontend`

**...just run something NOW**  
→ `01-hello-simple` or `03-with-sqlite` (no external deps)

---

## 📦 Example Categories

### Backend-Only Apps

| #   | Name         | Server  | Database  | Framework | Complexity        |
| --- | ------------ | ------- | --------- | --------- | ----------------- |
| 01  | hello-simple | Express | In-Memory | None      | ⭐ Simple         |
| 02  | with-mongodb | Fastify | MongoDB   | Zacatl    | ⭐⭐ Intermediate |
| 03  | with-sqlite  | Express | SQLite    | Zacatl    | ⭐⭐ Intermediate |

### Frontend Apps

| #   | Name           | UI    | Build Tool | Complexity        |
| --- | -------------- | ----- | ---------- | ----------------- |
| 04  | react-frontend | React | Vite       | ⭐⭐ Intermediate |

### Shared Resources

| Name          | Contents                | Usage                   |
| ------------- | ----------------------- | ----------------------- |
| shared/domain | Models, Services, Ports | Import in your examples |

---

## 🏗️ Architecture Comparison

### 01-hello-simple (Vanilla)

```
HTTP Routes (Express)
    ↓
GreetingService (business logic)
    ↓
InMemoryRepository (storage)
```

- Manual dependency injection
- No framework overhead
- Perfect for learning

### 02-with-mongodb & 03-with-sqlite (Zacatl)

```
Application Layer
├─ HTTP Handlers (Fastify/Express)
    ↓
Domain Layer
├─ GreetingService (shared/domain)
    ↓
Infrastructure Layer
├─ MongooseRepository / SequelizeRepository
```

- Zacatl Service Framework
- tsyringe DI container
- Full layer separation
- Production-ready patterns

---

## 🚀 Quick Start Commands

### 01-hello-simple

```bash
cd 01-hello-simple && npm install && npm run dev
# → http://localhost:3000
```

### 02-with-mongodb

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
