# Architecture Decision Record: Service Architecture Standardization (v0.0.20)

## Title

Standardization of Service Architecture and Modular Component Design

---

## Context

The project was previously structured around a specific `MicroService` implementation that, while functional, imposed rigid patterns on consuming applications. As we prepare to deploy on **ujti** and expand the ecosystem, we need a framework that behaves more like "Lego bricks"—composable, interchangeable, and testable. The previous naming conventions (`@zacatl/micro-service`) and patterns were becoming technical debt, limiting our ability to support different runtime environments (e.g., CLI tools vs. REST APIs vs. Gateways) and preventing clean dependency injection strategies.

---

## Problem Statement

The current architecture suffers from tight coupling between the configuration, the server implementation, and the business logic, making it difficult to compose applications dynamically or swap out infrastructure components (like switching ORMs) without significant rewriting.

---

## Current State

- **Entry Point:** Mixed usage of `MicroService` and `Service`.
- **Imports:** Inconsistent internal import scopes (`@zacatl/*` vs relative).
- **Configuration:** Ad-hoc configuration loading without strict schema validation or format agility.
- **Repository:** ORM usage is direct or loosely abstracted, making it hard to switch between Mongoose and Sequelize.
- **Modularity:** High coupling; replacing a server vendor or database strategy requires touching core logic.

---

## Options Evaluated

### Option 1: Incremental Patching

Keep the `MicroService` class but add patch fixes for urgent issues.

- **Pros:** Low immediate effort.
- **Cons:** Accrues technical debt. Retains the "MicroService" misnomer (it's really just a Service). Doesn't solve the core modularity issue for _ujti_.

### Option 2: Full Rewrite / Framework Switch

Move to NestJS or another established framework.

- **Pros:** Community support.
- **Cons:** High learning curve for existing team. Loss of the specific "Clean Architecture" flavor we have cultivated. Overkill for simple services.

### Option 3: Standardize on `Service` & Adapter Pattern (Chosen)

Refactor the core into a generic `Service` class that orchestrates `Application`, `Domain`, and `Infrastructure` layers via configuration.

- **Pros:** usage of "Lego-like" composition. Highly testable. Retains existing knowledge but cleans up the API. Aligns with standard Enterprise patterns (DI, Repository, Strategy).
- **Cons:** Breaking changes for v0.0.x consumers (requires migration).

---

## Decision

We will adopt **Option 3**. We will rebrand the core unit as `Service` (dropping "Micro"). We will strictly enforce the `Application/Domain/Infrastructure` layered architecture through configuration. We will use the **Adapter Pattern** for external dependencies (ORMs, Server Vendors) to ensure components are pluggable.

---

## Advantages

- **Modularity:** Components (Repositories, Route Handlers) are injected classes. You can swap them like Lego bricks.
- **Testability:** Dependency Injection allows mocking of the entire Infrastructure layer.
- **Consistency:** Unified import scope `@sentzunhat/zacatl` across the board.
- **Flexibility:** The `loadConfig` strategy supports multiple formats (JSON/YAML) and cascading overwrites, similar to Kubernetes resource definitions.

---

## Disadvantages

- **Migration Cost:** Existing services must update their `new MicroService()` calls to `new Service()` and refactor config structure.
- **Boilerplate:** Slightly more verbose setup for very simple "University project" style apps (mitigated by `create-zacatl-app` scaffolds in future).

---

## Implementation Plan

### Phase 1: Core Refactor (Completed v0.0.20)

- [x] Rename `MicroService` to `Service`.
- [x] Implement generic `BaseRepository<D, I, O>` for Mongoose/Sequelize.
- [x] Implement `loadConfig` with strict Zod validation.
- [x] Align package exports under `@sentzunhat/zacatl`.

### Phase 2: Documentation & Cleanup (Completed)

- [x] Update all diagrams and Guides (MIGRATION.md).
- [x] Fix unit tests to reflect new API (161 tests passing).
- [x] Ensure `npm run build` and `npm run type:check` are green.

### Phase 3: Deployment Verification

- [ ] Publish v0.0.20 to registry.
- [ ] Test integration in **ujti** environment (Next Step).

---

## Security Considerations

- **Dependency Injection:** Makes it easier to inject security contexts (User sessions) into Route Handlers.
- **Validation:** Strict Zod schemas required for all Config and Route inputs prevents injection attacks.
- **Secrets:** Configuration loading supports environment variable substitution (via `config` package behavior), keeping secrets out of code.

---

## Database Schema

N/A - This is a framework-level change. However, the `BaseRepository` enforces stricter typing on existing schemas.

---

## Status

**Accepted** (Implemented in v0.0.20)
