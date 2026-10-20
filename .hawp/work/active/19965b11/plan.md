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

## PR review follow-up — constructor compatibility — 2026-10-18

Reviewed the six Copilot comments supplied for the Service/DI PR. Five point to
real compatibility regressions from tightening exported constructors or the
page adapter port; the sixth identifies stale public documentation. The fixes
are limited to restoring the prior direct-construction shapes and keeping the
new DI-managed scope contract.

### Findings and changes

- `Layers(config, parentContainer?)`: the previous public API accepted a
  Service parent and created its own Infrastructure → Domain → Application
  child scopes. The partial-graph guard rejected this valid direct form. It now
  derives and registers those scopes when called directly with a parent. The
  Service-resolved path still requires `ServiceContainerToken` and
  `LayerContainerScopesToken` through DI. Sources:
  `src/service/layers/layers.ts`, `src/service/layers/tokens.ts`.
- `Platforms(config, container?)`: the previous API accepted a Service
  container and `Server` created the rest of the platform graph. It now derives
  and registers an Application child for that direct form. Passing only an
  Application scope remains invalid because its Service parent is required.
  DI resolution continues to require both scope tokens. Source:
  `src/service/platforms/platforms.ts`.
- `Server(config, container?)`: direct one- and two-argument calls are restored.
  A missing scope is built as an isolated child of the global container; a
  supplied Service scope gets an Application child. DI-managed construction
  retains the decorated required scope tokens. Source:
  `src/service/platforms/server/server.ts`.
- `ApiServer(config, adapter)`: the legacy direct form again uses the global
  container for handler resolution when no third scope argument is supplied.
  DI-managed construction still requires the API container token. Source:
  `src/service/platforms/server/api/api-server.ts`.
- `PageServerPort.getRawServer()` is optional and `PageServer` invokes it
  safely, preserving third-party page adapters that predate raw-server access.
  The `PageServerPort` docs now show `register(): Promise<void>` and optional
  `getRawServer?(): unknown`. Sources:
  `src/service/platforms/server/page/port.ts`,
  `src/service/platforms/server/page/page-server.ts`, `docs/service/README.md`.

### Reproduction and verification

Regression tests cover direct construction of all four classes, deriving the
missing scopes, fail-fast token resolution for DI-managed construction, and a
legacy page adapter without `getRawServer()`. The final full suite passed 718
tests across 84 files; `npm run type:check` passed for source, tests, and
scripts. `npm run build` passed. `npm run lint:silent` passed with existing
warnings (2 source, 29 test, 42 script), and `hawp links check` passed for 204
Markdown files. `npm run smoke:consumers` passed all required fixtures:
non-SQL, Node SQLite, Mongoose, Sequelize SQLite, and Sequelize Postgres. The
explicit Sequelize fixtures still report SQL-owned nested UUID audit findings.
`hawp work validate` still
fails only on historical closed-task completeness and legacy ID-format
findings; backlog consistency, evidence integrity, verification clarity, and
dead-link checks pass.

### Decision

Keep the changes as additive compatibility behavior; no migration path or
breaking release is needed for these constructor and port changes. No public
API change is required beyond types already introduced by the PR. The package
build, lint, full tests, and type checks have passed for this follow-up.

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

### Owner PR review notes — 2026-10-17, 1:56:40–2:05:50

These are open design questions from the owner's live review of draft PR #138;
they are recorded here without changing implementation or the PR review state.

1. **Native server / `customRegister`:** `HttpServerConfig.instance` already
   holds the consumer-created Fastify or Express instance. Zacatl wraps it in
   API and page adapters. `PageServerConfig.customRegister` currently receives
   `{ adapter, rawServer }` as two positional, `unknown` values (actual
   function signature: `(adapter, rawServer?)`), even though the native server
   is also already reachable from the server configuration. Its purpose is an
   escape hatch for provider features missing from Zacatl's ports, such as
   plugins and native hooks; it is not needed to create or start the server.
   Source: `src/service/platforms/server/types/server-config.ts`,
   `src/service/platforms/server/page/page-server.ts`, and
   `src/service/platforms/server/server.ts`.
2. **Registration order remains unresolved:** `Service.start()` registers
   Service routes/hooks before `Platforms.prepare()`. `Server.prepare()` then
   connects databases, registers page/static/SPA behavior, and invokes
   `customRegister`; repository readiness and HTTP listen follow. Thus the
   callback does not run before API route registration. Confirm whether a
   consumer's security plugins/hooks, redirects, and not-found handlers can be
   installed in the required order and apply to Service-managed routes. If an
   extension point is retained, put it on the HTTP server contract rather than
   page-only config, name its lifecycle phase, and pass one structured,
   vendor-aware context object. Avoid two `unknown` positional server values.
3. **Listener contract:** the public Service start option is already an object,
   but `ApiServerPort.listen(port, host?)` and adapter `listen()` remain
   positional and return `Promise<void>`. Review consolidating on a named
   `ListenOptions` object and whether configured/default port belongs in
   `ServerConfig`. Do not use 1969/6996 as collision-guaranteeing defaults. A
   port of `0` lets the OS choose an ephemeral port, but the actual bound
   address must then be returned or exposed through a typed address API.
   Preserve `0.0.0.0` for Docker; validate a stable configured port in Docker
   separately from an ephemeral local/test port.
