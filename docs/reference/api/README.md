# API Reference

Complete Zacatl API documentation.

## Service & Configuration

- [Service](service.md) - Service class configuration and methods
- [Configuration](configuration.md) - Config options for all layers

## Platforms

- [Server](server.md) - Server platform API (HTTP, page, database)

## Data Access

- [Repository](repository.md) - Generic repository pattern and methods

## Features

- [Logging](logging.md) - Logging API
- [i18n](i18n.md) - Internationalization and localization
- [Errors](errors.md) - Error classes and handling

## Quick Reference

### Main Package (v0.0.21+)

```typescript
// Core exports
import { Service } from "@sentzunhat/zacatl";

// Import shortcuts (v0.0.21+)
import { BaseRepository, ORMType } from "@sentzunhat/zacatl/infrastructure";
import { NotFoundError, BadRequestError } from "@sentzunhat/zacatl/errors";
import { loadConfig } from "@sentzunhat/zacatl/config";

// Full paths (still supported)
import { createLogger } from "@sentzunhat/zacatl";
import { createI18n } from "@sentzunhat/zacatl";
```

See [v0.0.21 Migration Guide](../migration/v0.0.21.md) for all available import shortcuts.

---

**Start here**: [Service API →](./service.md)
