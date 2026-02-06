# Zacatl Examples - Production-Ready Server Showcases

> **Status:** ✅ Active Development | **Last Audit:** February 5, 2026  
> **Quality:** Production-Ready | **Documentation:** Comprehensive & Organized

A catalog of production-ready server applications demonstrating the Zacatl framework across different HTTP platforms and databases. Each example is fully functional, copy-paste deployable, and follows identical domain logic.

---

## 🚀 Quick Start (30 Seconds)

**New to Zacatl?** Start here:

```bash
cd platform-fastify/01-with-sqlite
bun install && bun run dev
# → Backend: http://localhost:8081
# → Frontend: http://localhost:5173
```

**Why this example?**  
✅ Zero infrastructure (no databases to install)  
✅ Full-stack (backend + React frontend)  
✅ < 1 second startup  
✅ Production patterns demonstrated

---

## 📚 Documentation (Newly Organized!)

All documentation has been reorganized for easier navigation.

### 📖 Start Here
- **[📘 Documentation Index](./docs/README.md)** - Complete navigation guide
- **[📊 Project Status](./PROJECT-STATUS.md)** - Current state, what works, what's next
- **[📋 Change Log](./CHANGELOG.md)** - Recent reorganization details

### 🎯 Quick Links by Purpose

| I Want To...                  | Read This                                                     |
| ----------------------------- | ------------------------------------------------------------- |
| Understand the project        | [📄 Overview](./docs/overview/main-readme.md)                 |
| Run examples now              | [⚡ Quick Start](./docs/setup/quick-start.md)                 |
| Choose the right example      | [🗺️ Catalog](./docs/overview/catalog-visual.md)              |
| Understand architecture       | [🏗️ Architecture Guide](./docs/architecture/comparison-guide.md) |
| Build new examples            | [🤖 Agent Guide](./docs/decisions/agents.md)                  |
| Compare technologies          | [📊 Comparison Matrix](./docs/architecture/comparison.md)     |

---

## 🏗️ Available Examples

### ⚡ Platform: Fastify (Recommended)

**Best for:** New projects, high performance, modern patterns

#### [01-with-sqlite](./platform-fastify/01-with-sqlite/) - Full-Stack Monorepo
- **Stack:** Fastify + SQLite + React + Tailwind
- **Ports:** API: 8081, UI: 5173
- **Setup:** 30 seconds, zero infrastructure
- **Status:** ✅ Production-ready

#### [02-with-mongodb](./platform-fastify/02-with-mongodb/) - Full-Stack Monorepo
- **Stack:** Fastify + MongoDB + React + Tailwind
- **Ports:** API: 8082, UI: 5174
- **Setup:** 2 minutes (with Docker MongoDB)
- **Status:** ✅ Production-ready

**Why Fastify?**  
~50 lines to start | < 1s startup | Modern DI | Full-stack monorepo

---

### 🔧 Platform: Express

**Best for:** Traditional backends, team familiarity

#### [01-with-sqlite](./platform-express/01-with-sqlite/) - Backend Only
- **Stack:** Express + SQLite (Sequelize)
- **Port:** 8083
- **Setup:** < 1 minute
- **Status:** ✅ Functional

#### [02-with-mongodb](./platform-express/02-with-mongodb/) - Backend Only
- **Stack:** Express + MongoDB (Mongoose)
- **Port:** 8084
- **Setup:** 2 minutes (with Docker MongoDB)
- **Status:** ⚠️ Functional (has deprecated files, see [archive](./archive/))

---

### 📦 Shared Domain Logic

#### [shared/domain](./shared/)

Technology-agnostic business logic used across all examples:
- **Models:** Greeting entity
- **Services:** GreetingService (business logic)
- **Ports:** GreetingRepository interface

Demonstrates hexagonal architecture and clean separation.

---

## 🎯 Learning Path

### 1️⃣ Beginner
**Goal:** Get something running, understand basic patterns

→ Start with [platform-fastify/01-with-sqlite](./platform-fastify/01-with-sqlite/)  
→ Read [Quick Start Guide](./docs/setup/quick-start.md)  
→ Explore [Overview Docs](./docs/overview/)

### 2️⃣ Intermediate
**Goal:** Understand architecture, compare patterns

→ Try [platform-fastify/02-with-mongodb](./platform-fastify/02-with-mongodb/)  
→ Read [Architecture Comparison](./docs/architecture/comparison-guide.md)  
→ Compare Express vs Fastify implementations

### 3️⃣ Advanced
**Goal:** Build your own examples, contribute

→ Read [Agent Implementation Guide](./docs/decisions/agents.md)  
→ Study [Optimization Decisions](./docs/decisions/optimization-summary.md)  
→ Use [Validation Checklist](./docs/operations/validation-checklist.md)

---

## 📊 Project Health

### ✅ What's Working
- **Fastify examples:** Production-ready, full-stack, optimized
- **Express examples:** Functional backends with clean architecture
- **Shared domain:** Reusable business logic across all examples
- **Documentation:** Comprehensive and newly organized

### ⚠️ What's In Progress
- Test coverage (placeholder directories exist)
- Express frontend implementations (currently backend-only)
- Cleanup of deprecated handlers in Express 02-with-mongodb

