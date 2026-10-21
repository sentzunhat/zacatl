# 2026-10-20 to 2026-10-21 — Zacatl Service lifecycle review and 0.0.66 continuation

Conversation/event dates: 2026-10-20 to 2026-10-21
Checkpoint/archive date: 2026-10-21
Repository: `sentzunhat/zacatl`
Public-safety note: downstream product identities and personal paths are omitted.

## Checkpoint: Before, During, After

### Before

Zacatl `v0.0.65` had been published as `latest`. The initial review identified
the intentionally breaking `ApiServerPort.listen(host, port)` contract and
source-supported gaps in partial database cleanup and shutdown cleanup. Their
runtime behavior still needed reproduction. The website consumer's prior
compatibility and container checks were historical evidence, not proof of a
new Zacatl branch.

### During

- Rechecked the current package and repository state; `0.0.65` remained npm
  `latest`, and `main` matched `origin/main` at `b07979e2`.
- Created local branch `release-0.0.66` from that `main` commit, without a
  `codex/` prefix.
- The branch contains lifecycle cleanup changes and regression tests. Current
  source diffs track adapters before connection,
  attempt cleanup of opened databases on setup failure, attempt database
  disconnect even if HTTP close fails, and add a scoped container argument to
  the custom page-registration callback.
- Current verification on Node 26.3.0/npm 11.17.0: 85 test files / 752 tests,
  type checks, build, lint, and five consumer smoke fixtures passed. All eight
  maintained Docker examples passed root plus `/api/greetings` CRUD checks
  using the locally built Zacatl source. Mongo examples used `mongo:7.0`;
  default `mongo:latest` stopped at startup because this Docker Desktop VM
  runs Linux kernel 7.0.12, inside MongoDB's documented 6.19–7.0.13
  incompatibility range. This is not a website Docker or deployment check.
- A Fastify + in-memory SQLite start-stop-start probe is recorded as failing
  on the second start. This confirms that case fails today; the public restart
  contract remains undecided, so restart support was kept outside the cleanup
  change.
- A previous review questioned the `0.0.65` changelog date. The current
  changelog text calls it an October 17 release candidate and says “not
  published”; npm/GitHub show publication on October 20. The October 17 date
  can be a candidate date, but the published/not-published wording is stale and
  should be reconciled before the next release.

### After

The framework cleanup, page-resolution scope, and explicit API-prefix
regressions are verified on `release-0.0.66`. The eight Service examples use
`server.prefixes.api` with relative handler URLs; when omitted, handler URLs
remain unchanged. The website migration was not changed or runtime-tested. No
merge, package publication, or deployment of `0.0.66` occurred.

## Strategic Impact

The new branch starts a focused next-version lane for confirmed cleanup
behavior while keeping restart semantics and broader reusable module/config
design separate. The accepted host-first adapter migration remains part of the
pre-`0.1.0` API policy. Before any release decision, update stale release
metadata and verify the final branch head; consumer and Docker checks belong to
the consuming application's integration lane.

#### Intent

Continue the Zacatl 0.0.66 Service compatibility and lifecycle review, reproduce active findings against this branch, and implement only evidence-backed fixes.

#### Current State

Implementation commit `a71bdc30` contains the verified lifecycle cleanup. Page registration follow-up `bde72f6f` is pushed on `release-0.0.66` in draft PR #180 against `main`. Package metadata remains `0.0.65`. CVE, pending-release, and peer-install checks pass on code head `bde72f6f`; Docker and publish-dry-run are skipped by workflow policy. The local privacy edits remain uncommitted and were excluded from the PR. No merge, tag, package publication, or deployment of `0.0.66` occurred.

#### What Was Inspected

- Repository guidance in `.hawp/kit/start-here.md` and `.hawp/kit/usage/status-report.md`.
- Existing plans `19965b11`, `0ab7e9b2`, `6ec737fa`, `fa61f33c`, `f1080c66`, and `533c3a53`.
- Current Service, Server, database server, SQLite/Sequelize/Mongoose adapters, service tests, and release notes.
- Node 26.3.0 and npm 11.17.0, satisfying package engine requirements.

#### What Changed

