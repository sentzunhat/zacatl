# Path Aliases

> ⚠️ **INTERNAL DEVELOPMENT ONLY**: The aliases documented here (`@zacatl/*`) are internal path aliases used **within the Zacatl repository** during development. These are **NOT available** to users of the `@sentzunhat/zacatl` package.
>
> **For users:** Import from explicit `@sentzunhat/zacatl/*` subpaths (no root barrel). See [Third-Party Dependencies](../third-party/README.md) and the [main README](../../README.md#-public-api-modules).

Zacatl uses TypeScript path aliases internally for cleaner imports during development.

## Keeping aliases and exports synchronized

- Run `npm run paths:generate` after moving or adding source modules. The generator maps source files to their current `@zacatl/*` paths, including the `utils/configuration` and `third-party/localization` modules.
- `npm run build` runs the local package export synchronizer. Package subpaths follow the current source layout; retired `/configuration`, `/localization`, `/eslint`, and `/dependency-injection` paths are not compatibility aliases.
- The public DI entry is `/third-party/dependency-injection`. Import only its documented exports; do not import internal helpers from `/third-party/dependency-injection/container`.

## Internal Aliases (Development Only)

### Core Modules

```typescript
import { loadJSON } from '@zacatl/utils/configuration';
import { registerDependency, resolveDependency } from '@zacatl/third-party/dependency-injection';
import { CustomError, BadRequestError } from '@zacatl/error';
import { configureI18nNode } from '@zacatl/third-party/localization';
import { logger } from '@zacatl/logs';
import { Service } from '@zacatl/service';
import { encode, generateHmac } from '@zacatl/utils';
```

### Architecture Layers

```typescript
import { Infrastructure } from '@zacatl/service/layers/infrastructure/infrastructure';
import { Domain } from '@zacatl/service/layers/domain/domain';
import { Application } from '@zacatl/service/layers/application/application';
import { Platforms } from '@zacatl/service/platforms/platforms';
import { BaseRepository } from '@zacatl/service/layers/infrastructure/repositories/sequelize/repository';
```

### Third-Party Re-Exports

```typescript
import { container, injectable } from '@zacatl/third-party';
import { z } from '@zacatl/third-party';
```

### ORM (Subpath Imports Only)

```typescript
// ORM packages are NOT in main exports - use subpath imports:
import { mongoose, Schema } from '@sentzunhat/zacatl/third-party/databases/mongoose';
import { Sequelize, DataTypes } from '@sentzunhat/zacatl/third-party/databases/sequelize';
```

## How Users Should Import

If you're using Zacatl in your project, import from the published package:

```typescript
// ✅ Correct - Public API imports
import { NotFoundError } from '@sentzunhat/zacatl/error';
import { Service, ServiceType } from '@sentzunhat/zacatl/service';
import { ServerVendor } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';
import { BaseRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/sequelize/repository';
import { mongoose } from '@sentzunhat/zacatl/third-party/databases/mongoose';

// ❌ Wrong - Internal aliases don't work in user projects
import { Service } from '@zacatl/service'; // This won't resolve
```

See the [main README](../../README.md) for complete import examples.

## Benefits (Internal Development)

### Before (Relative Paths)

```typescript
import { Service } from '../../../service/service';
import { BaseRepository } from '../../service/layers/infrastructure/repositories/sequelize/repository';
import { BadRequestError } from '../../../error/bad-request';
import { logger } from '../../../logs';
```

### After (Path Aliases)

```typescript
import { Service } from '@zacatl/service';
import { BaseRepository } from '@zacatl/service/layers/infrastructure/repositories/sequelize/repository';
import { BadRequestError } from '@zacatl/error';
import { logger } from '@zacatl/logs';
```

## Complete Reference

| Alias                          | Path                                 | Exports                    |
| ------------------------------ | ------------------------------------ | -------------------------- |
| `@zacatl/utils/configuration`  | `src/utils/configuration.ts` and `src/utils/configuration/` | Config loading, validation |
| `@zacatl/third-party/dependency-injection` | `src/third-party/dependency-injection.ts` | Public DI helpers |
| `@zacatl/error`                | `src/error/`                         | Error classes              |
| `@zacatl/third-party/localization` | `src/third-party/localization.ts` and `src/third-party/localization/` | i18n support |
| `@zacatl/logs`                 | `src/logs/`                          | Logging                    |
| `@zacatl/service`              | `src/service/`                       | Service class              |
| `@zacatl/utils`                | `src/utils/`                         | Utility functions          |
| `@zacatl/third-party`          | `src/third-party.ts`                 | tsyringe, zod re-exports   |
| `@zacatl/third-party/eslint-plugins` | `src/third-party/eslint-plugins.ts` | Vendor ESLint packages |
| `@zacatl/optionals`            | `src/utils/optionals.ts`             | Optional type helpers      |
| `@zacatl/service/layers/infrastructure/infrastructure` | `src/service/layers/infrastructure/infrastructure.ts` | Infrastructure layer bootstrapper |
| `@zacatl/service/layers/domain/domain` | `src/service/layers/domain/domain.ts` | Domain layer bootstrapper |
| `@zacatl/service/layers/application/application` | `src/service/layers/application/application.ts` | Application layer bootstrapper |
| `@zacatl/service/platforms/platforms` | `src/service/platforms/platforms.ts` | Platforms coordinator |

## Native Subpath Imports (`#/*`)

Node.js native subpath imports are configured in `package.json` alongside the TypeScript path aliases:

```json
{
  "imports": {
    "#/*": "./src/*"
  }
}
```

This allows import resolution without any TypeScript config or bundler:

```typescript
import { UserService } from '#/application/user.service';
import { requestContext } from '#/service/platforms/context';
```

> **Note:** `#/*` imports are for internal module use within the repository and are not exported in the published package.

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
