# Validation Checklist - Node.js + npm Standardization

## Scope

- `with-sqlite-react`
- `with-mongodb-react`
- `with-postgres-react`

## Runtime and Package Manager

- [x] Node.js is the only runtime for scripts and Docker images
- [x] npm is the only package manager in commands and docs
- [x] No Bun lockfiles remain in examples
- [x] No Bun-specific config remains (for example, `bunfig.toml`)

## Project Configuration

- [x] Root example `package.json` files use npm scripts only
- [x] `packageManager` set to npm in Fastify example roots
- [x] Node engine requirements declared in Fastify example roots
- [x] Backend `start` scripts run compiled output (`node dist/index.js`)

## Build and Start Flow

- [x] `npm ci` works in each Fastify example root
- [x] `npm run build` builds backend and frontend
- [x] `npm start` starts backend from compiled JavaScript

## Docker Standardization

- [x] Multi-stage Dockerfiles use `node:24-slim` builder
- [x] Runtime image uses `gcr.io/distroless/nodejs24-debian12:nonroot`
- [x] Final image contains compiled artifacts and runtime dependencies only
- [x] Final image has no shell and uses nonroot runtime

## Documentation Alignment

- [x] Fastify quick-start docs use npm commands only
- [x] Fastify example READMEs use npm commands only
- [x] Examples top-level README states Node.js + npm usage
