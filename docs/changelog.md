# Release Notes

---

## [0.0.53] - 2026-04-10

**Status**: Pending release

### ⚠️ Breaking Changes

- **`ApiServerConfig` removed** — Unused `ApiServerConfig` type removed from `@sentzunhat/zacatl/service` public exports. Use `ServerConfig` directly.

### ✨ Improvements

- **Fastify-prefixed handler aliases** — Added `FastifyGetRouteHandler`, `FastifyPostRouteHandler`, `FastifyPutRouteHandler`, `FastifyPatchRouteHandler`, and `FastifyDeleteRouteHandler` as explicit aliases in the REST entry-point barrel, alongside the existing method-first aliases.

### 🐛 Fixes

- **Installed locale discovery** — Expanded built-in localization path resolution so packaged consumers can find Zacatl locale files from both ESM and CommonJS publish outputs without extra manual path configuration.

### 🔧 Architecture

- **Cleanup task coverage** — Expanded `clean:examples` to remove nested example dependencies and build outputs across the flattened examples layout, and hardened filesystem cleanup retries for large directory removals on macOS.

### 📚 Documentation

- **Examples and runtime guidance** — Updated repository docs to reflect the flattened examples structure, clarified current CLI/Desktop runtime support, and added a practical `START_HERE.md` onboarding guide.
- **`fastify-sqlite-react` example hardened** — Migrated to Fastify-prefixed handler classes, moved SQLite DB to example root, added backend query validation for language filter, hardened favicon serving with hashed-asset fallback, and improved shutdown signal handling for `tsx watch`.

## [0.0.52] - 2026-03-08

**Status**: Pending release

### 🐛 Fixes

- **Mongoose third-party exports** — Added missing `Types` and `PipelineStage` exports to `src/third-party/mongoose.ts` to support downstream projects using Zacatl's Mongoose wrapper as single source of truth. Prevents version conflicts when framework consumers need `Types.ObjectId` and aggregation pipeline types.

- **Configurable built-in localization path** — Added `localization.builtInLocalesDir` to `Service` and `configureI18nNode()` so consumers can override Zacatl's built-in locale discovery when their runtime working directory does not match the package's default path probes.

### 🔧 Improvements

- **SQLite audit remediation** — Removed the unused direct `sqlite3` dependency from Zacatl's published package so consumers no longer inherit the vulnerable `node-gyp` and `tar` toolchain through the framework itself. SQLite dialect drivers remain consumer-installed dependencies.

---

## [0.0.51] - 2026-03-04

**Status**: Pending release

### 🐛 Fixes

- **`zacatl-fix-esm` self-contained bin layout** — Updated publish packaging so script utilities are placed under `publish/build/bin/utils` and `fix-esm.js` resolves `./utils/index.js`, preventing runtime module resolution issues when running `npx zacatl-fix-esm`.

### 🔧 Improvements

- **Publish script cleanup** — Simplified `prepare-publish` flow by copying the bin script first and then rewriting imports in place, keeping the publish output consistent and easier to reason about.

## [0.0.50] - 2026-03-04

**Status**: Pending release

### ✨ Features

- **Built-in SQLite ORM adapter** — Added Node.js built-in sqlite module adapter (Node 24+) with dynamic module loading. Eliminates experimental warnings through lazy-loading pattern, provides zero external dependencies, and offers type-safe repository operations. Matches feature parity with Mongoose and Sequelize adapters.

### 🔧 Improvements

- **Dynamic module loading for optional features** — Deferred import of optional ORM modules (node:sqlite) until first use to eliminate startup overhead and experimental warnings. Implemented static module caching pattern to prevent repeated imports while maintaining lazy-loading benefits.

- **Build system resilience** — Increased git command buffer from 10MB to 100MB and added 5-second timeout to handle large gitignored file lists. Improved error handling from fatal failures to graceful warnings, ensuring cleanup operations complete even with large projects.

- **Comprehensive cleanup targets** — Updated clean:build task to remove coverage and publish directories alongside build artifacts and compiled files, ensuring complete build directory cleanup.

### 🐛 Fixes

- **`zacatl-fix-esm` publish bin resolution** — Fixed `prepare-publish` packaging order to prioritize ESM-ready script artifacts and include required script utilities under `publish/build/utils`, preventing runtime module resolution errors when running `npx zacatl-fix-esm` from installed packages.

### 📚 Documentation

- **SQLite integration guide** — Updated README.md and docs/third-party/orm/overview.md to document built-in SQLite support and dynamic import optimization. Added usage examples and explain lazy-loading benefits for non-SQLite projects.

---

## [0.0.49] - 2026-03-03

**Status**: Released

### 🔧 Improvements

