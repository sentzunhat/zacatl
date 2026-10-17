# Design reusable modular ServiceConfig composition

**Backlog ID (Legacy):** `19965b11`
**UUID:** `19965b11-0348-49fd-8502-857dc887dc4a`
**Type:** improvement
**Reported:** 2026-10-16

---

## Input (verbatim)

> Design reusable modular ServiceConfig composition

## Intake Summary

Assess how application teams can compose reusable service configurations and feature modules while keeping Zacatl's framework in charge of service lifecycle and dependency injection. Favor declarative config and narrow composition helpers over application-specific framework forks.

## Current Context

Zacatl exposes a `ServiceConfig` with type, layers, platforms, localization, auto-start, and logger. `Service` currently constructs one Service from these arrays/config objects and owns DB registration and lifecycle. Its docs/examples show app-local `createServiceConfig` in some samples, while no general feature-module merge/validation API was found in the inspected `ServiceConfig` contract. A real website consumer currently starts Zacatl `Layers` while manually managing Fastify, DB and shutdown.

## Initial Analysis

**Directly verified:**

- `ServiceConfig` accepts one `layers`, one `platforms`, optional `localization`, `run`, and `logger` object.
- Layer configs accept arrays of application routes/hooks, domain providers, and infrastructure repositories.
- `Service` creates child DI containers, registers configured ORM instances/logger before instantiating layers/platforms, and exposes `start()`/`stop()`.
- `DatabaseConfig.onDatabaseConnected` provides a hook for model setup/sync and runs after database authentication.
- The website's current backend composition and user-supplied Tekit-style sample demonstrate different approaches and motivate a framework consumer case.

**Inferred (not yet proven):**

- Teams with independent feature bundles may need a typed, testable way to merge route/provider/repository/database contributions into a single `ServiceConfig` before constructing `Service`.
- Avoid a module registry or runtime plugin framework unless a few real consumers demonstrate that plain config factories/composition functions are insufficient.

**Likely scope:**

- `src/service/types.ts`, layer/platform config types, config assembly utilities if justified, `docs/service/`, examples, and focused unit/type tests.

## Risk + Review Gate

**Risk:** medium — public API changes can constrain consumers and affect DI ownership/order.
**Gate:** compare at least two real service compositions and review API ergonomics before implementation.

## Backlog + Plan Link

**Status now:** in-progress
**Plan file:** work/active/19965b11/plan.md

## Plan

1. Gather consumer cases: website SSR backend, a simple Fastify+SQLite example, and an app with optional workers/plugins.
2. Define the goal: framework handles Service lifecycle and shared DI; app owns provider-specific values and module feature composition.
3. Compare plain `createServiceConfig()` factories, typed module descriptors (routes/hooks/providers/repositories/databases/start/stop hooks), and a smaller config merge helper.
4. Preserve deterministic ordering, duplicate detection, explicit DI parent-child scope, database ownership, and understandable validation errors. Keep app-specific framework plugins composable through the platform instance or documented extension points.
5. Decide whether reusable modules are a framework feature or only a documented app pattern; implement only the smallest API supported by evidence.
6. Add examples and unit/type tests for composition, duplicate registrations, logger sharing, database setup, and graceful lifecycle.

## Acceptance

- A consumer can assemble features declaratively and pass one validated configuration to `new Service(config)`.
- The framework retains ownership of DI, database registration, startup/shutdown, logger injection, and platform lifecycle.
- Composition has explicit ordering/error behavior and no hidden global container coupling.
- Documentation explains app-level configuration functions separately from any built-in module API.

## Verification Plan

Run targeted tests and type checks for config merge/validation, existing Service behavior, examples, and logger/database lifecycle. Compare emitted declaration types and preserve existing public API compatibility where practical.

## Website consumer findings — 2026-10-16

The Sentzunhat website's attempted `Service` migration exposed runtime prerequisites that a config merge helper alone will not solve. These are confirmed in Zacatl `0.0.64` source and the current Zacatl checkout; no framework implementation or release is claimed here.