4. **Constructor option objects:** the owner prefers config-shaped options
   instead of growing positional constructor arguments. Review internal
   constructors such as `ApiServer(config, adapter, container)`,
   `Server(config, container, applicationContainer)`, and
   `Layers(config, parentContainer)`. If retained, use one named options object
   that clearly distinguishes behavior config, adapters, and DI scopes; avoid
   positional ambiguity and keep the Service public constructor as
   `new Service(serviceConfig)`.
5. **Example Dockerfiles:** compare Zacatl's consolidated
   `examples/Dockerfile` with the website's two-stage `Dockerfile`. Zacatl's
   example image already pins base image digests and runs a distroless non-root
   runtime; the website pattern uses `npm ci`, a focused build context and a
   distroless non-root runtime, but its builder tag is not digest-pinned.
   Review reproducible lockfile installation and stage boundaries for the
   local `file:../..` Zacatl package before changing the examples. No Docker
   behavior change is approved by this note.

**Next decision:** keep these as release-review API-shape questions. Before
changing a public callback or listener signature, demonstrate the consumer
ordering requirements and decide whether the callback can be narrowed,
re-homed, or removed in favor of typed Zacatl extension points. Add acceptance
checks for plugin/hook order, API and page 404 behavior, Docker port publishing,
and selected-port reporting if port `0` is supported.

## Layer container scope decision — 2026-10-17

Keep the Infrastructure → Domain → Application child-container chain. These
are deliberately not siblings: Domain must resolve Infrastructure
registrations, and Application must resolve both earlier layers, while
dependencies should not flow backward. `Layers` now keeps the three container
references together in private composition state before constructing each
layer. The registry is intentionally not registered as a DI token because
child containers inherit parent registrations; doing so would make every layer
able to reach every other layer's scope and bypass the intended boundary.

The existing `getApplicationContainer()` remains the narrow composition
handoff used by `Service` to let REST routes and hooks resolve from the
Application scope. This is framework orchestration, not a token exposed to
feature classes. Revisit the getter only if a named internal options/context
contract removes the plumbing without exposing unrelated scopes.

**Acceptance / verification:** confirm the scope chain still supports
Infrastructure → Domain → Application resolution; Service-managed REST routes
and hooks resolve in Application scope; separate Service instances remain
isolated; and no general layer-container registry is resolvable from feature
classes. Update constructor shapes as a separate compatibility decision rather
than expanding this scoped change.

## Owner correction: constructor injection — 2026-10-17

The first constructor cleanup on this branch added overloads that accepted
both positional arguments and an options object. The owner rejected that
direction: it still passed the container through each constructor and added
unnecessary normalization code. The overload change has been reverted on the
release branch.

For `ApiServer`, `Server` now binds the HTTP config, API adapter, and
Application container under internal tokens in the Application scope and
constructs `ApiServer` through tsyringe. The `ApiServer` constructor uses
`@inject()` for those tokens. Direct `new ApiServer(config, adapter, container)`
remains source compatible for existing callers; decorators take effect when
DI constructs the class. The token for the Application container is scoped to
the Application container, so Infrastructure and Domain cannot resolve it.
The general three-container registry remains private in `Layers`.

**Verified:** source and test type checks and 35 focused API, Server, Service,
and logger DI tests passed after this correction. Source lint passed with two
existing warnings; the package build and all required packaged consumer smoke
fixtures passed. Sequelize consumer audits still report its nested UUID
advisory. Release CI should re-run on the corrected branch before release.

## HAWP Codex provider refresh — 2026-10-17

Executed the pasted Codex Update Command from the repository root. Terminal
proof: `Source: sentzunhat/human-ai-workflow-protocol@main`,
`Provider: codex`, `Source mode: remote archive`. The command completed,
refreshed `.hawp/kit/**`, and reported `.hawp/work/**` preserved. It verified
and refreshed the ignored `.hawp/bin/hawp` binary to release `0.0.24`.
`AGENTS.md` was already present and remained unchanged; no plan/backlog files
were reconciled or moved.

## Owner correction: named Service scope tokens — 2026-10-17

The owner asked for the Service-owned scopes to be registered as simple typed
tokens following the `LoggerToken` pattern, so framework-managed classes can
resolve the relevant scope without passing container references through
multiple constructors. Implemented in the current working tree:

- `src/service/tokens.ts` declares stable typed tokens for Service,
  Infrastructure, Domain, and Application scopes using `InjectionToken` and
  `Symbol.for`.
- `Service.registerContainers()` creates one Service → Infrastructure → Domain
  → Application chain and registers each token locally at its corresponding
  scope. It does not write per-Service container state to the global container.
- `Service.registerServiceValues()` registers `LoggerToken` in the Service
  scope. `Layers` accepts the already-created layer scopes, preventing it from
  creating a duplicate chain. Existing two-argument `Layers` construction
  remains supported.