- **Simplified handler responses** — Streamlined `AbstractRouteHandler` for both Express and Fastify by removing response shaping logic. Handlers now return data directly without any default envelope or status code injection. Added `handleError()` method that automatically maps Zacatl error types (NotFoundError→404, BadRequestError→400, ValidationError→422, UnauthorizedError→401, ForbiddenError→403, InternalServerError→500) to appropriate HTTP status codes. The `execute()` pipeline wraps handler execution in try-catch, sending handler results directly on success and calling `handleError()` on failure. Custom status codes and response envelopes can be implemented within handler logic using framework-native reply methods.

### 🧪 Tests

- **Express handler parity tests** — Added comprehensive test suite (15 tests) for Express handlers ensuring feature parity with Fastify implementations. Tests cover auto-mapping of Zacatl error types to status codes, custom error handling via `handleError()` override, handler metadata, and Express-specific request/response handling.

### 📚 Documentation

- **Handler best practices guide** — New comprehensive guide (`docs/service/handler-best-practices.md`) covering REST handler patterns, error handling strategies, real-world examples (pagination, filtering, updates), hook/middleware patterns, and testing. Includes both Fastify and Express examples with detailed explanations of the simplified response approach.

---

## [0.0.48] - 2026-03-03

**Status**: Released

### ✨ Features

- **Node:sqlite ORM adapter** — Added complete ORM implementation for Node.js built-in sqlite module (Node 24+). Includes `NodeSqliteAdapter`, lazy-loading factory, type-safe repository class, and comprehensive unit tests. Follows same architecture as Mongoose and Sequelize adapters with prepared statements and defensive mode security.

### 🔧 Improvements

- **Barrel auto-generation** — Converted all 49 index.ts files in src/ to auto-generated pattern using recursive directory walking with per-directory opt-in headers. Maintains explicit dependency declarations while eliminating manual maintenance.

- **ORM dependency isolation** — Refined orm/ layer barrel to export only adapter factory functions (`createMongooseAdapter`, `createSequelizeAdapter`, `createNodeSqliteAdapter`), preventing mongoose, sequelize, and node:sqlite packages from leaking into library exports. Dependencies remain isolable via third-party subpaths.

- **Examples restructuring** — Flattened examples directory structure from nested folders (`platform-express/with-mongodb-react/apps/backend`) to simplified layout (`express-mongodb-react/backend`). Removed redundant platform-level nesting to reduce directory depth and improve discoverability.

- **ESLint config simplification** — Refactored root ESLint configuration to use Zacatl's recommended config directly, reducing complexity and improving maintainability. Removed manual config normalization logic.

- **Node 24.14.0 LTS** — Updated `.nvmrc` to Node 24.14.0 (latest LTS point release) and bumped npm requirement to 11.0.0+ in documentation.

### 📚 Documentation

- Updated all documentation references to reflect simplified examples layout (`examples/<framework>-<db>-<ui>/backend|frontend`).
- Aligned service module, QA guide, and testing roadmap snippets with current example paths and route-handler locations.

---

## [0.0.47] - 2026-03-03

**Status**: Released

### 📚 Documentation

- **Repository pattern guide enhancements** — Clarified output type requirements for all repository
  methods (`create`, `findById`, `update`, `delete`, `findMany`). All output types must include
  `id`, `createdAt`, and `updatedAt` fields as they are automatically normalized by `toLean()`.

- **Base type examples** — Added clear examples showing how to use `LeanWithMeta<T>` (Mongoose)
  and `LeanDocument<T>` (Sequelize) to enforce output type contracts in consuming code.

- **API reference improvements** — Updated BaseRepository API signature to include all methods:
  `findMany()` and `exists()` were missing from the documented interface.

### 🔧 Improvements

- **LeanDocument export** — Exported `LeanDocument<T>` type from main library entrypoint
  (`@sentzunhat/zacatl`) for symmetric access with `LeanWithMeta<T>`. Both types now available
  at library root for convenience.

---

## [0.0.46] - Unreleased

**Status**: Pending release

### ✨ New

- **Node 24 LTS standardization** — Bumped `engines.node` to `>=24.14.0` (LTS point release). Added
  native `imports` field (`"#/*": "./src/*"`) to `package.json` for Node-native subpath imports,
  removing the need for TypeScript path-alias hacks in consuming projects.

- **Built-in SQLite adapter (`node:sqlite`)** — Added `DatabaseVendor.SQLITE` and
  `src/service/platforms/server/database/sqlite-adapter.ts` using the Node 24 built-in
  `node:sqlite` (`DatabaseSync`). Defensive mode is enabled by default. No external SQLite
  package or native bindings required. `instance` is now optional in `DatabaseConfig` — only
  needed for Mongoose / Sequelize.

