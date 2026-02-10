# Architecture Reference

Deep dive into Zacatl's architecture and design decisions.

## Core Architecture

- [Framework Overview](framework-overview.md) - Layered architecture, key components
- [Multi-Context Design](multi-context-design.md) - CLI, Desktop, Server support

## Design Decisions

- [Architecture Decisions](decisions/) - ADRs and design rationale

## Key Concepts

**Layered Architecture**

- Platform Layer - Server setup, lifecycle
- Application Layer - Entry points (routes, commands, IPC)
- Domain Layer - Business logic
- Infrastructure Layer - Data access

**Multi-Context Support**

- CLI applications with commands
- Desktop apps with IPC handlers
- Server APIs with REST routes
- All using unified architecture

## For Implementers

- See [ORM Architecture](../orm/architecture.md) for adapter patterns
- See [Guides](../../guides/) for practical how-tos
