# Installation

Install Zacatl and dependencies.

## Prerequisites

- **Node.js**: 24+ LTS (recommended)
- **Bun**: Optional, recommended for faster builds
- **TypeScript**: 5.3+

**Note**: Zacatl works with both Node.js and Bun. Bun provides native TypeScript support and faster execution.

## Install Zacatl

```bash
# Using npm
npm install @sentzunhat/zacatl

# Using Bun
bun add @sentzunhat/zacatl

# Using pnpm
pnpm add @sentzunhat/zacatl
```

## Required: Reflect Metadata

Zacatl uses dependency injection which requires reflect-metadata:

```bash
npm install reflect-metadata
```

Import it at the **top** of your entry file:

```typescript
import "reflect-metadata";
// ... rest of your imports
```

## Install Web Framework

Next",
"module": "ESNext",
"moduleResolution": "bundler",
"experimentalDecorators": true,
"emitDecoratorMetadata": true,
"strict": true,
"esModuleInterop": true,
"skipLibCheck": true,
"resolveJsonModule": true,
"outDir": "./build",
"rootDir": "./src"

## TypeScript Setup

```bash
npm install --save-dev typescript @types/node
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "experimentalDecorators": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "test"]
}
```

## Project Structure

```bash
mkdir -p src/{services,handlers,repositories}
```

```
src/
├── index.ts          # Entry point
├── services/         # Business logic
├── handlers/         # HTTP handlers
└── repositories/     # Data access
```

## npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node build/index.js",
    "dev": "tsx watch src/index.ts"
  }
}
```

## Development Tools

```bash
npm install --save-dev tsx vitest
```

---

**Current Version**: v0.0.32
**Next**: [Quick Start](./quickstart.md) or [Hello World](./hello-world.md)
