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

**Status:** in-progress. Partial database cleanup is implemented and locally
verified below; restart support remains unresolved and no restart guarantee is
claimed.

## Zacatl 0.0.66 lifecycle follow-up — 2026-10-21

**Confirmed:** source inspection found database adapters were added to the
ownership map only after `connect()` returned, so callback failures escaped
cleanup. Sequelize and Mongoose retained their instances only after the
callback, and `Server.stop()` skipped database disconnect if HTTP close threw.

**Implemented:** `DatabaseServer.configure()` tracks each adapter before
connecting and disconnects all tracked adapters when any configured database
fails. Built-in adapters retain connected instances before awaiting user
callbacks. `DatabaseServer.disconnect()` attempts every adapter and clears its
ownership map. `Server.stop()` attempts HTTP close and database disconnect
independently, preserving the HTTP error when both fail.

**Verified on `release-0.0.66` at base `b07979e2`:** regressions cover a
callback failure for SQLite, Sequelize and Mongoose, a later failure in a
multi-database setup, Service cleanup at callback/repository/page/listener
startup failures, and HTTP close rejection. The full suite passed 85 files
/ 752 tests; type checks, build, lint, and all five consumer smoke fixtures
passed under Node 26.3.0/npm 11.17.0. Eight example Docker stacks passed CRUD
smokes using the locally built framework; Mongo examples used MongoDB 7.0
because this Docker Desktop VM runs Linux 7.0.12 and default `mongo:latest`
stops at startup on that kernel. SQL consumer smoke retains the known
Sequelize-owned nested UUID audit notice.

**Restart contract:** no public documentation promises restart after
`stop()`. A cached preparation promise alone does not reconstruct database
connections or route state, so this change does not claim restart support.
Full restart behavior remains a separate design decision and requires direct
reproduction across HTTP providers and database vendors before implementation.

An additional local probe constructed a Fastify Service with an in-memory
SQLite database, started it, stopped it, then called `start()` again. The
second call rejected with `failed to start service` and the connected callback
had run only once. This confirms that restart currently fails for this
Service/database case; it does not establish the intended public contract or
behavior for the other providers/vendors. Keep restart support out of this
cleanup patch and decide whether the next contract should explicitly be
one-shot or reconstruct all owned resources.

**Remaining:** repeat CI on the pushed release branch head. The website itself
was not runtime-tested or changed; Docker evidence covers the framework's
eight maintained examples, not the website consumer or deployment.


## Current PR verification — 2026-10-21

At PR #180 head `97c2197a` (observed 2026-10-21), CVE, pending-release,
and peer-install checks pass. Docker smoke and publish dry-run were skipped by
workflow policy. These checks are not evidence for website runtime or Docker
compatibility. The partial-connection and HTTP-close cleanup changes are
verified for this release branch; the item remains active only for the
unresolved restart contract and any later one-shot/restart decision.

### Documentation sync — 2026-10-21

`docs/service/README.md` now records that `Service.start()` registers entry
points, prepares the server (including database and page setup), waits for
layer readiness, then starts the listener. It documents cleanup after startup
failure and the independently attempted HTTP/database shutdown. It also states
that restart is not a documented guarantee and records the reproduced
Fastify + in-memory SQLite second-start failure without generalizing that probe
to other providers or database vendors. No implementation or release claim
changed in this documentation update.

### Copilot database ownership review follow-up — 2026-10-21

**Confirmed from source:** the ownership map could overwrite an adapter when
the same vendor/name key was configured twice; missing `connection` metadata
could throw while constructing the wrapped error; and `disconnect()` cleared
ownership before knowing whether resource closure succeeded.

**Implemented:** reject duplicate keys before creating/replacing an
adapter; key named connections by vendor plus name so different vendors may
reuse a name; optional-chain connection metadata in diagnostic context; and
remove adapters from ownership only after disconnect succeeds. Regression tests
cover preserving the first adapter, same-name cross-vendor isolation, missing
metadata, and retry after a failed disconnect.

**Verified:** Node 26.3.0/npm 11.17.0 focused run passed 3 test files / 38
tests, including the new cases. `npm run type:check` passed source, test, and
script checks. Lint, full suite, consumer fixtures, and CI for this follow-up
remain to be run; website runtime remains outside this Zacatl verification.


### Copilot review follow-up: normalized SQLite ownership key — 2026-10-21

**Confirmed from source:** `DatabaseServer` currently forms ownership keys as
`SQLITE` when a connection has no name and `SQLITE:SQLITE` when the name is
explicitly `SQLITE`. `registerOrmInstance()` uses `connection?.name ?? vendor`,
so those two configurations register the same ORM token while the ownership
map treats them as distinct. Both may be accepted and the later registration
can replace the default ORM instance. This substantiates the new High Copilot
comment on PR #180.

**Follow-up scope:** normalize an explicit vendor-default connection name
identically to an omitted name, reject collisions before creating/registering a
second adapter, and add a regression using unnamed SQLite plus named `SQLITE`
with distinct adapter instances. Keep other connection naming behavior and the
separate restart contract under this existing item. Run targeted database/ORM
tests, type check, and source/build checks as appropriate.