- **Request context module (AsyncLocalStorage)** — Added
  `src/service/platforms/context/request-context.ts` exposing:

  - `requestContext` — singleton `AsyncLocalStorage<RequestContext>` for propagating
    `requestId`, `tenantId`, and `userId` (all optional) across async layers without
    manual parameter threading.
  - `requestContextMixin` — opt-in Pino mixin function that automatically merges the
    current request context into every log entry when passed to `PinoLoggerAdapter`.
    Both exports are re-exported from the package root.

- **ESLint: `node:` core modules** — Added `import/core-modules` setting to the imports
  ESLint config so `node:sqlite`, `node:async_hooks`, and all other `node:`-prefixed
  built-ins resolve cleanly without spurious "unable to resolve" warnings.

- **Command Runner module** — Added `src/utils/command-runner/`, a structured, shell-free command
  execution module built on `child_process.spawn` with `shell: false`. Includes:

  - `CommandSpec` Zod schema and type (cmd + args kept separate to prevent shell injection)
  - `RunnerPolicy` Zod schema with configurable allowlist, deny patterns, cwd prefix restriction,
    timeout, output byte cap, and concurrency limit
  - `runCommand` — single command executor with SIGTERM → SIGKILL timeout fallback
  - `executeCommands` — parallel batch executor bounded by `maxConcurrency`
  - `validateCommandSpec` — standalone policy guard for use at API boundaries
  - `scripts/dev/parallel-execution.ts` — developer script demonstrating concurrent execution
  - Full unit test coverage in `test/unit/utils/command-runner.test.ts`
  - Module documentation in `docs/utils/command-runner.md`

### ✨ Improvements

- **Fastify compiler helpers re-exported** — `serializerCompiler` and `validatorCompiler` from
  `fastify-type-provider-zod` are now exported via `@sentzunhat/zacatl/third-party/fastify`,
  so consumers no longer need a direct `fastify-type-provider-zod` dependency.

- **Lazy-load DB adapters** — Prevented top-level imports from pulling in heavy ORM runtime deps (notably `sequelize`/`pg` and `pg-hstore`) by:

  - Making the Sequelize adapter a lazy wrapper that dynamically imports the runtime implementation when first used.
  - Converting internal Sequelize runtime imports to type-only where appropriate.
  - Registering concrete DB instances by their runtime constructor to avoid importing adapter classes at module load.

  This fixes bundler failures (e.g. `bun build`) where consumers that only use Mongoose were required to install Postgres packages.

### 🔧 Fixes

- **`ServerType` added to public barrel** — `ServerType` was missing from the
  `service/platforms/server` public exports; it is now re-exported alongside `ServerVendor` and
  `DatabaseVendor` so consumers can reference it without internal path imports.

- **Bundling**: Importing the library root no longer causes bundlers to traverse `sequelize` at bundle time unless explicitly used.

- **Lazy-load Mongoose adapter** — Removed the top-level static `import { MongooseAdapter }` from
  `src/service/layers/infrastructure/orm/adapter-loader.ts`. The `mongoose` npm package is now
  dynamically imported only when an async repository method is first called (same lazy pattern
  already applied to Sequelize). Main entry import no longer evaluates `mongoose` as a side
  effect for consumers that only target SQL or non-ORM backends.

### 📦 Dependencies

- **Batteries-included install** — Moved `mongoose`, `sequelize`, `express`, `fastify`, and
  `better-sqlite3` from `peerDependencies` into `dependencies`. A single
  `npm install @sentzunhat/zacatl` now provides all supported ORMs and platforms without extra
  peer install steps. Platform-specific code remains gated behind subpath imports
  (`@sentzunhat/zacatl/third-party/mongoose`, `/third-party/sequelize`, etc.) so the main entry
  stays lean. Removed corresponding `peerDependenciesMeta` block.

### 🔧 Tooling

- **Local exports map sync** — Added `scripts/dev/sync-local-exports.ts`, wired into
  `postbuild`. After every build it walks `build-src-esm/` and writes a complete `exports` map
  (with `types`, `import`, and `require` conditions) into root `package.json`. This lets the
  `file:`-linked local package resolve all subpath imports (e.g.
  `@sentzunhat/zacatl/third-party/fastify`) in consuming projects without manual `paths` hacks
  in their tsconfigs.

- **`prepare-publish` hardening** — Fixed two npm v10 publish warnings in the generated
  `publish/package.json`: `repository.url` is now always prefixed with `git+`, and bin script
  paths no longer carry a leading `./` (npm v10 normalizes both; they are now written correctly
  by the script).

- **`fixEntryKeepBuild` double-path bug** — The third regex in `fixEntryKeepBuild` inside
  `prepare-publish.ts` was incorrectly re-processing already-transformed paths
  (`./build/esm/…` → `./build/esm/esm/…`, `./build/cjs/…` → `./build/esm/cjs/…`). Fixed
  with a negative lookahead (`(?!esm/|cjs/)`) so the fallback replacement only applies to
  plain `build/` paths that were not yet normalized by either of the earlier two passes.

