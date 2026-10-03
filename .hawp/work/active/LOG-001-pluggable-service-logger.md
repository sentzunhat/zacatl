# LOG-001 — Pluggable service logger shared with Fastify

**UUID:** `LOG-001` · **Type:** feature · **Priority:** P2 · **Reported:** 2026-10-01
**Status:** in-progress · **Branch:** `feature/pluggable-service-logger` · **Target:** 0.0.63

## Problem

- Zacatl has an app logger (`@sentzunhat/zacatl/logs`: `createLogger`,
  `PinoLoggerAdapter`, `ConsoleLoggerAdapter`, custom `LoggerPort`), but the
  Service never receives it. Internal logs use a module-global pino logger.
- The app creates the Fastify instance, so `request.log` / `reply.log` are a
  second, separately configured logger — or a no-op: all four Fastify
  examples use `Fastify({ logger: false })`, so handler errors logged by the
  Fastify adapter go nowhere.
- Fastify needs a pino-shaped logger (`level`, `child()`, `info(obj, msg)`);
  `LoggerPort` is `info(message, input)`.

## Owner direction (2026-09-30)

One logger configured at the app/service level — pino by default, console or
a custom adapter (e.g. a future SQLite log writer) — that the service uses and
that Fastify's `request.log` / `reply.log` go through; app code can also call
`logger.error(...)` directly.

## Plan (final shape after owner review, 2026-10-02)

1. `toFastifyLogger(adapter)` (additive, `@sentzunhat/zacatl/logs`): an
   adapter with `getPinoInstance()` returns the real pino instance; console /
   custom adapters and plain `Logger` objects get a bridge implementing
   `level`, `child()` (bindings merged into `data`) and Fastify's
   `(obj, msg)` call style. No hidden adapter link on `createLogger()`.
2. `LoggerToken`: the Service registers `ServiceConfig.logger?: Logger`
   (default: Zacatl's pino logger) once in its own container (like the
   database instances), shared by `Layers` and `Platforms`; layer classes can
   `@inject(LoggerToken)`.
3. Platforms: no logger fields on `PlatformsConfig` / `ServerConfig`. `Server`
   resolves `LoggerToken` from the shared container for the Express adapter,
   which logs Zacatl's own messages through it and gives Express requests a
   request-scoped `req.log` / reply `log` (pino-style, generated `reqId`).
   Fastify keeps its native `request.log` / `reply.log` (the adapter logs
   handled route errors through `reply.log`); apps point Fastify at the same
   adapter with `loggerInstance: toFastifyLogger(adapter)`.
4. Fastify examples: `logger: false` → shared logger via `toFastifyLogger`.
5. Tests: pino passthrough, console/custom bridge (levels, child bindings,
   `(obj, msg)` mapping), real-Fastify request/handled-error logs reaching a
   custom `LoggerPort`, Service passes its logger to platforms.
6. Docs (`src/logs/README.md`, logging guide), changelog, backlog.

## Out of scope

- SQLite log writer adapter itself.
- Express request logging (no built-in request logger).
- Zacatl creating the Fastify instance (v0.1.0 candidate).

## Verification

`npm test`, `npm run type:check`, `npm run lint:silent`, `npm run build`,
`npm run prepare-publish && npm run check:optional-peers && npm run smoke:consumers`,
Fastify example builds.

## Log

- 2026-10-01: Opened; design approved by owner 2026-09-30 (follow-up PR, examples switched to a real logger).
- 2026-10-01: Implemented on `feature/pluggable-service-logger`: `toFastifyLogger`, adapter refs, `ServiceConfig.logger`, four Fastify examples on a shared logger, docs. Validation: 680 tests, type check, lint, build, optional-peer check (301 builds), consumer smokes, four example builds, and a live run of `fastify-sqlite-react` showing `incoming request` / `request completed` with `reqId` through the Zacatl logger.
- 2026-10-02: Owner review: replaced the hidden Symbol adapter link with an explicit adapter (`toFastifyLogger(adapter)`; `getPinoInstance()` fast path, bridge otherwise) and added `LoggerToken` — the Service registers its logger in its own DI container so layer classes can `@inject(LoggerToken)`. Validation on Node 26.3.0 (`.nvmrc`): 687 tests, type check, lint baseline, build, optional-peer check (301 builds), consumer smokes, four example builds.
- 2026-10-03: Owner review: logger removed from `PlatformsConfig` / `ServerConfig`; `Layers` registers `LoggerToken` (Service passes `config.logger`). Platforms, Server and the Express adapter are back to their `dev` versions.
- 2026-10-03: Owner clarification: Fastify and Express adapters must use the Service logger too. Final shape: the Service registers `LoggerToken` in its own container and passes that container to `Layers` and `Platforms`; `Server` resolves the logger for both adapters. The Fastify adapter logs handled route errors through it (with `reqId`, method, URL, status, plain `err`).
- 2026-10-03: Owner review: restore Fastify `reply.log` for the adapter's handled-error log. Swapping `request.log` / `reply.log` during the handler was tried and rejected — `reply.send()` completes inside the handler, so Fastify's own "request completed" log would have moved to the Service logger (and lost Fastify's serializers). Final: Fastify native `reply.log`; Express gets a Service-bound `req.log` / `reply.log`.
