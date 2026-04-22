# Fastify + MongoDB React Frontend

Minimal React + Vite frontend for the Fastify + MongoDB + React example.

## Quick Start

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5002
- Backend proxy target: http://localhost:8082

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
- Validate MongoDB flow against backend and proxy target
- Update proxy/API wiring in vite.config.ts when changing backend ports
