# AI Agent Implementation Guide

_Last Updated: 2026-02-04_

This guide is intentionally short. The **canonical implementation pattern** lives here:

- [Service Adapter Pattern](./service-adapter-pattern.md)
- [DI Registration Patterns](../reference/di-registration-patterns.md)

## Minimal Agent Checklist

- Use `container.registerInstance()` for repositories and services.
- Use `container.registerSingleton()` for handlers.
- All handlers extend `AbstractRouteHandler`.
- `domain.providers` is `[]`.
- `infrastructure.repositories` is `[]`.
- Routes array contains handler classes (not instances).
- No manual Express/Fastify route registration.
- Ignore `/build/**` artifacts.

## Canonical Example Entry Points

- [examples/platform-express/02-with-mongodb/src/index.ts](../../examples/platform-express/02-with-mongodb/src/index.ts)
- [examples/platform-fastify/01-with-sqlite/src/index.ts](../../examples/platform-fastify/01-with-sqlite/src/index.ts)
