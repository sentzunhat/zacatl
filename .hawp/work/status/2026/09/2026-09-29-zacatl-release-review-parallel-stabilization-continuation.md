# 2026-09-29 — Zacatl release review and parallel stabilization continuation

## Purpose

Continuation checkpoint for the release-readiness review and proposed parallel HAWP work. This record contains only public-repository technical context.

## Before

- Zacatl already used HAWP as the durable work-management convention: active plans live under `.hawp/work/active/`, status/evidence are archived by date, and `.hawp/work/BACKLOG.md` is the active index.
- Earlier stabilization work established CI/release gates, consumer checks, security scanning, and release workflows.
- The historical branch `another-update-branch-work` had been used for substantial stabilization and HAWP integration work.
- Prior parallel-work guidance favored isolated lanes/worktrees, one work item per owner, explicit overlap guards, and no automatic merge.

## During this review

- A review was requested of `another-update-branch-work` as a possible patch release, using repository patterns/guidelines and HAWP while keeping changes simple.
- The inspected historical branch was 59 commits ahead of its then-base and contained broad HAWP, documentation, examples, workflow, Node/TypeScript, and release-tooling changes. The review therefore treated release evidence as more important than assuming the change set was patch-sized.
- One concrete release inconsistency was identified at review time: `.github/workflows/cve-scan.yml` used Node 24.14.0 while `package.json` declared Node >=26.3.0. The branch already carried STAB-001 to align CI with the declared runtime.
- A documentation drift issue was also identified: the HAWP start document referenced a guardrail ADR path that did not match the inspected branch layout.
- The recommended compounding order was: runtime/CI alignment; reproducible release evidence; example/Docker verification; documentation-link validation; then lower-risk type/lint/import/dependency cleanup. Broader starter simplification and path-generation/test-import work were considered later follow-up work.
- The next requested execution model was parallel work on separate branches derived from the reviewed branch, with HAWP guardrails and independent work-item ownership.

## Current repository state observed at archival time

- Archive date: 2026-09-29.
- The historical ref `another-update-branch-work` is no longer resolvable in the current remote branch list. Do not recreate it or assume its old head without new evidence.
- Current long-lived branches observed are `main` and `dev`; this checkpoint branch was created from `dev`.
- Current `dev` backlog contains newer release/stabilization work, including the 0.0.60 release candidate, NPM-OIDC-001, README/CI polish, dependency hygiene, platform-boundary work, and the v0.1.0 milestone. Older STAB/TASK identifiers from the historical branch must therefore be reconciled against current work before implementation rather than blindly revived.
- No application code, release workflow, backlog row, merge, rebase, or publish action was performed by this archival checkpoint.

## Decisions and guardrails

1. Use current repository state as source of truth; historical review findings are evidence, not automatically active tasks.
2. Before implementing a historical finding, verify whether current `dev` already fixed, superseded, or intentionally deferred it.
3. Parallel implementation should use separate branches/workspaces per independently owned work item.
4. Avoid overlapping file ownership between parallel lanes. If overlap is discovered, hold one lane and reconcile through the coordinator.
5. Keep commits small and independently testable.
6. Do not merge, publish, rebase, force-push, or retarget protected branches without explicit owner approval.
7. Prefer release-confidence work over broad cleanup immediately before a patch/minor release.

## Continuation state

### Current state

The review phase established a useful release-risk ordering, but the originally reviewed branch has since disappeared from the current remote refs. The repository has advanced beyond that historical snapshot.

### Next milestone

Reconcile the historical findings against current `dev`, then create only the still-relevant HAWP work items and assign non-overlapping parallel lanes.

### Next actions

1. Inspect current `dev` versions of Node/runtime declarations, CI workflows, HAWP links, examples, package exports, and release gates.
2. Mark each historical finding as fixed, superseded, still reproducible, or no longer applicable.
3. Cross-check against `.hawp/work/BACKLOG.md` to avoid duplicate work items.
4. For confirmed gaps, create/update HAWP plans before implementation.
5. Split implementation into independent branches only where file ownership and validation boundaries are clean.
6. Run the repository's existing CI/release evidence after integration; do not infer readiness from isolated lane success.

### Blockers / unresolved questions

- The exact final head and disposition of `another-update-branch-work` were not established during this archive pass.
- Historical STAB-001/STAB-006/STAB-007/STAB-008/STAB-009/STAB-010/STAB-012 and TASK-002/TASK-003 must not be assumed open in current `dev`; current backlog reconciliation is required.
- Whether the next release should be categorized as patch or minor depends on the current published/API/runtime delta, not the historical branch size alone.

## Resume point

Start from current `dev` and perform a bounded HAWP reconciliation of the historical release-review findings against the current backlog and code. Only then create parallel implementation branches for confirmed, non-overlapping gaps.
