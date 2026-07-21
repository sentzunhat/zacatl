# Architecture & Module Organization

This guide covers folder structure, layering patterns, module boundaries, and dependency management for a scalable TypeScript project.

## Table of Contents

1. [Folder Structure](#folder-structure)
2. [Layered Architecture](#layered-architecture)
3. [Module Organization](#module-organization)
4. [Dependency Injection](#dependency-injection)
5. [Adapter Pattern](#adapter-pattern)
6. [Import Paths & Aliases](#import-paths--aliases)

---

## Folder Structure

### Project Root Layout

```
src/
├── configuration/              # Config loading & validation
├── dependency-injection/       # DI container wrappers
├── error/                      # Error classes & types
├── logs/                       # Logging abstractions
├── localization/               # i18n/translation adapters
├── service/                    # Service orchestration
│   ├── types.ts                # Service types (ServiceType, etc.)
│   ├── platforms/              # Platform implementations
│   │   ├── server/             # HTTP server, database adapters
│   │   │   ├── api/
│   │   │   │   └── adapters/   # Express & Fastify API adapters
│   │   │   ├── page/
│   │   │   │   └── adapters/   # Express & Fastify page adapters
│   │   │   └── database/
│   │   │       └── adapters/   # Mongoose, Sequelize & SQLite DB adapters
│   │   ├── cli/                # CLI platform
│   │   ├── desktop/            # Desktop platform
│   │   └── context/            # AsyncLocalStorage request context
│   ├── layers/                 # Application, Domain, Infrastructure
│   │   ├── application/        # Use cases, handlers, ports
│   │   ├── domain/             # Business logic, services
│   │   └── infrastructure/     # Repositories, adapters
│   │       └── orm/
│   │           ├── mongoose/   # Mongoose adapter & lazy loader
│   │           ├── nodesqlite/ # Node sqlite adapter
│   │           └── sequelize/  # Sequelize adapter & lazy loader
│   └── service.ts              # Main Service class
├── third-party/                # Framework & library wrappers
│   ├── express.ts              # Express export
│   ├── fastify.ts              # Fastify export
│   ├── mongoose.ts             # Mongoose export
│   ├── sequelize.ts            # Sequelize export
│   ├── sqlite3.ts              # sqlite3 export
│   ├── zod.ts                  # Zod export
│   └── ...other libs
└── utils/                      # Utility functions
    └── command-runner/         # Shell-free command execution module

test/
├── unit/                       # Unit tests
│   ├── service/
│   ├── error/
│   └── ...matching src/ structure
├── setup.ts                    # Shared test bootstrap
├── tsconfig.json               # Test type-check config
└── unit/helpers/               # Test utilities

docs/
├── changelog.md                # Release notes
├── guidelines/                 # Style & workflow guides
│   ├── architecture.md         # This file
│   └── framework-overview.md   # High-level framework map
├── skills/                     # Procedures (versioning, etc.)
└── <feature>/README.md         # Per-module documentation

build-src-esm/, build-src-cjs/, build-scripts-*/  # Compiled output (generated)
```

### Semantic Folder Naming

- Use **kebab-case** for all folder names
- Name folders after their primary responsibility
- Use **plural names** for collections, **singular** for concepts

```
// ✅ Good structure
src/
  error-guards/      # Utilities for error handling
  dependency-injection/
  service/
  routes/
  handlers/
  repositories/

// ❌ Avoid
src/
  errorGuards/       # camelCase
  DependencyInjection/  # PascalCase
  Services/          # Vague
  misc/              # Too vague
  utils/misc/types/  # Too deep
```

### Folder Depth in Practice

Most modules stay around **3-4 levels deep**, but service entry-point and adapter
paths are intentionally deeper to preserve clear boundaries.

```
// ✅ Good (3 levels)
src/
  service/
    layers/
      application/

// ✅ Expected deep path in current service module
src/
  service/
    layers/
      application/
        entry-points/
          rest/
            fastify/
              handlers/
```

---

## Layered Architecture

Zacatl uses **Hexagonal (Ports & Adapters) Architecture** with four main layers:

### 1. Application Layer

**Purpose:** User-facing use cases, HTTP handlers, CLI commands

**Contains:**

- Route handlers (REST endpoints)
- CLI commands
- UI event handlers
- Request/response validation
- HTTP hooks (middleware)

**Key Pattern:** Request → Handler → Service → Response

```typescript
// ✅ Structure
src/service/layers/application/
├── entry-points/        # External interfaces
│   ├── rest/           # HTTP routes
│   │   └── handlers/   # Method-specific handlers
│   └── cli/            # CLI commands
└── types.ts

// Example Handler
export abstract class GetRouteHandler<TResponse> {
  abstract execute(): Promise<TResponse>;

  async handle(req: FastifyRequest) {
    return this.execute();
  }
}

// Concrete Implementation
export class GetGreetingsHandler extends GetRouteHandler<Greeting[]> {
  constructor(private service: GreetingService) { }

  async execute(): Promise<Greeting[]> {
    return this.service.getAll();
  }
}
```

### 2. Domain Layer

**Purpose:** Core business logic, independent of frameworks/libraries

**Contains:**

- Domain services (orchestrate business logic)
- Domain models/entities
- Business rules & domain exceptions
- Port definitions (interfaces)

**Pattern:** Pure TypeScript classes with no external dependencies

```typescript
// ✅ Domain Service
export class GreetingService {
  constructor(private repo: GreetingRepository) {}

  async getAll(): Promise<Greeting[]> {
    return this.repo.findAll();
  }

  async create(input: CreateGreetingInput): Promise<Greeting> {
    if (!input.message?.trim()) {
      throw new InvalidGreetingError('Message cannot be empty');
    }
    return this.repo.save(input);
  }
}

// ❌ Don't put HTTP-specific code here
export class GreetingService {
  constructor(
    private fastify: FastifyInstance, // Framework-specific!
    private repo: GreetingRepository,
  ) {}
}
```

### 3. Infrastructure Layer

**Purpose:** External integrations, database, third-party services

**Contains:**

- Repository implementations
- Database clients (Mongoose, Sequelize, node sqlite)
- External API clients
- Logger adapters

**Pattern:** Implement domain ports with concrete technologies

```typescript
// ✅ Repository Implementation
export class GreetingRepository implements GreetingPort {
  constructor(private db: Sequelize) {}

  async findAll(): Promise<Greeting[]> {
    return this.db.models.Greeting.findAll();
  }

  async save(greeting: CreateGreetingInput): Promise<Greeting> {
    return this.db.models.Greeting.create(greeting);
  }
}

// ✅ Logger Adapter
export class PinoLoggerAdapter implements LoggerPort {
  constructor(private pino: PinoLogger) {}

  log(message: string) {
    this.pino.info(message);
  }
}
```

### 4. Platforms Layer

**Purpose:** Runtime initialization, HTTP server setup, DI wiring

**Contains:**

- Server startup (Express, Fastify)
- Database connections
- DI container initialization
- CLI platform setup

**Pattern:** Orchestrate layers and initialize external systems

```typescript
// ✅ Platforms Setup
const service = new Service({
  type: ServiceType.SERVER,

  layers: {
    application: { entryPoints: { rest: { routes: [...] } } },
    domain: { providers: [GreetingService] },
    infrastructure: { repositories: [GreetingRepository] },
  },

  platforms: {
    server: {
      name: "my-api",
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastifyInstance,
      },
      databases: [
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: sequelize,
        },
      ],
    },
  },
});
```

### Layer Dependency Rules

```
Application → (depends on) → Domain
      ↓
Infrastructure → (depends on) → Domain
      ↓
Platforms → (orchestrates all layers)
```

**Golden Rule:**

- ✅ Application can use Domain
- ✅ Infrastructure can use Domain
- ❌ Domain should NOT depend on Application or Infrastructure
- ❌ Circle dependencies are forbidden

---

## Module Organization

### Named Module Files

Every top-level module gets a facade file **as a sibling of its folder**,
not inside it — `src/error.ts` next to `src/error/`, not `src/error/error.ts`:

```
src/
├── error.ts          # facade — the only public entrypoint for this module
└── error/
    ├── bad-request.ts
    ├── unauthorized.ts
    └── custom.ts
```

```typescript
// src/error.ts
export * from './error/bad-request';
export * from './error/unauthorized';
export * from './error/custom';
export type { CustomErrorsArgs } from './error/custom';

// Usage
import { BadRequestError, UnauthorizedError } from '@zacatl/error';
```

**Why sibling, not nested — this is not a style preference:**

TypeScript/Node module resolution always prefers a **file** over a
same-named **directory** when both exist. `src/error.ts` sitting next to
`src/error/` means a bare import (`from '../error'`, or the public
`@zacatl/error` subpath) resolves straight to the facade file — no
`index.ts` required anywhere. If the facade lived *inside* the folder
instead (`src/error/error.ts`), the bare import `'../error'` would need
Node to fall back to directory-index resolution (`error/index.ts`) to work
without an explicit `/error` suffix on the import — which reintroduces
exactly the barrel-file indirection this convention exists to avoid.

**Adding a new top-level module — do both, in the same commit:**

1. Create the folder: `src/<name>/` with its real implementation files.
2. Create the sibling facade: `src/<name>.ts` at `src/` root, re-exporting
   what should be public.

No script or generated file needs manual updates for this — `npm run build`
already handles it dynamically:
- `scripts/dev/sync-local-exports.ts` walks `build-src-esm/` recursively and
  adds every top-level `<name>.js` it finds to `package.json`'s `exports`
  map automatically (see `scripts/publish/export-policy.ts` for the exact
  policy — top-level facade files are always exported; nested `index.*`
  files are not, unless explicitly allowlisted).
- `scripts/publish/prune-barrels.ts` (wired into `postbuild`) removes any
  dead nested `index.*` files left behind, using that same exports map as
  its source of truth.
- `scripts/dev/generate-tsconfig-paths.ts` recursively regenerates
  `tsconfig.base.json`'s `@zacatl/*` path aliases from whatever exists
  under `src/` — run `npm run paths:generate` after adding a new module if
  you need the alias for local test imports.

**Benefits:**

- Prefer explicit module files over barrel files
- Keep public subpaths stable in package exports
- Make folder-level entrypoints opt-in rather than implicit

### Module Entry Files

Prefer concrete entry files for public modules and keep imports pointed at the specific module
file that owns the exports. This keeps module boundaries explicit and avoids directory-level
index barrels.

When a module needs a small public façade, document it in the owning folder README instead of
relying on generated barrel headers or automation.

### Per-Module Documentation

Each major module should have a `README.md`:

```
src/
  dependency-injection/
    README.md         # Explains DI pattern, how to use
  service/
    README.md         # Service architecture overview
  error/
    README.md         # Error types, when to use each
```

---

## Dependency Injection

### Container Pattern

Use a DI container to manage dependencies (e.g., `tsyringe`):

```typescript
// Register dependencies
import { container } from 'tsyringe';

container.register(GreetingService, {
  useClass: GreetingService,
});

container.register('GreetingRepository', {
  useClass: GreetingRepository,
});

// Resolve
const service = container.resolve(GreetingService);
```

### Auto-Registration

Leverage automatic registration during layer initialization:

```typescript
// ✅ Don't manually register every class
// Instead, let the framework auto-register based on layer config

new Domain({
  providers: [GreetingService, UserService], // Auto-registered
});

new Infrastructure({
  repositories: [GreetingRepository, UserRepository], // Auto-registered
});
```

### Injection via Constructor

Always inject dependencies through the constructor:

```typescript
// ✅ Good
export class GreetingService {
  constructor(private repo: GreetingRepository, private logger: Logger) {}
}

class GetGreetingsHandler extends GetRouteHandler {
  constructor(private service: GreetingService) {}
}

// ❌ Avoid
export class GreetingService {
  private repo = container.resolve(GreetingRepository); // Coupling
}
```

---

## Adapter Pattern

Use adapters to abstract third-party libraries and frameworks:

### Framework Adapters (Express, Fastify)

**Don't extend `AbstractRouteHandler` directly.** It exists as the shared base
(handles error mapping, reply sending, and the `RouteSchema` shape) but is **not
exported** from the top-level `@sentzunhat/zacatl/service` barrel. Every consumer —
library code and example apps alike — must use one of the **named, method-bound
handlers** instead:

| Named handler       | HTTP method | Import path (Fastify)                                                                          |
| ------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| `GetRouteHandler`    | GET         | `@sentzunhat/zacatl/service/layers/application/entry-points/rest/fastify/handlers/get-route-handler` |
| `PostRouteHandler`   | POST        | `.../fastify/handlers/post-route-handler`                                                        |
| `PutRouteHandler`    | PUT         | `.../fastify/handlers/put-route-handler`                                                         |
| `PatchRouteHandler`  | PATCH       | `.../fastify/handlers/patch-route-handler`                                                       |
| `DeleteRouteHandler` | DELETE      | `.../fastify/handlers/delete-route-handler`                                                      |

Swap `fastify` for `express` in the path for the Express variants. Each named
class sets `method` for you at construction time — you never pass `method`
yourself, which removes an entire class of "wrong verb wired to this route"
bugs.

```typescript
// ✅ Fastify — named handler, method is implicit
import type { Request } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/fastify/handlers/abstract';
import { PostRouteHandler } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/fastify/handlers/post-route-handler';

export class CreateGreetingHandler extends PostRouteHandler<CreateGreetingBody, void, GreetingResponse> {
  constructor(private readonly greetingService: GreetingServiceAdapter) {
    super({ url: '/greetings', schema: { body: CreateGreetingBodySchema } });
  }

  async handler(request: Request<CreateGreetingBody>): Promise<GreetingResponse> {
    return this.greetingService.createGreeting(request.body);
  }
}

// ✅ Express — same named-handler pattern, different Request generic order
// Express Request is <Params, ResBody, ReqBody, Query>; Fastify Request is <Body, Query, Params, Headers>.
import type { Request } from '@sentzunhat/zacatl/third-party/express';
import { PostRouteHandler } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/express/handlers/post-route-handler';

export class CreateGreetingHandler extends PostRouteHandler<CreateGreetingBody, void, GreetingResponse> {
  async handler(request: Request<void, GreetingResponse, CreateGreetingBody, void>): Promise<GreetingResponse> {
    return this.greetingService.createGreeting(request.body);
  }
}

// ❌ Don't do this — AbstractRouteHandler is internal, and 'method' becomes a
// stringly-typed footgun the named handlers exist to remove.
import { AbstractRouteHandler } from '@sentzunhat/zacatl/service'; // not exported — will fail to compile
export class CreateGreetingHandler extends AbstractRouteHandler<CreateGreetingBody, void, GreetingResponse> {
  method = 'POST'; // easy to typo, easy to leave stale after a refactor
}
```

**Why this matters for examples/consumer apps:** if a handler still imports
`AbstractRouteHandler` from `@sentzunhat/zacatl/service`, it is using a stale
API and will fail `tsc --noEmit`. Grep for `AbstractRouteHandler` outside of
`src/service/**` as a stale-API signal.

### Database Adapters — Named Repository Pattern

Same rule as handlers and providers: the exported class name is identical
across every ORM vendor; only the file path differs. Each vendor's
`repository.ts` exports `BaseRepository` — the `Base` prefix signals "this
is abstract, extend it" (satisfying the `naming-conventions.mjs` lint rule
for exported abstract classes), and the vendor is resolved entirely by which
path you import from:

```
src/service/layers/infrastructure/repositories/
├── mongoose/
│   └── repository.ts    # BaseRepository (Mongoose)
├── sequelize/
│   └── repository.ts    # BaseRepository (Sequelize)
└── nodesqlite/
    └── repository.ts    # BaseRepository (node:sqlite)
```

```typescript
// ✅ Sequelize — import the vendor you need, name is always BaseRepository
import { BaseRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/sequelize/repository';

export class GreetingRepositoryAdapter extends BaseRepository<
  GreetingModel,
  CreateGreetingInput,
  Greeting
> {
  // Concrete repository — domain never sees Sequelize, Mongoose, or
  // node:sqlite directly.
}

// ✅ Mongoose — same name, different path
import { BaseRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/mongoose/repository';

export class GreetingRepositoryAdapter extends BaseRepository<
  Greeting,
  CreateGreetingInput,
  Greeting
> {
  // ...
}
```

Domain code depends only on the port (`RepositoryPort` / a domain-specific
port like `GreetingRepositoryPort`), never on which ORM adapter is wired up.

### Naming Rule: How an Exported Abstract Class Signals "Extend Me"

`src/eslint/naming-conventions.mjs` enforces this with **one rule, one
allowlist** — not a base rule plus scattered independent exemptions. An
exported abstract class must do one of:

- **end in a role suffix** from the single `ABSTRACT_ROLE_SUFFIXES` array
  (currently `Handler`, `Repository`) — the role noun itself signals
  "extend this" (`GetRouteHandler`, `BaseRepository`'s per-vendor
  siblings), **or**
- **start with `Abstract` or `Base`** when the name doesn't end in one of
  those suffixes.

Both are the same semantic signal ("this class is abstract, extend it"),
expressed two ways depending on whether the class already has a
self-describing role name. Adding a new role that should skip the prefix
requirement means adding one entry to `ABSTRACT_ROLE_SUFFIXES` — not a new
standalone filter block. This intentionally does **not** cover the
`Adapter`-suffix rule, the `Error`-suffix rule, or the exact-match
orchestration-class allowlist (`Service`, `Domain`, `Infrastructure`,
etc.) elsewhere in the same file — those govern unrelated naming concerns,
not the abstract-extend signal.

### Named Provider Pattern (Platform Adapters)

Same rule again: the exported factory name is identical across every vendor;
only the file path differs. `src/service/platforms/server/providers/` uses
**named factory functions**, not classes or an `AbstractProvider` base, to
implement a port per vendor:

```
src/service/platforms/server/
├── api/
│   └── port.ts              # ApiServerPort interface (the contract)
├── page/
│   └── port.ts               # PageServerPort interface (the contract)
└── providers/
    ├── fastify/
    │   ├── api-adapter.ts     # createApiAdapter(): ApiServerPort
    │   └── page-adapter.ts    # createPageAdapter(): PageServerPort
    └── express/
        ├── api-adapter.ts     # createApiAdapter(): ApiServerPort
        ├── page-adapter.ts    # createPageAdapter(): PageServerPort
        └── schema-helper.ts   # Express-only: manual Zod validation helper
```

**Naming convention:** `create<Kind>Adapter(...): <Kind>Port` — no vendor
prefix on the function name; the vendor is the path you import from.

```typescript
// ✅ Port — the contract, framework-agnostic
export interface ApiServerPort {
  registerRoute(handler: RouteHandler): void;
  registerHook(handler: HookHandler): void;
  registerProxy(config: ProxyConfig): void;
  listen(port: number): Promise<void>;
  getRawServer(): unknown;
}

// ✅ Named provider — one factory function per vendor path, no shared base class
// providers/fastify/api-adapter.ts
export const createApiAdapter = (
  server: FastifyInstance,
  apiPrefix = '',
): ApiServerPort => ({
  registerRoute: (handler) => { /* fastify-specific wiring */ },
  registerHook: (handler) => { /* ... */ },
  registerProxy: (config) => { /* ... */ },
  listen: async (port) => { /* ... */ },
  getRawServer: () => server,
});

// providers/express/api-adapter.ts — same name, different path
export const createApiAdapter = (
  server: Express,
  apiPrefix = '',
): ApiServerPort => ({
  // Same port, different wiring — Express has no schema/type-provider
  // integration, so it needs its own `applyZodSchema` helper (schema-helper.ts)
  // to validate body/query/params before calling the handler.
  registerRoute: (handler) => { /* express-specific wiring */ },
  registerHook: (handler) => { /* ... */ },
  registerProxy: (config) => { /* ... */ },
  listen: async (port) => { /* ... */ },
  getRawServer: () => server,
});
```

**Why factory functions instead of an `AbstractApiProvider` class:**

- No inheritance to reason about — each vendor's quirks stay local to its own file
- The port (`ApiServerPort`/`PageServerPort`) is the only shared contract; there is
  nothing to override or call `super()` on
- Easier to unit test: construct the adapter with a mock server instance, assert
  against the returned plain object

**The one exception — `server.ts`.** It's the single file that wires up
*both* vendors together (it runtime-selects Fastify vs Express from config),
so it's the one place that needs vendor-prefixed local aliases at the import
site, since two same-named imports would collide in one file:

```typescript
// service/platforms/server/server.ts
import { createApiAdapter as createExpressApiAdapter } from './providers/express/api-adapter';
import { createApiAdapter as createFastifyApiAdapter } from './providers/fastify/api-adapter';
```

This is expected and correct — vendor selection here is genuinely a runtime
decision, not a per-file consumer choice like everywhere else.

**Always test each named provider against its port contract.** Every adapter in
`providers/<vendor>/` has a matching test in
`test/unit/service/platforms/server/providers/<vendor>/`; when adding a new
vendor (e.g. a `koa` adapter), add its test file in the same pass — don't let
implementation and coverage drift apart.

---

## Import Paths & Aliases

### Path Aliases (tsconfig.json & vite.config.mjs)

Configure short import paths for better readability:

```jsonc
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@zacatl/configuration": ["src/configuration.ts"],
      "@zacatl/error": ["src/error.ts"],
      "@zacatl/service": ["src/service/service.ts"],
      "@zacatl/*": ["src/*"]
    }
  }
}
```

### Import Organization

Order imports as:

1. **External packages** (Node, npm modules)
2. **Internal path aliases** (@zacatl/\*)
3. **Relative imports** (./types, ../utils)

```typescript
// ✅ Good
import { FastifyRequest, FastifyReply } from 'fastify';
import { Service } from '@zacatl/service';
import { logger } from '@zacatl/logs';
import { GreetingService } from '../domain';
import type { RouteConfig } from './types';

// ❌ Avoid (mixed order)
import { GreetingService } from '../domain';
import { FastifyRequest } from 'fastify';
import { logger } from '@zacatl/logs';
```

### Subpath Exports for Libraries

```json
{
  "exports": {
    "./service": {
      "types": "./build/esm/service/index.d.ts",
      "import": "./build/esm/service/index.js",
      "require": "./build/cjs/service/index.js"
    },
    "./third-party/fastify": {
      "types": "./build/esm/third-party/fastify.d.ts",
      "import": "./build/esm/third-party/fastify.js",
      "require": "./build/cjs/third-party/fastify.js"
    },
    "./error": {
      "types": "./build/esm/error.d.ts",
      "import": "./build/esm/error.js",
      "require": "./build/cjs/error.js"
    }
  }
}
```

**Usage:**

```typescript
// ✅ Framework-specific import only where needed
import { FastifyInstance } from '@zacatl/third-party/fastify';

// ✅ Core library imports
import { Service } from '@sentzunhat/zacatl/service';
import { BadRequestError } from '@zacatl/error';
```

---

## Dependency Lifecycle

### Singleton (Shared Instance)

Use for services that should exist once across the app:

```typescript
container.register(
  GreetingService,
  {
    useClass: GreetingService,
  },
  { lifetime: Lifetime.SINGLETON },
); // tsyringe syntax
```

**Good for:**

- Database connections
- Loggers
- Configuration services
- Repository instances

### Transient (New Instance Per Resolution)

Use for stateful objects that should be isolated:

```typescript
container.register(
  RequestHandler,
  {
    useClass: RequestHandler,
  },
  { lifetime: Lifetime.TRANSIENT },
);
```

**Good for:**

- Request context objects
- Temporary data processors
- Per-request services

---

## Common Pitfalls & Solutions

### Pitfall 1: Domain Layer Depends on Frameworks

**❌ Problem:**

```typescript
// src/service/layers/domain/greeting-service.ts
import { FastifyRequest } from 'fastify'; // Framework in domain!

export class GreetingService {
  async create(req: FastifyRequest) {
    // Couples domain to Fastify
  }
}
```

**✅ Solution:**

```typescript
// Domain accepts plain objects
export class GreetingService {
  async create(input: CreateGreetingInput) {
    // Framework-agnostic
    if (!input.message?.trim()) {
      throw new BadRequestError({ message: 'Message is required' });
    }
    return this.repository.save(input);
  }
}

// Handler translates framework request → domain input
export class CreateGreetingHandler extends PostRouteHandler {
  async execute(request: FastifyRequest): Promise<Greeting> {
    const input: CreateGreetingInput = {
      message: request.body.message,
      author: request.body.author,
    };
    return this.service.create(input);
  }
}
```

### Pitfall 2: Circular Dependencies

**❌ Problem:**

```typescript
// user-service.ts
import { OrderService } from './order-service';

export class UserService {
  constructor(private orderService: OrderService) {}
}

// order-service.ts
import { UserService } from './user-service'; // Circular!

export class OrderService {
  constructor(private userService: UserService) {}
}
```

**✅ Solution:**

```typescript
// Refactor to break cycle — use events or separate shared service
export class UserService {
  constructor(private eventBus: EventBus) {}

  async createUser(input: CreateUserInput) {
    const user = await this.repository.save(input);
    this.eventBus.emit('user.created', { userId: user.id });
    return user;
  }
}

export class OrderService {
  constructor(private eventBus: EventBus) {
    this.eventBus.on('user.created', this.handleUserCreated);
  }

  private handleUserCreated(event: UserCreatedEvent) {
    // React to user creation
  }
}
```

### Pitfall 3: God Objects / Services Doing Too Much

**❌ Problem:**

```typescript
export class UserService {
  async createUser() {}
  async updateUser() {}
  async deleteUser() {}
  async sendWelcomeEmail() {} // Different responsibility!
  async generateReport() {} // Different responsibility!
  async processPayment() {} // Different responsibility!
}
```

**✅ Solution:**

```typescript
// Split into focused services
export class UserService {
  async createUser() {}
  async updateUser() {}
  async deleteUser() {}
}

export class EmailService {
  async sendWelcomeEmail(user: User) {}
}

export class ReportService {
  async generateUserReport(userId: string) {}
}

export class PaymentService {
  async processPayment(payment: Payment) {}
}
```

### Pitfall 4: Hard-Coded Dependencies

**❌ Problem:**

```typescript
export class GreetingService {
  private repository = new GreetingRepository(); // Hard-coded!
  private logger = console; // Hard-coded!
}
```

**✅ Solution:**

```typescript
export class GreetingService {
  constructor(private repository: GreetingRepository, private logger: Logger) {} // Injected dependencies
}
```

### Pitfall 5: Mixing Concerns in Handlers

**❌ Problem:**

```typescript
export class GetGreetingsHandler extends GetRouteHandler {
  async execute(): Promise<Greeting[]> {
    // Don't put business logic here!
    const greetings = await this.repository.findAll();

    // Filtering logic belongs in domain
    return greetings.filter((g) => g.message.length > 5);
  }
}
```

**✅ Solution:**

```typescript
// Domain service handles business logic
export class GreetingService {
  async getValidGreetings(): Promise<Greeting[]> {
    const greetings = await this.repository.findAll();
    return greetings.filter((g) => g.message.length > 5);
  }
}

// Handler delegates to service
export class GetGreetingsHandler extends GetRouteHandler {
  constructor(private service: GreetingService) {}

  async execute(): Promise<Greeting[]> {
    return this.service.getValidGreetings();
  }
}
```

### Pitfall 6: Leaking Infrastructure Details

**❌ Problem:**

```typescript
// Exposes Mongoose document type to domain layer
export interface GreetingPort {
  findAll(): Promise<Document<Greeting>[]>; // Mongoose-specific!
}
```

**✅ Solution:**

```typescript
// Port uses plain domain types
export interface GreetingPort {
  findAll(): Promise<Greeting[]>; // Plain objects
}

// Repository handles conversion
export class MongooseGreetingRepository implements GreetingPort {
  async findAll(): Promise<Greeting[]> {
    const docs = await this.model.find();
    return docs.map((doc) => doc.toObject()); // Convert to plain object
  }
}
```

---

## Real-World Examples from Codebase

### Example 1: CustomError Base Class

```typescript
// src/error/custom.ts
export class CustomError extends Error {
  public readonly custom: boolean;
  public readonly code: ErrorCode;
  public readonly correlationId: string;
  public readonly metadata?: Record<string, unknown>;
  public readonly component?: string;
  public readonly operation?: string;

  constructor(args: CustomErrorArgs & { correlationId?: string }) {
    super(args.message);
    this.id = uuidv4();
    this.correlationId = args.correlationId ?? uuidv4();
    this.custom = true;
    this.name = this.constructor.name;
    this.code = args.code;
    this.metadata = args.metadata;
    this.component = args.component;
    this.operation = args.operation;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      message: typeof this.code === 'number' && this.code >= 500
        ? 'Internal Server Error'
        : this.message,
      code: this.code,
      correlationId: this.correlationId,
    };
  }

  // Explicit internal logging only; never return this from an HTTP handler.
  toDiagnosticJSON() {
    return { name: this.name, message: this.message, metadata: this.metadata };
  }
}
```

### Example 2: Dependency Injection Container

```typescript
// src/dependency-injection/container.ts
export const registerDependencies = <T extends object>(
  dependencies: Constructor<T>[],
  lifecycle: Lifecycle = Lifecycle.SINGLETON,
): void => {
  dependencies.forEach((dep) => {
    const token = dep.name || dep;
    registerSingleton(token, dep);
  });
};

export const resolveDependencies = <T extends object>(dependencies: Constructor<T>[]): T[] => {
  return dependencies.map((dep) => {
    const token = dep.name || dep;
    return resolveDependency<T>(token);
  });
};
```

### Example 3: Configuration Loading with Validation

```typescript
// src/configuration/json.ts
export const loadJSON = <T>(filePath: string, schema: ZodSchema<T>): T => {
  try {
    if (!existsSync(filePath)) {
      throw new BadResourceError({
        message: `Configuration file not found: ${filePath}`,
        component: 'ConfigLoader',
        operation: 'loadJSON',
      });
    }

    const fileContent = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(fileContent);

    // Validate with Zod schema
    const result = schema.safeParse(parsed);

    if (!result.success) {
      throw new ValidationError({
        message: 'Configuration validation failed',
        metadata: { errors: result.error.errors, filePath },
        component: 'ConfigLoader',
        operation: 'loadJSON',
      });
    }

    return result.data;
  } catch (error) {
    if (error instanceof CustomError) throw error;

    throw new InternalServerError({
      message: `Failed to load configuration from ${filePath}`,
      error: error as Error,
      component: 'ConfigLoader',
      operation: 'loadJSON',
    });
  }
};
```

---

## Summary

| Aspect        | Rule                                    |
| ------------- | --------------------------------------- |
| Folder Depth  | 3–4 levels max                          |
| Folder Naming | kebab-case                              |
| Architecture  | Hexagonal/Layered (4 layers)            |
| Layer Rules   | Domain independent; unidirectional deps |
| DI Pattern    | Constructor injection via container     |
| Adapters      | One per framework/database variant      |
| Imports       | Path aliases + consistent order         |
| Entry Files   | Facade `.ts` sibling per module; no nested barrels |