- `DatabaseServer` tracks adapters before connection, releases all tracked adapters on any setup failure, attempts every disconnect, and clears its ownership map.
- SQLite, Sequelize, and Mongoose adapters retain opened connections before awaiting `onDatabaseConnected`, allowing cleanup if user setup rejects.
- `Server.stop()` attempts database disconnect after HTTP close failure and preserves the first cleanup error.
- Added regression coverage for callback failure cleanup across all three database vendors, later database failure, Service startup failure at callback/repository/page/listener stages, and HTTP close rejection.
- Added Server-level tests proving configured `/api` prefixes are prepended and omitted prefixes preserve handler URLs; clarified this contract in the Service config docs.
- Added an Unreleased changelog entry and updated the existing lifecycle, Service composition, documentation, direct Server, ORM-scope, and API-shim plans. The prior untracked October 20 status report was preserved.

#### What Was Directly Verified

- `npm test`: 85 files, 752 tests passed.
- `npm run type:check`: source, test, and scripts all passed.
- `npm run build`: passed.
- `npm run lint:silent`: passed with existing warnings (1 source, 47 test, 42 script; no errors).
- `npm run smoke:consumers`: all five fixtures passed: non-SQL, Node SQLite, Mongoose, Sequelize SQLite, and Sequelize Postgres. Sequelize SQL fixtures retain the known nested UUID audit notice from the consumer-owned dependency tree.
- Eight Docker example stacks passed `/` and `/api/greetings` CRUD checks using the locally built framework. MongoDB examples used `mongo:7.0`; the repository-default `mongo:latest` cannot start on this Docker Desktop VM's Linux 7.0.12 kernel.
- A Fastify + in-memory SQLite start-stop-start probe rejected the second `start()`; its database-connected callback ran only once. This confirms restart currently fails for this case. No public restart contract was found, and this work does not claim restart support.
- GitHub release metadata and npm timestamps confirm `v0.0.65` published on October 20. The October 17 date remains its candidate date; the changelog status now records the publication.
- `.hawp/bin/hawp links check` passed for 212 Markdown files; `git diff --check` passed. `hawp work validate` passed backlog consistency, evidence integrity, verification clarity, and dead-link checks, but failed on the repository's historical closed-task completeness and legacy ID-format findings. No unrelated historical records were changed.

#### What Remains Unproven

- Restart behavior for Express, CLI/Desktop, and other database vendors; no intended public restart contract is documented.
- Website runtime, Docker, and live deployment compatibility; the website migration remains separate.
- Docker smoke and publish dry-run in PR workflow were skipped by policy; local maintained-example checks are recorded above.

#### Constraints

Kept the host-first `listen(host, port)` API and canonical ORM token contract unchanged. No broad ServiceConfig/module-composition API was introduced. The privacy edits already present in this checkout are not part of the Service implementation scope. No merge, tag, package publication, or deployment was performed.

#### Help Wanted

Decide separately whether the supported lifecycle contract should explicitly be one-shot startup or full restart with complete HTTP, database, route, and readiness reconstruction.

#### Suggested Next Step

Three completed plans (`6ec737fa`, `fa61f33c`, `533c3a53`) are archived with current-head evidence. Keep lifecycle restart (`f1080c66`), broader composition (`19965b11`), and documentation reconciliation (`0ab7e9b2`) active; keep website migration and live verification separate.

## Continuation State

Resume on `release-0.0.66`, based on `b07979e2`, with the implementation
commit pushed and draft PR opened after local verification. Check current PR
CI before closing eligible work items. Decide separately whether the lifecycle
contract is one-shot or should support restart; do not claim restart support
from the one reproduced failure. Keep website migration separate.

## Archival Record

This existing HAWP status report was extended as the canonical checkpoint for
this work; no parallel `docs/checkpoints/` copy was created. The associated
public repository is `sentzunhat/zacatl`. The checkpoint is saved on
`release-0.0.66`; only this report is included in its checkpoint commit. Other
implementation diffs and the October 20 status report remain outside that
commit.

#### Follow-up: website HTML 404 container scope

The website's current Fastify `setNotFoundHandler` calls global-only
`resolveDependency(RenderPageProvider)`. The provider is a singleton backed by
Service-owned repositories, so this can select the wrong provider across
multiple Services in one process. Zacatl's current page callback receives one
`PageRegistrationContext` with `adapter`, `rawServer`, `resolve(token)`, and
`isApiRequest(url)`. The resolver uses the matching Application container for
Service-managed Server construction and the global container for direct
unmanaged Server construction. This named-context API supersedes the earlier
optional-third-argument design. Focused tests verify two Server scopes resolve
their own values.

The website repository was inspected read-only. Its callback still calls the
global resolver and has not yet been migrated to use the supplied scope; no
website runtime or deployment verification was performed. This finding was
missed in the preceding summary and remains an explicit consumer follow-up.

