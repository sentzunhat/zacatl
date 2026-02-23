# ESLint Configuration Guide

This guide explains how to use Zacatl's shared ESLint configurations in your projects.

## Overview

Zacatl provides modular, shareable ESLint configurations optimized for TypeScript projects following Hexagonal Architecture patterns. These configs enforce:

- **Port-Adapter naming conventions** for interfaces and implementations
- **Consistent import ordering** with automatic sorting
- **TypeScript best practices** for modern Node.js applications

## Quick Start

### 1. Install Dependencies

In your project, ensure you have the required peer dependencies:

```bash
npm install --save-dev \
  @sentzunhat/zacatl \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint \
  eslint-plugin-import \
  typescript-eslint
```

### 2. Create ESLint Configuration

Create an `eslint.config.mjs` file in your project root:

```javascript
// eslint.config.mjs
import { recommended } from '@sentzunhat/zacatl/eslint';

export default [
  {
    ignores: ['build/**', 'node_modules/**', 'coverage/**', '*.config.js', '*.config.mjs'],
  },
  ...recommended,
];
```

### 3. Add Scripts to package.json

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### 4. Run ESLint

```bash
npm run lint
```

## Available Configurations

Zacatl provides four modular ESLint configurations:

### 1. `recommended` (All configs combined)

The easiest way to get started with all Zacatl ESLint rules.

```javascript
import { recommended } from '@sentzunhat/zacatl/eslint';

export default [...recommended];
```

### 2. `baseConfig` (Core TypeScript rules)

Fundamental TypeScript linting rules.

```javascript
import { baseConfig } from '@sentzunhat/zacatl/eslint';

export default [baseConfig];
```

**Includes:**

- TypeScript parser configuration
- Unused variable warnings
- Empty interface support (for Ports)
- Function return type warnings
- Standard Node.js globals

### 3. `namingConventions` (Hexagonal Architecture patterns)

Enforces Port-Adapter naming conventions.

```javascript
import { namingConventions } from '@sentzunhat/zacatl/eslint';

export default [namingConventions];
```

**Enforces:**

- Interfaces: `*Port` suffix for architectural boundaries
- Classes: `*Adapter` suffix for implementations
- Type aliases: `Input`, `Output`, `Config`, `Document`, `Type` suffixes
- Error classes: `*Error` suffix
- Methods: camelCase with verb+noun patterns

### 4. `importsConfig` (Import organization)

Automatically organizes and sorts imports.

```javascript
import { importsConfig } from '@sentzunhat/zacatl/eslint';

export default [importsConfig];
```

**Features:**

- Groups imports by type (builtin, external, internal, relative)
- Alphabetical sorting within groups
- Newlines between import groups
- Works with TypeScript path aliases

## Customization Examples

### Override Specific Rules

```javascript
import { recommended } from '@sentzunhat/zacatl/eslint';

export default [
  ...recommended,
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/naming-convention': 'warn', // Change to warning
    },
  },
];
```

### Project-Specific Rules for Test Files

```javascript
import { recommended } from '@sentzunhat/zacatl/eslint';

export default [
  ...recommended,
  {
    files: ['test/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
```

### Mix and Match Configs

```javascript
import { baseConfig, importsConfig } from '@sentzunhat/zacatl/eslint';

export default [
  baseConfig,
  importsConfig,
  // Skip naming conventions if not using Hexagonal Architecture
  {
    files: ['src/**/*.ts'],
    rules: {
      // Your custom rules
    },
  },
];
```

### Add Path Aliases Support

```javascript
import { recommended } from '@sentzunhat/zacatl/eslint';

export default [
  ...recommended,
  {
    rules: {
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling']],
          pathGroups: [
            { pattern: '@app/**', group: 'internal' },
            { pattern: '@shared/**', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
];
```

## Naming Convention Examples

### ✅ Correct Patterns

