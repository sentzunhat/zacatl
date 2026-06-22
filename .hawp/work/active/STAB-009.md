# Audit dependency approvals and optionalize prunable runtime packages

input: |
  The repository now records approved install-script dependencies in package.json, and the user wants a separate work item to inspect dependencies and decide whether some packages should become optional as barrel pruning reduces the exported surface.

context: |
  Recent stabilization work confirmed the publish path under Node 26.3.0 and surfaced a small set of native/tooling packages with install scripts: better-sqlite3, esbuild, fsevents, mongodb-memory-server, sqlite3, and unrs-resolver. The user also referenced a planning branch for this broader dependency review.

mission: |
  Audit the runtime, dev, peer, and optional dependency split, then decide which packages should stay required, which should remain approved but optional, and which can be removed or demoted now that barrel imports and published surface pruning are in progress.

constraints: |
  Do not weaken the release path or hide real build/test failures. Keep production publishability intact. Treat install-script approval and optionality as policy decisions with clear tradeoffs, not automatic cleanup.

output: |
  A plan-ready dependency review item with a concrete investigation checklist and a final recommendation path for required vs optional packages, plus any follow-on package.json or lockfile changes.