- A Service-managed route test injects all four typed tokens and verifies
  registration visibility is directional and the Service token is absent from
  global DI.

**Verified:** source/test type checks passed; 26 focused Service, logger DI, and
Layers tests passed; targeted ESLint passed; `npm run build` passed; all
`npm run smoke:consumers` fixtures passed. Non-SQL and Node SQLite consumer
audits passed. Sequelize SQLite/Postgres smoke passed, with the previously
known nested Sequelize UUID advisory still reported. `package.json` gained the
generated `./service/tokens` subpath export; no lockfile change was made.

**Next decision:** review whether exposing scope-container tokens as a supported
consumer API is desirable or whether these should remain framework-internal.
The implementation intentionally does not change logger semantics, constructor
public signatures, package version, or release state. Run the full test suite
and consumer/PR review before merging or releasing.

## Follow-up: resolve Service composition through DI — 2026-10-17

The owner clarified that `Service` should not keep passing scope objects into
`new Layers(...)` and `new Platforms(...)`; the framework should register the
configuration values and resolve its composition classes through DI. Updated
the working tree accordingly:

- `Service.registerCompositionValues()` binds layer/platform configuration and
  the scope values in a short-lived composition child container. It then
  resolves `Layers` and `Platforms` from that container instead of constructing
  them with positional container arguments.
- Constructor `@inject` tokens preserve existing direct construction for
  consumers that call `new Layers(config, parent, scopes)` or
  `new Platforms(config, container)`.
- `Layers` registers each layer's typed config and scope tokens in that layer's
  own container, then resolves `Infrastructure`, `Domain`, and `Application`
  from the corresponding scope. The layer scopes do not inherit the
  composition container's config registry.

**Verification:** full type checks and build pass; full test suite passes (84
files, 704 tests); all packaged consumer smoke fixtures pass. The Sequelize
SQLite/Postgres fixtures still report their existing nested UUID advisory.

**Remaining DI review:** `Platforms` still constructs `Server`, `CLI`, and
`Desktop`; `Server` still constructs `ApiServer`, `PageServer`, and
`DatabaseServer` (with `ApiServer` already DI-resolved). Decide whether these
are framework composition boundaries or should be moved to injected tokens in
a subsequent slice. ORM instance registration also still uses the global DI
container and needs its own scoped-injection design before claiming full
multi-Service database isolation.

## Platform construction through DI — 2026-10-17

This continuation moves the remaining Zacatl-owned platform composition
classes into token-based DI while preserving the existing direct constructor
signatures for consumers that instantiate these classes themselves.

- `src/service/platforms/platforms.ts` now resolves `Server`, `CLI`, and
  `Desktop` from an isolated platform child container after registering each
  config under a typed token. Standalone `Platforms` creates a local scope and
  registers the Service/Application scope tokens needed by `Server`.
- `src/service/platforms/server/server.ts` resolves `ApiServer`, `PageServer`,
  and `DatabaseServer` from scoped containers. `PageServer` receives its
  configuration and adapter via tokens; `DatabaseServer` receives its service
  name and database configs via tokens.
- `CLI`, `Desktop`, `Server`, `PageServer`, and `DatabaseServer` now carry
  explicit `@injectable()` metadata and token-decorated parameters. Direct
  `new Class(config...)` call shapes remain compatible.
- Added typed platform config tokens in `src/service/platforms/tokens.ts` and
  `src/service/platforms/server/tokens.ts`. The normal build export
  synchronization adds their package subpath declarations.
- `Platforms` test doubles now carry the same constructor token metadata as
  production classes so the tests exercise the actual DI resolution boundary.

**Construction boundaries retained:** `Service` remains the root composition
entry point. Vendor adapter objects remain factory-created values selected by
configuration, not separately registered application services. Database
adapter implementations likewise remain constructed inside
`createDatabaseAdapter()`. No other framework-owned class construction was
found in `src/service` outside these factories and ordinary value/error
construction.

**Verification on 2026-10-17:** `npm test` passed (84 files, 704 tests);
`npm run type:check` passed; `npm run lint:silent` passed with existing
warnings only; `npm run build` passed; `npm run smoke:consumers` passed all
five packaged-consumer fixtures. The `examples/fastify-sqlite-react` backend
and frontend production build passed with Node 26.3.0 explicitly selected,
then the built backend ran locally against a disposable SQLite file on port
19891: `/api/greetings` returned 200, `/` returned 200, and an unknown API
route returned 404. The initial example build attempt used system Node 18.12.1
and failed in Vite/Rolldown; rerunning with the repository's Node 26.3.0
runtime passed. Docker was not rerun during this continuation.

**Remaining release boundary:** changes are locally verified and ready for
owner review through the existing PR workflow; no package publish or release
is part of this work.

**HAWP validation:** `.hawp/bin/hawp work validate` reports backlog
consistency, evidence integrity, verification clarity, and dead links as
passing. Overall validation exits 1 because of pre-existing closed-plan
completeness and legacy filename findings across historical work; this
continuation does not alter or rewrite those closed records.

## Dependency and Docker recheck — 2026-10-17

- Repository runtime dependency audit: `npm audit --omit=dev
  --audit-level=moderate` reports zero vulnerabilities.
