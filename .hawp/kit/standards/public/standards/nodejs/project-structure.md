# Node.js Project Structure & File Organization

**Audience:** Node.js/TypeScript backend developers
**Status:** Standard level - Recommended

This guide defines how to organize files and folders in a layered Node.js backend application. It establishes naming conventions, folder hierarchies, and file patterns that scale across multiple feature modules.

## Quick Reference: File Naming Conventions

| Purpose             | Location                       | File Pattern                                   | Example                 |
| ------------------- | ------------------------------ | ---------------------------------------------- | ----------------------- |
| HTTP Endpoint       | `application/route-handlers/`  | `[feature]/handler.ts` + `schema.ts`           | `users/login/`          |
| Business Logic      | `domain/providers/`            | `[feature]/adapter.ts` + `port.ts`             | `auth/session/`         |
| Business Interface  | `domain/providers/`            | `[feature]/port.ts`                            | `auth/session/port.ts`  |
| Type Definitions    | `domain/providers/`            | `types.ts` or in `port.ts`                     | `auth/session/types.ts` |
| Data Persistence    | `infrastructure/repositories/` | `[entity]/adapter.ts`                          | `users/adapter.ts`      |
| Schema & Models     | `infrastructure/repositories/` | `[entity].schema.ts`                           | `users.schema.ts`       |
| Aggregation/Exports | Each layer                     | `routes.ts`, `providers.ts`, `repositories.ts` | See Aggregators         |
| Migrations          | `infrastructure/migrations/`   | Descriptive name `.ts`                         | `user-bootstrap.ts`     |
| Unit Tests          | `test/unit/`                   | `[feature].test.ts`                            | `login.test.ts`         |

## Layered Area Structure

Each feature area follows a consistent three-layer hierarchy:

```
src/backend/areas/[area-name]/
│
├── application/                       # HTTP entry points and validation
│   ├── route-handlers/
│   │   ├── routes.ts                  # Aggregator: exports all handlers
│   │   ├── users/
│   │   │   ├── create/
│   │   │   │   ├── handler.ts         # HTTP handler class
│   │   │   │   └── schema.ts          # Zod validation schemas
│   │   │   ├── list/
│   │   │   │   ├── handler.ts
│   │   │   │   └── schema.ts
│   │   │   └── delete/
│   │   │       └── handler.ts
│   │   └── health/
│   │       └── handler.ts
│   └── hook-handlers/                 # HTTP middleware
│       └── hooks.ts                   # Aggregator: exports all middleware
│
├── domain/                            # Business logic and contracts
│   ├── entities/                      # Type definitions
│   │   ├── user.ts
│   │   ├── session.ts
│   │   └── auth/
│   │       └── device.ts
│   └── providers/                     # Service interfaces & implementations
│       ├── providers.ts               # Aggregator: exports all services
│       ├── users/
│       │   ├── create/
│       │   │   ├── port.ts            # Service interface
│       │   │   ├── adapter.ts         # Service implementation
│       │   │   └── types.ts           # Input/Output types
│       │   └── delete/
│       │       ├── port.ts
│       │       └── adapter.ts
│       └── auth/
│           ├── session/
│           │   ├── port.ts
│           │   └── adapter.ts
│           └── device/
│               └── adapter.ts
│
└── infrastructure/                    # Data access and external services
    ├── repositories/                  # Data persistence layer
    │   ├── repositories.ts            # Aggregator: exports all repositories
    │   ├── users/
    │   │   ├── adapter.ts             # Repository implementation
    │   │   ├── port.ts                # Optional: interface
    │   │   └── users.schema.ts        # Zod schema + TypeScript types
    │   ├── auth/
    │   │   └── sessions/
    │   │       ├── adapter.ts
    │   │       └── sessions.schema.ts
    │   └── archived-users/
    │       └── adapter.ts
    ├── migrations/                    # Database migrations (optional per-area)
    │   └── bootstrap-data.ts
    └── clients/                       # External service clients (optional)
        └── (not commonly per-area)
```

## Key Principles

1. **One responsibility per file** — Each file has a single, clear purpose.
2. **Aggregators at each layer** — Always export arrays of handlers/services/repositories via aggregator files.
3. **Port/Adapter split** — Services define contracts (`port.ts`) separately from implementations (`adapter.ts`).
4. **Type co-location** — Types live with their schema or interface.
5. **Singleton lifecycle** — Services and repositories are singletons, injected via constructor.
6. **No cross-layer shortcuts** — Application does not import infrastructure directly; routes go through domain services.

## Naming Conventions

- **Folders:** lowercase, kebab-case (`user-profiles`, `auth-sessions`)
- **Files:** lowercase, kebab-case or descriptive names (`handler.ts`, `adapter.ts`, `port.ts`, `schema.ts`)
- **Classes:** PascalCase, descriptive (`UserCreateHandler`, `UserRepository`, `SessionService`)
- **Types/Interfaces:** PascalCase (`User`, `UserCreateInput`, `UserCreatePort`)
- **Constants/Enums:** UPPER_SNAKE_CASE (`MAX_RETRIES`, `TOKEN_TYPES`)
