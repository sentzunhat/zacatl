# Zacatl stabilization baseline

- **Branch:** `stability/review-20260628-2340`
- **Base:** `another-update-branch-work`
- **Mode:** stabilization only — no new product features
- **Status:** investigation and validation planning in progress

## Scope

Review the existing integration baseline and all active or recently merged work that can affect release stability:

1. Node 26 and TypeScript 6 compatibility.
2. ORM and repository adapter contracts.
3. Package export surface and barrel-pruning behavior.
4. Dependency/security updates.
5. Build, lint, type-check, test, package, and example validation.
6. HAWP and contributor documentation required to make the work repeatable.

## Evidence collected

- The base branch is ahead of `main` by 59 commits and contains a broad integration surface; it should not be treated as a small feature PR.
- `package.json` declares Node `>=26.3.0`, npm `>=11.0.0`, TypeScript `^6.0.3`, and version `0.0.57`.
- The repo provides deterministic scripts for `lint`, `type:check`, `build`, `test`, `prepublish:guard`, `prepare-publish`, and `publish:dry:ci`.
- The branch history contains overlapping work on Node/TypeScript upgrades, ORM alignment, barrel removal/package pruning, HAWP guidance, and dependency upgrades.

## Verified correct

- The stability branch was created directly from the requested integration branch.
- The repository has explicit validation and publishing scripts rather than relying only on ad-hoc commands.
- HAWP guidance already establishes investigation-first intake and planning before implementation.

## Constraints

This agent environment cannot clone the GitHub repository through the terminal, so local command execution has not been claimed as completed. Validation results must be produced by CI or a repository-capable execution environment before release approval.

## Compoundable work items

### STAB-001 — Create reproducible validation evidence (P0)

**Goal:** run the canonical validation sequence on this exact branch and record exact command/result evidence.

**Commands:**

```bash
npm ci
npm run lint:silent
npm run type:check
npm run build
npm test
npm run prepublish:guard
npm run prepare-publish
npm publish ./publish --dry-run
```

**Acceptance criteria:** each command has a timestamped pass/fail result; environment-only blockers are clearly separated from code failures; no release decision is made from incomplete evidence.

### STAB-002 — Audit branch and PR overlap (P0)

**Goal:** classify every open or recently active branch/PR as merge, supersede, defer, or archive.

**Acceptance criteria:** each item has a base/head relationship, unique-change assessment, conflict risk, and disposition.

### STAB-003 — Verify package boundaries after barrel removal (P0)

**Goal:** prove published ESM/CJS exports resolve from a clean consumer fixture and no forbidden nested barrel files remain in publish output.

**Acceptance criteria:** `prepare-publish` succeeds; consumer fixture imports declared entrypoints; package file listing is reviewed.

### STAB-004 — Verify Node 26 / TypeScript 6 / ORM contract compatibility (P0)

**Goal:** validate each supported adapter compiles and tests against the shared repository contracts.

**Acceptance criteria:** type-check and targeted adapter tests pass; intentional compatibility casts are documented with a reason and expiry/review owner.

### STAB-005 — Consolidate dependency and vulnerability posture (P1)

**Goal:** reconcile overlapping dependency updates, run vulnerability scanning, and document unresolved advisories.

**Acceptance criteria:** one lockfile-consistent dependency state; scanner output retained; unresolved findings have risk/disposition.

### STAB-006 — Release readiness record (P1)

**Goal:** produce a concise go/no-go checklist with version, changelog, CI matrix, consumer smoke test, and rollback guidance.

**Acceptance criteria:** all P0 items closed or explicitly waived by an owner with rationale.

## Decision

Do not merge this stabilization branch into `main` or `development` until STAB-001 through STAB-004 have verified evidence.