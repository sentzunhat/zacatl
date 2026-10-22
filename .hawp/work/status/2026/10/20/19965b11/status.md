# Status Report

## Intent

Review the latest Zacatl release for issues affecting the Sentzunhat website
integration, classify compatibility concerns, and give Zacatl maintainers a
focused next-release handoff. This report records findings only; it does not
change runtime code or HAWP work-item status.

## Current State

Reviewed Zacatl `v0.0.65` at commit
`b07979e2a42e4bee98c93d1b28da27b2e073b4d3`. The local `main` branch matched
`origin/main`; npm reports `0.0.65` as `latest`. The release workflow completed
successfully (GitHub Actions run `39473526371`).

## What Was Inspected

- Service composition and lifecycle: `src/service/service.ts`,
  `src/service/platforms/platforms.ts`, and
  `src/service/platforms/server/server.ts`.
- API adapter contract and scoped route resolution:
  `src/service/platforms/server/api/port.ts`,
  `src/service/platforms/server/api/api-server.ts`.
- ORM adapter scopes and database lifecycle:
  `src/service/layers/infrastructure/orm/`,
  `src/service/platforms/server/database/`.
- Release and compatibility documentation: `docs/changelog.md`,
  `docs/service/README.md`, and `docs/skills/version-updates.md`.
- Existing HAWP plans `19965b11`, `6ec737fa`, `fa61f33c`, and `f1080c66`.
- npm registry version and GitHub Actions status for the `v0.0.65` release.

## What Changed

No application or framework source changed in this review. This report captures
the current release state and the remaining compatibility/lifecycle follow-up.

## What Was Directly Verified

- `v0.0.65` is the current package release and `latest` npm dist-tag; Zacatl
  `main` points at the same tagged commit.
- Release workflow `39473526371` completed successfully.
- Zacatl now exposes host configuration while retaining `0.0.0.0` as the
  default, resolves Service-managed routes from the Application scope, prepares
  databases/pages before repository readiness and HTTP listen, and scopes ORM
  instances and Mongoose index policy per Service. Focused regression tests for
  direct Server routes, Service scope isolation, and same-name ORM instances are
  present in the release source.
- The public `ApiServerPort.listen` contract is now `listen(host, port)`. A
  custom adapter that implements only the earlier `listen(port)` form is
  incompatible with `0.0.65`. Zacatl documents this as an intentional
  pre-`0.1.0` break in the changelog and Service guide. The version policy
  allows breaking changes during `0.0.x`; this is a real consumer migration
  requirement, not an undocumented framework defect.
- `docs/changelog.md` labels `0.0.65` as dated `2026-10-17`, while the npm
  publication and release workflow occurred `2026-10-20`. Confirm whether the
  changelog date means a candidate date; if it represents release publication,
  correct it.
- The current local Node runtime is `v18.12.1`, below Zacatl's declared Node
  `>=26` engine. Attempting the focused Vitest suite failed before test loading
  because this Node runtime does not export `node:util.styleText`. This is an
  environment mismatch, not evidence of a Zacatl test failure. The release
  workflow success is the available release-level CI evidence.

## What Remains Unproven

- The release-source tests cover route and ORM isolation, but this review did
  not rerun them locally under Node 26.
- Lifecycle cleanup edge cases remain open under `f1080c66`: a database
  `onDatabaseConnected` callback can throw before its adapter is stored for
  disconnect; `Server.stop()` awaits HTTP close before disconnecting databases,
  so an HTTP close rejection can skip DB cleanup. These are source-supported
  failure paths; runtime reproductions and desired restart semantics are still
  needed before calling them confirmed runtime failures. Reproduce and address
  them in a focused Zacatl follow-up.
- Full website runtime/container compatibility was not re-exercised in this
  review. The website lockfile references Zacatl `^0.0.65`, but that alone is
  not current runtime proof.

## Constraints

This is a source, release-metadata, and existing-test review. No code, tests,
work-item status, PR, release, or website files were changed. Do not infer
website deployment or production behavior from package publication or CI.

## Help Wanted

Zacatl maintainers should confirm whether the `0.0.65` changelog date is
intentional and choose whether lifecycle cleanup/restart behavior belongs in
the next `0.0.x` release or a later scoped lifecycle change. Consumers with
custom `ApiServerPort` implementations must migrate to `listen(host, port)`.

## Suggested Next Step

Run the existing focused Service, Server, and ORM tests under Node 26, then
reproduce the two cleanup paths in `f1080c66`. If reproduced, make cleanup
best-effort across HTTP and every database adapter while preserving the
original startup/stop error, and record an explicit one-shot or restart
contract. Keep the accepted adapter signature break documented in migration
notes. Verify any fix with consumer smoke and CI before marking those plans
complete.
