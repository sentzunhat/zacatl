# Zacatl Framework — Agent Integration Spec

This document provides a compact, implementation-ready summary for an AI agent to integrate Zacatl into another Node.js TypeScript project.

## Overview

- Purpose: Modular microservice framework with layered architecture (Application/Domain/Infrastructure/Platform), DI via `tsyringe`, structured logging via `pino`, configuration via `node-config`, validation via `zod`, and adapters for HTTP servers and persistence.
- Runtime: Node.js >= 22; TypeScript 5.9.
- Entrypoint: `build/index.js` (package consumers) and `src/index.ts` during development.

## Folder Structure (key)

- `src/index.ts`: Re-exports public API
- `src/micro-service/architecture/`: Layered architecture utilities and base class
- `src/logs/`: Pino logger wrapper and types
- `src/error/`: Typed error classes (`CustomError`, `ValidationError`, etc.)
- `src/configuration.ts`: Configuration accessor using `config`
- `src/utils/`: Helpers (`base64`, `hmac`)
- `config/*.json`: Environment-specific configuration
- `docs/`: Guides and specs

## Public API (exports)

From `src/index.ts`:

- `optionals`: `Optional<T>`, `Nullable<T>`, `Maybe<T>`
- `configuration`: `getConfigOrThrow<T>(name)`
- `utils`: `encodeBase64()`, `decodeBase64()`, `generateHmac()`
- `error`: `CustomError`, `ValidationError`, plus HTTP-specific errors
- `micro-service`: architecture namespaces and `AbstractArchitecture`
- `MicroService`: convenience export for microservice namespace
- `logs`: `logger`, `defaultLogger`, `createPinoConfig`, types (`Logger`, `PinoLoggerConfig`)

## Configuration

- Uses `node-config` (files under `config/`). Keys typically include: `SERVICE_NAME`, `NODE_ENV`, `APP_VERSION`, `APP_ENV`, `CONNECTION_STRING`, `LOG_LEVEL`.
- Access via `getConfigOrThrow<T>("SERVICE_NAME")`.

## Logging

- Pino-based structured logging via `defaultLogger` and simplified `logger` interface with methods: `info`, `trace`, `warn`, `error`, `fatal`.
- Use `logger.info("Event", { data, details })` for uniform payloads.

## Errors

- `CustomError` adds `id`, `code`, `reason`, `metadata`, `time`.
- Specializations (`BadRequestError`, `UnauthorizedError`, `ValidationError`, etc.) standardize HTTP status codes and semantics.
- Throw and catch at boundaries; log with context; surface appropriate HTTP codes.

## Dependency Injection & Architecture

- Base: `AbstractArchitecture` with `start(): void`.
- Helpers:
  - `registerDependencies(ctors[])`: registers classes in `tsyringe` by name.
  - `registerAndStoreDependencies(ctors[], storage[])`: registers, resolves, and stores instances.
- Pattern: Define `Application`, `Domain`, `Infrastructure`, `Platform` layers; register handlers/services; start platform server/adapters.

## Platform & Persistence

- HTTP: Express/Fastify adapters (present in platform folder), with optional static/proxy utilities.
- Persistence: Mongoose and Sequelize repositories (present in infrastructure folder).
- Validation: `zod` and `fastify-type-provider-zod` are available for typed route schemas.

## Utilities

- `encodeBase64(input)`, `decodeBase64(input)`
- `generateHmac(message, secretKey)`

## Testing & Build

- Testing: `vitest` with setup files; coverage available.
- Scripts: `start`, `build`, `test`, `test:coverage`, `type:check`, `lint`, `publish:latest`.

## Minimal Integration Checklist

1. Install Zacatl in target project and ensure Node 22+.
2. Create environment config under `config/` (or map to your system). Required keys: `SERVICE_NAME`, `APP_ENV`, `CONNECTION_STRING`, `LOG_LEVEL`.
3. Implement your microservice class:

```ts
import "reflect-metadata";
import { container } from "tsyringe";
import {
  AbstractArchitecture,
  logger,
  ValidationError,
  getConfigOrThrow,
} from "@sentzunhat/zacatl";

class MyService extends AbstractArchitecture {
  public start(): void {
    // Register application/domain/infrastructure dependencies
    // this.registerDependencies([UserRepository, CreateUserHandler, ...]);

    // Example: read config
    const serviceName = getConfigOrThrow<string>("SERVICE_NAME");
    logger.info(`Starting ${serviceName}`);

    // Start platform adapter (Express/Fastify) and bind routes
    // const server = new FastifyAdapter({ logger });
    // server.registerRoutes([...]);
    // server.listen(3000);
  }
}

new MyService().start();
```

4. Use errors and logging consistently:
   - Throw `new ValidationError({ message, reason, metadata })` for schema issues.
   - Log via `logger.error("Operation failed", { data, details })`.

5. Optional: Wire validation with `zod` schemas on routes; use DI (`container.resolve()`) to access services.

## Agent Inputs (for autonomous implementation)

- Target project details: repo URL/path, chosen HTTP adapter (Express/Fastify), persistence (Mongo/Mongoose or SQL/Sequelize).
- Required env/config values and ports.
- Route list with request/response schemas (prefer `zod`).
- Entities and repository interfaces; adapters to use or stub.

## Extension Roadmap (improvements the agent can add)

- Configuration schema: validate `config/*` via `zod` with safe fallbacks.
- Health & readiness endpoints: `/health`, `/ready` with DI-based checks.
- Lifecycle hooks: `onStart`, `onShutdown` with graceful shutdown.
- Metrics & tracing: Prometheus client, OpenTelemetry integration.
- Error mapping middleware: auto-map `CustomError` → HTTP responses.
- Request context: per-request correlation ID; include in `logger` payloads.
- CLI scaffolding: `npx zacatl new service` to bootstrap architecture.
- Plugin system: register platform/persistence providers via interfaces.
- i18n integration: surface localized messages from `src/locales/*`.
- Testing utilities: in-memory DB adapters and server test harness.

## Notes

- Use `reflect-metadata` before DI.
- Prefer DI `@injectable()` on classes to follow `tsyringe` best practices.
- Keep layers isolated; share contracts (interfaces) across boundaries only.

---

If you share the target project repo/link and preferences (Express vs Fastify, Mongo vs SQL), we can tailor this spec and implement the initial service skeleton automatically.