The follow-up was verified with `npm test` (85 files / 752 tests),
`npm run type:check`, the build, lint, all five consumer smoke fixtures, eight
Docker examples, local Markdown link checking, and `git diff --check`. Lint
passed with existing warnings and no errors. The consumer-owned Sequelize UUID
audit notice remains. Default MongoDB `latest` was blocked by the local kernel;
Mongo application paths passed using MongoDB 7.0.

#### Follow-up: simple page registration and API 404 guard

The website code shows that only its HTML 404 handler needs
`RenderPageProvider`; the rest of `createFastifyApp()` configures native
Fastify behavior. Zacatl now passes one `PageRegistrationContext` to
`customRegister`, including `resolve(token)` bound to that Server's handler
scope and `isApiRequest(url)` bound to its configured API prefix. Page SPA
fallback inherits Server prefixes when page prefixes are omitted. This keeps
an unknown request under a configured API path on the JSON 404 path, while
allowing application-owned HTML rendering for page misses. The website still
needs to use the matcher and return its existing JSON 404 response; Zacatl
does not register that consumer-specific 404 handler automatically.

Direct verification on Node 26.3.0/npm 11.17.0: 3 focused files / 53 tests,
full suite 85 files / 754 tests, source/test/script type checks, build, lint
(zero errors; existing warnings), all five consumer smoke fixtures, local
Markdown link checks, and `git diff --check` passed. The Fastify adapter test
confirms `/v1/missing` yields a structured 404 rather than HTML fallback when
`/v1` is configured. The eight maintained Docker examples were verified
before this callback change, not rerun for it. Website source, tests, Docker,
and live deployment remain unverified for this migration.


#### Follow-up: Copilot review and DI implementation location

Copilot's completed review reported named-adapter lookup and cleanup-error handling, plus stale callback guidance and changelog heading formatting. Named adapters are now looked up by vendor and optional connection name. `Server.stop()` uses an explicit failure sentinel so rejection with `undefined` remains observable. The stale HAWP callback notes now describe the single `PageRegistrationContext`, and the Unreleased changelog heading uses the established emoji style. No unresolved review threads remained in that completed review.

The DI implementation now resides at `src/third-party/dependency-injection/container.ts`; the old `src/dependency-injection/` directory and root DI source file are removed. `src/third-party/dependency-injection.ts` is a deliberately small explicit-export facade: direct mapping to the implementation exposed internal helpers in the public package path. The documented `/dependency-injection` package entry maps to this facade. The old `/dependency-injection/container` export and an auto-generated third-party deep export are excluded. Example TS configs, build aliases, Vitest resolution, and source imports now use the updated locations.

Verification on Node 26.3.0/npm 11.17.0: `npm test` passed (85 files / 761 tests), `npm run type:check` passed for source/test/scripts, `npm run build` passed and generated the intended `/dependency-injection` mapping, `npm run lint:silent` passed (zero errors; existing warnings), and `npm run smoke:consumers` passed all five maintained consumer fixtures. The Sequelize fixtures still report their consumer-owned nested UUID advisory. `git diff --check` passed. No website runtime, Docker, or deployment claim is made from these Zacatl checks.


#### Follow-up: keep DI source aliases and package exports synchronized

The source path generator now preserves `@zacatl/dependency-injection` at `src/third-party/dependency-injection.ts`. The local package export synchronizer validates the explicit facade artifacts before mapping `/dependency-injection`. The shared export policy excludes the DI facade and implementation from third-party deep subpaths, while runtime alias rewriting maps the canonical DI alias to the package import. Updated the three example Vitest configs that still targeted the removed source folder.

`npm run paths:generate` retained the canonical alias and generated the third-party source aliases; `npm run local:exports` preserved `/dependency-injection` and did not add either deep container export. The local exporter writes the CommonJS scope marker for `build-src-cjs`, matching publish output and fixing local `require()` resolution. ESM and CommonJS runtime checks both load the documented DI entry with exactly nine exports; the internal deep import is rejected.

Verification on Node 26.3.0/npm 11.17.0: `npm test` passed (85 files / 762 tests), `npm run type:check`, `npm run build`, `npm run lint:silent` (zero errors; existing warnings), and `npm run smoke:consumers` (all five fixtures) passed. `npm run paths:generate`, `npm run local:exports`, focused export-strategy tests (16 tests), `.hawp/bin/hawp links check`, and `git diff --check` passed. Consumer smoke still reports the existing Sequelize-owned nested UUID advisory; no change was made to peer ownership.

