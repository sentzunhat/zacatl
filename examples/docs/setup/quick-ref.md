# Zacatl Examples - At a Glance

> **One-page reference** for the entire examples catalog.

---

## 🎯 What Example Should I Use?

```
┌─────────────────────────────────────────────────┐
│  I WANT TO...                                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Learn basic patterns       → 01-hello-simple   │
│  See Zacatl framework       → 02 or 03          │
│  Build with MongoDB         → 02-with-mongodb   │
│  Build with SQL             → 03-with-sqlite    │
│  Avoid DB setup (dev)       → 01 or 03          │
│  Build full-stack           → Any backend + 04  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📦 Examples Catalog

| #      | Name                                   | Type     | Stack            | Setup      | Zacatl |
| ------ | -------------------------------------- | -------- | ---------------- | ---------- | ------ |
| **01** | [hello-simple](./01-hello-simple/)     | Backend  | Express + Memory | ⚡ < 1 min | ❌     |
| **02** | [with-mongodb](./02-with-mongodb/)     | Backend  | Fastify + Mongo  | 🐳 2 min   | ✅     |
| **03** | [with-sqlite](./03-with-sqlite/)       | Backend  | Express + SQLite | ⚡ < 1 min | ✅     |
| **04** | [react-frontend](./04-react-frontend/) | Frontend | React + Vite     | ⚡ < 1 min | -      |

---

## ⚡ Quick Commands

### 01-hello-simple

```bash
cd 01-hello-simple && npm install && npm run dev
# http://localhost:3000
```

### 02-with-mongodb

```bash
docker run -d -p 27017:27017 --name mongo mongo:latest
cd 02-with-mongodb && npm install && npm start
# http://localhost:8080
```

### 03-with-sqlite

```bash
cd 03-with-sqlite && npm install && npm start
# http://localhost:8081
```

### 04-react-frontend

```bash
# Start a backend first (01, 02, or 03), then:
cd 04-react-frontend && npm install && npm run dev
# http://localhost:5173
```

---

## 🏗️ Architecture Levels

### Level 1: Basic (Example 01)

```
Routes → Service → Repository → Data
```

- Manual DI
- Simple patterns
- No framework

### Level 2: Full Zacatl (Examples 02 & 03)

```
Application Layer (Handlers)
         ↓
Domain Layer (Business Logic)
         ↓
Infrastructure Layer (DB)
```

- Zacatl Service Framework
- tsyringe DI Container
- Layered architecture
- Port-adapter pattern

---

## 📊 Feature Comparison

|                            |   01   |  02   |   03   | 04  |
| -------------------------- | :----: | :---: | :----: | :-: |
| **Backend API**            |   ✅   |  ✅   |   ✅   |  -  |
| **Frontend UI**            |   -    |   -   |   -    | ✅  |
| **Zacatl Framework**       |   ❌   |  ✅   |   ✅   |  -  |
| **Layers (App/Dom/Infra)** | Basic  | Full  |  Full  |  -  |
| **DI Container**           | Manual | Auto  |  Auto  |  -  |
| **Persistence**            | Memory | Mongo | SQLite |  -  |
| **Docker Ready**           |   ✅   |  ✅   |   ✅   | ✅  |
| **Zero External Deps**     |   ✅   |  ❌   |   ✅   |  -  |

---

## 🎓 Learning Path

```
Step 1: Run 01-hello-simple
        ↓
Step 2: Understand Repository + Service patterns
        ↓
Step 3: Run 02-with-mongodb OR 03-with-sqlite
        ↓
Step 4: Compare architectures (Zacatl vs vanilla)
        ↓
Step 5: Run 04-react-frontend (full-stack)
        ↓
Step 6: Build your own app!
```

---

## 🗂️ Code Structure

### 01-hello-simple (Flat)

```
src/
├── types.ts
├── greeting-repository.ts
├── greeting-service.ts
└── server.ts
```

### 02 & 03 (Layered)

```
src/
├── application/handlers/     # HTTP
├── config/                   # Config
├── infrastructure/           # DB
│   ├── models/
│   └── repositories/
└── index.ts

../shared/domain/             # Business logic
├── models/
├── ports/
└── services/
```

---

## 💡 Pro Tips

✅ **Start with 01** - Don't skip the basics  
✅ **Each example is standalone** - Copy-paste to start your project  
✅ **Shared domain code** - Reuse business logic across services  
✅ **Mix and match** - Combine patterns from different examples  
✅ **Docker included** - All examples have Dockerfiles

---

## 📚 Documentation

- **[README.md](./README.md)** - Full guide and walkthrough
- **[INDEX.md](./INDEX.md)** - Quick catalog with commands
- **[CATALOG.md](./CATALOG.md)** - Visual decision guide
- **This file (QUICK-REF.md)** - One-page cheat sheet
- **Individual example READMEs** - Specific setup details

---

## 🚀 Common Workflows

### Just Learning?

```bash
01-hello-simple → Understand patterns → Done!
```

### Building a Real App?

```bash
Pick 02 or 03 → Copy as template → Customize → Deploy!
```

### Full-Stack Project?

```bash
02 or 03 (backend) + 04 (frontend) → Connect APIs → Ship!
```

---

**Questions?** Check individual example READMEs or main docs at `../docs/` 🎯
