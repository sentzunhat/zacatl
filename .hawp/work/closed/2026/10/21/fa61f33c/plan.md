# Scope ORM registrations and index policy to each Service

**UUID:** `fa61f33c-0c27-4d31-9bde-e5aca0e71e6c`
**Type:** bug
**Reported:** 2026-10-19

## Input (verbatim)

> Continue with the fixes needed from the new Copilot review, in small changes where possible.

## Intake summary

Investigate whether two live Services using the same database vendor and
connection name overwrite each other's ORM registration or Mongoose index
policy. Define and implement a consistent Service ownership boundary.

## Initial analysis

**Directly verified:** `Service` creates child containers, but its constructor
calls `registerOrmInstance` without passing a child container. Mongoose,
Sequelize and node:sqlite ORM adapters use global `getContainer()` /
`resolveDependency()` lookups. Mongoose index options are registered by
connection name in process-level policy state. These are source observations;
the two-Service failure needs a reproduction.

**Inferred:** same-name configurations in two Services can collide, contrary
to the intended scoped composition model.

**Likely scope:** `src/service/service.ts`,
`src/service/platforms/server/database/orm-instance.ts`, three ORM adapters,
Mongoose index policy/manager, repository construction, and focused DI tests.

**Risk:** high, because tokens, adapters and index policy cross boundaries.
**Gate:** reproduce same-name two-Service behavior, then review ownership and
legacy direct-adapter compatibility before implementation.

## Plan

1. Reproduce two Services with the same vendor/connection name and distinct
   instances; test token lookup, repository use and Mongoose index options.
2. Route Service-owned ORM registrations through its Infrastructure scope;
   define how adapters receive that scope without hidden global resolution.
3. Preserve documented direct/manual adapter usage with an explicit fallback
   only where it cannot shadow a supplied Service scope.
4. Separate index policy per connection instance or Service, with cleanup on
   lifecycle end if policy state survives an instance.
5. Verify both isolated Services, one-Service legacy behavior, all three ORM
   vendors, and PR-head CI.

## Acceptance and release gate

- Two Services with colliding names use their own ORM instances and policy.
- Service-owned repositories do not read another Service's global tokens.
- A direct/manual adapter path remains documented and verified.
- If this cannot fit safely in PR #138, the development PR may integrate only
  with an explicit single-Service limitation, but publication waits for the
  scoped fix or an owner-approved narrower contract. Prefer a separate small
  follow-up PR to `dev` over expanding PR #138 further.

**Status:** plan-ready. Token overwrite reproduced below; no implementation is claimed.

## Review reproduction — 2026-10-19

On local commit `04f3a090` (runtime identical to PR head `6f9aa0e3`), two
`Service` instances were constructed with distinct in-memory `DatabaseSync`
instances but the same `SQLITE` vendor and `shared` connection name. Resolving
the canonical token from the global container returned the first instance
after Service A construction and the second after Service B construction.
The overwrite is confirmed. Repository cross-query behavior and Mongoose
index-policy effects remain source-supported risks, not separately reproduced.
All three ORM adapters still use global container lookups; Mongoose index
policy is keyed globally by connection name. Next: add a permanent two-Service
regression test, then fix ownership and fallback behavior across vendors.

## Implementation and verification — 2026-10-19

Service construction now registers canonical and legacy ORM tokens in its
Infrastructure container. A temporary AsyncLocalStorage construction scope
lets existing repository constructors capture their owning container; direct
manual repositories retain the global fallback. Database adapters register
newly connected instances in that Infrastructure scope. Each Service also owns
a Mongoose index registry, exposed for inspection through
`service.getMongooseIndexManager()`; standalone/manual usage retains the global
registry. The same-name two-Service regression checks cover SQLite (supplied
and prepared), Mongoose model/index isolation, and Sequelize model isolation.
The full local suite passed (85 files / 732 tests), as did type checks and
build. Consumer smoke and PR-head CI remain to be verified.

**Status:** in-progress until consumer and pushed-head verification finish.

## Follow-up review — 2026-10-19

Copilot found that direct `new Layers(config)` had lost visibility into ORM
instances registered through the legacy global helper. Focused tests first
reproduced failed `ready()` for both direct Layers forms. The composition
boundary now explicitly chooses the legacy global ORM source whenever Layers
is built without Service-provided scopes, even if a parent container is used
for other layer DI. Service-managed Layers continue to capture only their
Infrastructure container; ORM adapters do not recursively resolve globals.
Focused direct tests and the two-Service isolation tests passed. Final PR-head
CI remains the gate.

## Release-0.0.66 source recheck — 2026-10-21

The per-Service ORM/index-policy implementation remains present in the current
source and its prior same-name isolation coverage remains part of the full
suite. The complete local suite passed 85 files / 752 tests, as did type checks,
build, lint, and all five consumer smoke fixtures. The known Sequelize nested
UUID notice remains consumer-owned. Commit `a71bdc30` is pushed in draft PR
#180. Its CVE and peer-install checks are pending; workflow skipped Docker and
publish-dry-run. Keep this item in-progress until current PR checks finish.


## Closure — 2026-10-21

## Outcome

Same-name Service isolation remains covered for SQLite, Sequelize, and Mongoose, including Mongoose index policy. Direct Layers compatibility tests, five consumer fixtures, full 85-file / 752-test suite, type check, build, lint, and PR #180 required checks pass on `a71bdc30`. Docker workflow was skipped; all eight maintained examples passed local CRUD smoke checks using the local build (MongoDB 7.0 for the host-kernel constraint).

**Status:** closed 2026-10-21. The implementation is in draft PR #180 (`a71bdc30`), not merged or released.

## Verification

- Node 26.3.0 / npm 11.17.0: 85 test files / 752 tests, type check, build, lint, and consumer smoke passed.
- PR #180 required CVE, release-gate, and peer-install checks passed on the current head. Docker smoke and publish dry-run were skipped by workflow policy.
- Same-name Service isolation remains covered for SQLite, Sequelize, and Mongoose, including Mongoose index policy. Direct Layers compatibility tests, five consumer fixtures, full 85-file / 752-test suite, type check, build, lint, and PR #180 required checks pass on `a71bdc30`. Docker workflow was skipped; all eight maintained examples passed local CRUD smoke checks using the local build (MongoDB 7.0 for the host-kernel constraint).

## Close Checklist

- [x] Outcome recorded
- [x] Verification recorded
- [x] Active backlog row removed and recent-close entry added
- [x] Plan moved to the dated closed archive
