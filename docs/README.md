# Zacatl Documentation

> **Modular TypeScript framework for building scalable microservices with pluggable ORM support**

**Environment:** Target Node.js 24+ LTS; Bun is optional and best used as a fast package manager.

## 🚀 Getting Started

**New to Zacatl?** Start here:

1. **[Quick Start](getting-started/quickstart-simple.md)** - Get running in 5 minutes
2. **[Full Tutorial](getting-started/QUICKSTART.md)** - Complete setup guide with examples

## 📚 Documentation by Category

### Getting Started

- [Installation](getting-started/INSTALLATION.md) - Install and setup
- [Quick Start (5 min)](getting-started/quickstart-5min.md) - Fast setup with code examples
- [Simple Quick Start](getting-started/quickstart-simple.md) - Minimal example
- [Complete Tutorial](getting-started/QUICKSTART.md) - Comprehensive guide
- [First Service](getting-started/first-service.md) - Build your first service
- [Database Setup](getting-started/database-setup.md) - Connect to databases

### Examples

- [Hello World](examples/01-hello-world.md)
- [CLI App](examples/02-cli-app.md)
- [REST API](examples/03-rest-api.md)
- [Database](examples/04-database.md)
- [Error Handling](examples/05-error-handling.md)
- [i18n](examples/06-i18n.md)
- [Testing](examples/07-testing.md)

### Guides

- [Infrastructure Usage](guides/infrastructure-usage.md) - BaseRepository pattern
- [Multi-ORM Setup](guides/multi-orm-setup.md) - Multiple databases simultaneously
- [Single Import System](guides/single-import.md) - Import all from one place

### Architecture & Design

- [Framework Overview](architecture/framework-overview.md) - Core concepts
- [ORM Support](architecture/orm.md) - Database integration overview
- [ORM Architecture](architecture/orm-detailed.md) - In-depth adapter pattern design
- [Architecture Decisions](architecture/decisions/) - ADRs

### API Reference

- [Configuration](api/configuration.md)
- [Errors](api/errors.md)
- [i18n](api/i18n.md)
- [Logging](api/logging.md)
- [Repository](api/repository.md)
- [Service](api/service.md)

### Migration & Upgrades

- [Migration Index](migration/index.md) - All migration guides
- [v0.0.20 Migration](migration/v0.0.20.md) - Post-release migration
- [Prepare for v0.0.20](migration/prepare-v0.0.20.md) - Pre-release preparation
- [Type Safety Improvements](migration/type-safety-improvements.md)

### Development & Standards

- [AI Prompts](prompts/index.md) - Automation and AI assistance
- [Documentation Standards](standards/documentation.md) - Writing guidelines
- [Publish Checklist](standards/publish-checklist.md) - Release validation

### Testing

- [Testing Guide](testing/README.md) - Complete testing documentation
- [Setup](testing/01-setup.md) through [Best Practices](testing/10-best-practices.md)

### Internal Documentation

- [Adapter Pattern](internal/adapter-pattern.md) - Implementation details
- [Agent Integration](internal/agent-integration-spec.md) - AI agent specs
- [Agent Prompts](internal/agent-prompt-template.md) - AI templates
- [Implementation Summary](internal/implementation-summary.md) - Progress snapshot
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
