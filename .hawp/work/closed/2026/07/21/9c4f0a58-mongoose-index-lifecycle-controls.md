# 9c4f0a58 — Mongoose index lifecycle controls

input: |
Implement safe, reusable Mongo/Mongoose index lifecycle controls in Zacatl for
0.0.58 so services do not automatically mutate large staging/production
collections during normal app boot.

context: |
Zacatl 0.0.57 starts repositories during service startup. Mongoose repository
readiness previously called `createCollection()`, `createIndexes()`, and
`init()`, which can mutate indexes during app boot. Large MongoDB collections
need explicit operator-controlled index diff/create/sync flows.

mission: |
Add a configurable Mongoose index boot policy plus read-only diff,
create-only, and force-guarded sync library APIs.

constraints: |
Keep runtime behavior guarded by config. Do not expose sync/drop as a default
boot action. Do not add a fake CLI if Zacatl does not yet have a real command
pattern. Do not log secrets or connection strings.

output: |
Implemented for 0.0.58 with code, tests, docs, changelog, and release
verification.

## Completed

- Added `indexes.bootMode: 'off' | 'create' | 'sync'` for Mongoose database and
  repository config.
- Defaulted boot policy to create-only for local/development/test and off for
  staging/production.
- Removed hidden `model.init()` index creation from Mongoose repository
  readiness.
- Added `MongooseIndexManager` with read-only diff, explicit create-only, and
  force-guarded sync operations plus model/collection allowlists.
- Registered Mongoose models by connection token so operator utilities can
  inspect existing repositories without boot-time mutation.
- Updated Mongo examples and third-party ORM docs with production-safe
  boot-mode guidance.

## Evidence

- `npm run type:check`
- `npx vitest run test/unit/service/layers/infrastructure/orm/mongoose/adapter.test.ts test/unit/service/layers/infrastructure/orm/mongoose/index-manager.test.ts test/unit/service/platforms/server/database/mongoose-adapter.test.ts`
- `npm test`
- `npm run build`
- `npm audit --omit=dev`
