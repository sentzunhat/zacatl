# Code Quality & Source Cleanliness Guide

## Overview

This document outlines best practices for maintaining a clean, scalable codebase in the Zacatl project. A key principle is keeping the `src/` folder free of compiled artifacts, with only TypeScript source files (`.ts`) tracked in version control.

## Compiled Files Management

### Why Separate Source and Build?

- **Source Folder (`src/`)**: Contains only TypeScript source code
- **Build Folder (`build/`)**: Contains compiled JavaScript and type definitions

This separation ensures:

- ✅ Version control only tracks source code, not generated artifacts
- ✅ Clean git history without build noise
- ✅ Faster cleanup and rebuilds
- ✅ Clear distinction between development and distribution code

### What Gets Cleaned

The following file types are automatically cleaned from `src/` folder:

- `*.js` - Compiled JavaScript files
- `*.d.ts` - Type definition files
- `*.js.map` - JavaScript source maps
- `*.d.ts.map` - Type definition source maps

These files are generated during compilation but automatically deleted to keep `src/` clean.

## Build Commands

### Standard Build

```bash
npm run build
```

This command:

1. Cleans any leftover compiled files from `src/`
2. Compiles TypeScript with `tsc`
3. Rewrites path aliases with `tsc-alias`
4. Cleans up any compiled files from `src/` again

### Incremental Builds (Development)

```bash
npm run build:watch
```

For development with continuous compilation.

## Cleanup Commands

### Clean Everything

```bash
npm run clean
```

Removes:

- Build folder (`build/`, `dist/`)
- All compiled files from `src/`
- `node_modules/`

### Clean Only Build Output

```bash
npm run clean:build
```

Removes:

- Build folder
- Compiled files from `src/`
- TypeScript build info files

### Clean Only Source Artifacts

```bash
npm run clean:src
```

Removes only compiled files accidentally generated in `src/`:

- `src/**/*.js`
- `src/**/*.js.map`
- `src/**/*.d.ts`
- `src/**/*.d.ts.map`

## Git Configuration

### .gitignore Rules

The following patterns are configured in `.gitignore` to prevent committing compiled files:

```
src/**/*.js
src/**/*.js.map
src/**/*.d.ts
src/**/*.d.ts.map
```

### Pre-Commit Hook (Recommended)

To prevent accidental commits of compiled files, install the git pre-commit hook:

```bash
npm run setup:hooks
```

This creates a `.git/hooks/pre-commit` script that will:

1. Check for compiled files in `src/` staged for commit
2. Prevent the commit if any are found
3. Display helpful instructions to fix the issue

#### Manual Hook Setup

If automatic setup fails, you can manually create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Check for compiled files in src
COMPILED_FILES=$(git diff --cached --name-only | grep -E 'src/.*\.(js|d\.ts|js\.map|d\.ts\.map)$' || true)

if [ -n "$COMPILED_FILES" ]; then
    echo "❌ ERROR: Compiled files detected in src folder!"
    echo "These files should not be committed."
    echo "Run 'npm run clean:src' to remove them."
    exit 1
fi
exit 0
```

Make it executable:

```bash
chmod +x .git/hooks/pre-commit
```

## Workflow Best Practices

### Before Committing

```bash
# Clean up any stray compiled files
npm run clean:src

# Build to ensure compilation works
npm run build

# Run quality checks
npm run type:check
npm run lint
npm run test
```

### Publishing to NPM

```bash
npm run publish:latest
```

This automatically runs:

1. Clean source artifacts
2. Run full test suite with coverage
3. Type checking
4. Linting
5. Build (with automatic cleanup)
6. Publish to NPM

## Troubleshooting

### "I accidentally committed compiled files"

If you've already committed `.js` or `.d.ts` files from `src/`:

```bash
# Remove them from git history
git rm --cached 'src/**/*.js' 'src/**/*.d.ts' 'src/**/*.js.map' 'src/**/*.d.ts.map'

# Commit the removal
git commit -m "Remove accidentally committed compiled files from src"

# Update .gitignore to prevent future commits (should already be there)
```

### "Build folder is empty"

```bash
# Rebuild everything
npm run clean:build && npm run build
```

### "Git hook won't run"

Ensure the hook file has execute permissions:

```bash
chmod +x .git/hooks/pre-commit
```

## Architecture

The TypeScript configuration ensures:

- **Source Location**: `./src/**/*.ts`
- **Output Location**: `./build/**` (JavaScript and type definitions)
- **Include Patterns**: Only `.ts` and `.js` source files
- **Exclude Patterns**: `node_modules`, `build`, `coverage`, `test`, `examples`

See [tsconfig.json](../../tsconfig.json) for detailed compiler options.

## Related Documentation

- [TypeScript Configuration](../config/tsconfig.md)
- [Development Guide](./README.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