- All nine example lockfiles pass `npm audit --package-lock-only
  --audit-level=moderate`; all eight example Docker Compose files pass
  `docker compose ... config --quiet`.
- `npm run check:optional-peers` confirms all 301 entry point builds load
  without optional peer dependencies.
- Full repository `npm audit` continues to report seven high findings in the
  development dependency tree. The affected paths converge on
  `braces@3.0.3` through `micromatch` (including optional peer
  `http-proxy-middleware`) and `tsc-alias` -> `chokidar`/`globby`/`fast-glob`.
  The current upstream `braces` release is still 3.0.3 and GitHub's advisory
  lists no patched version; npm's proposed package downgrades are not
  compatible remedies. Runtime deployments that install the optional Express
  proxy peer should treat that configuration as an outstanding dependency
  risk until upstream publishes a fix or Zacatl replaces that optional
  integration.
- For commit `f794f99dd3c2418c7ee97d1663f964d7c9d6e9ff`, GitHub Actions
  completed successfully for the peer install check, CVE scan, pending-release
  check, publish dry-run, and all eight Docker smoke jobs. The local Docker
  CLI is present but the daemon is unavailable, so no additional local image
  build/run was possible in this recheck.
- The checked-in application Dockerfile uses digest-pinned Node 26 builder
  and distroless Node 26 runtime images. Local build/run of the
  `fastify-sqlite-react` example was already verified with Node 26.3.0 and a
  disposable database; its backend and frontend builds passed and HTTP checks
  returned expected statuses.

## Owner review correction: preserve distinct DI scopes — 2026-10-17

The owner identified that `Platforms` registered the Application container as
`ServiceContainerToken` when no Service token was visible. That made a single
container claim two different scopes.

- Removed the Application-to-Service alias.
- In standalone `Platforms` construction, create a dedicated Service container
  and an Application child, then register each container under its matching
  token.
- In Service-managed construction, continue to resolve the actual Service
  scope inherited by the Application container.
- When a caller supplies an unscoped container, create a separate fallback
  Service scope for the platform child rather than relabeling the supplied
  Application container.
- Added unit coverage asserting standalone Service/Application identities
  differ and that Service-managed Platforms receives the exact Service and
  Application containers created by Service.

**Verification:** focused platform tests pass (4 tests); `npm test` passes
(84 files, 706 tests); source and test type checks pass; the package build
passes; targeted ESLint and `git diff --check` pass.

## Follow-up: fail-fast scope injection — 2026-10-17

The owner approved making Service-managed container wiring required while
keeping direct standalone construction isolated from the global container.

- `Service` remains the composition root. Its platform composition now relies
  on the Service scope inherited from the composition container rather than
  registering a duplicate Service token there.
- `Platforms` receives Service and Application scopes as separate DI tokens.
  It rejects partial or inconsistent scope pairs. Missing Service scope fails
  during DI resolution.
- Standalone `Platforms` and `Layers` construction creates a dedicated child
  of `getContainer()`, registers that child as its Service scope, and builds
  descendant scopes beneath it.
- `Server` now requires both Service and Application scopes through DI; it no
  longer silently constructs without them. Its tests resolve it using isolated
  scopes, matching framework composition.
- No module receives the `Service` orchestrator itself; modules continue to
  depend on scope tokens and their own config/dependencies.

**Verification:** `npm test` passes (84 files, 710 tests); source and test type
checks pass; the package build passes; targeted ESLint and `git diff --check`
pass. Focused Service, Layers, Platforms, Server, and logger-DI tests pass (29
tests).

## Follow-up: cohesive API server tokens and parent registration — 2026-10-17

- Renamed API DI tokens to `ApiServerConfigToken`, `ApiServerAdapterToken`,
  and `ApiServerContainerToken`, and centralized their declarations with the
  other Server tokens in `src/service/platforms/server/tokens.ts`.
- Kept all component value registration in `Server`, the parent that creates
  the adapters and resolves `ApiServer`, `PageServer`, and `DatabaseServer`.
- Put API-only config and adapter values in an API child scope. Page and
  Database each receive their own child scope so private component tokens do
  not leak to siblings.
- Bound `ApiServerContainerToken` to the Application scope, where the
  Application layer registers route and hook classes. This preserves the
  resolver's same-scope registration check while keeping API config and
  adapter values private to the API child.
- Added a regression check that `ApiServer` fails immediately when its
  required handler-container token is missing.

**Verification:** `npm test` passes (84 files, 711 tests); source and test type
checks pass; the package build and targeted ESLint pass; the Service-managed
route and hook DI tests pass (23 focused API, Server, and Service DI tests);
`git diff --check` passes.

## Owner-approved API and DI cleanup — 2026-10-18

- Remove `Layers.getApplicationContainer()`: the scope is registered under
  `ApplicationContainerToken` for injection, and the getter had no repository
  callers. Keep other getters only where they are intentional adapter or
  integration surfaces, not as alternate DI accessors.
- Split DI token definitions beside Service, Layers, each layer, and Platforms;
  retain `service/tokens` as a compatibility barrel. Use slash-separated
  `Symbol.for` paths consistently with the module/scope hierarchy.
