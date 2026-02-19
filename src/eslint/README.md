# eslint

Flat ESLint config with naming, imports, and conventions rules.

→ Full docs: [../../docs/eslint/README.md](../../docs/eslint/README.md)

## Exports

recommended, baseConfig, importsConfig, namingConventions, fileNamingRules

## Quick use

```javascript
import { recommended } from "@sentzunhat/zacatl/eslint";
export default [...recommended];
```

---

# Zacatl ESLint Configuration

Shareable ESLint configurations for TypeScript projects following Hexagonal Architecture (Port-Adapter) patterns.

## Features

- ✅ **TypeScript-first**: Optimized for modern TypeScript projects
- ✅ **Hexagonal Architecture**: Enforces Port-Adapter naming conventions
- ✅ **Import Organization**: Consistent import ordering with `eslint-plugin-import`
- ✅ **Modular**: Use individual configs or combine them
- ✅ **Extensible**: Easy to override and extend with project-specific rules

## Installation

```bash
npm install --save-dev @sentzunhat/zacatl
```

### Peer Dependencies

Make sure you have these installed:

```bash
npm install --save-dev \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint \
  eslint-plugin-import \
  typescript-eslint
```

## Usage

### Quick Start (Recommended)

Use all Zacatl ESLint configs with sensible defaults:

```javascript
// eslint.config.mjs
import { recommended } from "@sentzunhat/zacatl/eslint";

export default [
  {
    ignores: ["build/**", "node_modules/**"],
  },
  ...recommended,
];
```

### Modular Approach

Pick and choose individual configurations:

```javascript
// eslint.config.mjs
import { baseConfig, namingConventions } from "@sentzunhat/zacatl/eslint";

export default [
  {
    ignores: ["build/**", "node_modules/**"],
  },
  baseConfig,
  namingConventions,
  // Add your own configs
];
```

### Individual Imports

```javascript
// eslint.config.mjs
import baseConfig from "@sentzunhat/zacatl/eslint/base";
import namingConventions from "@sentzunhat/zacatl/eslint/naming-conventions";
import importsConfig from "@sentzunhat/zacatl/eslint/imports";

export default [baseConfig, namingConventions, importsConfig];
```

## Available Configurations

### `baseConfig`

Core TypeScript linting rules with sensible defaults.

**Features:**

- TypeScript parser configuration
- Standard globals (`__dirname`, `process`, `console`)
- Empty interface support (for Ports)
- Function return type enforcement
- Unused variable warnings

**Import:**

```javascript
import { baseConfig } from "@sentzunhat/zacatl/eslint";
// or
import baseConfig from "@sentzunhat/zacatl/eslint/base";
```

### `namingConventions`

Enforces Hexagonal Architecture naming patterns.

**Patterns:**

- **Interfaces (Ports)**: `*Port` suffix for architectural boundaries
  - Examples: `UserRepositoryPort`, `LoggerServicePort`
- **Classes (Adapters)**: `*Adapter` suffix for implementations
  - Examples: `MongoUserRepositoryAdapter`, `PinoLoggerAdapter`
- **Type Aliases**: `Input`, `Output`, `Config`, `Document`, `Type` suffixes
  - Examples: `CreateUserInput`, `UserOutput`, `DatabaseConfig`
- **Error Classes**: `*Error` suffix
  - Examples: `ValidationError`, `NotFoundError`
- **Methods**: camelCase with verb+noun patterns
  - Examples: `findById()`, `validateUser()`, `loadAdapter()`

**Import:**

```javascript
import { namingConventions } from "@sentzunhat/zacatl/eslint";
// or
import namingConventions from "@sentzunhat/zacatl/eslint/naming-conventions";
```

### `importsConfig`

Enforces consistent import organization.

**Import Groups (in order):**

1. Built-in Node.js modules
2. External npm packages
3. Internal workspace imports (`src/**`)
4. Parent/sibling/index relative imports

**Features:**

- Alphabetical sorting within groups
- Newlines between groups
- Works with TypeScript path aliases

**Import:**