- `src/service/platforms/server/providers/fastify/api-adapter.ts` binds to `0.0.0.0`, while `Service.start()` accepts only a port. The website currently defaults to `127.0.0.1`; the server configuration needs an explicit host/listen contract before migration.
- `src/service/platforms/server/api/api-server.ts` resolves REST handlers through the global container even though `Service` creates a child container and `Application` uses it. Pass the service container through route/hook resolution and document registration scope; avoid relying on consumer-global singletons.
- `src/service/service.ts` awaits `layers.start()` after `platforms.start()`, which opens the database and starts HTTP listening. Define a database-connected, repository-ready, then listen sequence for server services without breaking other platform types or connection-only flows.
- The website installs Fastify security hooks, redirects, SSR fallback, and static assets around plugin registration. Specify the extension/registration order so app hooks protect Service-managed routes and preserve the branded HTML 404 and API/asset 404 behavior.

Treat these as consumer acceptance cases for the smallest framework change. Verify host binding, DI resolution, readiness ordering, and Fastify hook ordering before publishing a compatible release. The website remains on its manual lifecycle until that release is consumed and checked.

## Implementation checkpoint — 2026-10-16

The current Zacatl working tree adds optional host configuration while retaining `0.0.0.0` as the container-safe default, passes the application layer container to server route/hook resolution, and introduces platform preparation before repository readiness and HTTP listen. Page adapter access now exposes the raw server to the optional custom registration callback while preserving its adapter argument.

**Verified:** source, test, and script type checks pass; the Zacatl build passes; lint passes with existing warnings; 59 focused service/API/page tests pass under Node 26 in an x86_64 Docker environment. These checks cover host override, scoped DI, and readiness-before-listen.

**Still open:** complete broader platform and consumer checks, resolve the npm audit findings, verify website plugin ordering and DB shutdown after partial startup, and make a compatible Zacatl release. This implementation remains local until committed and pushed; the website still consumes published `0.0.64`.

## Independent source and published API review — 2026-10-16

Reviewed the website's assessment against this checkout and the installed,
published `@sentzunhat/zacatl@0.0.64` package. No runtime code, API, website
implementation, version, or release was changed. The website item is a useful
consumer case, but its initial assessment needs the qualifications below.

### 1. Fastify host and Docker

**Classification:** acceptable existing Docker behavior; optional enhancement
for loopback-only local runs. The claimed missing override is confirmed.

- Source: `src/service/platforms/server/providers/fastify/api-adapter.ts:78-80`
  always invokes `server.listen({ port, host: '0.0.0.0' })`.
  `src/service/service.ts:183-187` exposes only `{ port?: number }`.
  `src/service/platforms/server/types/server-config.ts:10-19` has no host field.
- Published 0.0.64 API agrees: `build/esm/service/service.d.ts` declares
  `start(options?: { port?: number })`; the published `HttpServerConfig`
  declaration has no `host`; published Fastify adapter also binds
  `0.0.0.0`.
- `0.0.0.0` is valid and needed for the usual container port-forwarding case.
  It must remain the default. The website's `HOST=127.0.0.1` expectation is a
  consumer's local-only preference, not evidence that Zacatl's container
  default is wrong.
- Container reproduction: built the existing
  `examples/fastify-sqlite-react` image with
  `docker compose -f examples/fastify-sqlite-react/docker-compose.yml build backend`;
  started it with `ZACATL_EXAMPLE_SQLITE_DATA_DIR=/tmp/zacatl-docker-port-check`
  and the same compose file's `up -d backend`; `docker inspect
  fastify-sqlite-backend --format '{{json .NetworkSettings.Ports}}` showed
  container port 8081 published on host `0.0.0.0:8081` and `:::8081`;
  `curl -sS -o /tmp/zacatl-docker-response.json -w 'HTTP %{http_code}'
  http://127.0.0.1:8081/api/greetings` returned HTTP 200. Compose `down`
  stopped and removed the check container and network.
- Impact: wildcard binding can expose a local development service on other
  interfaces. Conversely, changing the default to loopback would break the
  verified Docker port path.
- Next decision: consider an additive `host` at `Service.start()` (or
  `HttpServerConfig`) with default `0.0.0.0`, and let local consumers pass
  `127.0.0.1`. This is optional; no change is justified solely to fix the
  Docker-safe default.
- API/docs: API change only if this enhancement is approved. Document the
  wildcard default and explicit local override; preserve a container published
  port test for default and override behavior.

### 2. Service-scoped dependency injection

