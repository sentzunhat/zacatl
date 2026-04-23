# Zacatl Fastify + SQLite Backend

Minimal Fastify backend for the Fastify + SQLite + React example.

## Quick Start

```bash
cd ../..
npm install
npm run dev
```

- API: http://localhost:8081
- Default DB: sqlite:<example-root>/database.sqlite
- Project locales: `apps/backend/locales/*.json`

## Environment

- PORT (default: 8081)
- DATABASE_URL (default: sqlite:<example-root>/database.sqlite)

## Localization

- Backend locale files live in `apps/backend/locales/`
- Zacatl built-in locales still come from the library package
- Add project-specific overrides by creating or updating `en.json`, `es.json`, or new language files in this folder

## Hook Handler Example

- Simple session hook example: `src/application/hook-handlers/session/handler.ts`
- Registration list: `src/application/hook-handlers/hooks.ts`
- Wired in service config under `entryPoints.rest.hooks`
- Current behavior: adds `x-session-id` response header using Fastify request id

## Documentation

- Example Root: [../README.md](../README.md)
- Examples Catalog: [../../README.md](../../README.md)
- Start Here: [../../../START_HERE.md](../../../START_HERE.md)
- Framework Overview: [../../../docs/guidelines/framework-overview.md](../../../docs/guidelines/framework-overview.md)
- ORM Setup: [../../../docs/third-party/orm/database-setup.md](../../../docs/third-party/orm/database-setup.md)
- Service Module: [../../../docs/service/README.md](../../../docs/service/README.md)

## Next Steps

- Keep this example as the primary minimal baseline
- Compare with [Fastify + MongoDB + React](../../fastify-mongodb-react/)
- Extend routes and services following the service docs
