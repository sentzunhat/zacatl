# Zacatl Fastify + SQLite Backend Example

Simple, clean Node.js ESM backend using the Zacatl framework.

## Quick Start

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build

# Run production build
npm start
```

## Build Process

The build is simple and transparent:

1. **TypeScript compilation**: `tsc` compiles your code
2. **ESM fix**: Framework's built-in `zacatl-fix-esm` adds `.js` extensions for Node.js ESM compatibility

That's it! No bundlers, no complex tooling. The ESM fix script is included in the framework package - no copying scripts needed!

## What's Happening Behind the Scenes

Node.js ESM requires explicit file extensions in imports:

- ❌ `import { thing } from "./file"`
- ✅ `import { thing } from "./file.js"`

The framework's `zacatl-fix-esm` utility automatically adds these extensions after TypeScript compilation, so you can write clean TypeScript without manual `.js` extensions everywhere.

The script is included in `@sentzunhat/zacatl` - no manual setup required!

## Project Structure

```
src/
├── application/      # HTTP handlers (entry points)
├── domain/          # Business logic
├── infrastructure/  # Database models & repos
├── config.ts        # Configuration
└── index.ts         # App entry point
```

## Developer Experience

- ✅ Write clean TypeScript (no `.js` in imports)
- ✅ One command to build: `npm run build`
- ✅ Fast development with `tsx watch`
- ✅ Production-ready output in `dist/`
- ✅ Works in Docker (distroless images)