```typescript
// Ports (Interfaces)
interface UserRepositoryPort {
  findById(id: string): Promise<UserOutput>;
  create(input: CreateUserInput): Promise<UserOutput>;
}

interface LoggerServicePort {
  info(message: string): void;
  error(message: string, error: Error): void;
}

// Adapters (Implementations)
class MongoUserRepositoryAdapter implements UserRepositoryPort {
  async findById(id: string): Promise<UserOutput> {
    // Implementation
  }

  async create(input: CreateUserInput): Promise<UserOutput> {
    // Implementation
  }
}

class PinoLoggerAdapter implements LoggerServicePort {
  info(message: string): void {
    // Implementation
  }

  error(message: string, error: Error): void {
    // Implementation
  }
}

// Type Aliases
type CreateUserInput = {
  email: string;
  password: string;
  name: string;
};

type UserOutput = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
};

type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
};

// Error Classes
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

// Configuration Interfaces
interface DatabaseOptions {
  poolSize: number;
  timeout: number;
}

interface ServerConfig {
  port: number;
  host: string;
}
```

### ❌ Incorrect Patterns

```typescript
// Anti-patterns that will trigger ESLint errors

// ❌ I-prefix (anti-pattern)
interface IUserRepository {
  findById(id: string): Promise<User>;
}

// ❌ Missing Port suffix
interface UserRepository {
  findById(id: string): Promise<User>;
}

// ❌ Missing Adapter suffix
class MongoUserRepository implements UserRepositoryPort {
  // ...
}

// ❌ Missing Input/Output suffix
type CreateUser = {
  email: string;
  password: string;
};

type User = {
  id: string;
  email: string;
};

// ❌ Wrong error suffix
class ValidationException extends Error {
  // Should be ValidationError
}

// ❌ PascalCase method (should be camelCase)
class UserService {
  FindById(id: string) {
    // Should be findById
  }
}
```

## Import Organization Example

When you use `importsConfig`, your imports will be automatically organized:

```typescript
// Before (unorganized)
import { UserRepositoryPort } from './repositories/user';
import express from 'express';
import { config } from '../config';
import fs from 'fs';
import { LoggerServicePort } from '@/services/logger';

// After (organized by ESLint)
import fs from 'fs';

import express from 'express';

import { LoggerServicePort } from '@/services/logger';

import { config } from '../config';
import { UserRepositoryPort } from './repositories/user';
```

## Integration with VS Code

For automatic linting on save, add to `.vscode/settings.json`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["javascript", "typescript"]
}
```

## Troubleshooting

### "Cannot resolve module" errors

Make sure all peer dependencies are installed:

```bash
npm install --save-dev \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-plugin-import \
  typescript-eslint
```

### TypeScript parser errors

Verify your `tsconfig.json` is in the project root or update the parser configuration:

```javascript
{
  languageOptions: {
    parserOptions: {
      project: "./tsconfig.json", // or custom path
    },
  },
}
```

### Too many naming convention errors

You can temporarily change the severity to `warn` while refactoring:

```javascript
import { recommended } from '@sentzunhat/zacatl/eslint';

export default [
  ...recommended,
  {
    rules: {
      '@typescript-eslint/naming-convention': 'warn',
    },
  },
];
```

## Migration from Existing Projects

If you're migrating from an existing ESLint setup:

1. **Backup your current config**: `cp eslint.config.mjs eslint.config.mjs.backup`

2. **Install Zacatl configs**: Follow the Quick Start installation

3. **Update your config file**: Replace with Zacatl's recommended config

4. **Run lint**: `npm run lint` to see what needs fixing

5. **Fix automatically**: `npm run lint:fix` for auto-fixable issues

6. **Manually fix naming**: Update Port/Adapter naming patterns as needed

## Best Practices

1. **Start with recommended**: Use the full recommended config, then override as needed
2. **Project-specific rules last**: Add custom rules after Zacatl configs
3. **Use ignores**: Exclude build artifacts, dependencies, and config files
4. **Test file flexibility**: Relax rules for test files if needed
5. **Gradual adoption**: Set naming conventions to `warn` during migration, then `error`

## Related Documentation

- [Infrastructure Usage](../service/infrastructure-usage.md)
- [Layer Registration](../service/layer-registration.md)
- [Naming Conventions Standard](./naming-conventions-guide.md)

## Support

For issues or questions:

- **GitHub Issues**: https://github.com/sentzunhat/zacatl/issues
- **Documentation**: https://github.com/sentzunhat/zacatl/tree/main/docs
