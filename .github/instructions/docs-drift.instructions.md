---
name: 'Docs Drift Guardrails'
description: 'Prevent documentation examples from drifting away from source exports and runtime behavior'
applyTo: 'README.md,docs/**'
---

# Documentation Drift Guardrails

When editing docs or README content:

1. Treat `src/` as the source of truth for behavior and import paths.
2. Validate every `@sentzunhat/zacatl/...` example import against real source-backed paths.
3. Prefer stable paths shown in `src/index.ts` and module barrels before deep internals.
4. For handler docs, use the current exported classes and existing folder paths under `src/service/layers/application/entry-points/rest/`.
5. If docs describe runtime behavior (for example auto-start, adapter behavior, platform support), verify against implementation before publishing.
6. Do not rewrite historical changelog entries unless explicitly requested.

Quick verification checklist (after docs edits):

- Search for known stale paths/symbols:
  - `@sentzunhat/zacatl/errors`
  - `@sentzunhat/zacatl/infrastructure`
  - `@sentzunhat/zacatl/service/express`
  - `@sentzunhat/zacatl/handlers/fastify`
  - `@sentzunhat/zacatl/handlers/express`
- Reconcile any matches against existing files in `src/`.
