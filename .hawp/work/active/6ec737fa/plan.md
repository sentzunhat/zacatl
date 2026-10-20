# Preserve direct Server entry-point resolution

**UUID:** `6ec737fa-f704-491b-943c-609823f8ec90`
**Type:** bug
**Reported:** 2026-10-19

## Input (verbatim)

> Continue with the fixes needed from the new Copilot review, in small changes where possible.

## Intake summary

Review direct `new Server(config)` route/hook resolution after Service-scoped
Application containers were introduced. Preserve the exported direct Server
path without weakening Service-owned scopes.

## Initial analysis

**Directly verified:** `Server` creates an Application child container when
constructed directly (`src/service/platforms/server/server.ts`). The Application
scope registers configured handlers in its own container
(`src/service/layers/application/application.ts`). Review identified a potential
failure when a pre-existing global `@singleton` registration is not visible to
local-only registration checks; runtime reproduction has not been recorded.

**Inferred:** direct Server consumers may see a route-resolution regression.

**Likely scope:** `src/service/platforms/server/server.ts`,
`src/service/platforms/server/api/api-server.ts`, DI resolution helper, focused
direct-construction coverage, and corresponding API docs if the contract changes.

**Risk:** medium, because a fallback can accidentally cross Service scopes.
**Gate:** reproduce direct construction and Service-managed behavior before a
source change.

## Plan

1. Reproduce direct `Server` route/hook registration with a global singleton
   and with an explicitly supplied Application scope.
2. Make the smallest resolution change that preserves direct compatibility
   while keeping Service-managed routes in their own Application container.
3. Verify both paths and a negative cross-Service resolution case.
4. Update the current draft PR review thread with evidence; keep the change
   in PR #138 before development integration if the regression is confirmed.

## Acceptance

- Direct Server routes and hooks resolve as documented.
- An explicitly supplied Service Application container takes precedence and
  cannot silently resolve another Service's handlers.
- Focused regression checks and PR-head CI are recorded before integration.

**Status:** plan-ready. Reproduced below; no implementation is claimed.

## Review reproduction — 2026-10-19

On local commit `04f3a090` (runtime identical to PR head `6f9aa0e3`), a
focused `tsx` check globally registered `GlobalRoute` with tsyringe, then
constructed `new Server(config)` with Fastify and called
`server.registerEntrypoints({ routes: [GlobalRoute] })`. It failed with
`Failed to resolve 'GlobalRoute' from the DI container`. The derived
Application child is used by `ApiServer`, while `resolveDependencies` checks
local registration before resolution. The current constructor-only unit test
does not exercise direct route registration. The finding is confirmed; no
runtime fix has been made. Next: add a failing permanent regression test and
implement the narrow direct-path fallback without weakening Service scopes.

## Implementation and verification — 2026-10-19

Commit `6826bc61` changed direct `Server` resolution to use its supplied/global
handler container and direct `Platforms` to register configured routes/hooks in
its derived Application scope. Service-managed routes still resolve through the
Service Application scope. Targeted tests for both direct entry points passed
(25 tests across two files); the subsequent full suite passed (732 tests across
85 files), along with type checks and build. PR-head CI remains the closure gate.

**Status:** in-progress until the pushed PR head and its CI are verified.
