# Installation

Install Zacatl and dependencies.

## Prerequisites

- **Node.js**: 22.x or higher
- **npm**: 10.x or higher
- **TypeScript**: 5.3+

## Install

```bash
npm install @sentzunhat/zacatl
```

## Install Web Framework

Choose Fastify or Express:

```bash
# Fastify (recommended)
npm install fastify

# Or Express
npm install express
```

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

**Next**: [First Service →](./first-service.md)
