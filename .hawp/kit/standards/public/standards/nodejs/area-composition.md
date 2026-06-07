# Backend Area Module Composition

**Audience:** Node.js/TypeScript backend architects
**Status:** Standard level - Required

This guide explains how to structure and activate backend feature areas in a layered Node.js application. It defines the Active/Staged distinction, area folder patterns, and activation workflows.

## Area Lifecycle States

### Active Areas (✓ Composed in Main)

An active area is fully wired into the application. All route handlers, services, and repositories are imported and composed through main-layer aggregators.

**Characteristics:**

- Routes are included in main aggregators
- Services are included in main aggregators
- Repositories are included in main aggregators
- API endpoints are live and accessible
- All features are functional

**Standard level:** Required

---

### Staged Areas (🔄 Structure Present, Not Composed)

A staged area has complete folder structure, types, and business logic, but is not wired into main aggregators.

**Characteristics:**

- Folder structure exists
- Domain layer is complete
- Infrastructure layer is ready
- Route handlers are implemented but commented out in aggregators
- API endpoints are NOT accessible
- Can be activated by uncommenting imports and exports

**Standard level:** Recommended

---

## Area Module Structure

```
src/backend/areas/[area-name]/
│
├── application/
│   ├── route-handlers/
│   │   ├── routes.ts                  # Aggregator: exports routeHandlers array
│   │   ├── [feature]/
│   │   │   ├── handler.ts
│   │   │   └── schema.ts
│   │   └── [feature]/...
│   │
│   └── hook-handlers/
│       └── hooks.ts                   # Middleware handlers (optional)
│
├── domain/
│   ├── entities/
│   │   ├── [entity].ts
│   │   └── [entity]/...
│   │
│   └── providers/
│       ├── providers.ts               # Aggregator: exports providers array
│       ├── [service]/
│       │   ├── port.ts                # Interface definition
│       │   ├── adapter.ts             # Implementation
│       │   └── types.ts               # I/O types
│       └── [service]/...
│
└── infrastructure/
    ├── repositories/
    │   ├── repositories.ts            # Aggregator: exports repositories array
    │   ├── [entity]/
    │   │   ├── adapter.ts
    │   │   └── [entity].schema.ts
    │   └── [entity]/...
    │
    ├── migrations/
    │   └── [name].ts                  # Optional area-specific migrations
    │
    └── clients/
        └── [service].ts               # Optional external service clients
```

**Standard level:** Required

---

## Aggregator Pattern

### Route Handlers Aggregator

**File: `application/route-handlers/routes.ts`**

```typescript
import type { RouteHandler } from "@framework/core";

import { UserCreateHandler } from "./users/create/handler";
import { UserListHandler } from "./users/list/handler";
import { UserDeleteHandler } from "./users/delete/handler";

export const routeHandlers = [
  UserCreateHandler,
  UserListHandler,
  UserDeleteHandler,
] as unknown as Array<new () => RouteHandler>;
```

**Standard level:** Required

---

### Services Aggregator

**File: `domain/providers/providers.ts`**

```typescript
import { UserCreateService } from "./users/create/adapter";
import { UserListService } from "./users/list/adapter";
import { UserDeleteService } from "./users/delete/adapter";
import { SessionService } from "./auth/session/adapter";

export const providers = [
  UserCreateService,
  UserListService,
  UserDeleteService,
  SessionService,
];
```

**Standard level:** Required

---

### Repositories Aggregator

**File: `infrastructure/repositories/repositories.ts`**

```typescript
import { UserRepository } from "./users/adapter";
import { SessionRepository } from "./sessions/adapter";
import { AuditLogRepository } from "./audit-logs/adapter";

export const repositories = [
  UserRepository,
  SessionRepository,
  AuditLogRepository,
];
```

**Standard level:** Required

---

## Area Activation

### To Activate an Area

Ensure the area is composed in all three main aggregators:

**`src/backend/main/application/route-handlers/routes.ts`:**

```typescript
import { routeHandlers as userAreaHandlers } from "../../../areas/users/application/route-handlers/routes";
import { routeHandlers as authAreaHandlers } from "../../../areas/auth/application/route-handlers/routes";

export const routeHandlers = [
  ...userAreaHandlers,
  ...authAreaHandlers,
] as unknown as Array<new () => RouteHandler>;
```

**`src/backend/main/domain/providers/providers.ts`:**

```typescript
import { providers as userAreaProviders } from "../../../areas/users/domain/providers/providers";
import { providers as authAreaProviders } from "../../../areas/auth/domain/providers/providers";

export const providers = [...userAreaProviders, ...authAreaProviders];
```

**`src/backend/main/infrastructure/repositories/repositories.ts`:**

```typescript
import { repositories as userAreaRepos } from "../../../areas/users/infrastructure/repositories/repositories";
import { repositories as authAreaRepos } from "../../../areas/auth/infrastructure/repositories/repositories";

export const repositories = [...userAreaRepos, ...authAreaRepos];
```

**Standard level:** Required

---

### To Stage an Area

1. Create full folder structure and domain layer
2. Implement route handlers (even if incomplete)
3. Do NOT import into main aggregators
4. Document status with a comment

```typescript
// Example: Staged area (commented)
// import { routeHandlers as invoiceAreaHandlers } from "../../../areas/invoices/application/route-handlers/routes";

export const routeHandlers = [
  ...userHandlers,
  // ...invoiceAreaHandlers,  // TODO: Activate when route handlers complete
] as unknown as Array<new () => RouteHandler>;
```

**Standard level:** Recommended

---

## Activation Checklist

When moving an area from Staged to Active:

- [ ] All route handlers are implemented (not placeholder)
- [ ] All services in domain layer are complete
- [ ] All repositories are wired to database
- [ ] Aggregator files exist in area: `routes.ts`, `providers.ts`, `repositories.ts`
- [ ] Area is imported in main `routes.ts` aggregator
- [ ] Area is imported in main `providers.ts` aggregator
- [ ] Area is imported in main `repositories.ts` aggregator
- [ ] API endpoints are tested and working
- [ ] All types are exported and accessible
- [ ] Area is documented (purpose, endpoints, usage)

**Standard level:** Recommended

---

## Key Principles

1. **Aggregators make composition explicit** — Each layer explicitly lists what's active
2. **Staged areas are future-ready** — Structure and business logic are complete, just not wired
3. **No implicit imports** — If an area is not in main aggregators, it's not active
4. **Activation is reversible** — Comment out to deactivate; uncomment to reactivate
5. **Main layer is the control point** — All composition decisions happen in main

**Standard level:** Required
