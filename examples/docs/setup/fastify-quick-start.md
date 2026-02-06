# 🚀 Quick Start Guide - Full-Stack Monorepo Examples

## ⚡ Choose Your Path

### Option 1: SQLite (Fastest to Start)

```bash
cd examples/platform-fastify/01-with-sqlite
```

**Perfect for**: Learning, prototyping, demos, edge deployments
**Pros**: Zero infrastructure, < 1s startup, single file database
**Cons**: Single connection limit, not ideal for high concurrency

### Option 2: MongoDB (Production Ready)

```bash
cd examples/platform-fastify/02-with-mongodb
```

**Perfect for**: Production apps, microservices, scalable workloads
**Pros**: Horizontal scaling, flexible schemas, cloud-ready
**Cons**: Requires MongoDB server (but Docker makes it easy)

---

## ⚡ 30-Second Setup

### Prerequisites

```bash
# Install Bun (fastest runtime) - https://bun.sh
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version
```

> **Why Bun?** 2-3 (Zero Infrastructure)

```bash
cd examples/platform-fastify/01-with-sqlite

# Install dependencies
bun install

# Option 1: Run both backend + frontend together
bun run dev

# Option 2: Run separately in different terminals
bun run backend:dev   # Terminal 1 - http://localhost:8081
bun run frontend:dev  # Terminal 2 - http://localhost:5173
```

✅ **That's it!** No database setup needed. Open http://localhost:5173

### MongoDB Example (Production Setup)

```bash
cd examples/platform-fastify/02-with-mongodb

# Step 1: Start MongoDB
docker run -d -p 27017:27017 --name mongo \
  -e MONGO_INITDB_ROOT_USERNAME=local \
  -e MONGO_INITDB_ROOT_PASSWORD=local \
  mongo:latest

# Step 2: Install dependencies
bun install

# Step 3: Run the app
bun run dev  # or run backend:dev and frontend:dev separately
```

✅ **Done!** Backend on http://localhost:8082, Frontend on http://localhost:5174

# Open http://localhost:5174

````

---

## 📋 Common Commands

### Build

```bash
# Build everything
bun run build

# Build just backend
bun run backend:build

# Build just frontend
bun run frontend:build
````

### Development

```bash
# Backend with file watching
bun run backend:dev

# Frontend with hot reload
bun run frontend:dev
```

### Production

```bash
# Build for deployment
bun run build

# Start backend only
bun run backend:start
```

### Cleanup

```bash
# Remove build artifacts
bun run clean
```

---

## 🐳 Docker

### Build Image

```bash
docker build -t my-app:latest .
```

### Run Container

```bash
# SQLite
docker run -p 8081:8081 my-app:latest

# MongoDB
docker run -p 8082:8082 \
  -e MONGODB_URI=mongodb://mongo:27017/zacatl \
  my-app:latest
```

### Docker Compose

```bash
# Start all services
docker-compose up --build

# With MongoDB only (MongoDB example)
docker-compose up mongo -d

# Stop services
docker-compose down
```

---

## 🔗 API Testing

### SQLite Backend (8081)

```bash
# List greetings
curl http://localhost:8081/greetings

# Create greeting
curl -X POST http://localhost:8081/greetings \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","language":"en"}'

# Get random
curl http://localhost:8081/greetings/random/en

# Delete
curl -X DELETE http://localhost:8081/greetings/1
```

### MongoDB Backend (8082)

```bash
# List greetings
curl http://localhost:8082/greetings

# Create greeting
curl -X POST http://localhost:8082/greetings \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","language":"en"}'

# Get random
curl http://localhost:8082/greetings/random/en

# Delete
curl -X DELETE http://localhost:8082/greetings/ID
```

---

## 🧠 Project Structure

```
example/
├── apps/
│   ├── backend/          # Fastify API
│   │   ├── src/
│   │   ├── dist/         (compiled)
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/         # React SPA
│       ├── src/
│       ├── dist/         (built)
│       ├── package.json
│       └── vite.config.ts
├── shared/               # Domain models
├── package.json          # Root (Bun workspaces)
├── bun.lock              # Dependencies
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🔍 Key Files to Modify

### Add Backend Endpoint

1. Create handler: `apps/backend/src/application/handlers/my.handler.ts`
2. Register in: `apps/backend/src/config.ts`
3. Test with frontend

### Update Frontend UI

1. Edit: `apps/frontend/src/app.tsx` or `App.tsx`
2. Auto-reload via Vite dev server

### Change API Port

1. SQLite: Search for `8081` in code
2. MongoDB: Search for `8082` in code
3. Update `vite.config.ts` proxy settings

---

## 🆘 Troubleshooting

### "bun command not found"

```bash
# Install bun
curl -fsSL https://bun.sh/install | bash

# Or use npm
npm install -g bun
```

### Build fails: "Cannot find module"

```bash
# Clean and reinstall
rm -rf node_modules bun.lock
bun install
```

### Port 8081 already in use

```bash
# Find process using port
lsof -i :8081

# Kill it
kill -9 <PID>
```

### MongoDB connection error

```bash
# Ensure MongoDB is running
docker-compose up mongo -d

# Check connection string in backend logs
```

### Frontend shows blank page

1. Check console for errors: F12 → Console
2. Verify backend is running: `curl http://localhost:8081/api/health`
3. Check CORS settings in backend

---

## 📚 Learn More

- **Zacatl Framework**: https://github.com/sentzunhat/zacatl
- **Bun Documentation**: https://bun.sh/docs
- **Fastify Guide**: https://www.fastify.io/docs
- **React Hooks**: https://react.dev/reference/react/hooks
- **Vite Config**: https://vitejs.dev/config/

---

## 💡 Pro Tips

1. **Hot Reload**: Frontend auto-updates on save via Vite
2. **API Proxy**: Vite dev server proxies `/api` to backend
3. **TypeScript**: Full type safety in backend and frontend
4. **Monorepo Scripts**: Use `bun run build` from root for both apps
5. **Docker Compose**: Perfect for local development with all services

---

**Ready to build?** Pick your example above and run the 60-second setup! 🎉
