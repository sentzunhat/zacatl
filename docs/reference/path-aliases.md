# Path Aliases

Zacatl provides TypeScript path aliases for cleaner imports and better code organization.

## Available Aliases

### Core Modules

```typescript
import { loadConfig } from "@zacatl/configuration";
import { container } from "@zacatl/dependency-injection";
import { CustomError, BadRequestError } from "@zacatl/error";
import { createI18n } from "@zacatl/localization";
import { logger } from "@zacatl/logs";
import { detectRuntime } from "@zacatl/runtime";
import { Service } from "@zacatl/service";
import { hmac } from "@zacatl/utils";
```

### Architecture Layers

```typescript
import { BaseRepository } from "@zacatl/infrastructure";
import { BaseDomain } from "@zacatl/domain";
import { Application } from "@zacatl/application";
import { Server } from "@zacatl/platform";
```

### Third-Party Re-Exports

```typescript
import { container, injectable } from "@zacatl/third-party";
import { z } from "@zacatl/third-party";
```

### ORM (Subpath Imports Only)

```typescript
// ORM packages are NOT in main exports - use subpath imports:
import { mongoose, Schema } from "@sentzunhat/zacatl/third-party/mongoose";
import { Sequelize, DataTypes } from "@sentzunhat/zacatl/third-party/sequelize";
```

## Benefits

### Before (Relative Paths)

```typescript
import { Service } from "../../../service/architecture/platform/service";
import { BaseRepository } from "../../service/architecture/infrastructure/repositories/abstract";
import { BadRequestError } from "../../../error/bad-request";
import { logger } from "../../../logs";
```

### After (Path Aliases)

```typescript
import { Service } from "@zacatl/service";
import { BaseRepository } from "@zacatl/infrastructure";
import { BadRequestError } from "@zacatl/error";
import { logger } from "@zacatl/logs";
```

## Complete Reference

| Alias                          | Path                                       | Exports                    |
| ------------------------------ | ------------------------------------------ | -------------------------- |
| `@zacatl/configuration`        | `src/configuration/`                       | Config loading, validation |
| `@zacatl/dependency-injection` | `src/dependency-injection/`                | DI container utilities     |
| `@zacatl/error`                | `src/error/`                               | Error classes              |
| `@zacatl/localization`         | `src/localization/`                        | i18n support               |
| `@zacatl/logs`                 | `src/logs/`                                | Logging                    |
| `@zacatl/runtime`              | `src/runtime/`                             | Runtime detection          |
| `@zacatl/service`              | `src/service/`                             | Service class              |
| `@zacatl/utils`                | `src/utils/`                               | Utility functions          |
| `@zacatl/third-party`          | `src/third-party/`                         | tsyringe, zod re-exports   |
| `@zacatl/optionals`            | `src/optionals.ts`                         | Optional exports           |
| `@zacatl/infrastructure`       | `src/service/architecture/infrastructure/` | Infrastructure layer       |
| `@zacatl/domain`               | `src/service/architecture/domain/`         | Domain layer               |
| `@zacatl/application`          | `src/service/architecture/application/`    | Application layer          |
| `@zacatl/platform`             | `src/service/architecture/platform/`       | Platform layer             |

## Usage in Your Project

Path aliases are configured in `tsconfig.json` and work automatically in:

- TypeScript files
- Test files (via `vite.config.mjs`)
- Build process

## Migration from Relative Imports

If you have existing code with relative imports, replace them systematically:

```bash
# Find relative imports
grep -r "from ['\"]\.\./" src/

# Replace with aliases (example)
# Before: import { Service } from "../../../service";
# After:  import { Service } from "@zacatl/service";
```

## Related

- [Third-Party Dependencies](third-party.md)
- [ORM Documentation](orm/overview.md)