- **Deterministic barrel generation** — Added `scripts/dev/generate-barrels.ts` and two new npm
  scripts:

  - `npm run barrels:generate` — walks `src/` and regenerates every `index.ts` barrel that opts in
    with a `// @barrel-generated` header. Output is alphabetically sorted and idempotent (two
    consecutive runs produce no diff). Runs automatically on `npm run setup:dev` and in the
    pre-commit hook (updated barrels are auto-staged before every commit).
  - `npm run barrels:verify` — runs the generator then calls
    `git diff --exit-code -- 'src/**/index.ts'` (scoped to barrel files only), failing CI
    when committed barrels diverge from generated output. Included in `prepublish:only`,
    `publish:dry:ci`, and the `publish-dry.yml` CI workflow.

  Barrels that require selective or hand-crafted exports (e.g. backward-compat aliases, type-only
  re-exports, ORM exclusions) carry a `// @barrel-manual` header and are never touched by the
  script. Per-directory exclusion rules (`EXCLUSIONS` map in the script) prevent optional heavy
  peer-dependencies from being pulled in as side-effects at the barrel level.

---

## [0.0.45] - 2026-02-22

**Status**: Current release

### 🔧 Maintenance

- **Docs**: Removed Bun runtime claims from documentation and changelog.
- **Version**: Bumped package version to `0.0.45`.

---

## [0.0.44] - 2026-02-22

**Status**: Previous release

### ✨ Improvements

- **ESLint: consolidated `solid` config** — Added `src/eslint/solid.mjs` (a consolidated, ready-to-use Flat config) and exported it via the package `recommended` set so consumers can opt into a single, well-configured ESLint bundle.
- **ESLint: relaxed naming rules for literal properties** — The `naming-conventions` rules now allow numeric keys (e.g. `200`) and dot-delimited alphanumeric property names (e.g. `device.browser.fingerprint`, `diego.beltran.is.best`), which avoids false positives when using status-code keys or dotted property identifiers in literal objects.

### 📚 Documentation

- **Docs: cleaned examples and imports** — Removed unnecessary imports from code examples and reformatted ORM docs into a list for clarity. ([commit: f961e2c])
- **Docs: minor formatting fixes** — Corrected formatting inconsistencies and removed an extraneous trailing newline to improve readability. ([commit: 5fa643b])

### 🔧 Maintenance

- **Preparations for publish** — Bumped package version to `0.0.44`.

---

## [0.0.43] - 2026-02-19

**Status**: Previous release

### 🔧 Maintenance

- **Dependency audit refresh**: Updated lockfile dependencies via npm audit fix to reduce vulnerabilities.

---

## [0.0.42] - 2026-02-19

**Status**: Previous release

### 🔧 Maintenance

- **npm package metadata**: Added .npmignore for publish hygiene and expanded keywords for discoverability.

---

## [0.0.41] - 2026-02-19

**Status**: Previous release

### ✨ Improvements

- **User-controlled response shapes** (opt-in envelope): `buildResponse()` returns raw handler data by default. Use `makeWithDefaultResponse()` in your schema if you want to validate the `{ ok, message, data }` envelope at the Fastify level, then override `buildResponse()` to add the wrapper. This gives full control to the user.
- **`@singleton()` and `@injectable()` both work on route handlers**: the application layer now checks `container.isRegistered()` before registering a handler. Both decorators produce singletons — use whichever reads better.
- **Framework dependencies exported from `third-party/`**: `ZodTypeProvider` from `fastify-type-provider-zod` is now re-exported via `@sentzunhat/zacatl/third-party/fastify`, along with all other framework dependencies, for consistent type safety.

### 🔧 Fixes

- **Zod v4 schema type compatibility**: `makeWithDefaultResponse` now has explicit return type and accepts `z.ZodTypeAny`, resolving ~70 `TS2379` errors under `exactOptionalPropertyTypes: true`
- **Removed `makeSchema`**: was a no-op identity wrapper; its type constraint caused schema type errors. Plain `z.object(...)` is all that is needed.
- **Schema utilities in `common/`**: `makeWithDefaultResponse` lives in `rest/common/schema.ts` and is shared by both Fastify and Express platforms as an optional utility.

### 📚 Usage examples

#### Default — raw response

```typescript
export class MyHandler extends PostRouteHandler<Input, MyData> {
  schema = {
    body: z.object({ name: z.string() }),
    response: z.object({ id: z.string() }), // just the data shape
  };

  async handler({ body }): Promise<MyData> {
    return { id: '1' }; // returns plain data
  }
}
// HTTP response: { id: "1" }
```

#### With envelope (opt-in)

