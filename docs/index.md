# Zacatl Documentation

Universal TypeScript framework for building CLI tools, desktop apps, APIs, and distributed systems.

## Quick Start

- **[Tutorials](./tutorials/README.md)** - Step-by-step learning guides
- **[Quick Start](./tutorials/quickstart.md)** - Get running in 5 minutes
- **[Reference](./reference/README.md)** - Complete API documentation
- **[Testing](./testing/README.md)** - Test your services

> **Package Managers**: The framework uses **npm** for development and testing. Examples use **Bun** for faster builds and native TypeScript support.

## 🎯 Multi-Context Support

Zacatl supports **three execution contexts** from a unified architecture:

- **CLI** - Command-line tools and automation scripts
- **DESKTOP** - Desktop applications (Neutralino, Electron)
- **SERVER** - HTTP/REST APIs and microservices

**See**: [Multi-Context Design](./reference/architecture/multi-context-design.md)
**Migration**: [v0.0.26 → v0.0.32 Guide](./migration/v0.0.26-to-v0.1.0.md)

## Documentation Sections

### Learning Path

- [Tutorials](./tutorials/README.md) - Step-by-step guides from hello-world to advanced
- [Quick Start](./tutorials/quickstart.md) - Get started in 5 minutes
- [Installation](./tutorials/installation.md) - Install Zacatl
- [Hello World](./tutorials/hello-world.md) - Your first service
- [REST API](./tutorials/rest-api.md) - Build HTTP services
- [Working with Databases](./tutorials/working-with-databases.md) - Query data
- [Error Handling](./tutorials/error-handling.md) - Handle errors
- [i18n](./tutorials/i18n.md) - Multi-language support
- [Testing](./tutorials/testing.md) - Write tests

### Guides & How-Tos

- [Service Adapter Pattern](./guides/service-adapter-pattern.md) - Canonical service implementation
- [DI Registration Patterns](./reference/di-registration-patterns.md) - Canonical DI registration
- [AI Agent Implementation](./guides/agent-implementation-guide.md) - Short agent checklist
- [Infrastructure Usage](./guides/infrastructure-usage.md) - BaseRepository patterns
- [Dependency Injection](./guides/dependency-injection.md) - DI with tsyringe
- [HTTP Service Scaffold](./guides/http-service-scaffold.md) - AI-powered project templates
- [Non-HTTP Setup](./guides/non-http-setup.md) - CLI and background workers
- [Dependencies Reference](./guides/dependencies-reference.md) - External dependencies guide

### Reference Documentation

- [API Reference](./reference/api/README.md) - Complete API documentation
- [Architecture](./reference/architecture/README.md) - System design and patterns
- [ORM & Databases](./reference/orm/README.md) - Database integration guide
- [Architecture Decisions](./reference/architecture/decisions/) - Design decision records

### Migration & Upgrades

- [Migration Guides](./migration/index.md)
- **[v0.0.26 → v0.1.0](./migration/v0.1.0-multicontext.md) - Multi-context support (current)**
- [v0.0.21 Migration](./migration/v0.0.21.md) - Import shortcuts
- [v0.0.20 Migration](./migration/v0.0.20.md)

### Development

- [AI Prompts](./prompts/index.md)
- [Documentation Standards](./standards/documentation.md)
- [Publish Checklist](./standards/publish-checklist.md)
- [Internal Specs](./internal/)

## Core Concepts

**Multi-Context Architecture**

- ServiceType enum: CLI | DESKTOP | SERVER
- Polymorphic entry points (cli, rest, ipc)
- Unified Application/Domain/Infrastructure layers
- Context-specific Platform configurations

**Layered Architecture**

- Application Layer - Entry points (routes, commands, IPC handlers)
- Domain Layer - Business logic (providers)
- Infrastructure Layer - Data access (repositories)
- Platform Layer - Service orchestration

**Key Features**

- Multiple contexts (CLI, Desktop, Server)
- Multiple adapters (Fastify/Express, Sequelize/Mongoose)
- Type-safe error handling with correlation IDs
- Configuration management (JSON/YAML)
- Structured logging (Pino)
- i18n/localization support
- Generic repository pattern

## Production Ready

**Test Coverage**: 178 tests, 61.6% coverage
**TypeScript**: Fully typed
**Node.js**: 24.x+
**Status**: v0.0.32

