# Path Aliases

> ⚠️ **INTERNAL DEVELOPMENT ONLY**: The aliases documented here (`@zacatl/*`) are internal path aliases used **within the Zacatl repository** during development. These are **NOT available** to users of the `@sentzunhat/zacatl` package.
>
> **For users:** Import from `@sentzunhat/zacatl` and its subpaths as shown in [Third-Party Dependencies](../third-party/README.md).

Zacatl uses TypeScript path aliases internally for cleaner imports during development.

## Internal Aliases (Development Only)

### Core Modules

```typescript
import { loadJSON } from '@zacatl/configuration';
import { registerDependency, resolveDependency } from '@zacatl/dependency-injection';
import { CustomError, BadRequestError } from '@zacatl/error';
import { configureI18nNode } from '@zacatl/localization';
import { logger } from '@zacatl/logs';
import { Service } from '@zacatl/service';
import { encode, generateHmac } from '@zacatl/utils';
```

### Architecture Layers

```typescript
import { BaseRepository } from '@zacatl/infrastructure';
import { Domain } from '@zacatl/domain';
import { Application } from '@zacatl/application';
import { Platforms } from '@zacatl/platform';
```

### Third-Party Re-Exports

```typescript
import { container, injectable } from '@zacatl/third-party';
import { z } from '@zacatl/third-party';
```

### ORM (Subpath Imports Only)

```typescript
// ORM packages are NOT in main exports - use subpath imports:
import { mongoose, Schema } from '@sentzunhat/zacatl/third-party/mongoose';
import { Sequelize, DataTypes } from '@sentzunhat/zacatl/third-party/sequelize';
```

## How Users Should Import

If you're using Zacatl in your project, import from the published package:

```typescript
// ✅ Correct - Public API imports
import { Service, ServiceType, ServerVendor } from '@sentzunhat/zacatl';
import { BaseRepository } from '@sentzunhat/zacatl/infrastructure';
import { NotFoundError } from '@sentzunhat/zacatl/errors';
import { mongoose } from '@sentzunhat/zacatl/third-party/mongoose';

// ❌ Wrong - Internal aliases don't work in user projects
import { Service } from '@zacatl/service'; // This won't resolve
```

See the [main README](../../README.md) for complete import examples.

## Benefits (Internal Development)

### Before (Relative Paths)

```typescript
import { Service } from '../../../service/service';
import { BaseRepository } from '../../service/layers/infrastructure/repositories/abstract';
import { BadRequestError } from '../../../error/bad-request';
import { logger } from '../../../logs';
```

### After (Path Aliases)

```typescript
import { Service } from '@zacatl/service';
import { BaseRepository } from '@zacatl/infrastructure';
import { BadRequestError } from '@zacatl/error';
import { logger } from '@zacatl/logs';
```

## Complete Reference

| Alias                          | Path                                 | Exports                    |
| ------------------------------ | ------------------------------------ | -------------------------- |
| `@zacatl/configuration`        | `src/configuration/`                 | Config loading, validation |
| `@zacatl/dependency-injection` | `src/dependency-injection/`          | DI container utilities     |
| `@zacatl/error`                | `src/error/`                         | Error classes              |
| `@zacatl/localization`         | `src/localization/`                  | i18n support               |
| `@zacatl/logs`                 | `src/logs/`                          | Logging                    |
| `@zacatl/service`              | `src/service/`                       | Service class              |
| `@zacatl/utils`                | `src/utils/`                         | Utility functions          |
| `@zacatl/third-party`          | `src/third-party/`                   | tsyringe, zod re-exports   |
| `@zacatl/optionals`            | `src/optionals.ts`                   | Optional exports           |
| `@zacatl/infrastructure`       | `src/service/layers/infrastructure/` | Infrastructure layer       |
| `@zacatl/domain`               | `src/service/layers/domain/`         | Domain layer               |
| `@zacatl/application`          | `src/service/layers/application/`    | Application layer          |
| `@zacatl/platform`             | `src/service/platforms/`             | Platform layer             |

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

- [Third-Party Dependencies](../third-party/README.md)
- [ORM Documentation](../third-party/orm/overview.md)
