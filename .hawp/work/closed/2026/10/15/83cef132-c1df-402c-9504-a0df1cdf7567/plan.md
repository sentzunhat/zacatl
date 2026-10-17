# 83cef132 — Update the `.hawp` folder to HAWP 0.0.24

**UUID:** `83cef132-c1df-402c-9504-a0df1cdf7567` · **Type:** tooling · **Priority:** P3 · **Reported:** 2026-10-03
**Status:** done · **Closed:** 2026-10-15 · **Scope:** Codex provider refresh requested for this task

## Goal

Bring the repo-local HAWP kit (`.hawp/kit/`, `.claude/rules/hawp-*.md`,
`CLAUDE.md` / `AGENTS.md` pointers) up to HAWP 0.0.24, the version the owner
now runs. The last refresh came in with 0.0.63 (Codex provider, `main`).

## Plan

1. Refresh the HAWP kit and Codex provider overlay from HAWP `main`, preserving
   existing `AGENTS.md` and `.hawp/work/**`.
2. Review the diff and validate the current work records.

## Out of scope

- Migrating existing work items to UUID folders — `ac0c4acf`.

## Verification

## Update Evidence (2026-10-15)

- Ran the supplied Codex update command from the Zacatl repository root with
  `REF=main`; output confirmed `Source: sentzunhat/human-ai-workflow-protocol@main`,
  `Provider: codex`, `Source mode: remote archive`.
- Refreshed `.hawp/kit/**` and `.hawp/LICENSE`; HAWP CLI release `0.0.24` was
  downloaded and SHA-256 verified. Existing `AGENTS.md` was preserved.
- `.hawp/work/**` was preserved by the updater. The active backlog/status
  reconciliation was completed in the same task; historical closed-record
  validation debt remains documented below.
- `hawp kit validate`: 3 checks passed. `hawp work validate` still reports
  legacy backlog/closed-record drift; see current task report before claiming
  a clean validation.

Claude provider files were not part of the supplied Codex-provider update
instruction and remain unchanged; any Claude refresh should be a separate
explicitly scoped task.

## Outcome

Updated the repo-local HAWP kit from the HAWP `main` branch using the Codex
provider. The provider update completed as requested; the existing custom
`AGENTS.md` and all `.hawp/work/**` records were preserved by the updater.

## Verification

- Update command output: `Source: sentzunhat/human-ai-workflow-protocol@main`,
  `Provider: codex`, `Source mode: remote archive`.
- HAWP release `0.0.24` binary checksum verified; `hawp kit validate` passed
  (3 checks, 0 issues).
- `hawp links check` passed after repairing stale HAWP entry-point links.
- `hawp work validate` remains non-clean because of historical closed-record
  checklist debt and two legacy IDs; current active and parked plan paths
  resolve (7/7 active, 3/3 parked).
- `git diff --check` passed.

## Close Checklist

- [x] Outcome recorded
- [x] Verification recorded with remaining validator findings
- [x] Active backlog row removed and recent-close entry added
- [x] Plan moved to the dated closed archive
