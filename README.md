# Zacatl Framework

[![npm version](https://img.shields.io/npm/v/@sentzunhat/zacatl.svg)](https://www.npmjs.com/package/@sentzunhat/zacatl)
[![npm downloads](https://img.shields.io/npm/dm/@sentzunhat/zacatl.svg)](https://www.npmjs.com/package/@sentzunhat/zacatl)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-3178c6.svg)](https://www.typescriptlang.org/)
[![Node.js 24+](https://img.shields.io/badge/Node.js-24%2B-brightgreen.svg)](https://nodejs.org/)
[![Build](https://github.com/sentzunhat/zacatl/actions/workflows/publish-dry.yml/badge.svg)](https://github.com/sentzunhat/zacatl/actions/workflows/publish-dry.yml)
[![Tests: 461](https://img.shields.io/badge/Tests-461-blue.svg)](#tests)
[![Coverage: 75.95%](https://img.shields.io/badge/Coverage-75.95%25-yellow.svg)](https://img.shields.io/badge/Coverage-75.95%25-yellow.svg)

**Universal TypeScript framework for building APIs, CLI tools, and distributed systems.**

Zacatl enforces layered (hexagonal) architecture with built-in dependency injection, type-safe validation, and structured error handling — designed for both human developers and AI agents to collaborate effectively.

## ✨ What You Get

| Capability                  | Detail                                                         |
| --------------------------- | -------------------------------------------------------------- |
| 🏗️ Layered Architecture     | Strict Application → Domain → Infrastructure → Platform layers |
| 💉 Dependency Injection     | Built-in DI container via `tsyringe`                           |
| ✅ Type-Safe Validation     | Zod schema support; Yup and optional validation planned        |
| 🛡️ Structured Errors        | 7 custom error types with correlation IDs                      |
| 🗄️ Pluggable ORM Adapters   | Sequelize, Mongoose, built-in SQLite (Node 24+), or custom     |
| 🌐 Internationalization     | Pluggable i18n with filesystem/memory adapters                 |
| 📝 Production Observability | Structured logging and error tracking                          |
| 🧪 Tested                   | Vitest — test count and coverage shown in badges above         |

## 🏗️ Architecture

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

Dependencies flow strictly inward. The public API surface is stable; internal modules may change between minor versions.

## 🎯 Platform Support

| Platform      | Status              |
| ------------- | ------------------- |
| Server (HTTP) | Stable              |
| CLI           | Planned (stub only) |
| Desktop       | Planned (stub only) |

> For non-HTTP scripts and workers today, use the standalone DI helpers from `@sentzunhat/zacatl/dependency-injection` directly.

## 🚀 Quick Start

```bash
npm install @sentzunhat/zacatl
```

> Core server dependencies are installed with Zacatl. ORM/database adapters use optional peer dependencies (`mongoose`, `sequelize`, `better-sqlite3`, `sqlite3`, `pg`) that you install based on what your service uses.

```typescript
import Fastify from 'fastify';
import { Service, ServiceType, ServerType, ServerVendor } from '@sentzunhat/zacatl';

const fastify = Fastify();

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    application: { entryPoints: { rest: { hooks: [], routes: [] } } },
    domain: { services: [] },
    infrastructure: { repositories: [] },
  },
  platforms: {
    server: {
      name: 'hello-service',
      server: { type: ServerType.SERVER, vendor: ServerVendor.FASTIFY, instance: fastify },
    },
  },
});

await service.start({ port: 3000 });
```

See [examples/](./examples/) for production-ready starters (Express, Fastify × SQLite, Postgres, MongoDB × React, Svelte).

## 📦 Public API Modules

| Module                 | Import path                               |
| ---------------------- | ----------------------------------------- |
| Service                | `@sentzunhat/zacatl`                      |
| Configuration          | `@sentzunhat/zacatl/configuration`        |
| Dependency Injection   | `@sentzunhat/zacatl/dependency-injection` |
| Errors                 | `@sentzunhat/zacatl`                      |
| Logs                   | `@sentzunhat/zacatl`                      |
| Localization           | `@sentzunhat/zacatl`                      |
| Third-party re-exports | `@sentzunhat/zacatl/third-party/*`        |

## 📖 Documentation

Full docs live in **[`docs/`](./docs/README.md)**. New contributors start with **[START_HERE.md](./docs/START_HERE.md)**.

| Topic                 | Link                                                                             |
| --------------------- | -------------------------------------------------------------------------------- |
| Architecture Overview | [docs/guidelines/framework-overview.md](./docs/guidelines/framework-overview.md) |
| Service Module        | [docs/service/README.md](./docs/service/README.md)                               |
| Dependency Injection  | [docs/dependency-injection/README.md](./docs/dependency-injection/README.md)     |
| Configuration         | [docs/configuration/README.md](./docs/configuration/README.md)                   |
| Errors                | [docs/error/README.md](./docs/error/README.md)                                   |
| Logs                  | [docs/logs/README.md](./docs/logs/README.md)                                     |
| Localization          | [docs/localization/README.md](./docs/localization/README.md)                     |
| Third-Party + ORM     | [docs/third-party/README.md](./docs/third-party/README.md)                       |
| ESLint                | [docs/eslint/README.md](./docs/eslint/README.md)                                 |
| Utils                 | [docs/utils/README.md](./docs/utils/README.md)                                   |
| Release Notes         | [docs/changelog.md](./docs/changelog.md)                                         |

## 🧪 Testing

```bash
npm test                 # Run all tests
npm run test:coverage    # Coverage report
```

## 📋 Requirements

- **Node.js**: 24.14.0+ (LTS)
- **npm**: 11.0.0+ (bundled with Node 24)
- **TypeScript**: 5.9+

## 🤝 Contributing

1. Open an issue describing the change.
2. Branch off it: `git checkout -b issue-<number>/type/description`
3. Add tests, update docs, commit with [Conventional Commits](https://www.conventionalcommits.org/).

See [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for the full guide.

## 📄 License

[Apache License 2.0](./LICENSE) © 2025 Zacatl Contributors

> Zacatl is permissively licensed. Please don't use it to harm people.