#### Follow-up: third-party barrels and example alias paths

Inspection found that the root third-party barrel is the sibling file
`src/third-party.ts` and its build declaration is
`build-src-esm/third-party.d.ts`. Example and script configs still referenced
nonexistent `third-party/index.ts` paths; several example source configs also
pointed module aliases at nonexistent directory indexes and excluded the
linked Zacatl source from `rootDir`. Corrected those paths, added the internal
`@zacatl/*` source aliases to source-mode configs, set their root to the repo,
and removed unused aliases for nonexistent infrastructure/domain/application/
platform barrels. Updated the three example Vitest alias tables to use the
source barrel and explicit source-tree rewrites.

No `databases/` folder import/export was added: ORM integrations remain explicit
optional-peer leaf subpaths, avoiding eager loading of every adapter. The DI
facade remains the canonical `/dependency-injection` package entry; its
implementation is not a folder-level package export.

Verification on Node 26.3.0/npm 11.17.0: `npm run paths:generate`,
`npm run build`, `npm run type:check`, and `npm run smoke:consumers` passed; all
five consumer fixtures passed, with the existing Sequelize-owned nested UUID
advisory. All seven source-mode example TypeScript configs passed
`npx tsc --noEmit -p`. An exact path audit validated 132 current Zacatl
example/script mappings. The export-strategy test file passed 18 tests; the
full suite passed 85 files / 764 tests; local links and `git diff --check`
passed. All three example Vitest configs loaded from their backend directories;
those directories contain no tests. This does not establish example runtime or
Docker compatibility.

#### Archival continuation: third-party DI layout and current PR review

Conversation/event date and checkpoint date: 2026-10-21. This section extends
the existing checkpoint; it does not create a second `docs/checkpoints/`
record. Zacatl is the associated public repository. No personal identifiers,
machine-local paths, or unrelated private project details are included.

Before this continuation, the existing HAWP report already recorded the
Service lifecycle and page-registration work, the API-prefix contract, and the
website's still-unverified consumer migration. The DI source had just been
moved under `src/third-party/`, but path, export, and example synchronization
still needed review. A previous Copilot review had three database ownership
comments; those fixes were implemented and tested before the later review on
the current PR head.

During this continuation, the DI implementation was kept at
`src/third-party/dependency-injection/container.ts`, and the obsolete
`src/dependency-injection/` directory was removed. Evidence showed that a
small explicit-export facade is needed to keep internal helpers out of the
public package entry. The canonical `/dependency-injection` export is
preserved; internal deep exports are excluded. Path generation, local export
synchronization, CJS/ESM aliases, example configs, and import/export tests were
aligned. A further directory audit found the source third-party barrel is
`src/third-party.ts` (a sibling file), not `src/third-party/index.ts`; example
and script aliases were corrected to existing paths. ORM adapters remain
explicit optional-peer leaf exports; no eager `databases/` barrel was added.

After these changes, local verification on Node 26.3.0/npm 11.17.0 passed:
85 test files / 764 tests, source/test/script type checks, build, lint with no
errors and existing warnings, five consumer smoke fixtures, path generation,
local export synchronization, focused export tests (18 tests), seven source-
mode example TypeScript configs, and an exact-path audit of 132 Zacatl
example/script mappings. The three example Vitest configs loaded, but those
folders contain no tests. This verifies Zacatl's source/build mappings; it
does not prove downstream website runtime, Docker, or deployment behavior.

Current GitHub state was checked on 2026-10-21: draft PR #180
(`Harden Service lifecycle and page registration`) is open against `main` from
`release-0.0.66`, at `052e111ffd7c4f08b39f3586881bc91fed2fade6`. Required
review is still pending. The latest Copilot review on the code head immediately
before the archival-only commit (`052e111ffd7c4f08b39f3586881bc91fed2fade6`) has four
unresolved comments: add an exact-file Vite alias for `src/third-party.ts`;
correct the tree marker in `docs/guidelines/architecture.md`; merge duplicate
third-party roots in `docs/guidelines/framework-overview.md`; and consolidate
duplicate imports in `src/service/layers/infrastructure/infrastructure.ts`.
Earlier database comments are not listed as open by this latest review. CI
checks for pending release, CVE scan, and peer install passed; Docker smoke and
publish dry-run were skipped by workflow policy. Do not describe the latest
four review comments as fixed until their specific claims are checked and the
remote review state is read back.