```typescript
export const MyResponseSchema = makeWithDefaultResponse(z.object({ id: z.string() }));

export class MyHandler extends PostRouteHandler<Input, MyData> {
  schema = {
    body: z.object({ name: z.string() }),
    response: MyResponseSchema, // validates full envelope
  };

  async handler({ body }): Promise<MyData> {
    return { id: '1' };
  }

  protected buildResponse(data: MyData) {
    return { ok: true, message: 'Success', data };
  }
}
// HTTP response: { ok: true, message: "Success", data: { id: "1" } }
```

---

## [0.0.40] - 2026-02-19

**Status**: Previous release

### ✨ Improvements

- **Pure Handler Functions**: Handlers are now pure business logic - no HTTP concerns
  - Handler signature: `handler(request)` returns data
  - No access to `reply` parameter - cleaner separation of concerns
  - HTTP concerns (status codes, serialization, sending) handled by `execute()` method
  - Custom response shapes via `buildResponse()` override, not manual reply handling
  - Simpler, more testable handler implementations

### 🔧 Architecture

- **Clean Separation of Concerns**:
  - `handler()` = Business logic, returns domain data
  - `execute()` = HTTP protocol handling (status, headers, serialization)
  - `buildResponse()` = Optional serialization/envelope customization
- Both Fastify and Express handlers follow same pure function pattern

### 📚 Documentation

- Updated handler documentation to remove manual reply handling examples
- Clarified that handlers should be pure functions
- Updated all 37 example handlers to demonstrate new clean API

---

## [0.0.39] - 2026-02-19

**Status**: Previous release

### ✨ Improvements

- **Unified ESM Fix Script**: Consolidated `cli-fix-esm.mjs` and `fix-esm-exports.mjs` into single `fix-esm.mjs` script
- **Unified Dependency Export Strategy**: All dependencies (frameworks, ORMs, utilities) exported via library subpaths; examples import only from `@sentzunhat/zacatl` for a single source of truth
  - Express: `@sentzunhat/zacatl/third-party/express`
  - Fastify: `@sentzunhat/zacatl/third-party/fastify`
  - Mongoose: `@sentzunhat/zacatl/third-party/mongoose`
  - Sequelize: `@sentzunhat/zacatl/third-party/sequelize`
  - Utilities: Zod, UUID, Pino, i18n, YAML via subpaths or root exports
- **Shared HTTP Methods**: Created unified `HTTPMethod` type in common module for consistent method naming across Fastify and Express
- **Express Framework Support**: Full Express.js handler implementation with adapters matching Fastify patterns
  - Added `AbstractExpressRouteHandler` base class and method-specific handlers (Get, Post, Put, Patch, Delete, Head, Options)
  - `ExpressApiServerAdapter` for route registration and lifecycle management
- **Separated Provider Folders**: Reorganized handlers into provider-specific folders (`fastify/handlers/`, `express/handlers/`)
- **Removed Code Duplication**: Both frameworks now share common HTTP method types and utilities

### 🔧 Architecture

- **Framework Separation**: Each framework (Fastify/Express) has isolated handler implementations in separate module trees
- **Common Utilities**: HTTP methods, request types, and base interfaces in `rest/common/`
- **Port-Adapter Pattern**: Handlers adapt framework-specific types to domain logic (consistent with Fastify)

### 📚 Documentation

- Added comprehensive REST handlers guide (`docs/service/rest-handlers.md`)
- Documented HTTP method types and framework-specific implementations
- Migration guide for switching between Fastify and Express

### 🗺️ Roadmap

**In Progress - Express Platform Examples:**

Three Express examples targeting parity with existing Fastify examples:

- `04-with-sqlite` (Express + SQLite via Sequelize)

  - Backend API with full CRUD greetings endpoint
  - React frontend loading from Express API
  - E2E verified: API call → handler → service → repository → SQLite → response

- `05-with-mongodb` (Express + MongoDB via Mongoose)

  - Backend API with full CRUD greetings endpoint
  - React frontend loading from Express API
  - E2E verified: API call → handler → service → repository → MongoDB → response

- `06-with-postgres` (Express + PostgreSQL via Sequelize)
  - Backend API with full CRUD greetings endpoint
  - React frontend loading from Express API
  - E2E verified: API call → handler → service → repository → PostgreSQL → response

Each example will include:

- Docker multi-stage build with distroless Node.js 24
- ESM build pipeline using `fix-esm.mjs`
- Same monorepo structure as Fastify examples (apps/backend, apps/frontend)
- Verified end-to-end with live API calls and DB persistence

---

## [0.0.38] - 2026-02-14

**Status**: Current release

### ✨ Improvements

- **Repository Type Safety**: Added typed model property support for Mongoose and Sequelize repositories
- **Standalone Repository Classes**: Introduced a new standalone repository pattern for advanced use cases
- **DI Auto-Registration**: Fixed automatic registration of repositories and dependencies

### 🔧 Maintenance

- Updated all examples to use the new repository pattern (platform-fastify examples)
- Cleaned up documentation and aligned with the current implementation
- Fixed import paths for package exports

