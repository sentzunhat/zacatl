# Zacatl Framework Overview

Zacatl is a modular TypeScript framework for building scalable services with
layered architecture, dependency injection, and adapter-driven integrations.

## What Zacatl Provides

- Layered architecture (application, domain, infrastructure, platforms)
- Dependency injection via tsyringe
- Configuration loading (YAML/JSON) with validation
- Structured errors and logging
- i18n support with pluggable adapters
- ORM adapters for Sequelize and Mongoose
- Server adapters for Express and Fastify

## When to Use It

Good fit:

- Service-oriented backends that benefit from clear separation of concerns
- Teams that value strict typing and explicit module boundaries

Not a great fit:

- Small CRUD apps with minimal architecture needs
- Client-only applications

## Core Architecture (High Level)

```
Application (use cases)
Domain (ports, contracts)
Infrastructure (implementations)
Platforms (server + runtime wiring)
```

For deeper details, see the module docs under [service/README.md](../service/README.md).

## Module Index

- Configuration: [configuration/README.md](../configuration/README.md)
- Dependency Injection: [dependency-injection/README.md](../dependency-injection/README.md)
- Errors: [error/README.md](../error/README.md)
- Logging: [logs/README.md](../logs/README.md)
- Localization: [localization/README.md](../localization/README.md)
- ORM Adapters: [third-party/orm/README.md](../third-party/orm/README.md)
- Server Adapters: [service/README.md](../service/README.md)

## Skills & Procedures

Best practices and procedural guides for working with Zacatl:

- [Version Updates](../skills/version-updates.md) - How to version the package and maintain changelog documentation
