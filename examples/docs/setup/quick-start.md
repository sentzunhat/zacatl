# Quick Start Guide - Bun Monorepo Examples

## Prerequisites

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash
# or
brew install oven-sh/bun/bun
```

## MongoDB Example (Production-Ready)

```bash
# Navigate to example
cd examples/platform-fastify/02-with-mongodb

# Install dependencies
bun install

# Run locally
bun run dev                    # Runs both backend & frontend

# In separate terminal - just backend
cd apps/backend && bun run dev

# In separate terminal - just frontend
cd apps/frontend && bun run dev

# Build for production
bun run build

# Run built backend
bun run start

# Clean up
bun run clean
```

**URLs:**

- Backend API: http://localhost:8082
- Frontend UI: http://localhost:5174 (with proxy to backend)

## SQLite Example (Already Configured)

Same commands as MongoDB - structure already migrated!

```bash
cd examples/platform-fastify/01-with-sqlite
bun install
bun run dev
```

## Testing API Endpoints

```bash
# Get all greetings
curl http://localhost:8082/greetings

# Get specific greeting
curl http://localhost:8082/greetings/[id]

# Create greeting (MongoDB uses "text")
curl -X POST http://localhost:8082/greetings \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "language": "en"}'

# Create greeting (SQLite uses "message")
curl -X POST http://localhost:8081/greetings \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "language": "en"}'

# Get random greeting in language
curl http://localhost:8082/greetings/random/en

# Delete greeting
curl -X DELETE http://localhost:8082/greetings/[id]
```

## Project Structure

```
monorepo-root/
├── apps/
│   ├── backend/           # Fastify API
│   │   ├── src/
│   │   ├── dist/          # Built output
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/          # React + Vite
│       ├── src/
│       ├── dist/          # Built output
│       ├── package.json
│       └── vite.config.ts
├── shared/                # Shared domain code
│   └── domain/
│       ├── models/
│       ├── ports/
│       └── services/
├── package.json           # Root workspace config
└── bun.lock              # Bun dependency lock
```

## Useful Commands

| Command                            | Purpose                                  |
| ---------------------------------- | ---------------------------------------- |
| `bun install`                      | Install dependencies for entire monorepo |
| `bun run dev`                      | Start backend + frontend (from root)     |
| `bun run build`                    | Build both apps for production           |
| `bun run start`                    | Run production backend                   |
| `bun run clean`                    | Remove build artifacts                   |
| `bun --version`                    | Check Bun version                        |
| `bun add <pkg>`                    | Add dependency to all workspaces         |
| `bun --cwd apps/backend add <pkg>` | Add to specific app                      |

## Troubleshooting

### Port Already in Use

```bash
# Change backend port (edit apps/backend/src/config.ts)
# Change frontend port in apps/frontend/vite.config.ts
```

### Bun Not Found

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Or use homebrew (macOS)
brew install oven-sh/bun/bun
```

### Dependencies Not Updating

```bash
bun run clean
bun install
```

### TypeScript Errors

```bash
# Rebuild TypeScript
bun run build

# Or rebuild specific app
cd apps/backend && bun run build
```

## What's Next?

1. **Add Docker** - See Phase 2 Summary for guidelines
2. **Enhance Frontend** - Add CRUD forms in React
3. **Add Authentication** - Implement JWT or sessions
4. **Database Migration** - Add Prisma or TypeORM
5. **Testing** - Add Jest + React Testing Library
6. **API Docs** - Add Swagger/OpenAPI

## Documentation

- Full details: [archive/PHASE2_SUMMARY.md](./archive/PHASE2_SUMMARY.md)
- MongoDB specific: [02-with-mongodb/README.md](./platform-fastify/02-with-mongodb/README.md)
- SQLite specific: [01-with-sqlite/README.md](./platform-fastify/01-with-sqlite/README.md)
