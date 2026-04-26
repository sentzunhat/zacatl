# STAB-018 — Remove dead duplicate server adapters and share prefix normalization

- Status: done
- Closed: 2026-07-03
- Type: improvement

## Problem

The server platform had two inverted adapter conventions with a dead copy in each layer:

- `api/`: live adapters lived in `api/adapters/{express,fastify}.ts`; top-level `api/{express,fastify}-adapter.ts` were stale pre-`prefixes` duplicates imported by nothing.
- `page/`: live adapters were top-level `page/{express,fastify}-page-adapter.ts`; `page/adapters/{express,fastify}.ts` were dead duplicates.

Additionally, prefix handling was split-brain: API adapters normalized prefix values (`'api'` → `/api`) while page adapters did a raw `url.startsWith(p)`, so `prefixes: { api: 'api' }` registered routes but failed to exclude them from SPA fallback. Raw `startsWith` also matched siblings (`/apifoo` under `/api`).

## Change

- Deleted 4 dead files and both `adapters.ts` re-export barrels; moved live API adapters up as `api/express-api-adapter.ts` / `api/fastify-api-adapter.ts`, matching the page-layer naming. `server.ts` and tests import the adapter files directly.
- Added shared `src/service/platforms/server/prefixes.ts` (`normalizePrefix`, `isUnderPrefix`) used by both API adapters (route prefixing) and page adapters (SPA-fallback exclusion, boundary-safe).
- Fixed pre-existing broken re-export shims `src/logs/console.ts` / `src/logs/pino.ts` (paths were relative to `src/` instead of `src/logs/`), found while verifying — direct evidence: 16 TS2307 errors present with this change stashed.
- Renamed api adapter test files to `*-api-adapter.test.ts`; added `test/unit/service/platforms/server/prefixes.test.ts` (8 cases).

## Evidence

- `npm run type:check` — 0 errors (src, test, scripts)
- `npm test` — 66 files, 548/548 passed
- `npm run lint` — clean
- `npm run build` — clean; exports sync dropped from 151 to 143 entries (8 stale adapter/barrel paths removed)

## Addendum (same day)

Continued the restructure into vendor provider folders with functional factories, per `docs/guidelines/code-style.md` (prefer `const` arrow function expressions; classes only for domain objects with constructors):

- `server/providers/express/{api-adapter,page-adapter,schema-helper}.ts` and `server/providers/fastify/{api-adapter,page-adapter}.ts`
- Class adapters became `createExpressApiAdapter` / `createFastifyApiAdapter` / `createExpressPageAdapter` / `createFastifyPageAdapter` — arrow-function factories returning the port object; `api/` and `page/` now hold only vendor-neutral code (`*-server.ts`, `port.ts`)
- Tests mirrored under `test/unit/.../server/providers/`
- `PageServerPort.register(server: unknown)` dropped its unused parameter (adapters close over their server instance; nothing passed a meaningful value) — port, `PageServer`, and tests now use `register()`
- Prefix helpers are runtime code, not types, so they live in `server/shared/prefixes/{normalize-prefix,is-under-prefix}.ts` — one file per function, imported directly, no barrel; tests mirrored per file
- Evidence: type check 0 errors, 548/548 tests (67 files), lint clean, build + exports sync clean (144 entries, no stale paths)

## Follow-ups

- Named prefixes only affect SPA exclusion; only `prefixes.api` mounts routes. Making entry points target named prefixes (e.g. `webhooks`) is the next compounding feature.
- `database/` shows the same dual layout (`adapters/` dir + top-level `*-adapter.ts`) — worth the same audit.
