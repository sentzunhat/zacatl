# HAWP Status Report

### Intent

Track the import-boundary cleanup work needed in Zacatl so downstream services can use explicit deep imports instead of broad root/barrel paths.

### Current State

The `src/` package already exposes explicit deep subpaths for the relevant service, error, log, and handler modules. The remaining work is to codify the policy and keep future imports off the broad root surface.

### What Was Inspected

- `README.md`
- `docs/README.md`
- `.hawp/README.md`
- `.hawp/usage/INIT.md`
- `src/index.ts`
- `src/service/index.ts`
- `src/service/service.ts`
- `src/service/layers/application/entry-points/rest/index.ts`
- `src/service/layers/application/entry-points/rest/fastify/handlers/route-handler.ts`
- `src/service/layers/application/entry-points/rest/hook-handlers/hook-handler.ts`
- `src/logs/index.ts`
- `src/error/custom.ts`
- `package.json` exports

### What Changed

- Identified a safe deep-import path set for service entry code:
  - `@sentzunhat/zacatl/error/custom`
  - `@sentzunhat/zacatl/service/service`
  - `@sentzunhat/zacatl/service/types`
  - `@sentzunhat/zacatl/service/platforms/server/database/port`
  - `@sentzunhat/zacatl/service/layers/application/entry-points/rest/fastify/handlers/route-handler`
  - `@sentzunhat/zacatl/service/layers/application/entry-points/rest/hook-handlers/hook-handler`
  - `@sentzunhat/zacatl/logs/pino/default`
- Captured the need for a follow-up policy lane to block `@sentzunhat/zacatl` root imports in consumers.

### What Was Directly Verified

- The package exports above paths in `package.json`.
- The modules resolve to concrete source files in `src/`.
- Zacatl’s repo-local HAWP guidance uses `status/` as the continuity artifact path rather than a backlog folder.

### What Remains Unproven

- Whether adding lint restrictions will catch every future broad import without needing an allowlist tweak.
- Whether any internal examples still intentionally rely on the root package surface and need migration.

### Constraints

- Keep the policy lightweight and repo-local.
- Prefer minimal, explicit deep imports over broad barrels.
- Avoid expanding HAWP into a runtime or orchestration layer.

### Help Wanted

Review the import allowlist idea before enforcement so the restriction does not block legitimate public API usage or tests.

### Suggested Next Step

Add an ESLint restricted-import rule or equivalent guardrail for Zacatl consumer code, then migrate any remaining root-import examples.

### Optional Attached Artifact

- Handoff context also reflected in mictlan work items `TASK-087` and `TASK-088`.
