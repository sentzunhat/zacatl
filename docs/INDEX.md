# Zacatl Documentation

TypeScript microservice framework for building production-ready services.

## Quick Start

- **[Getting Started](./getting-started/README.md)** - Install and create your first service
- **[Examples](./examples/README.md)** - Practical code examples
- **[API Reference](./api/README.md)** - Complete API documentation
- **[Testing](./testing/README.md)** - Test your services

## Documentation Sections

### Getting Started

- [Installation](./getting-started/INSTALLATION.md)
- [Quick Start](./getting-started/QUICKSTART.md)
- [5-Minute Quick Start](./getting-started/quickstart-5min.md)
- [First Service](./getting-started/first-service.md)
- [Database Setup](./getting-started/database-setup.md)

### Guides

- [Infrastructure Usage](./guides/infrastructure-usage.md) - BaseRepository pattern
- [Multi-ORM Setup](./guides/multi-orm-setup.md) - Multiple databases
- [Single Import System](./guides/single-import.md) - Import all from one place

### Architecture

- [Framework Overview](./architecture/framework-overview.md)
- [ORM Architecture](./architecture/orm.md)
- [ORM Detailed](./architecture/orm-detailed.md)
- [Architecture Decisions](./architecture/decisions/)

### API Reference

- [Configuration](./api/configuration.md)
- [Errors](./api/errors.md)
- [i18n](./api/i18n.md)
- [Logging](./api/logging.md)
- [Repository](./api/repository.md)
- [Service](./api/service.md)

### Migration & Upgrades

- [Migration Guides](./migration/index.md)
- [v0.0.20 Migration](./migration/v0.0.20.md)
- [Prepare for v0.0.20](./migration/prepare-v0.0.20.md)

### Development

- [AI Prompts](./prompts/index.md)
- [Documentation Standards](./standards/documentation.md)
- [Publish Checklist](./standards/publish-checklist.md)
- [Internal Specs](./internal/)

## Core Concepts

**Layered Architecture**

- Application Layer - HTTP handlers
- Domain Layer - Business logic
- Infrastructure Layer - Data access
- Platform Layer - Service orchestration

**Key Features**

- Multiple adapters (Fastify/Express, Sequelize/Mongoose)
- Type-safe error handling with correlation IDs
- Configuration management (JSON/YAML)
- Structured logging (Pino)
- i18n/localization support
- Generic repository pattern

## Production Ready

**Test Coverage**: 161 tests, 79% coverage  
**TypeScript**: Fully typed  
**Node.js**: 22.x+  
**Status**: v0.0.20

---

## 🎯 Quick Navigation by Use Case

### "I want to build a REST API"

1. [5-Minute Quick Start](./getting-started/quickstart-5min.md)
2. [Examples - REST API](./examples/03-rest-api.md)
3. [Testing Guide](./testing/README.md)

### "I need to add a database"

1. [Database Setup](./getting-started/database-setup.md)
2. [Infrastructure Usage](./guides/infrastructure-usage.md)
3. [Multi-ORM Setup](./guides/multi-orm-setup.md)
4. [ORM Architecture](./architecture/orm.md)

### "I'm building a CLI app"

1. [CLI Example](./examples/02-cli-app.md)
2. [First Service](./getting-started/first-service.md)

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

- **161 unit tests** - Comprehensive test coverage
- **79% code coverage** - Statements, branches, functions
- **Zero compilation errors** - Strict TypeScript
- **Production ready** - Used in real services
- **Modular architecture** - Pick what you need

### Supported Platforms

- **Node.js** 22.x+ (LTS recommended)
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
4. **Write tests early** - 79% coverage benchmark to follow
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

**Version**: 0.0.20  
**Last Updated**: 2026  
**License**: MIT  
**Maintainer**: [Diego Beltran](https://www.linkedin.com/in/diego-beltran)

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