### 📚 Documentation

- Enhanced service module documentation with a testing section
- Added examples for new repository patterns
- Improved repository type safety documentation

---

## [0.0.37] - 2026-02-12

**Status**: Patch release

### ✨ Improvements

- Enhanced package export conditions and type definitions
- Improved type inference for service configuration

### 🔧 Maintenance

- Updated all internal type definitions
- Optimized export resolution paths
- Fixed TypeScript strict mode violations

---

## [0.0.36] - 2026-02-10

**Status**: Patch release

### 🔧 Maintenance

- **i18n Simplification**: Removed runtime detection and i18next dependency bloat
- **Logging Adapters**: Reorganized logging adapters for a cleaner module structure
- **DI Utilities**: Cleaned up dependency injection utilities and simplified registration

### ✨ Improvements

- Streamlined dependency injection initialization
- Simplified logging adapter loading
- Better error messages for missing adapters

### 📚 Documentation

- Updated DI patterns documentation
- Clarified logging adapter usage
- Removed references to deprecated i18next patterns

---

## [0.0.35] - 2026-02-10

**Status**: Stable release

### 🐛 Bug Fixes

- Fixed "TypeInfo not known for Mongoose/Sequelize" error in dependency injection container
- Fixed database instance registration timing issue where repositories were instantiated before database instances were registered
- Pre-register database instances in the Service constructor before layers are instantiated

### ✨ Improvements

- Service now automatically registers Mongoose and Sequelize instances from the config
- Improved database vendor detection and registration in Service initialization
- Enhanced documentation for ORM subpath-only imports

---

## [0.0.34] - 2026-02-10

**Status**: Patch release

### 🔧 Maintenance

- Version bump for upcoming database registration fixes

---

## [0.0.33] - 2026-02-07

**Status**: Previous stable release

See version 0.0.32 below for the latest changes. Version 0.0.33 is a minor version bump.

---

## [0.0.32] - 2026-02-07

> **Note**: The features below are planned for v0.1.0 but have not yet released.
> **Current stable version**: 0.0.33

### 🎯 Multi-Context Architecture Support (Planned)

**Major Feature:** Zacatl will support CLI, Desktop, and Server applications from a single, unified architecture.

#### New ServiceType Enum (Already Implemented)

```typescript
import { Service, ServiceType } from "@sentzunhat/zacatl";

// CLI Application
const cli = new Service({
  type: ServiceType.CLI,
  layers: {
    application: { entryPoints: { cli: { commands: [...] } } },
  },
  platforms: {
    cli: { name: "my-tool", version: "1.0.0" },
    // ... rest of config
  },
});

// Desktop Application
const desktop = new Service({
  type: ServiceType.DESKTOP,
  layers: {
    application: { entryPoints: { ipc: { handlers: [...] } } },
  },
  platforms: {
    desktop: {
      window: { title: "My App", width: 1024, height: 768 },
      platform: "neutralino"
    },
    // ... rest of config
  },
});

// HTTP Server (default - backward compatible)
const server = new Service({
  type: ServiceType.SERVER, // Optional: defaults to SERVER
  layers: {
    application: { entryPoints: { rest: { hooks: [...], routes: [...] } } },
  },
  platforms: {
    server: {
      name: "my-service",
      server: { type: ServerType.SERVER, vendor: ServerVendor.FASTIFY, instance: fastify }
    },
    // ... rest of config
  },
});
```

## **Breaking Changes (with Backward Compatibility)**

### 📦 Release

- **Version Sync**: Bumped package version to 0.0.32

### 📚 Documentation

- **Docs & Examples**: Updated version references, test counts, and Node requirements
- **Coverage Update**: Updated all documentation to reflect current test coverage (61.6%)
- **Internal Docs**: Cleaned up historical audit documents

### ✅ Code Quality

- **Lint Fixes**: Added explicit TypeScript return types in `src/loader.ts`
- **Test Suite**: 178 tests passing with 61.6% coverage (61.59% statements, 43.20% branches, 62.85% functions, 61.14% lines)

---

## [0.0.31] - 2026-02-07

### 🏗️ Architecture

- **Standardized Ports & Adapters Structure**: Removed all top-level `adapters/` folders across the codebase
  - Moved `logs/adapters/*` files to `logs/` root (console-adapter.ts, pino-adapter.ts)
  - Moved `orm/adapters/*` files to `orm/` root (mongoose-adapter.ts, sequelize-adapter.ts)
  - Removed `server/adapters/` re-export folder in favor of direct feature imports
  - All adapters now live directly alongside their ports and types within feature folders
  - Simplified import paths and improved module cohesion

### ✅ Fixes

- **Import Paths**: Updated all internal imports after adapter file relocations
  - Fixed relative imports in moved adapter files
  - Updated test file imports to reference new locations
  - Updated adapter-loader dynamic imports

