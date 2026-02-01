# API Reference

Complete API documentation for Zacatl framework.

## Core APIs

- **[Service](./service.md)** - Main service class
- **[Errors](./errors.md)** - Error handling
- **[Configuration](./configuration.md)** - Config loading
- **[Logging](./logging.md)** - Logger API
- **[i18n](./i18n.md)** - Internationalization
- **[Repository](./repository.md)** - Data access pattern

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
