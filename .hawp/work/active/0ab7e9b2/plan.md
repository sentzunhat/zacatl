# Document real-world Zacatl Service composition lessons

**Backlog ID (Legacy):** `0ab7e9b2`
**UUID:** `0ab7e9b2-9253-4f10-b7b8-f00fdc5661c5`
**Type:** improvement
**Reported:** 2026-10-16

---

## Input (verbatim)

> Document real-world Zacatl Service composition lessons

## Intake Summary

Update Zacatl's service, configuration, logging, errors, and examples documentation with current APIs and lessons from using Zacatl in a real multi-feature website backend.

## Current Context

Current docs include ServiceConfig/lifecycle, logging bridge, CustomError public/diagnostic JSON, DI metadata-first imports, database initialization hooks, modular server scaffolds, and examples. Some service guides contain older or conflicting advice (for example app-wide tsyringe registration versus Service-owned child containers/providers and stale `ServiceConfig` snippets). The website's real integration has custom Fastify security/SSR behavior and manually-managed lifecycle that needs comparison before any claims are added.

## Initial Analysis

**Directly verified:**

- Zacatl service docs expose `Service`, `ServiceType`, `ServiceConfig`, DB `onDatabaseConnected`, `start()` and `stop()`.
- Logging docs show a shared Pino adapter used by `Service` and Fastify through `toFastifyLogger`.
- Error docs specify safe `toJSON()` and trusted-only `toDiagnosticJSON()`.
- Some documentation is older than the current service contract and will need a consistency audit before choosing canonical guidance.
- This item is documentation planning only; no Zacatl code or docs have been changed.

**Inferred (not yet proven):**

- A concise real-consumer guide may expose gaps between framework contracts and practical needs such as plugin registration order, SQLite setup/seed hooks, typed custom errors, logging redaction, and multi-module config composition.

**Likely scope:**

- `docs/service/`, `docs/logs/README.md`, `docs/error/README.md`, DI/import guides, `README.md`, and one or more runnable examples; reconcile paths after the API audit.

## Risk + Review Gate

**Risk:** low-medium — examples can become misleading if they claim unverified behavior or contradict current APIs.
**Gate:** verify current exported types and source first; review any framework behavior changes separately from prose changes.

## Backlog + Plan Link

**Status now:** in-progress
**Plan file:** work/active/0ab7e9b2/plan.md

## Plan

1. Inventory public ServiceConfig types/exports, lifecycle order, DI initialization, DB hooks, logger injection/bridging, and CustomError serialization against source and built declarations.
2. Identify contradictory or stale guidance and classify each as docs-only, example update, or genuine framework API gap.
3. Use the Sentzunhat website as a consumer case: custom Fastify plugins, SSR 404, SQLite model/seed, logging, validation errors, and shutdown. Keep consumer-specific examples generic and secret-free.
4. Write an implementation walkthrough that composes modules into one `ServiceConfig` without treating HAWP as runtime machinery or encouraging direct unscoped container use.
5. Add a lessons section covering metadata import order, Service-owned DB/logger setup, safe public errors versus internal diagnostic logs, startup/shutdown, and acceptance evidence.
6. Update/read through examples and cross-links; keep a proposed modular config feature in `19965b11` until its scope is decided.

## Acceptance

- Canonical docs match current source/types and explicitly identify any unsupported capability.
- One tested example demonstrates the current recommended Service + Fastify + database + logger/error composition.
- Docs distinguish consumer-owned configuration factories from future framework-provided module composition.
- No secrets, private website facts, or unverified deployment claims are included.

## Verification Plan

Build/run the affected example, run documentation link checks and targeted Zacatl tests, and compare examples against current public declaration types. Do not update a release/changelog claim without a corresponding implementation/release.

## Website consumer findings — 2026-10-16

Document the supported first import as `@sentzunhat/zacatl/third-party/dependency-injection/reflect-metadata`; the shorter `/third-party/reflect-metadata` path from a consumer example is not exported in `0.0.64`. Show one `PinoLoggerAdapter` shared with Fastify through `toFastifyLogger`, `CustomError.toJSON()` for public responses, and server-only diagnostics. The website has applied these pieces locally while retaining its manual HTTP/database lifecycle.

Before presenting `Service.start()` as a drop-in website replacement, describe the current limits verified from source: Fastify binds to `0.0.0.0`; REST routes resolve from the global container instead of the Service child container; and HTTP listens before `layers.start()` finishes repository readiness. The related framework contract and consumer acceptance cases are tracked in `19965b11`. Once those behaviors change, update the walkthrough and runnable example against the released API, then record the release version used by the website. Do not imply this migration is already complete.

## Documentation checkpoint — 2026-10-16

The Service guide now documents optional host configuration with the container-safe `0.0.0.0` default, explains `Service.start({ host })`, and shows the custom page registration callback receiving both the adapter and the raw Fastify/Express instance. Remaining doc work includes updating all lifecycle, DI-scope, error/log, and real-consumer examples after the framework API settles. Build and type checks pass for the current Zacatl source; link/example validation is still open.

