# Release Notes

---

## [0.0.57] - 2026-07-17

**Status**: Ready for publication

### ⚠️ Breaking Changes

- **Node 26 is the release contract** — `package.json` declares
  `node >=26.0.0` and `npm >=11.0.0`. Node 24 is not a supported runtime for
  0.0.57 consumers; use Node 26 locally, in CI, and in production images before
  treating failures as Zacatl defects.
- **Config types renamed to `*Config` suffix style — no aliases kept** (owner decision: no rollout window needed). Migration table:

  | Removed | Use instead |
  | ------- | ----------- |
  | `ConfigService` | `ServiceConfig` |
  | `ConfigServer` | `ServerConfig` |
  | `ConfigLayers` | `LayersConfig` |
  | `ConfigApplication` | `ApplicationConfig` |
  | `ConfigInfrastructure` | `InfrastructureConfig` |
  | `ConfigDomain` | `DomainConfig` |
  | `ConfigCLI` | `CliConfig` |
  | `ConfigDesktop` | `DesktopConfig` |
  | `ConfigPlatforms` | `PlatformsConfig` |
  | `ConfigLocalization` | `LocalizationConfig` |

- **`generateHmac` no longer accepts SHA-1/MD5** — `HmacAlgorithm` is now `'sha256' | 'sha512'` (the separate `SafeHmacAlgorithm` type is gone; it's just `HmacAlgorithm`). Switch any SHA-1/MD5 signatures to sha256.

### 🐛 Critical Fixes

- **CommonJS consumers un-broken** — the published `build/cjs` tree now carries a `{"type":"commonjs"}` scope marker; previously every `require('@sentzunhat/zacatl/...')` subpath crashed because the CJS files were loaded as ESM under the `"type": "module"` package root. Verified end-to-end against the packed tarball from both `require` and `import`.

### 🔒 Security

- **Timing-safe HMAC verification** — New `verifyHmac()` utility uses `crypto.timingSafeEqual` with a byte-length guard (multi-byte UTF-8 signatures return `false` instead of throwing `RangeError`), preventing timing side-channel attacks on webhook signature validation.
- **Mongoose filter sanitization** — Adapter filters now reject operator-injection patterns; updates are wrapped in `$set` to prevent accidental field overwrites.
- **Command-runner policy fail-closed** — Unknown or unregistered commands now throw rather than silently pass; working-directory containment is enforced.
- **Sequelize is now an optional peer** — Zacatl no longer publishes `sequelize` as a hard runtime dependency, so non-SQL consumers do not inherit Sequelize's nested `uuid@8` advisory chain. Services that use Zacatl's Sequelize adapter should install `sequelize` plus their dialect driver (`pg`, `sqlite3`, etc.) directly.
- **Removed the scoped Sequelize UUID override** — with Sequelize moved to dev/optional-peer scope, Zacatl no longer forces Sequelize's nested `uuid` outside its declared semver range. Production consumers avoid the audit chain by not installing Sequelize unless they explicitly use SQL adapters.
- **Consumer audit remediation path documented** — the 0.0.56 audit chain
  `@sentzunhat/zacatl -> sequelize -> uuid@8.3.2` is fixed for non-SQL
  consumers by isolating Sequelize as an optional peer, not by downgrading
  Zacatl or forcing a nested UUID override. See
  [Migration Guide: 0.0.56 → 0.0.57](migration/0.0.57.md).

### ✨ Improvements

- **JSDoc now ships in the published type declarations** — `removeComments` was stripping every doc comment from the `.d.ts` output, so consumers saw no API docs or deprecation hints in their IDE. Fixed; all public JSDoc now reaches consumers.
- **@fastify/static upgraded 9 → 10** — verified against a live Fastify instance; the page adapter handles v10's `setHeaders` signature change (Fastify `Reply` instead of the raw `ServerResponse`) with backward compatibility for both shapes.
- **Static asset caching for CDNs** — new `page.cache: { maxAge, immutable }` config: hashed bundles get long immutable `Cache-Control` while `index.html` and the SPA fallback are always `no-cache`, so deploys propagate instantly and a CDN simply respects origin headers. Implemented in both Fastify and Express page adapters.
- **SQLite prepared-statement cache (bounded)** — `NodeSqliteAdapter` caches compiled `StatementSync` objects per SQL text in an LRU capped at 128 entries, avoiding re-parsing on every CRUD call without unbounded growth under dynamic filters.
- **Sequelize write-path polish** — `update()` uses `RETURNING` on the Postgres dialect to skip the re-fetch round trip; write operations are documented as scoping by primary key `id` only (the shared adapter contract).
- **Proxy path regex escaping** — Express http-proxy-middleware `pathRewrite` key now escapes the configured prefix so special regex characters in path prefixes don't silently mis-route.
- **Fastify SPA URL decode** — Static file handler strips query strings before resolving the file path so `/assets/app.js?v=1` resolves correctly.
- **Named database connections** — `connection: { url, name? }` API allows multiple databases of the same vendor; DI tokens are symbol-keyed per name.
- **Awaitable adapter initialization** — `Service.start()` awaits infrastructure readiness after platform startup.
- **`DatabaseVendor`, `QueryOptions`, `DEFAULT_QUERY_LIMIT` re-exported** from `@sentzunhat/zacatl/service` for consumer convenience.
- **`ensureRegisteredSingleton()` DI guard** — one container helper replaces the per-layer `isRegistered` checks: Application, Domain, and Infrastructure layers skip `registerSingleton` if the class is already registered, preventing silent clobber from `@singleton()`-decorated classes.
- **Publish staging validation** — `prepare-publish` now verifies every `exports`/`bin` target exists in the staged tree and fails the build with a missing-target list instead of shipping a silently broken subpath.

### 🐛 Fixes

- **Eager ORM resolution crash** — Repository adapters now resolve the ORM instance lazily on first model access, fixing startup failures under tsyringe `@singleton()` registration order.
- **JSONC comment stripping** — Replaced buggy regex with `jsonc-parser` to correctly handle nested comments and string literals.
- **`findMany` unbounded queries** — All three ORM adapters now enforce a default limit and cap on `findMany`; SQLite additionally pushes filters into SQL for efficiency.

### 🧪 Tests & CI

- **636 tests** — new coverage for `Service`, `Layers`, `Server`, `PageServer`, logger default singletons, statement-cache eviction, Postgres `RETURNING`, and cache-header behavior in both page adapters.
- **Docker smoke workflow** — CI builds one example image per database-driver branch (sqlite3/pg/mongoose) and runs full CRUD + SPA smoke against the running containers, on relevant pushes/PRs and weekly.
- **Consumer publish-shape proof** — release verification checks the published
  package shape so `sequelize` remains out of Zacatl's non-dev dependency tree
  while SQL examples install `sequelize` plus their dialect driver explicitly.
- **Release automation** — merging `dev` → `main` auto-creates the version tag, runs the verification chain with `NPM_TOKEN` scoped to the publish step only, publishes with provenance, and creates a GitHub Release from this changelog section.

### 📚 Examples

- All 8 examples gained `PUT /greetings/:id` end-to-end (route handler → domain → repository), an inline Edit UI, CDN cache config, and refreshed 4-state screenshot galleries (initial → create → update → delete).
- Example Docker Compose database defaults are factored into
  `examples/compose/databases/{sqlite,mongodb,postgres}.yml`; each example
  extends the relevant shared defaults while keeping only its app-specific
  ports, build args, container names, and Mongo init script. MongoDB and
  PostgreSQL examples default to `mongo:latest` / `postgres:latest` for local
  copy-paste use and remain env-overridable for pinned deployment images.

### 📚 Migration

- Added [Migration Guide: 0.0.56 → 0.0.57](migration/0.0.57.md), covering:
  Node 26 runtime expectations, optional ORM peer installs, Sequelize/UUID audit
  verification, stale override removal, SQL vs non-SQL dependency choices, and
  downstream Docker smoke expectations.

---

## [0.0.56] - 2026-07-11

**Status**: Ready for publication

### ⚠️ Breaking Changes

- **Named repository/provider pattern: vendor moves from the name to the path** — Repository classes and server provider factories now follow the same rule route handlers already did: the exported name is identical across every vendor, and only the file path disambiguates.
  - `AbstractMongooseRepository`/`MongooseRepository`, `AbstractSequelizeRepository`/`SequelizeRepository`, and `AbstractNodeSqliteRepository`/`NodeSqliteRepository` are now all just **`BaseRepository`**, exported from their own vendor path (`.../repositories/mongoose/repository`, `.../repositories/sequelize/repository`, `.../repositories/nodesqlite/repository`).
  - `createFastifyApiAdapter`/`createExpressApiAdapter` are now **`createApiAdapter`**; `createFastifyPageAdapter`/`createExpressPageAdapter` are now **`createPageAdapter`** — each exported from its own vendor path under `.../platforms/server/providers/<vendor>/`.
  - The old cross-vendor `BaseRepository` (`.../repositories/abstract`, runtime `config.type` dispatch) is removed entirely — it had zero usage in any example or `src/` consumer. Import the vendor-specific `BaseRepository` instead.
  - No aliases are kept for any of the above — update imports directly. See `docs/guidelines/architecture.md`'s "Database Adapters" and "Named Provider Pattern" sections for the updated pattern.
- **Removed root package barrel** — Dropped `src/index.ts` and the `"."` export. Import from explicit subpaths such as `@sentzunhat/zacatl/service`, `@sentzunhat/zacatl/error`, and `@sentzunhat/zacatl/dependency-injection` instead of `@sentzunhat/zacatl`.
- **Nested third-party paths only** — Flat publish shims removed. Use:
  - `@sentzunhat/zacatl/third-party/databases/mongoose`
  - `@sentzunhat/zacatl/third-party/databases/sequelize`
  - `@sentzunhat/zacatl/third-party/databases/sqlite3`
  - `@sentzunhat/zacatl/third-party/dependency-injection/tsyringe`
  - `@sentzunhat/zacatl/third-party/dependency-injection/reflect-metadata`

  Previous flat paths (`/third-party/mongoose`, `/third-party/tsyringe`, etc.) no longer resolve.

### 🔧 Architecture

- **Unified ORM adapter loading** — Aligned the Mongoose, Sequelize, and node:sqlite repository adapters around eager factory creation, DI-token ORM resolution, and consistent repository entrypoints.
- **Export map automation** — Wired `local:exports` into `postbuild` so `package.json` exports stay aligned with build output; publish tarball prunes to entrance index files only.
- **Consolidated export targets** — 152 nested export paths in published tarball (down from 192 pre-pruning); 21 entrance index files in package root and modules.

### ✨ Improvements

- **Graceful shutdown** — `Service` now exposes a `stop()` method that closes the HTTP server and disconnects all configured databases. Wire it to `SIGTERM`/`SIGINT` in your entry file for clean process exit.
- **Real database disconnect** — `MongooseAdapter.disconnect()` and `SequelizeAdapter.disconnect()` now call the underlying ORM's close method instead of no-oping. `SQLiteAdapter` already implemented this.
- **Example import standardization** — All examples use `@zacatl/*` subpath imports with unified root `tsconfig.json` path mappings.
- **Neutralino/WebGPU experiment scaffold** — Added a minimal runnable desktop experiment starter under `examples/neutralino-react-transformers-webgpu/` with a local preview path for the Neutralino + React + Transformers.js + WebGPU prototype.
- **Test suite expansion** — All 555 tests pass under Node 26+ with no type errors.

### 🐛 Fixes

- **Third-party compatibility shims** — Added explicit re-exports for `mongoose.ts`, `sequelize.ts`, `sqlite3.ts`, `tsyringe.ts`, and `reflect-metadata.ts` to prevent version conflicts in downstream projects.
- **Fastify DELETE with empty body** — Fixed frontend `api.ts` in all Fastify examples: `Content-Type: application/json` is now only sent when a request body is present. Fastify's strict JSON parser (`FST_ERR_CTP_EMPTY_JSON_BODY`) rejected DELETE requests that sent the header with no body.
- **express-mongodb-react brand label** — Corrected UI footer text from "Fastify" to "Express".

### 🔧 Tooling

- **Example screenshots automated** — Added `npm run screenshots:examples:capture` (Playwright) that boots each example via Docker Compose, performs create + delete, and saves 3 PNGs per example to `examples/screenshots/{name}/`. Screenshots are embedded in `examples/README.md`.
- **Docker images lean** — All 8 example images use `node:26-alpine` across all 3 build stages with a non-root runtime user. Frontend build tools (`vite`, `react`, `svelte`) are kept as `devDependencies` at the repo root and pruned from the final image layer.
- **Docker-compose healthchecks** — Fixed all 8 compose files: healthcheck URLs updated from `/greetings` to `/api/greetings`; Express examples corrected from `/nodejs/bin/node` to `node` (PATH-resolved, matching `node:26-alpine`).
- **Dependency updates** — `prettier` → `^3.9.5`, `vite` → `^8.1.4` across all examples, `npm` → `12`, `packageManager` pinned. TypeScript stays at `^6.0.3` (`@typescript-eslint@8.x` does not yet support TS 7); ESLint stays at `^9.x` (`eslint-plugin-import` blocks ESLint 10).
- **`prepare-publish.ts`** — Fixed `fix-esm.js` import rewrite: was only rewriting `../utils/index.js`; now rewrites all `../utils/*` paths including `measure-time.js`.
- **Removed dead `nestedIndexAllowlist`** from `export-policy.ts`.

### 🔬 Refactored

- **Unified API prefix** — All 8 examples now serve routes at `/api/greetings` via `server.prefixes: { api: '/api' }`. Vite dev proxies updated to `'^/api'`.
- **Tailwind CSS 4 migration** — All 8 example frontends migrated from Tailwind 3 to Tailwind 4 (`@import "tailwindcss"`, `@theme {}` block, `@tailwindcss/vite` plugin). No `postcss.config` or `tailwind.config` files remain.
- **Barrel removal** — Removed `src/service/layers/application/entry-points/rest/index.ts` and its orphaned test; the barrel was not in the published exports map and the Fastify-prefixed aliases it exposed were unreachable to consumers.
- **Node.js engine requirement** — Broadened from `>=26.3.0` to `>=26.0.0`. (Note: although `node:sqlite` first appeared experimentally in Node 22.5, the package's enforced engine floor remains `>=26.0.0` — Node 22.x is not supported.)

### 📚 Documentation

- **Repository/ORM docs cleanup** — Updated the repository and ORM docs to reflect BaseRepository's node:sqlite support and the Sequelize `name`-based model lookup flow.
- **Subpath import guide** — Refreshed third-party and migration docs for Option B (explicit subpaths, nested third-party only).
- **examples/README** — Added screenshot gallery, correct API endpoint spec (including `GET /greetings/random/:lang`), validation checklist, and instructions for re-running screenshots after UI changes.
- **Non-root Docker hardening** — All example containers now run as `node` user (uid 1000), not root. Documented in `examples/docker.md`.
- **`docs/examples/frontend-backend-gotchas.md`** — New reference covering API prefix wiring, React vs Svelte CSS differences, port table, DELETE body gotcha, and common mistakes.
- **Docs drift** — Cleared stale Node 26.3 references across guidelines, service, third-party, and utils docs. Fixed 109 broken relative links in example and docs READMEs.
- **AI attribution** — Package description updated: built with the help of AI models and digital agents.

#### Migration (0.0.55 → 0.0.56)

```typescript
// Before
import { Service, NotFoundError } from '@sentzunhat/zacatl';
import { mongoose, Schema } from '@sentzunhat/zacatl/third-party/mongoose';
import { container } from '@sentzunhat/zacatl/third-party/tsyringe';

// After
import { Service } from '@sentzunhat/zacatl/service';
import { NotFoundError } from '@sentzunhat/zacatl/error';
import { mongoose, Schema } from '@sentzunhat/zacatl/third-party/databases/mongoose';
import { container } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
```

See [third-party/single-import.md](third-party/single-import.md) for the full subpath table.

## [0.0.55] - 2026-04-25

**Status**: Released

### ✨ Improvements

- **Mongo example parity hardening** — Aligned the Fastify + MongoDB + React example with the working SQLite reference by fixing workspace scripts, static frontend serving, and runtime path resolution for the `apps/*` layout.
- **Mongo example startup initialization** — Added an explicit repository model initialization step after the Mongoose connection is established so example collections and indexes are ready before requests hit the API.

### 🐛 Fixes

- **Standalone Mongoose repository initialization** — Added `initializeModel()` to the standalone `MongooseRepository` base so framework consumers can safely trigger adapter-backed model setup outside the legacy base repository path.
- **Mongo example defaults and docs drift** — Corrected the default MongoDB connection guidance, backend docs, and Docker usage notes so they match the current monorepo structure and validated local runtime flow.
- **Published package audit cleanup** — Removed `sqlite3` from Zacatl's hard runtime dependencies and kept it as an optional peer/dev install, eliminating the published library's current `npm audit --omit=dev` findings while preserving SQLite driver availability for local development and Sequelize-based consumers.

### 📚 Documentation

- **Example release validation notes** — Documented the example runtime assumptions around local MongoDB containers, container-to-host connection strings on macOS, and the current separate-Mongo-container Docker workflow.
- **Localization discovery docs alignment** — Clarified that installed Zacatl packages resolve built-in locale files automatically and that consumer services can layer additional translations from explicit and auto-discovered `locales/` directories.

## [0.0.54] - 2026-04-22

**Status**: Released

### ✨ Improvements

- **Built-in SPA hosting** — `PageServer.configure()` now correctly serves static assets from the dist root and enables SPA fallback (index.html for non-API routes) by default whenever `staticDir` is set. The new `spaFallback` flag (default `true`) lets API-only services opt out explicitly, and `prefixes` now defaults to `{ api: '/api' }` instead of requiring manual configuration.

### 🐛 Fixes

- **`prefixes` no longer misused as static URL prefix** — Previously `PageServer.configure()` passed the API prefix value as the URL mount path for static files, which caused assets to be unreachable. Static files are now always mounted at root.
- **SPA fallback silently skipped** — Previously SPA fallback was only activated when an API prefix was explicitly set alongside `staticDir`, meaning most consumers never got it. Fallback now activates automatically when `staticDir` is present.

### 🔧 Architecture

- **Removed duplicate type definitions** — `ServerPageConfig` (private inline in `server.ts`) and the redundant `PageServerConfig` declaration in `page/port.ts` were removed. `PageServerConfig` is now defined once in `types/server-config.ts` and re-exported where needed.

## [0.0.53] - 2026-04-10

**Status**: Released

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

**Status**: Released

### 🐛 Fixes

- **Mongoose third-party exports** — Added missing `Types` and `PipelineStage` exports to `src/third-party/databases/mongoose.ts` to support downstream projects using Zacatl's Mongoose wrapper as single source of truth. Prevents version conflicts when framework consumers need `Types.ObjectId` and aggregation pipeline types.

- **Configurable built-in localization path** — Added `localization.builtInLocalesDir` to `Service` and `configureI18nNode()` so consumers can override Zacatl's built-in locale discovery when their runtime working directory does not match the package's default path probes.

### 🔧 Improvements

- **SQLite audit remediation** — Removed the unused direct `sqlite3` dependency from Zacatl's published package so consumers no longer inherit the vulnerable `node-gyp` and `tar` toolchain through the framework itself. SQLite dialect drivers remain consumer-installed dependencies.

---

## [0.0.51] - 2026-03-04

**Status**: Released

### 🐛 Fixes

- **`zacatl-fix-esm` self-contained bin layout** — Updated publish packaging so script utilities are placed under `publish/build/bin/utils` and `fix-esm.js` resolves `./utils/index.js`, preventing runtime module resolution issues when running `npx zacatl-fix-esm`.

### 🔧 Improvements

- **Publish script cleanup** — Simplified `prepare-publish` flow by copying the bin script first and then rewriting imports in place, keeping the publish output consistent and easier to reason about.

## [0.0.50] - 2026-03-04

**Status**: Released

### ✨ Features

- **Built-in SQLite ORM adapter** — Added Node.js built-in sqlite module adapter (Node 26+) with dynamic module loading. Eliminates experimental warnings through lazy-loading pattern, provides zero external dependencies, and offers type-safe repository operations. Matches feature parity with Mongoose and Sequelize adapters.

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

- **Node:sqlite ORM adapter** — Added complete ORM implementation for Node.js built-in sqlite module (Node 26+). Includes `NodeSqliteAdapter`, lazy-loading factory, type-safe repository class, and comprehensive unit tests. Follows same architecture as Mongoose and Sequelize adapters with prepared statements and defensive mode security.

### 🔧 Improvements

- **Barrel auto-generation** — Converted all 49 index.ts files in src/ to auto-generated pattern using recursive directory walking with per-directory opt-in headers. Maintains explicit dependency declarations while eliminating manual maintenance.

- **ORM dependency isolation** — Refined orm/ layer barrel to export only adapter factory functions (`createMongooseAdapter`, `createSequelizeAdapter`, `createNodeSqliteAdapter`), preventing mongoose, sequelize, and node:sqlite packages from leaking into library exports. Dependencies remain isolable via third-party subpaths.

- **Examples restructuring** — Flattened examples directory structure from nested folders (`platform-express/with-mongodb-react/apps/backend`) to simplified layout (`express-mongodb-react/backend`). Removed redundant platform-level nesting to reduce directory depth and improve discoverability.

- **ESLint config simplification** — Refactored root ESLint configuration to use Zacatl's recommended config directly, reducing complexity and improving maintainability. Removed manual config normalization logic.

- **Node 26.3.0** — Updated `.nvmrc` to Node 26.3.0 and bumped npm requirement to 11.0.0+ in documentation.

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

- **Node 26 baseline standardization** — Bumped `engines.node` to `>=26.3.0`. Added
  native `imports` field (`"#/*": "./src/*"`) to `package.json` for Node-native subpath imports,
  removing the need for TypeScript path-alias hacks in consuming projects.

- **Built-in SQLite adapter (`node:sqlite`)** — Added `DatabaseVendor.SQLITE` and
  `src/service/platforms/server/database/sqlite-adapter.ts` using the Node 26 built-in
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
  (`@sentzunhat/zacatl/third-party/databases/mongoose`, `/third-party/databases/sequelize`, etc.) so the main entry
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
  - Mongoose: `@sentzunhat/zacatl/third-party/databases/mongoose`
  - Sequelize: `@sentzunhat/zacatl/third-party/databases/sequelize`
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

- Docker multi-stage build with distroless Node.js 26
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
import { Service, ServiceType } from '@sentzunhat/zacatl/service';

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

> **Historical note:** The root barrel described below was removed in **0.0.56**. Use explicit subpaths — see [0.0.56](#0056---2026-06-23).

### 🎯 Dual ORM Import Strategy - Flexibility for All Use Cases

**New Feature:** Choose between convenience (main package) or minimal bundles (subpath imports).

#### Import Options

**Option 1 - Main Package (Convenience):**

```typescript
import { Service } from '@sentzunhat/zacatl/service';
import { mongoose, Schema } from '@sentzunhat/zacatl/third-party/databases/mongoose';
import { Sequelize } from '@sentzunhat/zacatl/third-party/databases/sequelize';
```

**Option 2 - Subpath Imports (Minimal Bundle):**

```typescript
import { Service } from '@sentzunhat/zacatl/service';
import { mongoose, Schema } from '@sentzunhat/zacatl/third-party/databases/mongoose';
import { Sequelize, DataTypes } from '@sentzunhat/zacatl/third-party/databases/sequelize';
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
