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
2. **ESM fix**: `npx tsx ../../../scripts/build/fix-esm.ts dist` adds `.js` extensions for Node.js ESM compatibility

That's it! No bundlers and no extra transpilation layers.

## What's Happening Behind the Scenes

Node.js ESM requires explicit file extensions in imports:

- ❌ `import { thing } from "./file"`
- ✅ `import { thing } from "./file.js"`

The repository uses `scripts/build/fix-esm.ts` to add these extensions after TypeScript compilation, so you can write clean TypeScript without manual `.js` extensions everywhere.

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