---

## 🎯 Quick Navigation by Use Case

### "I want to build a CLI tool"

1. [Multi-Context Design](./architecture/MULTI-CONTEXT-CLEANUP-DESIGN.md)
2. [Migration Guide v0.0.32](./migration/v0.0.26-to-v0.1.0.md) - See CLI example
3. [Examples - CLI App](./examples/02-cli-app.md)

### "I want to build a Desktop app"

1. [Multi-Context Design](./architecture/MULTI-CONTEXT-CLEANUP-DESIGN.md)
2. [Migration Guide v0.0.32](./migration/v0.0.26-to-v0.1.0.md) - See Desktop example
3. [Desktop Module Spec](./internal/desktop-module-spec.md) (future)

### "I want to build a REST API"

1. [Quick Start](./getting-started/quickstart.md)
2. [Examples - REST API](./examples/03-rest-api.md)
3. [Testing Guide](./testing/README.md)

### "I need to add a database"

1. [Database Setup](./getting-started/database-setup.md)
2. [Infrastructure Usage](./guides/infrastructure-usage.md)
3. [Multi-ORM Setup](./guides/multi-orm-setup.md)
4. [ORM Architecture](./architecture/orm.md)

### "I'm building a CLI app"

1. [AI Agent: Non-HTTP Services](./guides/ai-agent-non-http-setup.md)
2. [CLI Example](./examples/02-cli-app.md)
3. [First Service](./getting-started/first-service.md)

### "I want to scaffold a new HTTP service"

1. **[AI Agent: Scaffold HTTP Service](./guides/ai-agent-scaffold-http-service.md)** - Start here!
2. [Quick Start](./getting-started/quickstart.md)
3. [Examples - REST API](./examples/03-rest-api.md)

### "I need to test my code"

1. [Testing Guide](./testing/README.md)
2. [Testing Best Practices](./testing/10-best-practices.md)
3. [Testing Examples](./examples/07-testing.md)

### "I want to support multiple languages"

1. [i18n Example](./examples/06-i18n.md)
2. [i18n API](./api/i18n.md)

### "I'm migrating to v0.0.20"

1. [Migration Guide](./migration/v0.0.20.md)
2. [AI Migration Prompts](./prompts/migration.md)
3. [Type Safety Improvements](./migration/type-safety-improvements.md)

---

## 📊 Framework Statistics

- **178 unit tests** - Comprehensive test coverage
- **61.6% code coverage** - Statements, branches, functions
- **Zero compilation errors** - Strict TypeScript
- **Production ready** - Used in real services
- **Modular architecture** - Pick what you need

### Supported Platforms

- **Node.js** 24.x+ (LTS recommended)
- **Bun** 1.3+ (development/package management)

### Built-in Adapters

- **Servers**: Fastify, Express
- **Databases**: Sequelize (SQL), Mongoose (MongoDB)
- **Logging**: Pino
- **Validation**: Zod
- **i18n**: Filesystem, Memory adapters
- **DI Container**: tsyringe

---

## 🚀 Common Tasks Reference

### Install Zacatl

```bash
npm install @sentzunhat/zacatl
```

### Create a Route Handler

See [Building Route Handlers](./guides/ROUTE_HANDLERS.md)

### Create a Service

See [Building Services](./guides/SERVICES.md)

### Create a Repository

See [Building Repositories](./guides/REPOSITORIES.md)

### Write a Test

See [Testing Guide](./testing/README.md)

### Load Configuration

See [Configuration Management](./guides/CONFIGURATION.md)

### Setup Logging

See [Logging](./guides/LOGGING.md)

### Handle Errors

See [Error Handling](./guides/ERROR_HANDLING.md)

### Validate Input

See [Validation with Zod](./guides/VALIDATION.md)

### Setup i18n

See [i18n/Localization](./guides/I18N.md)

### Deploy to Production

See [Service Lifecycle](./advanced/SERVICE_LIFECYCLE.md)

---

## 📁 Directory Structure