**Classification:** confirmed framework issue against the Service-scoped DI
contract; the separate manual/global registration pattern remains supported
for consumers that intentionally use the global container.

- Source: `src/service/service.ts:57-70` creates a Service child container,
  registers the configured logger there, and passes it to Layers and Platforms.
  `src/service/layers/layers.ts:12-31` creates infrastructure, domain, and
  application child containers. `src/service/layers/application/application.ts:34-51`
  registers and resolves REST hooks/routes in its application container.
- The server drops that resolved scope at registration:
  `src/service/platforms/server/api/api-server.ts:90-99` and `:104-113`
  call `resolveDependencies()` without the application container. Its default
  is the global tsyringe container (`src/dependency-injection/container.ts:105-134`).
- Minimal reproduction: a temporary Vitest case used a route or hook decorated
  `@injectable()` with `@inject(LoggerToken)`, supplied `logger` through
  `ServiceConfig`, put the class in `layers.application.entryPoints.rest`,
  constructed `Service`, then awaited `service.start({ port: 0 })`. Application
  construction succeeded (the child scope had the Service logger and resolved
  the class); `start()` rejected before listening with
  `Failed to resolve 'ScopedHook' from the DI container`, and likewise for
  `ScopedRoute`. Command: `npx vitest run
  test/unit/service/service-scope-investigation.tmp.test.ts` (temporary test
  removed after the run; both cases passed by observing the expected failure).
- Singleton scope: tsyringe's `@singleton()` decorates a global registration;
  the existing `test/unit/service/service-logger-di.test.ts` verifies that
  Application's child registration can still provide per-Service loggers.
  Platform registration then resolves through the global container, so it can
  bypass that scoped instance or fail on a token registered only in Service.
  Keep decorator/global semantics for manual mode explicit; Service-managed
  entrypoints must use the same instance/scope already resolved by Application.
- The documentation is mixed: `docs/service/handler-registration.md:7-34`
  demonstrates global registration while Application and Service source use
  child scopes. Label the global pattern as manual/global-container mode and
  state the Service-managed scope contract.
- Impact: Service-only logger, provider, and other scoped dependencies cannot
  reliably reach Service-managed routes/hooks; multiple Services can resolve
  the wrong global singleton.
- Smallest compatible fix: pass the actual Application layer's resolved
  hook/route instances (or its container) through `Layers`/`Platforms` to
  `ApiServer`; passing only the top-level Service child is insufficient because
  entrypoint registrations live in the nested application child. Preserve
  global resolution helpers for the manual API.
- API/docs: likely no new consumer-facing registration API if already-resolved
  instances can flow internally. Correct/clarify DI documentation. Add tests
  proving child-only token injection, route and hook registration, and distinct
  instances/loggers for two Services, including `@singleton()` behavior.

### 3. Repository readiness and listen order

**Classification:** confirmed server lifecycle issue for consumers requiring
repositories ready before traffic; existing order is deliberate for the
database-before-repository dependency, but listen-before-ready is an
implementation consequence rather than a documented all-platform guarantee.

- Source order: `Service.start()` registers REST entrypoints, awaits
  `Platforms.start()`, then awaits `Layers.start()`
  (`src/service/service.ts:183-195`). Server startup connects databases,
  configures page/static handlers, then listens
  (`src/service/platforms/server/server.ts:141-165`). Database callbacks are
  awaited during connection (`src/service/platforms/server/database/database-server.ts:28-58`,
  `src/service/platforms/server/database/adapters/sequelize.ts:23-30`). Only
  after platform start does `Infrastructure.start()` await each repository's
  `ready()` (`src/service/layers/infrastructure/infrastructure.ts:64-71`).
  The Service constructor pre-registers database instances before resolving
  layers (`src/service/service.ts:46-55`), and the server connects/authenticates
  and invokes `onDatabaseConnected` before listening.
- Reproduction: temporary Service with Fastify port `0`, no database, and one
  repository whose `ready()` waited on a deferred promise. Before releasing
  readiness, `app.server.listening` was true, its address was `0.0.0.0`, a
  fetch to the assigned port returned HTTP 404 (request accepted),
  `readyFinished` was false, and the Service start promise remained pending.
  Releasing the promise completed startup. This confirms the port is open
  before repository readiness finishes.
