# Architecture & Module Organization

Generic guide for folder structure, layering patterns, module boundaries, and dependency management for TypeScript projects.

## Table of Contents

1. [Layered Architecture](#layered-architecture)
2. [Folder Structure](#folder-structure)
3. [Module Organization](#module-organization)
4. [Dependency Injection](#dependency-injection)
5. [Port / Adapter Pattern](#port--adapter-pattern)
6. [Import Paths & Aliases](#import-paths--aliases)

---

## Layered Architecture

All projects use a **ports-and-adapters (hexagonal) architecture** with four layers:

```
Application Layer   — HTTP handlers, request routing, middleware/hooks
Domain Layer        — Business logic, entities, provider ports (interfaces)
Infrastructure Layer — Data persistence (repositories), external clients/adapters
Platform Layer      — Framework wiring, config, telemetry, database connections
```

> **Observability** (OpenTelemetry tracing, metrics, structured logs) is wired at the **Platform Layer** — never imported directly from domain or infrastructure code.

### Key Principles

- **Separation of Concerns** — each layer has distinct responsibilities and must not cross layer boundaries.
- **Dependency Inversion** — domain logic depends only on interfaces (ports), never directly on infrastructure.
- **DI-first** — all dependencies injected via container; no manual `new` instantiation at call sites.
- **Modular by Feature** — code organized into feature-based areas/modules, not by type alone.
- **Type Safety** — full TypeScript strict mode; Zod for runtime schema validation.

---

## Folder Structure

### Recommended Project Root Layout

```
src/
├── index.ts                    # Main barrel export (libraries) or entry (apps)
├── configuration/              # Config loading & validation
├── dependency-injection/       # DI container setup
├── error/                      # Custom error classes
├── logs/                       # Logging abstractions
├── localization/               # i18n adapters (if needed)
├── service/                    # Service orchestration
│   ├── layers/
│   │   ├── application/        # HTTP handlers, routes, hooks
│   │   ├── domain/             # Business logic, ports, entities
│   │   └── infrastructure/     # Repositories, adapters, external clients
│   └── platforms/              # Server, CLI, or other platform wiring
│       └── context/            # AsyncLocalStorage request context (Node 24+)
├── third-party/                # Framework/library re-exports & wrappers
└── utils/                      # Pure utility functions

test/
├── setup.ts                    # Shared bootstrap
└── unit/                       # Unit tests mirroring src/ structure

docs/
├── guidelines/                 # Style & workflow guides (this folder)
└── <feature>/README.md         # Per-module documentation
```

### Semantic Folder Naming

- **kebab-case** for all folder and file names.
- Plural names for collections (`handlers/`, `repositories/`), singular for concepts (`error/`, `service/`).
- Name folders after their primary responsibility — avoid vague names like `misc/`, `helpers/`, `stuff/`.

```
// ✅ Good
src/
  error/
  dependency-injection/
  route-handlers/
  repositories/

// ❌ Avoid
src/
  Errors/           # PascalCase
  DI/               # Abbreviation
  misc/             # Too vague
```

### Max Folder Depth

Keep folder nesting to **3–4 levels deep**. This prevents "folder sprawl" and makes navigation easier.

```
// ✅ Good (3 levels max)
src/
  service/
    layers/
      application/

// ❌ Too deep (5+ levels)
src/
  service/
    layers/
      application/
        entry-points/
          rest/
            handlers/
              concrete/
```

When organizing deep hierarchies (like adapters), nest implementations under a parent folder:

```
// ✅ Good (4 levels, manageable)
src/
  service/
    layers/
      infrastructure/
        orm/
          mongoose/
          sequelize/

// ❌ Avoid (Would require 5+ levels)
src/
  layers/
    infrastructure/
      database-adapters/
        mongoose/
          implementations/
            user-repo/
```

---

## Module Organization

### Feature-Based Areas (Backend Services)

Organize backend feature modules as self-contained "areas":

```
src/
└── areas/
    └── <feature>/
        ├── application/
        │   ├── route-handlers/
        │   │   └── <action>/
        │   │       ├── handler.ts    # Route handler
        │   │       └── schema.ts     # Zod schema (optional sibling)
        │   └── hook-handlers/
        ├── domain/
        │   ├── entities/             # Domain entities / value objects
        │   └── providers/            # Port interfaces
        └── infrastructure/
            ├── repositories/         # Repository implementations
            └── clients/              # External API clients
```

### Component-Based Areas (Frontend)

Organize frontend by route/feature with co-located sub-components:

```
src/
└── app/
    ├── pages/
    │   └── <route>/
    │       ├── page.tsx              # Route entry component
    │       └── components/           # Route-local sub-components
    ├── components/                   # Shared components across routes
    ├── hooks/                        # Shared custom hooks
    ├── context/                      # React context providers
    └── route/
        └── app.tsx                   # Root router
```

---

## Dependency Injection

Use **TSyringe** as the IoC container for backend services.

```typescript
import { injectable, inject } from "tsyringe";

@injectable()
export class UserService {
  constructor(@inject("UserRepository") private repo: UserRepository) {}
}
```

- Register all dependencies in a dedicated `init-di.ts` or `container.ts` module.
- Use string tokens (e.g., `'UserRepository'`) for injection keys — avoids circular import issues.
- Never call `new` on a service/repository at a call site; always resolve from the container.

---

## Port / Adapter Pattern

Define **ports** (interfaces) in the domain layer and **adapters** (implementations) in infrastructure:

```typescript
// domain/providers/user-repository.port.ts
export interface UserRepositoryPort {
  findById(id: string): Promise<UserOutput | null>;
  save(input: CreateUserInput): Promise<UserOutput>;
}

// infrastructure/repositories/user-repository.adapter.ts
@injectable()
export class MongoUserRepositoryAdapter implements UserRepositoryPort {
  async findById(id: string) { ... }
  async save(input: CreateUserInput) { ... }
}
```

- Suffix interfaces with `Port` for domain contracts, `Adapter` for implementations.
- Infrastructure adapters must not leak framework details (e.g., Mongoose Documents) into domain interfaces.

---

## Import Paths & Aliases

- Use **path aliases** (e.g., `@/`, `~/`) in `tsconfig.json` to avoid deep relative imports.
- Resolve aliases at build time (`tsc-alias` or bundler config) — never ship unresolved aliases.
- Re-export public APIs through barrel `index.ts` files at module boundaries.

```typescript
// ✅ Good — alias resolves to src root
import { UserService } from "@/service/user.service";

// ❌ Avoid — fragile deep relative paths
import { UserService } from "../../../service/user.service";
```
