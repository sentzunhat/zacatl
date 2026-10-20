# 2026-10-19 — Zacatl development integration and release sequencing checkpoint

**Event/archive date:** 2026-10-19 · **Scope:** public Zacatl repository only.
Continues the canonical Service implementation timeline in
[plan 19965b11](../../../active/19965b11/plan.md).

## Before

Draft PR #138 was framed as a Zacatl 0.0.65 release candidate targeting
`main`. The user clarified that this PR should integrate development work to
`dev`; the release PR to `main` comes afterward. The listener API intentionally
requires `listen(host, port)` during pre-0.1.0 development, even though this
breaks existing custom adapters.

## During

- Retitled PR #138 to “Add scoped Service lifecycle, host-aware adapters, and
  dependency refresh,” retargeted it to `dev`, and rewrote its description to
  explain the development integration and later release-PR sequence.
- Preserved the pre-0.1.0 host-first adapter break and documented that custom
  adapters must migrate and that the public contract is intended to stabilize
  at 0.1.0. The related Copilot thread remains unresolved by owner choice.
- Clarified policy: before the first 0.1.0 release, `0.0.x` increments may
  include breaking changes, features, and improvements. From 0.1.0 onward,
  breaking changes during 0.x require a minor bump.
- Fixed direct `Server.start()` preparation with a shared, idempotent prepare
  promise; direct `Platforms.start()` inherits this through delegation.
- Refreshed README and changelog counts after a full test run (84 files / 724
  tests).

## After — directly verified

- Repository: `sentzunhat/zacatl`; branch: `codex/release-0.0.65`.
- Implementation commit `3779cb111e3e657b39d0754e04f58d8fbda19296` and HAWP
  follow-up `7f086fcfd151ee74e24a1507c8a2fc6e2f35e61a` are pushed to
  `origin/codex/release-0.0.65`.
- PR #138 is open, draft, mergeable, and targets `dev`; `dev` and `main` both
  pointed to `8fa7a790` at inspection. Nothing has been merged or released.
- GitHub confirms PR #138 remains open and draft at head `7f086fcf`, targeting
  `dev`. The version and two lifecycle review threads are resolved. The
  accepted adapter compatibility thread remains unresolved by owner choice.
- Local verification passed: 724 tests across 84 files, `npm run type:check`,
  `npm run build`, `npm run lint:silent` (existing warnings), and
  `git diff --check`. Current-head CI run 39285485782 is queued; no CI result
  is claimed yet. That run is associated with implementation commit `3779cb11`;
  the latest HAWP-only head has no workflow run or status entry.

## Strategic impact

This is now a development integration PR, not the release PR. Its branch still
contains package metadata and changelog for 0.0.65. The versioning guide now
defines `0.0.x` as the unstable initial development series before 0.1.0 and
requires migration notes for breaking changes. The release version remains a
decision for the separate release PR.

## Continuation state

**Resume from:** the current Copilot findings on PR #138, head
`7f086fcfd151ee74e24a1507c8a2fc6e2f35e61a`.

Next actions:

1. Preserve the owner-approved host-first adapter contract and its migration
   note; do not resolve that compatibility finding as though it were fixed.
2. Check current-head CI run 39285485782 before development integration. The
   lifecycle/version review findings are resolved; keep the adapter thread
   unresolved by owner choice.
3. Decide the release version in the separate `dev` to `main` release PR after
   development integration is ready.

No personal or private consumer information is recorded here.

## Later Copilot thread audit — 2026-10-19

This audit supersedes the older head/CI resume facts above. GitHub GraphQL
returned all 19 PR #138 review threads (no next page) and 16 reviews. At
inspection, the remote PR head was `6f9aa0e3`, still open, draft and targeting
`dev`; all 12 checks on that remote head passed. Local `04f3a090` is one
documentation/HAWP commit ahead and has no PR CI run. GitHub thread status is
recorded separately from current-code verification.

