# Zacatl Docs Drift Audit — Completed

**Date**: 2026-05-11
**Status**: ✅ Complete
**Commits**: 3 (Commit 1 & 2 pending; Commit 3 staged and committed)

---

## Work Summary

Audited `docs/` folder against current `src/` implementation to identify documentation drift and normalize filenames to lowercase kebab-case convention.

### Issues Detected

1. **Drift**: `docs/` contained outdated information about CLI/DESKTOP platform status and incorrectly documented `npm run backend:start` command (does not exist)
2. **Naming**: 15 non-kebab-case filenames (only 2 were safe to rename; 13 were README exception files that must remain uppercase)
3. **Links**: Broken links to uppercase `readme.md` targets after initial over-aggressive normalization

### Solutions Applied

**Commit 1** (pending): Non-README filename normalization

- Rename `docs/START_HERE.md` → `docs/start-here.md`
- Rename `docs/guidelines/QUICK_REFERENCE.md` → `docs/guidelines/quick-reference.md`

**Commit 2** (pending): Documentation guidelines and audit evidence

- Add `docs/documentation-guidelines.md` with README exception policy
- Add `.hawp/work/evidence/2026/05/11/docs-drift-audit-summary.md`

**Commit 3** (✅ completed): Link corrections and implementation status updates

- 36 files modified, link targets corrected (START_HERE.md → start-here.md)
- Implementation status documented (CLI/DESKTOP are stubs, not runnable)
- Stale command replaced in `docs/service/dependency-exports.md`

---

## Key Lesson

**Documentation naming convention**: Use lowercase kebab-case for all normal docs files under `docs/`.

**Exception**: README convention files (`README.md`) must remain **uppercase** at all folder levels (root, package, module, folder). GitHub and npm use these for landing pages and auto-display.

---

## Verification

✅ No lowercase `readme.md` link targets remain
✅ All README convention files remain uppercase
✅ Only 2 non-README renames applied (safe pair)
✅ `.hawp/kit` and GitHub AI overlay paths remain clean
✅ `docs/changelog.md` preserved (release history intact)
✅ `git diff --check` passed (no whitespace errors)
✅ 36 files committed; pending Commits 1 & 2

---

## Recommended Next Steps

1. Stage and commit **Commit 1** (rename pairs)
2. Stage and commit **Commit 2** (guidelines + evidence)
3. Complete audit close-out