## Findings refresh — 2026-10-16

The related Service migration claims were rechecked against the current source
and the website's installed published `@sentzunhat/zacatl@0.0.64` API. Full
reproduction details, exact outcomes, and implementation acceptance criteria
are in [work item 19965b11](../19965b11/plan.md#independent-source-and-published-api-review--2026-10-16).

### Documentation lessons to carry into the implementation

- Describe Fastify's `0.0.0.0` default as Docker-safe and verified through a
  published port. It is not a defect to fix by changing to loopback. If Zacatl
  later adds a host override, document that it is opt-in and preserve the
  wildcard default.
- Separate Service-managed DI from manual global-container registration.
  `Service` creates child scopes; Layers further nest them; Application
  resolves routes/hooks there, but platform registration currently resolves
  again from the global container. The temporary route and hook reproductions
  fail at `Service.start()` when their class/logger dependency exists only in
  the Service scope. Do not document global registration as a prerequisite for
  Service-managed handlers once that framework path is corrected.
- Document the actual database/startup phases: database adapters connect and
  await `onDatabaseConnected` during server start; the server then listens;
  only afterward does Service await repository `ready()`. That ordering is
  confirmed, while readiness-before-listen is the website's required behavior
  and an open framework lifecycle decision. Avoid a simple reordering that
  invokes repositories before DB/model initialization.
- The existing website Fastify pattern (Helmet plugin, security hooks,
  rate-limit and redirect hooks/routes in `app.after()`, custom not-found,
  then static serving) can be represented on a retained root Fastify instance;
  a representative `inject()` reproduction preserved the security headers,
  rate-limit, redirect, asset, API 404, and SSR HTML 404 behaviors. Still test
  the real website after migration; the source reproduction is not a deployment
  or migration pass.
- Clarify `PageServerConfig.customRegister`: docs show a raw `FastifyInstance`,
  but runtime passes the `PageServerPort` adapter. A run observed only adapter
  methods and `received === fastify` false. Correct the contract/example before
  recommending it for Fastify plugins. Consumers can currently extend the
  original instance they retain from `HttpServerConfig.instance`.

### Source and API references for future docs

- `src/service/service.ts:46-70,183-195`; published
  `build/esm/service/service.d.ts` (`start` accepts `{ port?: number }`).
- `src/service/layers/layers.ts:12-35` and
  `src/service/layers/application/application.ts:34-51` (nested scopes and
  application handler resolution).
- `src/service/platforms/server/api/api-server.ts:90-113` and
  `src/dependency-injection/container.ts:105-134` (platform re-resolution via
  global default).
- `src/service/platforms/server/server.ts:141-165`,
  `src/service/platforms/server/database/database-server.ts:28-58`,
  `src/service/platforms/server/database/adapters/sequelize.ts:23-30`, and
  `src/service/layers/infrastructure/infrastructure.ts:64-71` (DB/callback,
  listen, repository readiness ordering).
- `src/service/platforms/server/providers/fastify/api-adapter.ts:78-80`,
  `src/service/platforms/server/types/server-config.ts:10-40`,
  `src/service/platforms/server/page/page-server.ts:81-94`, and
  `docs/service/README.md:50-103,680-695` (host and extension contract).
- Current website consumer reference:
  `website/src/apps/backend/src/platforms/server/fastify-app.ts:35-153` and
  `website/src/apps/backend/src/server.ts:22-25`.

### Next documentation decision

Keep the website migration documentation-only until the implementation in
`19965b11` is reviewed and released. Then update `docs/service/handler-registration.md`
to distinguish manual/global-container mode from Service-managed mode, fix
the `customRegister` example to match its supported argument, and write a
walkthrough that follows the verified DB -> repository-ready -> listen and
Fastify plugin/hook/static/404 ordering. Do not imply these local changes exist in published `0.0.64`; document the
new contract only after a version containing it is released.

### Framework change update (2026-10-16)

The existing website migration plan remains documentation/consumer guidance; no website code was changed. Zacatl source now supports the additive host override while retaining `0.0.0.0` by default, resolves Service-managed handlers from the Application scope, runs database/page preparation and repository readiness before HTTP listen, and passes the raw native server as a second `customRegister` argument while preserving the adapter as the first.

`docs/service/README.md` now documents this callback contract and host option. Build, type checks, full Zacatl tests (84 files/703 tests), and all five consumer smoke fixtures passed. The Fastify SQLite Docker image reported a wildcard bind and accepted a published-port request (HTTP 200). A live Fastify Docker port check and a delayed-repository listener test both passed. The website's actual route lifecycle is still its current manual implementation, and its deployed or migrated behavior has not been claimed or changed.

Next: after Zacatl implementation review/release, use the existing website-owned work item `2a1dc541` to decide whether to adopt Service lifecycle and the website-local Sequelize UUID override; do not treat the checkout override as consumer protection.