**Planning refinement:** `test/unit/service/platforms/server/database/database-server.test.ts`
contains existing duplicate-key and connection identity coverage. Add the
regression there with distinct mocked adapter instances. The preferred design is
one canonical connection-name helper used by both the DatabaseServer ownership
key and ORM token registration in
`src/service/platforms/server/database/orm-instance.ts`; compare this with a
narrowly duplicated normalization at each callsite and reject duplication
because it can drift again. Confirm whether the same default-name equivalence
applies to Sequelize and Mongoose before broadening the change.

**Acceptance for this review finding:** unnamed SQLite plus explicitly named
`SQLITE` is rejected as a duplicate before a second adapter is created or
connected; the first connection remains the registered instance and is cleaned
up once; equivalent vendor-default pairs are covered if their adapters use the
same token convention. Run the database server and ORM instance tests, then
`npm run type:check:src` and `npm run build`. Treat implementation as medium
risk because connection identity and default repository resolution are public
runtime behavior.


### Implementation-ready brief — default connection identity normalization

The duplicated default token convention affects all three database vendors:
`SQLITE`, `SEQUELIZE`, and `MONGOOSE`. Their adapters use the vendor name when
`connection.name` is absent; explicit `name === vendor` therefore names the same
ORM token. Normalize only a nullish name or an exact vendor-name match to the
canonical vendor default. Preserve all other names as written; do not add case
folding, trimming, or empty-string interpretation in this change.

**Recommended implementation:** add one small connection-name identity helper
at the shared database boundary, then use it from both DatabaseServer
ownership key generation and `registerOrmInstance()`. Collapse the normalized
default name to the vendor-only adapter key so `getAdapter(vendor)` continues
to address the default connection. Reject a duplicate before factory creation.

**Regression:** in
`test/unit/service/platforms/server/database/database-server.test.ts`,
configure unnamed SQLite followed by explicitly named `SQLITE` with distinct
mock adapters. Assert the second factory/connect is never called, the first is
disconnected exactly once during failure cleanup, the second adapter is never
touched, the ownership map is cleared, and the wrapped error preserves the
duplicate-key cause. Add table coverage for explicit vendor-default names for
Sequelize and Mongoose; verify normalized token identity in
`test/unit/service/platforms/server/database/orm-instance.test.ts`.

**Ready check:** implementation can proceed as a focused medium-risk change;
restart semantics remain separate. Verification commands:
`npm test -- --run test/unit/service/platforms/server/database/database-server.test.ts test/unit/service/platforms/server/database/orm-instance.test.ts`,
`npm run type:check:src`, and `npm run build`.

**Implementation update — 2026-10-21:** Added the shared internal
`normalizeConnectionName()` helper and used it for both ownership-key and ORM
token identity. Added the unnamed SQLite plus explicit `SQLITE` regression,
asserting the duplicate is rejected before a second adapter is created and the
first adapter is cleaned up. Tests, type checks, and build remain unrun; keep
this item active until those checks and PR-head CI complete.

### Lifecycle verification follow-up — 2026-10-22

**Directly verified on base `56dc8136`:** Installed the locked dependencies
with Node `v26.10.0` / npm `11.19.1`. The focused database/ORM, Server, and
Service unit selection passed: 8 test files / 88 tests. `npm run type:check`
passed source, test, and script checks. `npm run build` passed source and
script ESM/CJS builds and postbuild generation. `git diff --check` passed.
The build's local export sync temporarily added an export for the internal
`connection-name` helper; that generated manifest-only change was removed and
is not part of this work.

**Restart boundary:** Existing docs say a stopped Service is not a documented
restart contract and recommend constructing a new instance. The recorded live
probe only covers Fastify with in-memory SQLite, where a second start failed;
there is no equivalent evidence across Express, other database vendors, and
direct Server use. Do not infer or enforce a universal one-shot contract from
that single combination. Keep the restart behavior decision open for a
separately scoped reproduction/design pass. No additional lifecycle defect was
found in the inspected source and tests, so this verification follow-up needs
no product-code change.

**Remaining:** Verify the integrated PR head and required CI. Website runtime
and all-provider restart behavior remain unverified.


### Copilot pending-connection shutdown race — 2026-10-22

**Finding confirmed:** `DatabaseServer.configure()` records an adapter before
awaiting `connect()`. A concurrent `disconnect()` could call an adapter while
its connect operation was pending. Sequelize/Mongoose may not yet have assigned
the connected instance that `disconnect()` needs; the server could then remove
the adapter from ownership after a no-op close and leave the eventual live
connection untracked.

**Implemented:** serialize concurrent `configure()` calls around the active
configuration promise. `disconnect()` waits for that operation to settle before
tearing down owned adapters. Setup-failure cleanup uses the internal teardown
path directly, avoiding self-wait, and adapter teardown is shared across
concurrent disconnect callers. Added a deferred-connect regression proving
shutdown does not call adapter disconnect or remove ownership before setup
completes, then disconnects and removes the adapter once setup settles.
Updated `docs/service/README.md` to state this shutdown behavior.

**Verification:** targeted `database-server.test.ts` passed 15 tests on Node
26.3.0. Full type, lint, build, release-dry-run, and PR CI results are pending.
Restart semantics remain a separate open question; this fix coordinates shutdown
with active connection setup and does not add restart support.