```javascript
import { importsConfig } from "@sentzunhat/zacatl/eslint";
// or
import importsConfig from "@sentzunhat/zacatl/eslint/imports";
```

### `recommended`

Combines all Zacatl configs for comprehensive linting.

**Import:**

```javascript
import { recommended } from "@sentzunhat/zacatl/eslint";
// or (default export)
import recommended from "@sentzunhat/zacatl/eslint";
```

## Extending Configurations

### Override Specific Rules

```javascript
import { recommended } from "@sentzunhat/zacatl/eslint";

export default [
  ...recommended,
  {
    files: ["src/**/*.ts"],
    rules: {
      "@typescript-eslint/naming-convention": "off", // Disable if needed
      "import/order": [
        "error",
        {
          /* custom config */
        },
      ],
    },
  },
];
```

### Add Project-Specific Configs

```javascript
import { recommended } from "@sentzunhat/zacatl/eslint";

export default [
  {
    ignores: ["build/**", "coverage/**", "*.config.js"],
  },
  ...recommended,
  {
    files: ["src/tests/**/*.ts"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },
];
```

### Combine with Other Configs

```javascript
import eslint from "@eslint/js";
import { recommended as zacatlRecommended } from "@sentzunhat/zacatl/eslint";

export default [
  eslint.configs.recommended,
  ...zacatlRecommended,
  // Your configs
];
```

## Naming Convention Examples

### ✅ Correct

```typescript
// Ports (interfaces)
interface UserRepositoryPort {
  findById(id: string): Promise<UserOutput>;
}

// Adapters (implementations)
class MongoUserRepositoryAdapter implements UserRepositoryPort {
  async findById(id: string): Promise<UserOutput> {
    // ...
  }
}

// Type aliases
type CreateUserInput = {
  email: string;
  password: string;
};

type UserOutput = {
  id: string;
  email: string;
};

// Error classes
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}
```

### ❌ Incorrect

```typescript
// Anti-patterns
interface IUserRepository {} // No I-prefix
class UserRepository {} // Missing Adapter suffix
type User = {}; // Missing Input/Output suffix
class ValidationException extends Error {} // Should be ValidationError
```

## Configuration Tips

1. **TypeScript Project Reference**: Ensure `parserOptions.project` points to your `tsconfig.json`:

   ```javascript
   {
     languageOptions: {
       parserOptions: {
         project: "./tsconfig.json",
       },
     },
   }
   ```

2. **Path Aliases**: Configure import resolution for aliases:

   ```javascript
   {
     rules: {
       "import/order": [
         "error",
         {
           pathGroups: [
             { pattern: "@app/**", group: "internal" },
           ],
         },
       ],
     },
   }
   ```

3. **Monorepo Support**: Adjust file patterns for monorepo structures:
   ```javascript
   {
     files: ["packages/*/src/**/*.ts"],
   }
   ```

## Migration Guide

### From Old Config (eslintrc)

Before:

```json
{
  "extends": ["plugin:@typescript-eslint/recommended"],
  "rules": {}
}
```

After:

```javascript
import { recommended } from "@sentzunhat/zacatl/eslint";

export default [
  ...recommended,
  // Your overrides
];
```

### From Local Config Files

If you have local ESLint config files in your project:

1. Install `@sentzunhat/zacatl`
2. Remove local config files
3. Import from `@sentzunhat/zacatl/eslint`
4. Add project-specific overrides if needed

## Troubleshooting

### "Cannot find module" errors

Ensure peer dependencies are installed:

```bash
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-import
```

### Naming convention errors

Review the [naming patterns](#naming-convention-examples) and adjust your code or override specific rules.

### Import ordering issues

Check that your `tsconfig.json` paths match the import configuration. Adjust `pathGroups` if needed.

## License

MIT

## Contributing

Contributions welcome! Please follow the existing patterns and add tests for new rules.

## Support

- **Issues**: https://github.com/sentzunhat/zacatl/issues
- **Docs**: https://github.com/sentzunhat/zacatl/tree/main/docs
