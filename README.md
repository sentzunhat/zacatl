# Zacatl Microservice Framework

A blazing fast, modular TypeScript microservice framework for Node.js, designed for rapid development of high-performance APIs and distributed systems. Zacatl enforces a clean, layered architecture, robust typing, and seamless collaboration between human and AI contributors.

---

## 1. How Humans and AI Agents Can Contribute

- **Read the docs:** Always review `guidelines.yaml`, `context.yaml`, and `patterns.yaml` before making changes.
- **Follow conventions:** Use dependency injection (`tsyringe`), maintain modularity, and respect the layered architecture.
- **Testing:** All logic must be unit tested (`vitest`). Place tests in `test/unit/`, mirroring the `src/` structure.
- **Documentation:** Update YAML docs with new patterns, features, or conventions. AI agents should parse YAML for context.
- **Register everything:** All services, repositories, and handlers must be registered in the DI container.

---

## 2. Project Structure & Layer Overview

```
src/
  configuration.ts         # App configuration (env, settings)
  logs.ts                  # Logging utilities
  optionals.ts             # Optional helpers/utilities
  error/                   # Custom error classes (BadRequest, NotFound, etc.)
  locales/                 # Localization files (en.json, fr.json, ...)
  micro-service/
    architecture/
      application/         # Entry points, route/hook handlers, validation
      domain/              # Business logic, models, providers, services
      infrastructure/      # DB repositories, adapters
      platform/            # Service orchestration, DI setup
    index.ts               # Microservice layer entry
  utils/                   # Utility functions (base64, hmac, etc.)
```

- **Application:** Handles HTTP entry points, validation, and delegates to domain logic.
- **Domain:** Pure business logic, models, and providers. No infrastructure dependencies.
- **Infrastructure:** Persistence (MongoDB repositories), adapters, and external integrations.
- **Platform:** Bootstraps the app, configures DI, and starts the server.

---

## 3. Core Architectural Concepts

- **Layered (Hexagonal) Architecture:**
  - Platform → Application → Domain → Infrastructure
  - Strict separation of concerns; each layer has a single responsibility.
- **Error Handling:** All errors extend `CustomError` (see `src/error/`).
- **Validation:** Use `zod` schemas for all request/response validation.
- **Service Registration:** Register handlers/services in the DI container.

---

## 4. Coding Standards for Humans and AI

- **Naming:**
  - Files/folders: lowercase, hyphens (e.g., `user-repository.ts`)
  - Classes: PascalCase
  - Functions/variables: camelCase, descriptive
- **Code Style:**
  - Clean, modular, and straightforward
  - Use strong typing and TypeScript generics
  - DRY principle: extract reusable logic
  - Minimal comments; use tests to document behavior
  - Validate all inputs and sanitize external data
- **AI Patterns:**
  - Replicate DI, modularity, and test structure
  - Update YAML docs when generating new code

---

## 5. Dependency Injection (DI) Details

- **DI Container:** All services, repositories, and handlers are registered using `tsyringe`.
- **No direct instantiation:** Always resolve dependencies via DI.
- **AI Registration:** When generating new components, ensure they are registered in the DI container.

---

## 6. Database Schema & Persistence

- **MongoDB schemas:** Define all schemas in `src/micro-service/architecture/infrastructure/repositories/`.
- **Repository pattern:** Extend `BaseRepository` for new collections.
- **Schema best practices:**
  - Favor embedding for related data
  - Keep schemas minimal and property names concise
  - Use references for large or independent data
  - See `mongodb.yaml` for full guidelines

---

## 7. Error Management and Validation

- **Error Classes:** All errors extend `CustomError` (see `src/error/`).
- **Throw, don’t return:** Always throw errors for exceptional cases.
- **Validation:** Use `zod` for all request/response validation. Place schemas in the Application layer.

---

## 8. Testing Philosophy and Setup

- **Framework:** Use `vitest` for all tests.
- **Structure:** Place tests in `test/unit/`, mirroring the `src/` structure.
- **Mocking:** Mock all external dependencies (DB, services) in tests.
- **AI Testing:** When generating new logic, always add or update tests.

---

## 9. Minimal Usage Example

```typescript
import Fastify from "fastify";
import { MicroService } from "@sentzunhat/zacatl";

const fastifyApp = Fastify();

const microservice = new MicroService({
  architecture: {
    application: {
      entryPoints: {
        rest: {
          hookHandlers: [], // Add hook handler classes
          routeHandlers: [], // Add route handler classes
        },
      },
    },
    domain: { providers: [] }, // Add domain provider classes
    infrastructure: { repositories: [] }, // Add repository classes
    service: {
      name: "my-service",
      server: {
        type: "SERVER",
        vendor: "FASTIFY",
        instance: fastifyApp,
      },
      databases: [
        // Example for MongoDB:
        // {
        //   vendor: "MONGOOSE",
        //   instance: new Mongoose(),
        //   connectionString: "mongodb://localhost/mydb",
        // }
      ],
    },
  },
});

await microservice.start({ port: 9000 });
```

---

## 10. Configuration and Environment Variables

- **Localization:** Place locale JSON files in `src/locales/` (e.g., `en.json`)
- **Environment Variables:**
  - `SERVICE_NAME` - Service name
  - `NODE_ENV` - Environment (development, production, test)
  - `CONNECTION_STRING` - Database connection string

---

## 11. Extending the Codebase (for Humans & AI)

- Add new features by creating new handlers, services, or repositories in the appropriate layer.
- Register all new classes in the DI container.
- Write tests for all new logic.
- Update YAML docs (`context.yaml`, `guidelines.yaml`, `patterns.yaml`, `mongodb.yaml`) with new patterns or conventions.

---

## 12. Documentation References

- [`context.yaml`](./context.yaml): Architecture, components, and project context
- [`guidelines.yaml`](./guidelines.yaml): Coding standards and best practices
- [`patterns.yaml`](./patterns.yaml): Design and usage patterns
- [`mongodb.yaml`](./mongodb.yaml): MongoDB schema guidelines

---

## 13. Contributing Workflow

### For Humans

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request
6. Ensure all tests pass and docs are updated

### For AI Agents

- Parse YAML docs for context and conventions
- Register new code in the DI container
- Add or update tests in `test/unit/`
- Update YAML docs with new features or patterns

---

## 14. License and Maintainers

- **License:** MIT License © 2025 Sentzunhat
- **Maintainer:** Diego Beltran ([LinkedIn](https://www.linkedin.com/in/diego-beltran))
- **Project URL:** [GitHub](https://github.com/sentzunhat/zacatl)

---

_For all details, see the YAML documentation files above. Zacatl is designed for seamless collaboration between humans and AI agents._