- Change Zacatl-owned listen APIs to `listen(host, port)` and start option
  shapes to `{ host?, port? }`. Keep native Express/Fastify call signatures
  intact inside their adapters.
- Make `ServerConfig.port` optional and use `9669` when neither start options
  nor server configuration supplies a port. Keep `0.0.0.0` as the default
  host. The selected port is a stable default, not a guarantee that the port
  is unoccupied; callers can provide a different port when needed.
- Verify the default and explicit host/port paths, tests, declarations, package
  build, and consumer smokes before release review.

**Verification:** full unit suite passes (84 files, 712 tests); source, test,
and script type checks pass; package build and consumer smoke fixtures pass;
full lint passes with 42 warnings and no errors. Focused listener and
scope tests pass (66 tests). HAWP validation passes backlog consistency,
evidence integrity, verification clarity, and dead-link checks, but remains
red on historical closed-task completeness; no historical records were changed.

## Copilot follow-up: additive listener compatibility and release-note accuracy — 2026-10-18

**Plan before implementation:** preserve the public one-argument
`ApiServer.listen(port)` and custom `ApiServerPort.listen(port)` implementations
while retaining an explicit host override; update both provider examples and
correct the example-lockfile claim. Review the Copilot summary's ORM token
identity note separately because it has no open inline thread: the token
factory changed from `Symbol.for('db:<vendor>:<key>')` to a package-scoped
slash path, so compatibility with existing symbol-based registrations needs
verification before release.

- Evidence: `ApiServer` and `ApiServerPort` are exported public subpaths.
  Custom port implementors can depend on their prior one-argument signature.
- Smallest listener approach: keep `listen(port)` required on the port and add
  an optional explicit host-aware method. Framework callers prefer the host
  method and fall back to legacy `listen(port)` adapters. Preserve `0.0.0.0`
  as built-in adapter default.
- Docs: show both capabilities in Fastify and Express examples; accurately
  state that eight applicable example locks resolve `source-map-js` 1.2.2 and
  `node-sqlite-store` has no such dependency entry.
- ORM follow-up: test the prior `db:<vendor>:<key>` symbol path against the
  current ORM registration and decide whether to preserve a legacy alias in
  registration without reverting the new canonical slash token names.

**Acceptance:** old custom adapters type-check and function through both
legacy and host-aware `ApiServer.listen` calls; built-in adapters bind the
default and explicit host correctly; documentation matches the type contract;
the lockfile claim is exact; legacy ORM tokens continue resolving if the
compatibility test confirms they were a supported consumer path. Run focused
tests, package type checks/build, consumer smoke checks, and repository
validation before committing. Do not request another Copilot review.

**Implementation and verification:**

- `ApiServer.listen(port)` remains available; its default host uses the
  configured host or `0.0.0.0`. `ApiServerPort.listen(port)` remains required,
  with optional `listenWithHost(host, port)` for explicit binding. Built-in
  Fastify and Express adapters implement both; a legacy-only adapter rejects
  a non-default explicit host rather than silently discarding it.
- Database startup registers the new namespaced token and the legacy
  `db:<vendor>:<key>` symbol, preserving both resolver identities.
- Updated Fastify/Express provider snippets and both public API guides; the
  changelog now identifies the eight applicable lockfiles and excludes
  `node-sqlite-store`, which has no source-map-js entry.
- Focused tests: `npm test -- --run test/unit/service/platforms/server/api/api-server.test.ts test/unit/service/platforms/server/providers/fastify/api-adapter.test.ts test/unit/service/platforms/server/providers/express/api-adapter.test.ts test/unit/service/platforms/server/database/orm-instance.test.ts` passed (58 tests; rerun after the Express default-host assertion).
- Full `npm test` passed: 84 files, 721 tests. `npm run type:check`,
  `npm run build`, `npm run lint:silent`, `npm run smoke:consumers`,
  `npm run check:peers`, `npm run check:optional-peers`, and
  `npm audit --omit=dev` passed. Lint reports 42 existing warnings and no
  errors. Consumer audit fixtures still report Sequelize-owned nested UUID
  advisories; non-SQL and other applicable audit fixtures pass.
- `./.hawp/bin/hawp check` remains red only on the repository's historical
  closed-task completeness backlog (one validation category); kit validation,
  backlog consistency, evidence integrity, verification clarity, and links
  pass. No historical closed work records were altered.

## Conversation checkpoint — archived 2026-10-19

**Conversation/event date:** 2026-10-18
**Archive date:** 2026-10-19

**Public repository:** `sentzunhat/zacatl`
**Public-safety note:** This checkpoint records only Zacatl source, public PR,
and CI state. Private consumer names, personal details, and local paths are
omitted.

### Before

Copilot's follow-up on draft PR #138 identified three open compatibility or
documentation issues: `ApiServer.listen` no longer accepted one port argument,
`ApiServerPort` required custom adapters to implement the new host-first
signature, and provider snippets disagreed with the documented contract. Its
review summary also called out a changed ORM token identity and an overbroad
changelog claim about nine example lockfiles.

