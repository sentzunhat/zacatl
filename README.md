# Zacatl Framework

[![npm version](https://img.shields.io/npm/v/@sentzunhat/zacatl.svg)](https://www.npmjs.com/package/@sentzunhat/zacatl)
[![npm downloads](https://img.shields.io/npm/dm/@sentzunhat/zacatl.svg)](https://www.npmjs.com/package/@sentzunhat/zacatl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-3178c6.svg)](https://www.typescriptlang.org/)
[![Node.js 24+](https://img.shields.io/badge/Node.js-24%2B-brightgreen.svg)](https://nodejs.org/)
[![Tests: 180](https://img.shields.io/badge/Tests-180-blue.svg)](#testing)
[![Coverage: 79%](https://img.shields.io/badge/Coverage-79%25-brightgreen.svg)](#testing)

**Production-ready TypeScript framework for building scalable microservices, APIs, and distributed systems.**

Zacatl enforces clean, layered architecture with dependency injection, validation, and comprehensive error handling—designed for both human developers and AI agents to collaborate effectively.

## ✨ Key Features

- **🏗️ Layered/Hexagonal Architecture** - Clean separation with Application, Domain, Infrastructure, and Platform layers
- **💉 Dependency Injection** - Built-in DI container using `tsyringe`
- **✅ Type-Safe Validation** - Full Zod schema support for requests/responses
- **🛡️ Structured Error Handling** - 7 custom error types with correlation IDs
- **🗄️ Pluggable ORM Adapters** - Sequelize, Mongoose, or build your own
- **🌐 Multi-Language Support** - Pluggable i18n with filesystem/memory adapters
- **🔌 Adapter Pattern** - Easy integration with any database or service
- **🧪 Comprehensive Testing** - 169 tests, 79% coverage, Vitest
- **⚡ Runtime Detection** - Works with Node.js 22+ and Bun
- **📝 Production Ready** - Structured logging, monitoring, and error tracking

## 📖 Documentation

- **[Full Documentation Index](./docs/INDEX.md)** - Complete guide and reference
- **[5-Minute Quick Start](./docs/getting-started/quickstart-5min.md)** - Get up and running fast
- **[Framework Overview](./docs/architecture/framework-overview.md)** - Architecture and concepts
- **[Installation Guide](./docs/getting-started/INSTALLATION.md)** - Setup instructions
- **[Testing Guide](./docs/testing/README.md)** - How to test your services
- **[Examples](./docs/examples/README.md)** - Practical patterns
- **[API Reference](./docs/api/README.md)** - Core APIs

## Ethical Use (Non-binding)

Zacatl is MIT-licensed (permissive). Please don’t use it to harm people.

## 🚀 Quick Start

### Install

```bash
npm install @sentzunhat/zacatl
```

## 📦 Import Options (v0.0.23+)

> **New in v0.0.23:** Dual-option import strategy. Choose convenience (main package) or minimal bundles (subpaths). [Import Guide](./docs/guides/orm-import-strategies.md)

```typescript
// Option 1: Main package (convenience - everything in one place)
import {
  Service,
  mongoose,
  Schema,
  Sequelize,
  singleton,
} from "@sentzunhat/zacatl";

// Option 2: Subpath imports (minimal - tree-shakeable)
import { Service } from "@sentzunhat/zacatl";
import { mongoose, Schema } from "@sentzunhat/zacatl/orm/mongoose";
import { resolveDependency } from "@sentzunhat/zacatl/application";

// Subpath shortcuts
import { BaseRepository, ORMType } from "@sentzunhat/zacatl/infrastructure";
import { CustomError } from "@sentzunhat/zacatl/errors";
import { loadConfig } from "@sentzunhat/zacatl/config";
```

### Hello World HTTP Service

```typescript
import Fastify from "fastify";
import { Service } from "@sentzunhat/zacatl";

const fastify = Fastify();

const service = new Service({
  architecture: {
    application: {
      entryPoints: { rest: { hookHandlers: [], routeHandlers: [] } },
    },
    domain: { providers: [] },
    infrastructure: { repositories: [] },
    server: {
      name: "hello-service",
      server: { type: "SERVER", vendor: "FASTIFY", instance: fastify },
    },
  },
});

await service.start({ port: 3000 });
```

### CLI / Desktop Application

```typescript
import { Service, resolveDependency } from "@sentzunhat/zacatl";

class MyService {
  doSomething = async () => console.log("Hello from CLI!");
}

const service = new Service({
  architecture: {
    domain: { providers: [MyService] },
  },
});

await service.start();
const myService = resolveDependency<MyService>("MyService");
await myService.doSomething();
```

## 🏗️ Architecture Layers

Zacatl implements **layered (hexagonal) architecture**:

```
┌─────────────────────────────────────────┐
│        Application Layer                │  HTTP handlers, validation, routes
├─────────────────────────────────────────┤
│        Domain Layer                     │  Business logic, services, models
├─────────────────────────────────────────┤
│        Infrastructure Layer             │  Repositories, database adapters
├─────────────────────────────────────────┤
│        Platform Layer                   │  DI container, service startup
└─────────────────────────────────────────┘
```

Each layer has a single responsibility and strict dependencies flow inward.

## 💾 Database Adapters

### Sequelize

```typescript
import { Sequelize } from "sequelize";
import { SequelizeAdapter } from "@sentzunhat/zacatl/adapters";

const sequelize = new Sequelize("postgresql://user:pass@localhost/db");

const service = new Service({
  architecture: {
    server: {
      databases: [
        {
          vendor: "SEQUELIZE",
          instance: sequelize,
        },
      ],
    },
  },
});
```

### MongoDB (Mongoose)

```typescript
import mongoose from "mongoose";

const service = new Service({
  architecture: {
    server: {
      databases: [
        {
          vendor: "MONGOOSE",
          instance: mongoose,
          connectionString: "mongodb://localhost/mydb",
        },
      ],
    },
  },
});
```

### Custom Repository Pattern

Implement `IRepository<T>` for any database:

```typescript
import { IRepository } from "@sentzunhat/zacatl";

class MyRepository<T> implements IRepository<T> {
  findById = async (id: string): Promise<T | null> => {
    /* ... */
  };
  findMany = async (filter: Record<string, unknown>): Promise<T[]> => {
    /* ... */
  };
  create = async (data: T): Promise<T> => {
    /* ... */
  };
  update = async (id: string, data: Partial<T>): Promise<void> => {
    /* ... */
  };
  delete = async (id: string): Promise<void> => {
    /* ... */
  };
  exists = async (id: string): Promise<boolean> => {
    /* ... */
  };
}
```

## 🌐 Internationalization

```typescript
import { createI18n, FilesystemAdapter } from "@sentzunhat/zacatl";

const i18n = createI18n();
const greeting = i18n.t("greeting"); // Loads from src/localization/locales/

await i18n.setLanguage("es");
const saludo = i18n.t("greeting"); // Translations loaded automatically
```

Place translation files in `src/localization/locales/`:

```json
// en.json
{ "greeting": "Hello {{name}}", "errors": { "notFound": "Not found" } }
```

```json
// es.json
{ "greeting": "Hola {{name}}", "errors": { "notFound": "No encontrado" } }
```

## ✅ Validation with Zod

```typescript
import { z } from "zod";
import { loadConfig } from "@sentzunhat/zacatl";

const AppConfigSchema = z.object({
  server: z.object({
    port: z.number().min(1).max(65535),
    host: z.string(),
  }),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

const config = loadConfig("./config/app.yaml", "yaml", AppConfigSchema);
```

## 🛡️ Error Handling

Zacatl includes 7 custom error types with built-in correlation IDs:

```typescript
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  InternalServerError,
  BadResourceError,
} from "@sentzunhat/zacatl";

throw new ValidationError("Email is required");
throw new NotFoundError("User not found", { userId: 123 });
```

## 🧪 Testing

Zacatl comes with **161 passing tests** and **79% coverage**:

```bash
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

Example test with mocking:

```typescript
import { describe, it, expect, vi } from "vitest";

describe("UserService", () => {
  it("should create a user", async () => {
    const mockRepo = { create: vi.fn().mockResolvedValue({ id: "1" }) };
    const service = new UserService(mockRepo as any);

    const result = await service.createUser({ name: "John" });

    expect(result.id).toBe("1");
    expect(mockRepo.create).toHaveBeenCalledOnce();
  });
});
```

## 🔍 Runtime Detection

Check which runtime you're using:

```typescript
import {
  detectRuntime,
  isBun,
  isNode,
  getRuntimeType,
  getRuntimeVersion,
} from "@sentzunhat/zacatl";

const runtime = detectRuntime();
console.log(runtime.type); // "node" | "bun" | "unknown"
console.log(runtime.version); // "22.11.0"

if (isNode()) {
  // Node.js specific code
}
```

## 📦 What's Included

```
src/
├── service/architecture/       # Core framework
│   ├── application/            # HTTP handlers, validation
│   ├── domain/                 # Business logic
│   ├── infrastructure/         # Repositories, adapters
│   └── platform/               # DI setup, server startup
├── configuration/              # Config loading & validation
├── error/                      # 7 custom error types
├── localization/               # i18n with adapters
├── logs/                       # Pino logging
└── utils/                      # Runtime detection, base64, HMAC
```

## 🛠️ Development

### Building

```bash
npm run build      # Compile TypeScript to build/
npm run build:watch # Watch mode
```

### Code Quality

```bash
npm run lint       # Run ESLint
npm run type:check # TypeScript checking
```

## 📋 Requirements

- **Node.js**: 24.0.0 or higher (LTS)
- **npm**: 10.0.0 or higher (bundled with Node 24)
- **TypeScript**: 5.9+ (we use 5.9.3)

Optional:

- **Bun**: Latest for fast package management (development only)

## 📄 License

[MIT License](./LICENSE) © 2025 Sentzunhat

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Add tests for your changes
4. Update documentation
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📞 Support

- 📖 [Documentation](./docs/INDEX.md)
- 🐛 [Issue Tracker](https://github.com/sentzunhat/zacatl/issues)
- 💬 [Discussions](https://github.com/sentzunhat/zacatl/discussions)

## 🙋 About

Zacatl is built for developers who value clean architecture, type safety, and test-driven development. It's equally useful for humans and AI agents building production services.

**Created by**: [Diego Beltran](https://www.linkedin.com/in/diego-beltran)  
**Repository**: https://github.com/sentzunhat/zacatl  
**npm**: https://www.npmjs.com/package/@sentzunhat/zacatl

## 🤖 Acknowledgments

This framework was built with assistance from **GitHub Copilot** and friendly ML/LLM models, demonstrating effective human-AI collaboration in software development.