### 📋 What's Next
See [PROJECT-STATUS.md](./PROJECT-STATUS.md) for detailed roadmap and recommendations.

---

## 🗂️ Project Structure (Post-Audit)

```
/examples
├── 📄 README.md                    ← You are here
├── 📊 PROJECT-STATUS.md            ← Comprehensive status report
├── 📋 CHANGELOG.md                 ← What changed in reorganization
├── 📁 docs/                        ← Organized documentation
│   ├── 📘 README.md                ← Documentation index
│   ├── overview/                   ← What is this project?
│   ├── architecture/               ← How does it work?
│   ├── setup/                      ← How do I use it?
│   ├── operations/                 ← How do I maintain it?
│   └── decisions/                  ← Why did we do it this way?
├── 📁 archive/                     ← Deprecated code (preserved)
│   ├── ARCHIVE.md                  ← What's here and why
│   └── code/deprecated-handlers/   ← Old camelCase handlers
├── 🚀 platform-fastify/            ← Fastify examples (recommended)
│   ├── 01-with-sqlite/             ← Full-stack, zero-setup
│   └── 02-with-mongodb/            ← Full-stack, production DB
├── 🔧 platform-express/            ← Express examples
│   ├── 01-with-sqlite/             ← Backend-only
│   └── 02-with-mongodb/            ← Backend-only
└── 📦 shared/                      ← Reusable domain logic
    └── domain/                     ← Models, Services, Ports
```

**Full tree:** See [FOLDER-TREE.txt](./FOLDER-TREE.txt)

---

## 🔍 Finding What You Need

### By Technology Choice

| Framework | Database | Example                            | Port |
| --------- | -------- | ---------------------------------- | ---- |
| Fastify   | SQLite   | `platform-fastify/01-with-sqlite`  | 8081 |
| Fastify   | MongoDB  | `platform-fastify/02-with-mongodb` | 8082 |
| Express   | SQLite   | `platform-express/01-with-sqlite`  | 8083 |
| Express   | MongoDB  | `platform-express/02-with-mongodb` | 8084 |

### By Use Case

| Use Case                      | Best Example                       |
| ----------------------------- | ---------------------------------- |
| Learn Zacatl basics           | platform-fastify/01-with-sqlite    |
| Production full-stack app     | platform-fastify/02-with-mongodb   |
| Backend-only service          | platform-express/01-with-sqlite    |
| Traditional Express pattern   | platform-express/02-with-mongodb   |
| Understand shared domain      | shared/domain                      |

### By Setup Time

| Time      | Examples                                                     |
| --------- | ------------------------------------------------------------ |
| < 1 min   | platform-fastify/01-with-sqlite, platform-express/01-with-sqlite |
| ~2 min    | platform-fastify/02-with-mongodb, platform-express/02-with-mongodb |

---

## 🧪 Testing Examples

```bash
# SQLite (Fastify)
curl http://localhost:8081/greetings

# MongoDB (Fastify)
curl http://localhost:8082/greetings

# Create greeting (adjust port/payload as needed)
curl -X POST http://localhost:8081/greetings \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World", "language": "en"}'
```

See [Quick Start Guide](./docs/setup/quick-start.md) for complete API documentation.

---

## 🤝 Contributing

### Building New Examples?
Read [Agent Implementation Guide](./docs/decisions/agents.md) for comprehensive guidance on:
- Port assignments
- Directory structure
- Required patterns
- Validation checklist

### Found Issues?
Check [PROJECT-STATUS.md](./PROJECT-STATUS.md) first - it may already be documented.

---

## 📖 Additional Resources

### Zacatl Framework
- [Main Framework Docs](../../docs/) - Core framework documentation
- [Architecture Overview](../../docs/architecture/) - Framework design principles

### Community
- Issues: Report on GitHub
- Questions: Check project documentation first
- Contributing: See contributor guidelines in main repo

---

## 🔐 Safety & Compatibility

**Backwards Compatible:** ✅ Yes  
All original files preserved in root directory. New `/docs` folder is additive.

**Breaking Changes:** ❌ None  
No code functionality changed. All examples work identically.

**Reversible:** ✅ Yes  
See [CHANGELOG.md](./CHANGELOG.md) for revert instructions.

---

## 📅 Recent Changes

**February 5, 2026 - Documentation Reorganization Audit**
- ✅ Created organized `/docs` structure
- ✅ Archived deprecated code to `/archive`
- ✅ Generated comprehensive project status
- ✅ Added navigation guides and indexes
- ❌ No code deleted
- ❌ No functionality changed

See [CHANGELOG.md](./CHANGELOG.md) for complete details.

---

## 📞 Quick Reference

**All documentation:** [/docs/README.md](./docs/README.md)  
**Project status:** [PROJECT-STATUS.md](./PROJECT-STATUS.md)  
**What changed:** [CHANGELOG.md](./CHANGELOG.md)  
**Archived code:** [/archive/ARCHIVE.md](./archive/ARCHIVE.md)

**Just want to run something?**
```bash
cd platform-fastify/01-with-sqlite && bun install && bun run dev
```

---

**Last Updated:** February 5, 2026  
**Status:** Active Development  
**Quality:** Production-Ready  
**Maintainers:** Zacatl Team + Community