### 📦 Build & Tests

- All 178 tests passing after restructuring
- Build verification successful with updated import paths

---

## [0.0.28] - 2026-02-06

### ✨ Enhancements

- **Runtime Path Alias Resolution**: Integrated `tsc-alias` post-build step to transform internal path aliases (`@zacatl/*`) into relative imports
  - Enables external consumers to use the library without path alias resolution issues
  - Build script now runs `tsc && tsc-alias` for complete compilation pipeline
  - Path aliases properly replaced in CommonJS and ESM output

### ✅ Fixes

- **Export Condition Ordering**: Reordered all package.json exports to place `"types"` condition first
  - Resolves TypeScript build warnings about incorrect export condition order
  - Ensures type information is properly resolved before runtime conditions
  - Applies to all 24+ subpath exports

### 📦 Dependencies

- Added `tsc-alias@^1.8.16` to dev dependencies for runtime path alias resolution

---

## [0.0.27] - 2026-02-05

### ✨ Enhancements

- **Dependency Updates**: Updated to latest stable versions
- `@fastify/static`: 8.3.0 → 9.0.0
- `@types/node`: 24.10.1 → 25.2.1
- `fastify`: 5.6.2 → 5.7.4
- `knip`: 5.71.0 → 5.83.0
- `mongodb-memory-server`: 10.4.1 → 11.0.1
- `mongoose`: 9.0.0 → 9.1.6

### ✅ Fixes

- **Exports**: Added CommonJS-compatible `require` entry for the main export
- **DI Stability**: Fixed dependency injection error handling with `isRegistered` validation
  - Now throws proper error messages when dependencies are not registered
  - Improved error messages include class names and dependency chain information
- **Type Safety**: Fixed strict TypeScript mode violations
  - Index signature access properly typed in localization tests
  - Null safety checks in layer registration tests
  - Buffer access using globalThis for Node.js compatibility
- **Tests**: All 183 unit tests passing with updated dependencies

**Migration Guide:** See migration archive for historical versions

---

## [0.0.23] - 2026-01-31

### 🎯 Dual ORM Import Strategy - Flexibility for All Use Cases

**New Feature:** Choose between convenience (main package) or minimal bundles (subpath imports).

#### Import Options

**Option 1 - Main Package (Convenience):**

```typescript
import { Service, mongoose, Schema, Sequelize } from '@sentzunhat/zacatl';
```

**Option 2 - Subpath Imports (Minimal Bundle):**

```typescript
import { Service } from '@sentzunhat/zacatl';
import { mongoose, Schema } from '@sentzunhat/zacatl/third-party/mongoose';
import { Sequelize, DataTypes } from '@sentzunhat/zacatl/third-party/sequelize';
```

#### Why Both Options?

- **Main Package**: Quick projects, prototypes, learning (includes both ORMs)
- **Subpath Imports**: Production apps, bundle optimization (tree-shakeable)

**No Breaking Changes:** Both import styles work - choose based on your needs.

**See:** [third-party/orm/orm-import-strategies.md](third-party/orm/orm-import-strategies.md)

---

### 🧹 Code Cleanup

- Simplified documentation comments throughout codebase
- Removed redundant explanations while keeping essential docs
- Cleaner code, same functionality

---

### 📦 Dependency Management Optimization

**Change:** Mongoose and Sequelize included as regular dependencies for version control.

**Rationale:**

- **Single Source of Truth:** All users get tested, compatible ORM versions
- **Version Control:** Zacatl manages ORM version compatibility
- **Automatic Updates:** Upgrading zacatl updates ORMs to compatible versions
- **Simpler Installation:** `npm install @sentzunhat/zacatl` includes everything

**Dependencies Structure:**

- `dependencies`: Core packages + mongoose + sequelize (guaranteed compatible)
- `peerDependencies`: Optional flexibility for advanced users to override
- `devDependencies`: Testing tools (mongodb-memory-server, etc.)

---

## [0.0.22] - 2026-01-31

### 🐛 Critical ESM Runtime Fix

#### **Issue: CommonJS `require()` in ESM Environment**

**Problem:** v0.0.21 used `require()` for lazy loading adapters, which throws `ReferenceError: require is not defined` in pure ESM environments (Node.js ESM, Vite, Next.js).

**Root Cause:**

```typescript
// v0.0.21 - BROKEN in ESM
export function loadMongooseAdapter(config) {
  const adapters = require('./adapters/mongoose-adapter'); // ❌
  return new adapters.MongooseAdapter(config);
}
```

**Solution:** Replaced `require()` with async `import()` and implemented lazy initialization pattern:

```typescript
// v0.0.22 - Works in ALL environments
export async function loadMongooseAdapter(config) {
  const adapters = await import('./adapters/mongoose-adapter'); // ✅
  return new adapters.MongooseAdapter(config);
}
```