```
docs/
├── INDEX.md (you are here)
├── FRAMEWORK_OVERVIEW.md
├── CODE_STANDARDS.md
├── CONTRIBUTING.md
├── EXTENDING.md
├── api-reference/
│   ├── README.md (API reference)
│   ├── service.md
│   ├── errors.md
│   ├── configuration.md
│   ├── logging.md
│   ├── i18n.md
│   └── repository.md
├── architecture/
│   ├── FUNDAMENTALS.md
│   ├── ORM_ARCHITECTURE.md
│   ├── ORM.md
│   ├── DEPENDENCY_INJECTION.md
│   └── ERROR_HANDLING.md
├── advanced/
│   ├── DEPENDENCY_INJECTION.md
│   ├── CUSTOM_ADAPTERS.md
│   ├── MIDDLEWARE.md
│   ├── MULTI_DATABASE.md
│   ├── SERVICE_LIFECYCLE.md
│   └── ERROR_TRACKING.md
├── guides/
│   ├── ROUTE_HANDLERS.md
│   ├── SERVICES.md
│   ├── REPOSITORIES.md
│   ├── CUSTOM_ADAPTERS.md
│   ├── VALIDATION.md
│   ├── ERROR_HANDLING.md
│   ├── CONFIGURATION.md
│   ├── LOGGING.md
│   ├── I18N.md
│   └── CODE_QUALITY.md
├── testing/
│   ├── README.md
│   ├── 01-setup.md
│   ├── 02-basic-tests.md
│   ├── 03-mocking.md
│   ├── 04-http-testing.md
│   ├── 05-error-testing.md
│   ├── 06-test-organization.md
│   ├── 07-fixtures.md
│   ├── 08-async-testing.md
│   ├── 09-coverage.md
│   └── 10-best-practices.md
├── examples/
│   ├── README.md
│   ├── 01-hello-world.md
│   ├── 02-cli-app.md
│   ├── 03-rest-api.md
│   ├── 04-database.md
│   ├── 05-error-handling.md
│   ├── 06-i18n.md
│   └── 07-testing.md
├── getting-started/
│   ├── README.md
│   ├── QUICKSTART_5MIN.md
│   ├── QUICKSTART_SIMPLE.md
│   ├── INSTALLATION.md
│   ├── first-service.md
│   └── database-setup.md
└── config/
    ├── (configuration examples)
```

---

## 🔗 External Resources

- **[GitHub Repository](https://github.com/sentzunhat/zacatl)**
- **[npm Package](https://www.npmjs.com/package/@sentzunhat/zacatl)**
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**
- **[Fastify Documentation](https://www.fastify.io/docs/latest/)**
- **[Zod Documentation](https://zod.dev/)**
- **[Vitest Documentation](https://vitest.dev/)**
- **[tsyringe Documentation](https://github.com/microsoft/tsyringe)**

---

## 💡 Tips for Success

1. **Start with the Quick Start** - Get a working example in 5 minutes
2. **Follow the structure** - Use the recommended directory layout
3. **Read the examples** - Real-world code patterns for common tasks
4. **Write tests early** - 61.6% coverage benchmark to follow
5. **Use TypeScript strictly** - Catch errors at compile time
6. **Check the error guide** - Use custom errors properly
7. **Test your code** - Use Vitest with the provided fixtures

---

## 🤝 Support

- 📖 Read the [Framework Overview](./FRAMEWORK_OVERVIEW.md)
- 🔍 Check the [API Reference](./api-reference/README.md)
- 💬 Search [GitHub Issues](https://github.com/sentzunhat/zacatl/issues)
- 🐛 Report issues on [GitHub](https://github.com/sentzunhat/zacatl)

---

**Version**: 0.0.32
**Last Updated**: 2026-02-07
**License**: MIT
**Maintainer**: Zacatl Contributors

## More Resources

- **[Examples](./examples/README.md)** - Practical patterns
- **[Testing](./testing/README.md)** - Vitest setup and patterns
- **[API Reference](./api-reference/README.md)** - Core APIs
- **[Contributing](./CONTRIBUTING.md)** - How to help
- **[License](../LICENSE)** - MIT

---

**Quick Links:**

- 🔗 [GitHub Repository](https://github.com/sentzunhat/zacatl)
- 📦 [npm Package](https://www.npmjs.com/package/@sentzunhat/zacatl)
- 💬 [Discussions](https://github.com/sentzunhat/zacatl/discussions)
- 🐛 [Report Issues](https://github.com/sentzunhat/zacatl/issues)
