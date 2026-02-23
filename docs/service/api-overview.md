# API Reference

Complete Zacatl API documentation.

## Service & Configuration

- [Service](api.md) - Service class configuration and methods
- [Configuration](../configuration/README.md) - Config options for all layers

## Platforms

- [Server Platform](./README.md) - HTTP, page, and database adapters

## Data Access

- [Repository](repository.md) - Generic repository pattern and methods

## Features

- [Logging](../logs/README.md) - Logging API
- [Localization](../localization/README.md) - Internationalization and localization
- [Errors](../error/README.md) - Error classes and handling

## Quick Reference

### Main Package (v0.0.21+)

```typescript
// Core exports
import { Service } from '@sentzunhat/zacatl';

// Import shortcuts (v0.0.21+)
import { BaseRepository, ORMType } from '@sentzunhat/zacatl/infrastructure';
import { NotFoundError, BadRequestError } from '@sentzunhat/zacatl/errors';
import { loadJSON, loadYML } from '@sentzunhat/zacatl/configuration';

// Full paths (still supported)
import { createLogger } from '@sentzunhat/zacatl';
```

---

**Start here**: [Service API →](./api.md)