**Implementation Details:**

- ✅ Repository constructors remain synchronous (no breaking changes)
- ✅ Adapters load lazily on first async method call
- ✅ Single initialization promise prevents race conditions
- ✅ Handles both ESM (`ERR_MODULE_NOT_FOUND`) and CommonJS (`MODULE_NOT_FOUND`) error codes

**Impact:** Framework now works in all JavaScript runtimes without `require is not defined` errors.

**Migration:** See migration archive for details. Most users need no code changes.

---

### Testing

- ✅ 169 tests passing (8 new ESM adapter tests)
- ✅ Verified with Node.js ESM
- ✅ All existing tests pass without modification

---

## [0.0.21] - 2026-01-31

### 🐛 Critical Bug Fixes

#### **Issue #1: Optional ORM Dependencies (BREAKING FIX)**

**Problem:** Both Mongoose and Sequelize adapters were imported unconditionally at the top level, forcing all projects to install both ORMs even if only using one.

**Solution:** Implemented lazy loading with `require()` - adapters are now only loaded when actually used.

```typescript
// Now you can use ONLY Sequelize without installing mongoose
npm install @sentzunhat/zacatl sequelize

// Or ONLY Mongoose without installing sequelize
npm install @sentzunhat/zacatl mongoose
```

**Impact:** Projects can now install and use a single ORM without dependency conflicts.

---

#### **Issue #2: Mongoose v9 ESM Import**

**Problem:** `connection` named export doesn't exist in mongoose v9, causing `SyntaxError` in ESM environments.

**Before:**

```typescript
import { connection } from 'mongoose'; // ❌ Breaks in v9
```

**After:**

```typescript
import mongoose from 'mongoose';
mongoose.connection; // ✅ Works in v9
```

**Impact:** Mongoose adapter now works correctly with mongoose v9+ in ESM/tsx/Node.js runtimes.

---

### Developer Experience Improvements

#### 📦 Package Exports Map

- Added comprehensive `exports` field for better module resolution
- Shorter, cleaner import paths for better DX
- Backward compatible - all old paths still work

**New Import Shortcuts:**

```typescript
import { BaseRepository, ORMType } from '@sentzunhat/zacatl/infrastructure';
import { CustomError } from '@sentzunhat/zacatl/errors';
import { loadConfig } from '@sentzunhat/zacatl/config';
```

#### 🔧 Peer Dependencies

- Moved `mongoose` and `sequelize` to `peerDependencies` with `optional: true`
- Clearer indication of which ORMs are supported
- No forced installation of unused dependencies

#### 🧪 Testing

- Better runtime-specific testing

#### 📚 Documentation

- Added v0.0.21 Migration Guide
- Updated README with import shortcuts section
- All examples remain backward compatible

### Technical Details

**Lazy Loading Implementation:**

- Adapters use CommonJS `require()` for conditional loading
- Type safety maintained with TypeScript type assertions
- Works in both compiled JavaScript and TypeScript environments
- ORM type stored for runtime checks without instanceof

### Migration Path

No code changes required. Projects already using both ORMs will continue to work. Projects wanting to use a single ORM can now uninstall the unused one.

See migration archive for details.

---

## [0.0.20] - 2026-01-30

### Summary

Zacatl is production-ready with organized documentation, full test coverage, and verified build/publish pipelines.

## What's New

### 📚 Documentation Updates

- README optimized for npm
- Documentation split into small, focused files
- API reference, testing, examples, and getting-started guides

### ✅ Verification

- **Tests Passing**
- **Coverage** meets target
- **0 Compilation Errors**
- **0 Type Errors**
- **All npm Scripts Working**

### 🏗️ Architecture (Unchanged)

Layered/hexagonal architecture:

1. Application Layer - HTTP handlers, validation
2. Domain Layer - Business logic
3. Infrastructure Layer - Repositories, adapters
4. Platform Layer - Service orchestration, DI

## Features

✅ Fastify & Express integrations
✅ Sequelize & Mongoose adapters
✅ tsyringe DI container
✅ Zod validation
✅ 7 custom error types
✅ Pino logging
✅ i18n adapters
✅ YAML/JSON configuration

## No Breaking Changes

All changes are additive. Existing APIs remain unchanged.

## Quality Metrics

| Metric      | Value      | Status |
| ----------- | ---------- | ------ |
| Tests       | passing    | ✅     |
| Coverage    | target met | ✅     |
| Type Errors | 0          | ✅     |
| Lint Errors | 0          | ✅     |
| Compilation | Success    | ✅     |

## Next Steps

1. `npm run publish:latest`
2. Create GitHub release `vX.Y.Z`
3. Announce the release

---

**Status**: ✅ Ready for Release
**Version**: 0.0.20
**Date**: 2026-01-30
