# Zacatl Microservice Framework

[![npm version](https://img.shields.io/npm/v/@sentzunhat/zacatl.svg)](https://www.npmjs.com/package/@sentzunhat/zacatl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)

A modular, high-performance TypeScript microservice framework for Node.js, featuring layered architecture, dependency injection, and robust validation for building scalable APIs and distributed systems.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Core Concepts](#core-concepts)
- [Configuration](#configuration)
- [Testing](#testing)
- [Contributing](#contributing)
- [Documentation](#documentation)
- [License](#license)

## Overview

Zacatl is a TypeScript-first microservice framework that enforces clean, layered (hexagonal) architecture with strict separation of concerns. It's designed for rapid development of robust APIs and distributed systems, with built-in support for dependency injection, validation, and seamless collaboration between human and AI contributors.

## Key Features

- **🏗️ Layered Architecture**: Clean separation with Application, Domain, Infrastructure, and Platform layers
- **💉 Dependency Injection**: Built-in DI container using `tsyringe` for better modularity
- **⚡ High Performance**: Built on Fastify for maximum speed and efficiency
- **🔍 Type Safety**: Full TypeScript support with strict typing and generics
- **✅ Validation**: Request/response validation using Zod schemas
- **🧪 Testing**: Comprehensive testing with Vitest and clear test structure
- **📊 MongoDB Support**: Built-in repository pattern with Mongoose integration
- **🌐 Internationalization**: Multi-language support with i18n
- **🚀 Production Ready**: Error handling, logging, and monitoring built-in

## Installation

Install Zacatl using npm:

```bash
npm install @sentzunhat/zacatl
```

Or with yarn:

```bash
yarn add @sentzunhat/zacatl
```

## Quick Start

Here's a minimal example to get you started:

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

For a complete example with route handlers, see our [examples](./examples) directory.

## Project Structure

```
src/
├── configuration.ts         # App configuration and environment settings
├── logs.ts                  # Structured logging with Pino
├── optionals.ts             # Optional utility types and helpers
├── error/                   # Custom error classes (BadRequest, NotFound, etc.)
├── locales/                 # Internationalization files (en.json, fr.json)
├── micro-service/
│   └── architecture/
│       ├── application/     # HTTP entry points, validation, route handlers
│       ├── domain/          # Business logic, models, services (pure)
│       ├── infrastructure/  # Database repositories, external adapters
│       └── platform/        # Service orchestration, DI setup, startup
└── utils/                   # Utility functions (base64, hmac, etc.)

test/
└── unit/                    # Unit tests mirroring src/ structure
```

### Layer Responsibilities

- **Application Layer**: Handles HTTP requests, validation, and delegates to domain logic
- **Domain Layer**: Contains pure business logic, models, and services (no infrastructure dependencies)
- **Infrastructure Layer**: Manages persistence (MongoDB repositories) and external integrations
- **Platform Layer**: Bootstraps the application, configures DI container, and starts the server

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
