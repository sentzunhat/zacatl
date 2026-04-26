# Align database server port contract and adapter signatures

input: |
  `npm run type:check` reported that `DatabaseServerPort.connect` expects a `{ name: string }` service argument while the mongoose, sequelize, and sqlite adapters still accept a plain string.

context: |
  This is a medium stabilization item because it affects multiple adapters, the server database port, and downstream callers/tests. The type mismatch is concrete and blocks the repo's strict type gate.

mission: |
  Make the database server port contract and adapter implementations agree on one service argument shape, then update callers and tests accordingly.

constraints: |
  Preserve the intended runtime behavior while fixing the type contract. Do not paper over the mismatch with `any` or loosened typing unless there is a deliberate architectural decision.

output: |
  A passing typecheck for the affected database layers and a concise rationale for the chosen service argument shape.

## Completion Notes

- Close date: 2026-06-21
- Direct verification: `npm run type:check`, `npm run test`
- Result: the database server port contract now matches the adapter implementations, and the NodeSqlite runtime tests pass.