- The source comment at `src/service/service.ts:190-194` explains that
  platforms start first because DB connections and DI tokens become available
  during platform startup. `Service.start()` applies this order after its
  configured platforms, but a universal readiness contract is not documented;
  CLI/Desktop implementations are currently stubs. The website's manual
  sequence (`connectDatabase()` -> `layers.start()` -> `app.listen()`) does
  require readiness-before-listen.
- Impact: callers may receive traffic while `ready()` is initializing; if it
  rejects, `start()` rejects after the listener was opened. The rejected-ready
  listener cleanup behavior remains to be tested.
- Smallest compatible lifecycle proposal: split server startup into
  `prepare/connect` (database connect and awaited `onDatabaseConnected`, then
  page setup), repository `ready()`, then HTTP `listen()`. Keep DB/model
  initialization before repositories; do not call repository readiness before
  DB connection. Preserve existing non-server semantics unless a supported
  non-server readiness contract is separately established. On readiness
  failure, close partially opened resources before rejecting.
- API/docs: can be an internal lifecycle change with unchanged `start()`
  signature. Document ordering and test event order, delayed readiness (port
  closed until ready), readiness rejection (no listener/resource leak),
  Sequelize `onDatabaseConnected` setup before repository readiness, and a
  connection-only/no-repository service.

### 4. Website Fastify extension and registration order

**Classification:** extension points largely exist; one confirmed
framework/documentation mismatch exists. The website's exact migration is not
proved, but the representative root-scope ordering case passed.

- Supported paths: `HttpServerConfig.instance` accepts the consumer's already
  created Fastify instance (`src/service/platforms/server/types/server-config.ts:10-19`;
  `docs/service/README.md:50-80`). Consumers retain that object and can
  register root plugins, hooks, routes, error handlers, and not-found handlers.
  Zacatl's `RouteHandler`/`HookHandler` arrays register framework handlers;
  Page config supports static files and SPA fallback
  (`src/service/platforms/server/providers/fastify/page-adapter.ts:10-68`).
- Confirmed mismatch: `PageServerConfig.customRegister` is documented with a
  raw `FastifyInstance` callback (`docs/service/README.md:680-695`), but
  `PageServer.configure()` calls `customRegister(this.adapter)`
  (`src/service/platforms/server/page/page-server.ts:81-94`). A minimal run
  observed callback keys `registerStaticFiles`, `registerSpaFallback`, and
  `register`, with `received === app` false. The actual object is the
  framework's `PageServerPort` adapter, not Fastify; the published declaration
  still types this parameter only as `unknown`.
- Ordering reproduction used the website's actual Fastify/Helmet/rate-limit
  packages and Zacatl's Fastify static plugin. It registered Helmet and
  rate-limit, a root security `onSend`, and a Service-style root API route;
  then an `app.after()` callback added root rate-limit/redirect hooks, a
  not-found handler, and static assets before `ready()`. Observed: API route
  200 with security headers, second request 429, slash redirect 308, static
  asset 200, API missing route JSON 404, missing asset JSON 404, unknown HTML
  SSR 404. Thus root hooks added in the callback protected the earlier root
  route, and the requested response classes can coexist in this representative
  order.
- Website source being modeled: `website/src/apps/backend/src/platforms/server/fastify-app.ts:35-153`
  registers Helmet/rate-limit, root `onSend`, then in `app.after()` adds the
  rate-limit/redirect hooks, routes, custom not-found behavior, and production
  static plugin. Current website lifecycle is still manual in
  `website/src/apps/backend/src/server.ts:22-25`.
- Impact: consumers can keep custom Fastify behavior through the retained
  instance, but cannot use `page.customRegister` as its documentation/example
  suggests. Replacing the website's manual route/app.after sequence without
  checking lifecycle and duplicate route registration could change behavior.
- Smallest next step: either make `customRegister` receive the raw configured
  server as the docs promise, with a Fastify-aware type/adapter contract, or
  change the docs to describe `PageServerPort` and remove the raw-Fastify
  plugin example. Prefer preserving the explicitly documented extension
  intent; add a regression test for the callback argument. Keep the website
  app's plugin/hook/not-found/static ordering as a consumer acceptance fixture.
- API/docs: a corrected callback type/argument is a public API clarification
  and may affect code already using the current undocumented adapter argument.
  Decide compatibility before implementation. Document pre-created instance
  extension and ensure hooks apply to Service routes; test both direct root
  hooks and plugin registration behavior.

