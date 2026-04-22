# Fastify + SQLite Svelte Frontend

Minimal Svelte + Vite frontend for the Fastify + SQLite + Svelte example.

## Quick Start

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5001
- Backend proxy target: http://localhost:8081

## Environment

- Uses Vite dev proxy for /api and /greetings routes.
- See [vite.config.ts](./vite.config.ts) for current proxy and port settings.

## Documentation

- Example Root: [../README.md](../README.md)
- Examples Catalog: [../../README.md](../../README.md)
- Start Here: [../../../START_HERE.md](../../../START_HERE.md)
- Service Module: [../../../docs/service/README.md](../../../docs/service/README.md)

## Next Steps

- Start from [Fastify + SQLite + React](../../fastify-sqlite-react/) as baseline
- Compare React and Svelte frontend variants
- Update proxy/API wiring in vite.config.ts when changing backend ports
