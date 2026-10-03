# ac0c4acf — Improve work items: UUID IDs and folder-per-item layout

**UUID:** `ac0c4acf-c90a-4a32-a66a-b058577368f6` · **Type:** improvement · **Priority:** P3 · **Reported:** 2026-10-03
**Status:** inbox · **Target:** after `83cef132` (HAWP 0.0.24 update)

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
