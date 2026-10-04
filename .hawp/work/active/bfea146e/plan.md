# Move database connection ownership into Infrastructure

**UUID:** `bfea146e-7a49-418d-b55a-54fb04c24eca`
**Type:** improvement
**Reported:** 2026-10-19

## Input (verbatim)

> Service coordinates startup and shutdown; Layers → Infrastructure owns database connections, ORM adapters, repositories; Platforms → Server owns HTTP, API routes, and pages. Update the work items and docs with the new structure.

## Intake summary

The agreed architecture places all database resource ownership in
Infrastructure. Today `platforms.server.databases` and
`src/service/platforms/server/database/` still configure and connect databases.
PR #138 first fixes Service-owned ORM scopes and direct entry-point regressions.
Move the remaining connection lifecycle in separate reviewable changes after
development integration, without suggesting that the physical move has happened.

## Evidence and decision

**Confirmed:** `Service` coordinates startup; Infrastructure owns repository
and ORM classes and now holds Service-scoped ORM registrations. `Server.prepare()`
still invokes `DatabaseServer.connect()`, and `ServerConfig.databases` remains the
consumer API.

**Decision:** Infrastructure owns database connections, ORM adapters,
repositories and models; Server owns HTTP/API/page behavior. Preserve existing
consumer configuration until a migration design is reviewed.

## Small changes

1. Specify the Infrastructure database config shape and compatibility mapping
   from `platforms.server.databases`; define direct `Server`/`Platforms` behavior.
2. Move connection ports, adapters and registration into Infrastructure while
   keeping Service's prepare → repository-ready → listen order. Confirm cleanup
   and connection-only flows.
3. Migrate examples/docs and expose the new config path with a transition
   period or explicit breaking migration note. Remove the old path only when
   consumer evidence and release version are decided.

## Acceptance

- Database connection lifecycle is owned by Infrastructure; Server no longer
  connects or registers databases.
- Service ordering and per-Service ORM/index isolation remain intact.
- Direct entry points, example consumers, multi-database cases and shutdown
  paths are verified on the final PR head.
- Public config migration and version policy are documented before release.

**Status:** plan-ready. Structural move deferred to a separate development
change after PR #138; no API removal or release is authorized here.
