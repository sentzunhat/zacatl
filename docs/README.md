# Zacatl Documentation

> **Modular TypeScript framework for building scalable microservices with pluggable ORM support**

**Environment:** Target Node.js 24+ LTS; Bun is optional and best used as a fast package manager.

## 🚀 Getting Started

**New to Zacatl?** Start here:

1. **[Quick Start](tutorials/quickstart.md)** - Get running in 5 minutes
2. **[Tutorials](tutorials/README.md)** - Step-by-step learning guides

## 📚 Documentation by Category

### Learning Tutorials

- [Installation](getting-started/installation.md) - Install and setup
- [Quick Start](tutorials/quickstart.md) - Get started in 5 minutes
- [Hello World](tutorials/hello-world.md) - Your first service
- [REST API](tutorials/rest-api.md) - Build HTTP services
- [Working with Databases](tutorials/working-with-databases.md) - Query data
- [Error Handling](tutorials/error-handling.md) - Handle errors gracefully
- [i18n](tutorials/i18n.md) - Multi-language support
- [Testing](tutorials/testing.md) - Write tests
- [First Service](tutorials/first-service.md) - Build a complete service
- [CLI App](tutorials/cli-app.md) - Build command-line tools

### Guides & How-Tos

- [Infrastructure Usage](guides/infrastructure-usage.md) - BaseRepository patterns
- [Dependency Injection](guides/dependency-injection.md) - DI with tsyringe
- [HTTP Service Scaffold](guides/http-service-scaffold.md) - AI-powered templates
- [Non-HTTP Setup](guides/non-http-setup.md) - CLI and workers
- [Dependencies Reference](guides/dependencies-reference.md) - External deps guide
- [Non-HTTP Elegant](guides/non-http-elegant.md) - Non-HTTP patterns
- [Single Import](guides/single-import.md) - Import patterns

### Reference Documentation

**[Complete Reference →](reference/README.md)**

- [API Reference](reference/api/README.md) - Service, Config, Errors, Logging, i18n, Repository
- [Architecture](reference/architecture/README.md) - Framework overview, multi-context design
- [ORM & Databases](reference/orm/README.md) - Database adapters, patterns, setup
- [Architecture Decisions](reference/architecture/decisions/) - Design decision records

### Migration & Upgrades

- [Migration Index](migration/index.md) - All migration guides
- [v0.0.26 → v0.0.32](migration/v0.0.26-to-v0.1.0.md) - Multi-context support (current)
- [v0.0.21 Migration](migration/v0.0.21.md) - Import shortcuts
- [v0.0.20 Migration](migration/v0.0.20.md) - Post-release migration
- [Prepare for v0.0.20](migration/prepare-v0.0.20.md) - Pre-release prep

### Development & Standards

- [AI Prompts](prompts/index.md) - Automation and AI assistance
- [Documentation Standards](standards/documentation.md) - Writing guidelines
- [Publish Checklist](standards/publish-checklist.md) - Release validation

### Testing

- [Testing Guide](testing/README.md) - Complete testing documentation
- [Setup](testing/01-setup.md) - Test environment setup
- [Basic Tests](testing/02-basic-tests.md) - Write your first tests
- [Mocking](testing/03-mocking.md) - Mock services and data
- [HTTP Testing](testing/04-http-testing.md) - Test API routes
- [Error Testing](testing/05-error-testing.md) - Test error scenarios
- [Organization](testing/06-test-organization.md) - Structure tests
- [Fixtures](testing/07-fixtures.md) - Test data fixtures
- [Async Testing](testing/08-async-testing.md) - Async patterns
- [Coverage](testing/09-coverage.md) - Code coverage
- [Best Practices](testing/10-best-practices.md) - Testing patterns

### Internal Documentation

- [Adapter Pattern](internal/adapter-pattern.md) - Implementation details
- [Agent Integration](internal/agent-integration-spec.md) - AI agent specs
- [Agent Prompts](internal/agent-prompt-template.md) - AI templates
- [Implementation Summary](internal/implementation-summary.md) - Progress snapshot
- [Express REST Roadmap](internal/express-rest-roadmap.md) - Express routing parity plan
- [Roadmap](internal/roadmap.md) - Future plans
- [CLI Module Spec](internal/cli-module-spec.md)
- [Desktop Module Spec](internal/desktop-module-spec.md)
- [Ujti Integration](internal/ujti-integration-analysis.md)