### During

- Restored the public `ApiServer.listen(port)` overload and retained
  `listen(host, port)` for callers needing explicit binding.
- Kept `ApiServerPort.listen(port)` required and added optional
  `listenWithHost(host, port)`. Built-in adapters implement both; a legacy
  adapter that cannot honor a non-default host reports that limitation clearly.
- Kept the namespaced ORM token as canonical and registered the legacy
  `db:<vendor>:<key>` symbol as an alias during ORM instance registration.
- Updated both provider examples and API documentation. Corrected the lockfile
  statement to eight applicable locks and recorded that `node-sqlite-store`
  has no `source-map-js` entry.
- Source/API changes are in `src/service/platforms/server/api/`,
  `src/service/platforms/server/providers/{express,fastify}/api-adapter.ts`,
  and `src/service/platforms/server/database/orm-instance.ts`. The guides are
  `docs/guidelines/architecture.md`, `docs/service/README.md`,
  `docs/roadmap/qa-testing-guide.md`, and `docs/changelog.md`.

### After

- Commit `8de301e9bfb70c602e1d9924ead4557733722c5a` is pushed to
  `codex/release-0.0.65`; the local branch is clean and matches its remote.
- Draft PR [#138](https://github.com/sentzunhat/zacatl/pull/138) remains open
  against `main`. The three listener/documentation review threads are resolved.
- GitHub Actions run
  [39154402517](https://github.com/sentzunhat/zacatl/actions/runs/39154402517)
  passed the CVE scan, release guard, peer-install check, publish dry-run, and
  all eight Docker smoke jobs.
- Local verification passed: 721 unit tests, type checks, package build,
  consumer smoke fixtures, peer checks, and production dependency audit.
  Lint passed with 42 warnings and no errors. Consumer SQL audit fixtures
  still report the Sequelize nested UUID advisory.
- HAWP link, kit, backlog, evidence-integrity, and verification-clarity checks
  pass. The aggregate check still reports historical closed-task completeness
  gaps; no historical work records were edited.

### Decisions and strategic impact

- Host support stays additive: the legacy port method remains required, while
  `listenWithHost` is the explicit optional capability. The built-in default
  remains `0.0.0.0`; Service's default port remains `9669`.
- The package-scoped slash token names remain canonical, with a registration
  alias to protect integrations that still resolve the former global symbol.
- Changelog claims must distinguish all example lockfiles from those that
  actually contain the dependency.
- This is a draft package candidate, not a published release. CI validates the
  package candidate; consumer adoption and release publication remain separate
  milestones.

### Continuation state

At the time of this conversation, resume from the owner-review state of draft
PR #138 at commit `8de301e9`. The implementation, local checks, GitHub CI, and
the first set of inline comment resolutions were complete. No merge, publish,
release, or additional review request was made in that conversation.

### Later GitHub state observed during archival — 2026-10-19

A GitHub Copilot workflow completed on commit `8de301e9` at
[run 39268370804](https://github.com/sentzunhat/zacatl/actions/runs/39268370804)
and added three new unresolved inline comments. This workflow is a later event
than the conversation checkpoint above; it was discovered by read-only GitHub
inspection during archival.

Source inspection confirms these are unresolved compatibility concerns:

1. **ORM token identity** — `src/service/layers/infrastructure/orm/tokens/factory.ts`
   now creates package-scoped symbols, while `orm-instance.ts` registers the
   former `db:<vendor>:<key>` symbol only when `registerOrmInstance()` is used.
   ORM adapters resolve the new canonical token, so a consumer's old manual
   registration is not bridged. Decide whether legacy factory identity should
   remain canonical or adapters should resolve the legacy token as fallback.
2. **Server scope consistency** — `src/service/platforms/server/server.ts`
   accepts the injected Application container without checking that it
   resolves the same Service container and registers itself. The equivalent
   validation already exists in `src/service/platforms/platforms.ts`.
   Validate the same parent/identity relationship before constructing servers.
3. **Configured host with legacy adapter** — `ApiServer.listen(port)` chooses
   `HttpServerConfig.host`, but its legacy-adapter rejection only runs for the
   string overload. A numeric call can therefore reach `adapter.listen(port)`
   and ignore a configured non-default host. Reject or otherwise handle that
   unsupported configuration explicitly.

The initial archival-only commit
`1b9c1fd80616256f6ba1ec92aa167d9d5af558c2` was pushed to the PR branch. Its
documentation-only GitHub Actions run
[39271549830](https://github.com/sentzunhat/zacatl/actions/runs/39271549830)
passed all required jobs, including the Docker matrix and publish dry-run. The
three earlier listener/documentation threads remain resolved; these three
newer ORM/DI/host threads remain open. The PR is still draft and unmerged.

A later checkpoint supplement was pushed as
`441eddfdecfde8cb1a0c7000d35a75d85c19e358`. Its documentation-only
GitHub Actions run
[39272001863](https://github.com/sentzunhat/zacatl/actions/runs/39272001863)
also passed all required jobs. The source implementation remains at the
reviewed code state `8de301e9`; subsequent commits in this archival sequence
only update this work-item record. Check the live PR head before resuming.

**Resume from:** triage and fix the three unresolved source-level findings on
the current head of draft PR #138 on `codex/release-0.0.65`. Add regression
tests for manual legacy token registration,
mismatched Server scopes, and numeric `listen(port)` with a configured
non-default host. Then rerun relevant local checks and CI. Do not request
another Copilot review unless explicitly asked. After owner-approved release,
continue consumer migration only in its existing owner work item; do not infer
consumer adoption from this Zacatl PR.

### Copilot findings and owner API decision — 2026-10-19

The owner reaffirmed the intentional pre-0.1.0 break after Copilot flagged
that `ApiServerPort.listen(host, port)` breaks existing custom adapters. Keep
the host-first method required; do not retain `listen(port)` or add
`listenWithHost`. Zacatl is still pre-0.1.0, so constructor and adapter
contracts may change. Document the breaking contract and migration directly
in the API and release notes; stabilize it for 0.1.0.

**Findings and changes:**

1. **ORM token identity:** keep the upgraded package-scoped slash symbol as the
   canonical token. Add a legacy `db:<vendor>:<key>` token factory and make
   Sequelize, Mongoose, and Node SQLite adapters resolve it when the namespaced
   token is absent. `registerOrmInstance()` continues registering both tokens.
   Regression check: manually register a Sequelize instance only under
   `Symbol.for('db:SEQUELIZE:SEQUELIZE')` and resolve its model through the
   adapter.
2. **Server DI scope identity:** `Server` now checks that its Application
   scope resolves the exact supplied Service scope and registers itself as the
   Application scope before creating adapters. Regression check: supply an
   Application child of a different Service scope; construction throws a
   clear `InternalServerError`.
3. **Host-aware adapter break:** retain required `ApiServerPort.listen(host,
   port)` and document that custom adapters must migrate before 0.1.0. The
   built-in adapters forward both values using their native APIs.
4. **Previously missed Zod finding:** Express validation now uses the existing
   structural `isZodError` guard so an error from another installed Zod copy
   still becomes a 400 response. An HTTP regression check covers a foreign-copy
   shaped error.
5. **Documentation finding:** the `port` description now belongs to
   `ServerConfig`; it is removed from the `HttpServerConfig` property list.
   Architecture examples, QA guidance, Service docs, and the 0.0.65 changelog
   describe the intentional pre-0.1.0 breaking adapter contract.

**Verification completed locally:**

- Focused suite: 6 files, 88 tests passed.
- Full unit suite: 84 files, 722 tests passed.
- `npm run type:check`, `npm run build`, `npm run lint:silent`, and
  `npm run check:optional-peers` passed. Lint reports 42 existing warnings
  outside these changes plus two existing source warnings; no errors.
- `npm run smoke:consumers` passed its non-SQL, Node SQLite, Mongoose, and
  Sequelize fixtures. Sequelize consumer fixtures still report the known
  nested UUID advisory owned by Sequelize.

**Next decision:** owner review of the intentional adapter break and migration
note on draft PR #138. Stabilize the public contract with 0.1.0.

**Closeout on implementation commit `67b4517b8a4316c64414b9a419d8e169c4cee641`:**
PR CI run [39273447968](https://github.com/sentzunhat/zacatl/actions/runs/39273447968)
completed successfully across all 12 jobs: release guard, production CVE scan,
peer install, publish dry-run/consumer smoke, and eight Docker smoke jobs. The
three open Copilot threads for token identity, Server scope identity, and host
handling were resolved after their fixes; GitHub reports zero unresolved
review threads. The PR remains open and draft. Owner review of the intentional
breaking listener API is the next decision; no Copilot review was requested,
and no merge or release occurred.

### Conversation checkpoint — development integration and release sequencing — 2026-10-19

The PR was retitled to describe the work rather than a release and retargeted
from `main` to `dev`. Current title: “Add scoped Service lifecycle,
host-aware adapters, and dependency refresh.” The intended flow is to review
and merge this development integration into `dev`, then prepare a separate
release PR from `dev` to `main`. At inspection, `dev` and `main` both pointed
to `8fa7a790`; PR #138 is open, draft, and mergeable at
`01715b670ab4a01404676d9131f4c970124fdf37` on
`codex/release-0.0.65`. No merge or publication has occurred.

The owner confirmed that the host-first `ApiServerPort.listen(host, port)`
break is accepted during pre-0.1.0 development. The Copilot thread remains
unresolved intentionally; source/interface and migration docs say the
contract should stabilize at 0.1.0.

The latest Copilot review also leaves these issues for triage before the PR is
made ready:

- The current `package.json` candidate is `0.0.65`. The owner clarified that
  before the first `0.1.0` release, `0.0.x` is the unstable initial development
  series and may include breaking changes, new features, and improvements.
  `docs/skills/version-updates.md` now documents this policy. The host-first
  adapter break is accepted for a `0.0.x` development release; continue to
  call it out in changelog and migration guidance. Starting at `0.1.0`,
  breaking changes during 0.x require a minor bump.
- Direct `Platforms.start()` and `new Server(config).start()` previously
  skipped preparation. `Server.start()` now awaits an idempotent `prepare()`;
  this restores direct-call setup and avoids duplicate database/page
  preparation after Service-managed preparation. Regression tests cover
  direct start and prepare-then-start behavior.
- Refreshed README badge/body and the 0.0.65 changelog test total from the
  current full suite: 84 files and 724 tests.

Latest Copilot review reports four open findings (the intentional adapter
break plus the three items above) and two previously missed count discrepancies.
The ORM-token, DI-scope, and unsupported-host findings are resolved. Prior
verification was 722 tests, type check, build, lint, optional-peer check and
consumer smoke; CI passed on earlier heads through `a9361af`. CI status for
the current documentation-only head `01715b67` was not confirmed in this
checkpoint.

The saved status report is
`.hawp/work/status/2026/10/19/19965b11/status.md`.

### Versioning policy clarification — 2026-10-19

The owner clarified the policy boundary raised by Copilot: before the first
`0.1.0` release, `0.0.x` is an unstable initial development series. Its patch
increments may include breaking API changes, features, fixes, documentation,
and other improvements. Beginning at `0.1.0`, breaking changes in the 0.x
series require a minor increment. Updated `docs/skills/version-updates.md` to
state this boundary and require clear changelog/migration notes for pre-0.1.0
breaks. The release version still belongs to the separate release PR decision;
no package version was changed.

This addresses the version-policy finding by clarifying repository policy.
The lifecycle and test-count findings are addressed in the local continuation
record below.

### Copilot lifecycle and test-count follow-up — 2026-10-19

Implemented the direct-start compatibility fix in `Server`: `prepare()` now
shares an in-flight/completed promise, clears it after failure for retry, and
is called by `start()`. This covers direct `Platforms.start()` through its
delegation to `Server.start()`, while the Service-managed prepare/readiness/
start sequence does not configure databases or pages twice. Added regression
tests for direct server start and explicit prepare followed by start.

Fresh local verification: `npm test -- --reporter=dot` passed 84 files / 724
tests; `npm run type:check`, `npm run build`, and `npm run lint:silent` passed
(existing lint warnings remain). README and the 0.0.65 changelog now report
724 tests. `git diff --check` passed. Commit `3779cb11` is pushed to
`codex/release-0.0.65`. The policy and both lifecycle review threads are now
resolved; the intentional adapter-break thread remains unresolved. CI run
39285485782 is queued, so no current-head CI success is claimed.

### Service architecture and review scope — 2026-10-19

The owner described `Service` as the composition/lifecycle boundary over two
sibling modules, `Layers` and `Platforms`. `Layers` owns Application, Domain and
Infrastructure; `Platforms` owns CLI, Desktop and Server. Nested modules own
their local ports and adapters. The current/source distinction is documented in
`docs/service/architecture.md`: REST and Server are implemented, CLI/Desktop
are stubs, and a dedicated Domain clients module is proposed rather than an
existing `DomainConfig` feature. This clarifies ownership without adding a
runtime module registry.

Keep PR #138 focused on development integration. Direct Server route resolution
is tracked as `6ec737fa`. Cross-Service ORM and Mongoose policy isolation is
tracked as `fa61f33c`; its two-Service behavior was subsequently reproduced
in the audit below.
Publication needs either the scoped fix or an explicitly approved narrower
single-Service contract. The accepted host-first adapter break fits the
documented pre-`0.1.0` `0.0.x` policy; version selection remains in the
later release PR. Do not infer current CI status from earlier passing heads.

### Complete Copilot thread audit — 2026-10-19

The 19-thread current-code audit is in
`.hawp/work/status/2026/10/19/19965b11/status.md#later-copilot-thread-audit--2026-10-19`.
Fifteen threads are marked resolved on GitHub, but the earlier one-argument
`ApiServer` and `ApiServerPort` compatibility fixes were later intentionally
reversed; those threads are historical, not proof of a compatible current API.
The host-first break remains the owner's accepted, visible open finding.
Two other open findings are reproduced: direct `Server.registerEntrypoints`
cannot resolve a globally registered route, and a second same-name Service
overwrites the first Service's global ORM token. The latter has two Copilot
threads. The two bug plans contain reproduction and focused fix paths.
Current remote PR head `6f9aa0e3` passed all 12 CI checks; local
documentation-only commit `04f3a090` has no CI result. Local unit, type,
build and lint checks passed but do not negate the focused reproductions.

### PR #138 retargeted to `main` — 2026-10-20

At the owner's request, PR #138 was retargeted from `dev` to `main` after
confirming `.github/workflows/ci.yml` runs pull-request checks for both bases.
At retarget time the head was `d3a37e429881ebdc90d6222052340cfaf816d7da`,
with all 12 checks passing in CI run `39445072711`. The candidate package
version is `0.0.65`; no `v0.0.65` tag was found and npm returned 404 for that
version. Merging to `main` will run the main-branch release gates and, if they
pass, create the tag, publish the package, and create a GitHub Release. The PR
remains open and unmerged. The PR description and `docs/changelog.md` now
describe this release path; pre-`0.1.0` `0.0.x` version policy is unchanged.