### Investigation decision (before implementation)

The investigation classified (1) as an optional host enhancement, (2) as a
confirmed framework bug, (3) as a confirmed readiness gap, and (4) as a
callback contract mismatch. On 2026-10-16 the user authorized a cohesive local
implementation on `dev`; the website remains on its manual lifecycle pending
review and a compatible Zacatl release.

### Acceptance criteria and verification for any framework change

- Fastify defaults to `0.0.0.0`; Docker published-port smoke remains reachable.
  If host override is accepted, test explicit `127.0.0.1` locally and explicit
  container host behavior without changing the default.
- Service-managed routes and hooks use the Application scope, resolve a token
  available only from their Service's DI scope, and do not share singleton
  instances across two Services. Manual global-container usage remains covered.
- With a database, `connect/authenticate` and awaited `onDatabaseConnected`
  complete before repository `ready()`, and `ready()` completes before
  `listen()`. Delayed or rejected readiness leaves no accepting listener and
  cleans up opened DB resources. Connection-only and no-repository behavior
  remains supported.
- `customRegister` receives the documented typed server, and a Fastify consumer
  can preserve security plugin/root hook order, rate limiting, redirects,
  static assets, API/asset 404s, and HTML SSR 404s without route duplication.
- Run focused tests/type checks, full relevant Service tests, build, the
  existing consumer smoke suite, and the existing Docker image port check.
  Compare built declarations and the packed/published consumer API before any
  release decision.

### Implementation update (2026-10-16)

User authorized working the confirmed fixes on `dev`. The local source now has:

- Additive `HttpServerConfig.host` and `Service.start({ port, host })`; host precedence is start option, configured host, then `0.0.0.0`. Fastify and Express adapters accept the selected host.
- API handler resolution now receives the Application child container retained by `Layers`; it no longer falls back to the global container for Service-managed REST handlers.
- `Server.prepare()` connects databases and configures page routes before repository readiness; `Service.start()` awaits repository readiness before platform listen. Startup errors trigger a best-effort platform stop while preserving the original error.
- `PageServerConfig.customRegister` keeps its existing adapter-first argument and gains the raw Fastify/Express instance as the second argument, preserving current implementation callers while enabling the documented native plugin use.
- Service docs now describe the host option and both callback arguments.

Direct checks: `npm run type:check:src`, `npm run type:check:test`, `npm test` (84 files, 703 tests), `npm run build`, `npm run smoke:consumers` all passed. Fastify Docker example built and became healthy; container binding reported `0.0.0.0:8081` and `:::8081`, and the published endpoint returned HTTP 200. `npm audit --omit=dev` reported zero vulnerabilities. Full `npm audit` still reports seven high development-toolchain findings through `braces`/`micromatch` under `tsc-alias` and `http-proxy-middleware`; npm's proposed fixes include semver-major downgrades. No breaking proposal was applied. The local dependency refresh already present in `package.json`/lockfile remains preserved and passed these checks.

Final verification on current source: `npm run type:check`, `npm test` (84 files/703 tests), `npm run build`, and `npm run smoke:consumers` passed. Generated ESM declarations include `Service.start({ port?, host? })` and `HttpServerConfig.host`; `git diff --check` passes. Review the Fastify consumer plugin/hook-order case before any website migration. Website consumers must use their own Sequelize override while upstream Sequelize retains vulnerable UUID. No version bump or release was prepared.

### Release candidate update — 2026-10-17

The previously verified implementation is now being prepared for owner review
as Zacatl `0.0.65` on `codex/release-0.0.65`, targeting `main` from `dev`.
This is a release candidate only; no tag, publish, merge, or website migration
has occurred. The version/changelog and dependency findings are summarized in
`docs/changelog.md`. The remaining development-only audit findings and the
website-owned Sequelize UUID override requirement are explicitly disclosed in
the PR context. The existing website work item remains the next consumer
decision after a compatible package is published.

The release PR CI run [355](https://github.com/sentzunhat/zacatl/actions/runs/39059892471)
passed the publish dry-run, consumer smoke and eight-example Docker matrix,
in addition to the CVE and peer-install checks. The website remains on
published `0.0.64` until owner review, merge and publication.