Current repository state at checkpoint: local branch
`release-0.0.66` matches `origin/release-0.0.66` before this archival commit.
Unrelated local changes remain in `.github/dependabot.yml`,
`.hawp/work/closed/2026/07/27/871e98ef-v0.0.59-dependency-bumps.md`,
`docs/changelog.md`, `src/eslint/naming-conventions.mjs`, and the pre-existing
untracked `.hawp/work/status/2026/10/20/` directory. They are intentionally
excluded from the checkpoint commit. No merge, release, publication, or
deployment occurred.

#### Continuation state

Resume by checking the four latest Copilot comments against the current source,
docs, and generated alias behavior. Fix only substantiated issues, add focused
regressions where behavior warrants them, run affected checks, push the review
fixes, then read back the new PR head, checks, and review threads. Keep the
website callback migration and runtime/Docker verification in the website's
own integration work. The restart-after-stop contract and broader reusable
ServiceConfig composition remain separate open design questions. Reconcile
the stale v0.0.65 changelog publication wording before the next release.

Memory delta: the earlier Zacatl lifecycle note remains historical. A dated
follow-up memory note records this DI/export synchronization milestone and
current PR review state without duplicating the full checkpoint. This HAWP
status report remains the detailed canonical record.

Archival push readback: checkpoint commit
`fca95b0a24762a91102713a92f6489989c90393c` was pushed to
`origin/release-0.0.66`. GitHub reports PR #180 at that exact head and still
`REVIEW_REQUIRED`; its pending-release, CVE, and peer-install checks had
restarted and were `IN_PROGRESS` at the readback. The four Copilot comments
remain the latest review findings on the preceding code head. The documentation
checkpoint commit does not address those review comments.

#### Archival continuation: current PR head and follow-up review

Conversation/event date and checkpoint date: 2026-10-21. This is the latest
continuation of the same canonical checkpoint. The repository is public; this
record omits personal identifiers, local machine paths, and unrelated private
project context.

Since the preceding archival readback, the code branch advanced to
`bfa04c05099ce80dbf85587c8f0f5a1a40437016`. PR #180 remains open and draft
against `main`, with review required.
All current-head CI jobs completed: pending-release, CVE scan, peer install,
and all eight Docker smoke jobs passed; publish dry-run was skipped by workflow
policy. This is CI evidence for the current head, not evidence of a release,
publication, or deployment.

The four earlier Copilot findings about the exact-file Vite alias, architecture
tree marker, framework-overview tree duplication, and duplicate infrastructure
imports are now resolved and outdated on GitHub. The latest review adds five
unresolved findings on `bfa04c05`: regenerate and include the package export
map for the DI facade; correct DI example imports in
`docs/dependency-injection/patterns.md` and `docs/llms.txt`; exclude stale
incremental build artifacts from `scripts/publish/export-policy.ts`; and use
the package path the export policy actually retains in
`docs/third-party/README.md`. These findings are pending assessment and are not
recorded as fixed.

Four unrelated local files are modified and remain uncommitted. They are
intentionally excluded from this archival update and must be preserved. No
implementation changes, merges, releases, or deployments are part of this
continuation.

#### Continuation state

Resume by assessing the five current Copilot findings against the package
export generator and policy, docs examples, and incremental-build behavior.
Apply supported fixes with focused checks, commit and push the code changes,
then read back the PR head, CI, and review threads. Keep the PR draft; do not
merge or publish without explicit approval. The unrelated local edits remain out of scope for this checkpoint commit.

Archival readback: current PR #180 head is
`bfa04c05099ce80dbf85587c8f0f5a1a40437016`, review is required, four prior
Copilot threads are resolved, and five findings on the current head remain
unresolved. Current-head CI passed except publish dry-run, which was skipped.

#### Follow-up: five current Copilot findings

The five new findings were assessed and corrected: package exports now include
the explicit third-party DI facade; documentation examples import the
container and tsyringe decorators from the `/tsyringe` wrapper; stale
configuration/localization/legacy DI build artifacts are excluded from local
exports; and the third-party README advertises the supported DI package path.

Direct verification: `npm test` passed (85 files / 765 tests), the focused
export-strategy suite passed (18 tests), and `npm run build` regenerated 162
exports. Inspection confirmed the facade export is present and obsolete DI,
configuration, and localization subpaths are absent. `git diff --check` passed.
Push and current PR review/CI readback remain pending. Four unrelated local
changes remain untouched.

#### Continuation state

Commit and push only the five finding-related code/documentation changes and
this HAWP record. Then verify PR #180 head, CI, and review-thread resolution.
Keep the PR draft; do not merge, publish, or deploy.
