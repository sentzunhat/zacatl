# Define restart behavior and clean up partial database connections

**UUID:** `f1080c66-def3-4e84-9001-1ed2374dfc06`
**Type:** bug
**Reported:** 2026-10-19

## Input (verbatim)

> Please review the new Copilot comments and see if there are better fixes than patching or workarounds.

## Intake summary

Copilot's review overview mentions restart and connection cleanup without
separate inline findings. Inspect the current Service/Server/DatabaseServer
lifecycle, reproduce any failures, and choose a coherent contract before
changing it. This is distinct from direct Layers ORM fallback and validation.

## Initial source observations

**Confirmed in source:** `Server.prepare()` caches a fulfilled promise through
`stop()`. `Service.start()` registers entry points on every call. The HTTP
adapter owns listener and route state. `DatabaseServer.configure()` stores an
adapter only after `connect()` completes, while database callbacks run inside
`connect()`; a callback failure can therefore bypass the stored-adapter cleanup
path. `Server.stop()` awaits HTTP close before database disconnect, so an HTTP
close failure may skip disconnect.

**Unproven:** Exact restart and partial-connect behavior for each built-in
HTTP/database adapter in a live run. No restart contract was found in the
inspected public docs. Do not claim full restart support or a proven leak yet.

## Plan

1. Reproduce stop → start behavior for Fastify, Express, and a Service with a
   database; determine whether instances are intentionally one-shot or should
   support restart. Test route registration and repository state.
2. Reproduce a failing database callback after connection and a later
   connection failure in a multi-database setup. Track which resources remain
   open and whether `stop()` cleans them.
3. Choose and document the lifecycle contract. A one-shot contract should
   fail clearly on restart; full restart requires reconstructing HTTP, routes,
   connections and readiness together. Do not only reset the prepare promise.
4. Make preparation and cleanup transactional: close a just-opened adapter on
   failure, close earlier adapters, and attempt HTTP/database cleanup
   independently while preserving the primary error.
5. Verify direct Server and Service paths, all built-in adapters, consumer
   smoke and PR-head CI in a separately reviewable development change.

**Status:** analyzing. No lifecycle fix or restart guarantee is claimed here.
