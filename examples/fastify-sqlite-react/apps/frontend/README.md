# Fastify + SQLite React Frontend

Minimal React + Vite frontend for the Fastify + SQLite + React example.

## Quick Start

```bash
cd ../..
npm install
npm run dev
```

- Frontend: http://localhost:5001
- Backend proxy target: http://localhost:8081

## Environment

- Uses Vite dev proxy for /api routes.
- Frontend app source files live in `src/`.
- HTML entry and static assets served as-is live in `public/`.
- Example favicon is `public/favicon.svg` and can be replaced later.
- `public/src` is a symlink to `../src` so `/src/main.tsx` resolves with `root: 'public'`.
- See [vite.config.ts](./vite.config.ts) for current proxy and port settings.

## Documentation

- Example Root: [../README.md](../README.md)
- Examples Catalog: [../../README.md](../../README.md)
- Start Here: [../../../docs/START_HERE.md](../../../docs/START_HERE.md)
- Service Module: [../../../docs/service/README.md](../../../docs/service/README.md)

## Next Steps

- Keep this example with Fastify + SQLite as the baseline minimal flow
- Compare with [Fastify + MongoDB + React](../../fastify-mongodb-react/)
- Update proxy/API wiring in vite.config.ts when changing backend ports
