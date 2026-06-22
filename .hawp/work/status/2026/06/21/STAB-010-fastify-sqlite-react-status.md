# Status Report

## Intent

Stabilize the `examples/fastify-sqlite-react` example so it builds cleanly on Node 26 and uses the `@zacatl` import alias consistently in backend source.

## Current State

The SQLite Fastify example backend source now imports from `@zacatl/...` instead of the older `@sentzunhat/...` namespace. The example backend tsconfig resolves the `@zacatl` alias, and the example Docker build completed successfully after the cleanup pass.
The runtime bootstrap now initializes `GreetingModel` before the service resolves repositories, which fixes the Sequelize model registration race in the example.

## What Was Inspected

- `examples/fastify-sqlite-react/apps/backend/src`
- `examples/fastify-sqlite-react/apps/backend/tsconfig.json`
- `examples/fastify-sqlite-react/Dockerfile`
- `examples/fastify-sqlite-react/apps/backend/package.json`
- `npm run build` in `examples/fastify-sqlite-react/apps/backend`
- `docker build --progress=plain -f examples/fastify-sqlite-react/Dockerfile .`

## What Changed

- Rewrote the backend example imports to `@zacatl/...`.
- Removed the unused `@sentzunhat/...` alias block from the backend tsconfig.
- Removed the temporary diagnostic `ls` command from the example Dockerfile.
- Added a runtime alias rewrite in the backend build so emitted JS resolves the published package layout correctly.
- Moved `GreetingModel` initialization ahead of service startup so the repository adapter can resolve the model during DI construction.

## What Was Directly Verified

- `npm run build` in `examples/fastify-sqlite-react/apps/backend` completed successfully.
- `docker build --progress=plain -f examples/fastify-sqlite-react/Dockerfile .` completed successfully.
- The Docker build used `node:26-bookworm-slim` and completed the backend and frontend example builds.
- Container smoke test passed: `GET /` returned `200 OK` and `GET /api/greetings` returned `200 OK` with `[]`.
- The host shell currently reports `node -v` as `v24.14.0`, so local shell Node 26 readiness was not proven by this session.

## What Remains Unproven

- The broader example matrix was not re-audited in this pass.
- The repeated `npm warn allow-scripts` and package vulnerability warnings were observed but not remediated here.
- The Dockerfile still copies the published package to both `node_modules/@sentzunhat/zacatl` and `node_modules/@zacatl` for compatibility; that duplication has not been simplified.

## Constraints

Focused only on the fastify SQLite React example. No unrelated examples were rewritten during this pass.

## Help Wanted

Review whether the duplicate runtime package copy in the Dockerfile should be reduced to a single alias path, or kept for compatibility until the broader package migration is complete.

## Suggested Next Step

Run a container smoke test for the SQLite example, then move to the next example in the verification matrix or prune the compatibility aliasing if it is no longer needed.
