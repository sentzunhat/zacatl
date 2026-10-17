# ac0c4acf — Improve work items: UUID IDs and folder-per-item layout

**UUID:** `ac0c4acf-c90a-4a32-a66a-b058577368f6` · **Type:** improvement · **Priority:** P3 · **Reported:** 2026-10-03
**Status:** done · **Closed:** 2026-10-15 · **Target:** after `83cef132` (Codex HAWP kit update completed 2026-10-15)

## Problem

The kit's current standard (`.hawp/kit/usage/intake-workflow.md`,
`.hawp/kit/references/backlog-alignment.md`) is UUID work-item IDs with a
folder per item — `active/{uuid}/plan.md`, `evidence/YYYY/MM/DD/{uuid}/evidence.md`,
`status/YYYY/MM/DD/{uuid}/status.md`. This repo still mixes formats: mnemonic
IDs (`DEPS-063`, `LOG-001`, `EXPRESS-400`), 8-hex IDs, flat plan files
(`active/<ID>.md`) and flat evidence files (`evidence/YYYY/MM/DD/<name>.md`).

## Plan

1. After `83cef132`, re-read the 0.0.24 rules for IDs, layout and the
   BACKLOG table columns (UUID / Legacy ID).
2. New items: always `hawp uuid` + `active/{uuid}/plan.md`; evidence and status
   in `{uuid}/` folders.
3. Open items: keep their current ID as Legacy ID; move flat plans into
   folders only where the kit asks for it.
4. Closed records: do not rename (kit rule); only fix broken links.
5. BACKLOG.md: adopt the 0.0.24 column layout, if it changed.

## Verification

`work:validate` (or the kit's equivalent) passes; every BACKLOG plan link
resolves; no closed record renamed.

## Current Checkpoint (2026-10-15)

The prerequisite Codex-provider kit refresh is complete. HAWP 0.0.24
validation currently reports legacy-format active/parked rows, missing detail
links for several old items, one orphaned active audit note, and closed-record
completeness findings. Do not bulk-apply normalization: review the dry-run and
preserve historical closed filenames. The initial migration scope should be
the current backlog/index and clearly orphaned active/parked records; legacy
closed-record modernization remains a separate decision.

**Next action:** reconcile active versus parked sections and plan links,
resolve duplicate provider-boundary rows, then rerun validation and document
remaining historical findings.

## Outcome (2026-10-15)

Aligned the current index and open records with the HAWP 0.0.24 layout,
without renaming closed history:

- **IDs:** open mnemonic IDs now map to canonical IDs with a **Legacy ID** in
  the plan header — `EXPRESS-400` → `f822490e-9898-4d57-b17c-7d0f318e6399`,
  `b4f0c8a1-readme-and-ci-badge-polish` → `b4f0c8a1` (both closed today in
  folder layout).
- **Recently Closed:** every row now links to a closed record. Added a closed
  record for `RUNTIME-FIX-001` (→ `72f2e6b9-a0fd-4abb-8151-c3b061b83281`),
  built only from the existing 0.0.62 release evidence. Archived the three
  rows older than 30 days (`0.0.61`, `871e98ef`,
  `refactor-collapse-duplication`) to `closed/BACKLOG-ARCHIVE.md`
  (`Archived 2026-10-15`), links rebased; section capped at 10.
- **Docs drift:** `active/README.md` and `parked/README.md` now describe the
  folder-per-item layout (legacy flat files still valid); `FEAT-001` header
  status corrected from `plan-ready` to `parked`.
- **Decided, not changed:** parked items stay as legacy flat files (the kit
  accepts both; moving them is churn with no validator gain). The BACKLOG
  column layout already matches the 0.0.24 template. Provider-boundary rows
  were already consolidated under `e7a20d15` on 2026-10-15.

## Verification

- `hawp work validate` → **1. Backlog consistency: PASS** (active 2/2, closed
  9/9, parked 5/5; was FAIL with `RUNTIME-FIX-001`, `0.0.61` missing plans and
  non-canonical `EXPRESS-400`). Evidence integrity, verification clarity and
  dead links: PASS.
- **2. Closed task completeness: still FAIL** — 72 findings, all on historical
  closed records (missing Outcome/Verification/Close Checklist sections, or
  pre-UUID file names). Same count before and after this pass; none on the
  records closed today. Modernizing those is a separate owner decision (it
  would rewrite closed history).
- `hawp kit validate`: 3 checks, 0 issues. `hawp links check`: all local links
  valid. No closed record renamed.

## Close Checklist

- [x] Outcome recorded
- [x] Verification recorded with remaining historical findings
- [x] Active backlog row removed and recent-close entry added
- [x] Plan moved to the dated closed archive