## 🏗️ Architecture Overview

````mermaid
graph TB
    subgraph "Your Application"
        A[Route Handlers] --> B[Domain Services]
        B --> C[Repositories]
    end

    subgraph "Zacatl Framework"
        C --> D[BaseRepository]
        D --> E[ORM Adapters]
    end

    subgraph "Databases"
        E --> F[(MongoDB)]
        E --> G[(PostgreSQL)]
        E --> H[(Your DB)]
    end

### Layer Architecture

```mermaid
graph LR
    A[Platform] --> B[Application]
    B --> C[Domain]
    C --> D[Infrastructure]

    style A fill:#e1f5ff
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9

- **Platform**: Server setup, DI container, lifecycle management
- **Application**: HTTP handlers, request validation, middleware
- **Domain**: Business logic (pure, framework-agnostic)
- **Infrastructure**: Repositories, database adapters, external services

## 🎯 Common Tasks

| Task                      | Documentation                                                    |
| ------------------------- | ---------------------------------------------------------------- |
| Get started quickly       | [Quick Start](getting-started/quickstart-simple.md)              |
| Connect to MongoDB        | [ORM - Mongoose](architecture/orm.md#mongoose-example)           |
| Connect to PostgreSQL     | [ORM - Sequelize](architecture/orm.md#sequelize-example)         |
| Add custom ORM adapter    | [ORM Architecture](architecture/orm-detailed.md)                 |
| Upgrade to new version    | [Migration Guide](migration/index.md)                            |
| Use multiple databases    | [Multi-ORM Setup](guides/multi-orm-setup.md)                     |
| Import from one place     | [Single Import System](guides/single-import.md)                  |
| Detect runtime (Node/Bun) | [Runtime helpers](../README.md#runtime-detection-helpers)        |

## 📖 Documentation by Experience Level

### Beginners

1. [Quick Start](getting-started/quickstart-simple.md) - Start here
2. [ORM Support](architecture/orm.md) - Connect your database
3. [Full Tutorial](getting-started/quickstart.md) - Learn by example

### Intermediate

1. [ORM Architecture](architecture/orm-detailed.md) - Understand the adapter pattern
2. [Migration Guide](migration/index.md) - Handle version changes
3. [Infrastructure Usage](guides/infrastructure-usage.md) - Advanced patterns

### Advanced

1. [ORM Architecture](architecture/orm-detailed.md) - Deep dive into adapters
2. [Multi-ORM Setup](guides/multi-orm-setup.md) - Multiple databases
3. [Internal Docs](internal/) - Framework internals and roadmap

## 💡 Quick Reference

### Connect to MongoDB

```typescript
import { BaseRepository } from "@sentzunhat/zacatl";
import { Schema } from "mongoose";

const schema = new Schema({ name: String, email: String });

class UserRepository extends BaseRepository<User, CreateUser, UserDTO> {
  constructor() {
    super({ type: "mongoose", name: "User", schema });
  }
}

````

→ [Full Guide](architecture/orm.md#mongoose-example)

### Connect to PostgreSQL

```typescript
import { BaseRepository } from "@sentzunhat/zacatl";
import { DataTypes, Model, Sequelize } from "sequelize";

const sequelize = new Sequelize("postgresql://user:pass@localhost/db");

class UserModel extends Model {
  declare id: string;
  declare name: string;
  declare email: string;
}

UserModel.init(
  {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
  },
  { sequelize, tableName: "users" },
);

class UserRepository extends BaseRepository<UserModel, CreateUser, UserDTO> {
  constructor() {
    super({ type: "sequelize", model: UserModel });
  }
}
```

→ [Full Guide](architecture/ORM.md#sequelize-example)

→ [Full Guide](architecture/ORM.md#sequelize-example)

## 🔗 External Resources

- **GitHub**: [sentzunhat/zacatl](https://github.com/sentzunhat/zacatl)
- **Issues**: [Report bugs](https://github.com/sentzunhat/zacatl/issues)
- **Examples**: [examples](./examples/README.md)

## 📄 License

MIT - See [LICENSE](../LICENSE) for details

---

**Questions?** Check the [getting started guide](getting-started/QUICKSTART_SIMPLE.md) or [open an issue](https://github.com/sentzunhat/zacatl/issues).
