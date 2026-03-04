# Zacatl Framework

[![npm version](https://img.shields.io/npm/v/@sentzunhat/zacatl.svg)](https://www.npmjs.com/package/@sentzunhat/zacatl)
[![npm downloads](https://img.shields.io/npm/dm/@sentzunhat/zacatl.svg)](https://www.npmjs.com/package/@sentzunhat/zacatl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-3178c6.svg)](https://www.typescriptlang.org/)
[![Node.js 24+](https://img.shields.io/badge/Node.js-24%2B-brightgreen.svg)](https://nodejs.org/)
[![Build](https://github.com/sentzunhat/zacatl/actions/workflows/publish-dry.yml/badge.svg)](https://github.com/sentzunhat/zacatl/actions/workflows/publish-dry.yml)
[![Tests: 425](https://img.shields.io/badge/Tests-425-blue.svg)](#tests)
[![Coverage: 72.45%](https://img.shields.io/badge/Coverage-72.45%25-orange.svg)](https://img.shields.io/badge/Coverage-72.45%25-orange.svg)

**Universal TypeScript framework for building CLI tools, desktop apps, APIs, and distributed systems.**

Zacatl enforces clean, layered architecture with dependency injection, validation, and comprehensive error handling—designed for both human developers and AI agents to collaborate effectively.

## ✨ Key Features

- **🎯 Multi-Context Architecture** - Single codebase for CLI, Desktop, and Server applications
- **🏗️ Layered/Hexagonal Architecture** - Clean separation with Application, Domain, Infrastructure, and Platform layers
- **💉 Dependency Injection** - Built-in DI container using `tsyringe`
- **✅ Type-Safe Validation** - Full Zod schema support (with planned Yup and optional validation)
- **🛡️ Structured Error Handling** - 7 custom error types with correlation IDs
- **🗄️ Pluggable ORM Adapters** - Sequelize, Mongoose, or build your own
- **🌐 Multi-Language Support** - Pluggable i18n with filesystem/memory adapters
- **🔌 Adapter Pattern** - Easy integration with any database or service
- **🧪 Comprehensive Testing** - See the badges above for the current test count and coverage; Vitest
- **📝 Production Ready** - Structured logging, monitoring, and error tracking

## 🎯 Multi-Context Support

Build **CLI tools**, **Desktop apps**, and **HTTP servers** with the same architecture:

> **Platform availability:** CLI and Desktop platform adapters are planned; the HTTP server platform is the primary supported runtime. See [Service Module](./docs/service/README.md) for platform status and availability.

```typescript
import { Service, ServiceType } from "@sentzunhat/zacatl";

// CLI Application
const cli = new Service({
  type: ServiceType.CLI,
  layers: {
    application: { entryPoints: { cli: { commands: [...] } } },
    domain: { services: [...] },
    infrastructure: { repositories: [...] },
  },
  platforms: {
    cli: { name: "my-tool", version: "1.0.0" },
  },
});

// Desktop Application
const desktop = new Service({
  type: ServiceType.DESKTOP,
  layers: {
    application: { entryPoints: { ipc: { handlers: [...] } } },
    domain: { services: [...] },
    infrastructure: { repositories: [...] },
  },
  platforms: {
    desktop: { window: { title: "My App", width: 1024, height: 768 }, platform: "neutralino" },
  },
});

// HTTP Server (default)
const server = new Service({
  type: ServiceType.SERVER, // Optional: defaults to SERVER
  layers: {
    application: { entryPoints: { rest: { hooks: [...], routes: [...] } } },
    domain: { services: [...] },
    infrastructure: { repositories: [...] },
  },
  platforms: {
    server: {
      name: "my-service",
      server: { type: ServerType.SERVER, vendor: ServerVendor.FASTIFY, instance: fastify }
    },
  },
});
```

## Platform Support Status

| Platform | Status              |
| -------- | ------------------- |
| Server   | Stable              |
| CLI      | Planned (stub only) |
| Desktop  | Planned (stub only) |

## Service Configuration (notable options)

- `run.auto`: When `true`, the `Service` will attempt to start automatically when `start()` is invoked without additional manual orchestration. Defaults to `false` when omitted. This option is part of the `ConfigService` root config; see the `service` docs for full configuration examples.

## Public API Surface

The following modules are considered the stable, public surface of Zacatl:

- `configuration`
- `service`
- `dependency-injection`
- `error`
- `logs`
- `localization`
- `third-party/*`

## What Zacatl Does NOT Do

- Zacatl is not an end-user UI framework; Desktop and CLI adapters are planned and currently implemented as minimal stubs.

## Architectural Guarantees

- Layered / hexagonal architecture with strict inward dependency flow.
- Public API surface is stable; internal modules may change between minor versions.

## 📖 Documentation

Full documentation lives in **[`docs/`](./docs/README.md)**.

- **[Architecture Overview](./docs/guidelines/framework-overview.md)** - System design and module map
- **[Release Notes](./docs/changelog.md)** - Version history and changes
- **[Service Module](./docs/service/README.md)** - Service configuration and platform APIs
- **[Dependency Injection](./docs/dependency-injection/README.md)** - DI patterns and container usage
- **[Configuration](./docs/configuration/README.md)** - Configuration loading
- **[Errors](./docs/error/README.md)** - Error types and usage
- **[Logs](./docs/logs/README.md)** - Logging adapters and patterns
- **[Localization](./docs/localization/README.md)** - i18n usage and adapters
- **[Third-Party + ORM](./docs/third-party/README.md)** - Re-exports and ORM guidance
- **[ESLint](./docs/eslint/README.md)** - Shared ESLint configuration
- **[Utils](./docs/utils/README.md)** - Utility helpers and path aliases
- **[Examples](./examples/)** - Production-ready example applications

## 🌱 Ethical Use (Non-binding)

Zacatl is MIT-licensed (permissive). Please don’t use it to harm people.

## 🚀 Quick Start

### Install

```bash
npm install @sentzunhat/zacatl
```

> All supported ORMs and platforms (`mongoose`, `sequelize`, `express`, `fastify`, `better-sqlite3`) are bundled — a single install is enough. Only SQL dialect drivers need a separate install:

```bash
npm install pg pg-hstore   # PostgreSQL
npm install mysql2         # MySQL
```

Validate your environment with:

```bash
npm run check:peers
```

### Hello World HTTP Service

```typescript
import Fastify from 'fastify';
import { Service } from '@sentzunhat/zacatl';

const fastify = Fastify();

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    application: {
      entryPoints: { rest: { hooks: [], routes: [] } },
    },
    domain: { services: [] },
    infrastructure: { repositories: [] },
  },
  platforms: {
    server: {
      name: 'hello-service',
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify,
      },
    },
  },
});

await service.start({ port: 3000 });
```

### CLI / Desktop Application

```typescript
import { Service, resolveDependency } from '@sentzunhat/zacatl';

class MyService {
  doSomething = async () => console.log('Hello from CLI!');
}

const service = new Service({
  type: ServiceType.CLI,
  layers: {
    domain: { services: [MyService] },
  },
  platforms: {
    cli: { name: 'my-cli', version: '1.0.0' },
  },
});

await service.start();
const myService = resolveDependency<MyService>('MyService');
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

Each layer has a single responsibility, and dependencies flow strictly inward.

## 💾 Database Adapters

### Sequelize

```typescript
import { Sequelize } from 'sequelize';
import { Service } from '@sentzunhat/zacatl';

const sequelize = new Sequelize('postgresql://user:pass@localhost/db');

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    application: { entryPoints: { rest: { hooks: [], routes: [] } } },
    domain: { services: [] },
    infrastructure: { repositories: [] },
  },
  platforms: {
    server: {
      name: 'my-service',
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify,
      },
      databases: [
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: sequelize,
        },
      ],
    },
  },
});
```

### MongoDB (Mongoose)

```typescript
import mongoose from 'mongoose';
import { Service } from '@sentzunhat/zacatl';

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    application: { entryPoints: { rest: { hooks: [], routes: [] } } },
    domain: { services: [] },
    infrastructure: { repositories: [] },
  },
  platforms: {
    server: {
      name: 'my-service',
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify,
      },
      databases: [
        {
          vendor: DatabaseVendor.MONGOOSE,
          instance: mongoose,
          connectionString: 'mongodb://localhost/mydb',
        },
      ],
    },
  },
});
```

### Custom Repository Pattern

Implement `IRepository<T>` for any database:

```typescript
import { IRepository } from '@sentzunhat/zacatl';

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
import { createI18n, FilesystemAdapter } from '@sentzunhat/zacatl';

const i18n = createI18n();
const greeting = i18n.t('greeting'); // Loads from src/localization/locales/

await i18n.setLanguage('es');
const saludo = i18n.t('greeting'); // Translations loaded automatically
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
import { z } from 'zod';
import { loadConfig } from '@sentzunhat/zacatl';

const AppConfigSchema = z.object({
  server: z.object({
    port: z.number().min(1).max(65535),
    host: z.string(),
  }),
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const config = loadConfig('./config/app.yaml', 'yaml', AppConfigSchema);
```

> **Coming Soon**: Yup support and optional validation for maximum flexibility. See [Roadmap: Schema Validation Flexibility](docs/roadmap/index.md#schema-validation-flexibility-v0040--v010).

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
} from '@sentzunhat/zacatl';

throw new ValidationError({ message: 'Email is required' });
throw new NotFoundError({ message: 'User not found', metadata: { userId: 123 } });
```

## 🧪 Testing

Zacatl's test count and coverage are shown in the badges at the top of this README. Run the commands below to run tests and generate coverage:

```bash
npm test                 # Run all tests
npm run test:coverage   # Coverage report
```

## 📦 What's Included

```
src/
├── configuration/              # Config loading & validation
├── dependency-injection/       # DI container and helpers
├── error/                      # Error types
├── eslint/                     # Shared ESLint configs
├── localization/               # i18n adapters and helpers
├── logs/                       # Logging adapters
├── service/                    # Service layers and platforms
├── third-party/                # Re-exported dependencies
└── utils/                      # Utility helpers
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
- **npm**: 11.0.0 or higher (bundled with Node 24)
- **TypeScript**: 5.9+ (we use 5.9.3)

## 📄 License

[MIT License](./LICENSE) © 2025 Zacatl Contributors

## 🤝 Contributing

1. Open an issue describing the change.
2. Create a branch tied to it: `git checkout -b issue-<number>/type/description`
   - Examples: `issue-42/feat/add-forbidden-error`, `issue-5/docs/update-readme`
3. Add tests for your changes.
4. Update documentation.
5. Commit with [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m 'feat(error): add ForbiddenError'`
6. Push and open a PR referencing the issue.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

> **Local install tip:** use `npm install --ignore-scripts` to skip lifecycle scripts when you only want to install deps.

## 📞 Support

- 📖 [Documentation](./docs/guidelines/framework-overview.md)
- 🐛 [Issue Tracker](https://github.com/sentzunhat/zacatl/issues)
- 💬 [Discussions](https://github.com/sentzunhat/zacatl/discussions)

## 🙋 About

Zacatl is built for developers who value clean architecture, type safety, and test-driven development. It's equally useful for humans and AI agents building production services.

**Repository**: https://github.com/sentzunhat/zacatl
**npm**: https://www.npmjs.com/package/@sentzunhat/zacatl

## 🤖 Acknowledgments

This framework was built with assistance from **GitHub Copilot** and friendly ML/LLM models, demonstrating effective human-AI collaboration in software development.