| Thread | Finding | Current assessment |
| --- | --- | --- |
| 1 | Direct `Layers(config, parent)` | Resolved; constructor derives scopes; unit coverage passes. |
| 2 | Direct `Platforms(config, container)` | Resolved; Application scope derived; unit coverage passes. |
| 3 | Direct `ApiServer(config, adapter)` | Resolved; constructor falls back to global container; unit coverage passes. |
| 4 | Optional page raw-server access | Resolved; port optional, guarded call and legacy-adapter test pass. |
| 5 | Direct `Server(config[, container])` | Resolved for construction; tests pass. Direct route registration is a separate confirmed failure in thread 18. |
| 6 | Page port documentation | Resolved; guide matches the optional method and zero-argument `register()`. |
| 7 | `ApiServer.listen(port)` | GitHub-resolved historical fix was later reversed. Current API requires `(host, port)` under the owner's accepted pre-0.1.0 break. |
| 8 | Legacy `ApiServerPort.listen(port)` | GitHub-resolved historical fix was later reversed; same accepted contract break as thread 13. |
| 9 | Provider snippet mismatch | Resolved; both examples show host-first calls. |
| 10 | Manual legacy ORM symbol | Resolved for single-Service usage; all adapters have legacy-token fallback, Sequelize direct-registration test passes. Cross-Service collision remains open. |
| 11 | Mismatched Server scopes | Resolved; constructor checks token identity and mismatch test passes. |
| 12 | Configured host ignored by legacy adapter | Historical fallback no longer exists; current built-in adapters use the supplied host. Contract break remains accepted. |
| 13 | Host-first adapter break | Open by owner decision; source, guide and changelog identify migration. It is accepted, not fixed. |
| 14 | Breaking `0.0.65` version | Resolved by the explicit pre-`0.1.0` `0.0.x` policy; release version still selected in the later release PR. |
| 15 | Direct `Platforms.start()` preparation | Resolved; real Fastify check prepared page once and listened; unit suite passes. |
| 16 | Direct `Server.start()` preparation | Resolved; real Fastify prepare-then-start check prepared page once and listened; unit suite passes. |
| 17 | Global ORM compatibility registrations | Open and confirmed by two-Service same-name token overwrite reproduction. |
| 18 | Direct Server global route resolution | Open and confirmed: `registerEntrypoints` failed to resolve a globally registered route. |
| 19 | Service-owned ORM scope | Open; same confirmed token overwrite as 17. Repository cross-query and index-policy effects require focused checks. |

Local verification on `04f3a090`: 84 test files / 724 tests passed,
`npm run type:check` passed, `npm run build` passed, and
`npm run lint:silent` passed with existing warnings. These broad checks do
not cover the two reproduced failures. See active bug plans `6ec737fa` and
`fa61f33c` for reproduction details and next steps. No source fix, review
thread resolution change, merge, or release occurred in this audit.

## Later implementation checkpoint — 2026-10-19

### Intent

Apply the agreed Service ownership map and fix the remaining direct-entry and
multi-Service scope regressions in PR #138, while leaving the physical database
move for a separate development change.

### Current state and changes

- Direct `Server` and `Platforms` consumers now resolve configured routes and
  hooks; the Service-managed Application scope remains isolated. See `6ec737fa`.
- Service-owned SQLite, Sequelize and Mongoose ORM instances are registered in
  each Service's Infrastructure scope. Repository constructors capture their
  owning scope; the Mongoose index registry is also Service-owned. Direct/manual
  adapters retain global fallback behavior. See `fa61f33c`.
- Architecture and API docs now distinguish the agreed ownership from the
  current transitional source/config layout. The physical connection lifecycle
  move is tracked as `bfea146e` for a later development change.
- The pre-`0.1.0` `0.0.x` version policy and owner-accepted host-first adapter
  break remain in force; neither was silently reverted.

### Direct verification

- Local unit suite: 85 files / 732 tests passed, including direct-entry and
  same-name two-Service SQLite, Mongoose and Sequelize regressions.
- Type checks, build and lint passed; lint reports existing warnings only.
- Consumer smoke fixtures passed. Their Sequelize fixtures still report the
  previously documented nested `uuid` advisory.
- HAWP kit validation and Markdown link checks passed. HAWP work validation
  passed backlog consistency, evidence integrity, verification clarity and
  links; its aggregate exit remains failure due to historical closed-task
  completeness gaps outside this change.

### Remaining proof and next step

Verify the pushed PR head and CI before development integration. Keep the
accepted `ApiServerPort.listen(host, port)` compatibility thread explicitly
unresolved. The database source/config migration and release PR to `main`
remain separate work; no merge or publication occurred at this checkpoint.

## Later Copilot review follow-up — 2026-10-19

The review on squashed head `5a3e594a` identified a direct `Layers` ORM fallback
regression and a malformed ZodError guard. Both were reproduced with focused
tests before source changes. Direct Layers now explicitly captures the legacy
global ORM source, including when a parent is supplied for layer DI;
Service-owned Layers continue to capture their Infrastructure scope. The
shared `isZodError` guard now checks the issue shape before request or
configuration error wrapping. Final local verification passed 736 tests across
85 files, type checks, lint, build and consumer smoke. The final-head CI result
remains unproven at this checkpoint.

The review overview mentioned restart and partial connection cleanup without
separate inline findings. Source inspection found plausible lifecycle gaps;
`f1080c66` owns reproduction and contract design in a separate change. The
database ownership move remains `bfea146e`. The host-first adapter break stays
an accepted, intentionally unresolved review thread.
