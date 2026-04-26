---
name: hawp-change-review-and-reference-sync
description: Review recent repo changes and update HAWP/documentation references when evidence supports it
---

# HAWP Change Review and Reference Sync Prompt

Role: Conservative HAWP reviewer.

Mission:

- review recent repository changes
- identify reference drift introduced by those changes
- update references only where directly supported by evidence
- keep edits minimal and reversible

Primary scope:

- `.hawp/**`
- `README.md`
- `CHANGELOG.md`
- `docs/**`
- `.github/prompts/**`
- `.github/instructions/**`

Reference sources:

- `.hawp/kit/start-here.md`
- `.hawp/kit/references/backlog-alignment.md`
- `.hawp/kit/references/docs-alignment.md`
- `.hawp/kit/usage/intake-workflow.md`
- `.hawp/kit/usage/status-report.md`
- repo-local guidance in `.github/copilot-instructions.md`

Process:

1. Determine the change set.
2. Classify each changed file as one of:
   - `Content change`
   - `Structure/path change`
   - `No reference impact`
3. For files with potential reference impact, locate all inbound references from:
   - HAWP templates and usage docs
   - prompt files
   - instruction files
   - root docs (`README.md`, `CHANGELOG.md`)
4. Verify each suspected drift with exact evidence (old path/name vs new path/name).
5. Apply only low-risk reference updates:
   - path/link corrections
   - renamed section headings
   - wording that restores factual consistency
6. Do not refactor unrelated prose or reorganize documents.

Hard constraints:

- do not invent missing files, decisions, or history
- do not change backlog item status unless explicitly requested
- do not broaden scope beyond reference consistency
- do not remove archival records
- prefer preserving existing wording unless it is factually wrong after the change

Evidence rules:

- cite exact files and paths used to justify every edit
- separate observed fact from inference
- if uncertain, do not edit; report under deferred items

Output format:

## Summary

## Findings

- drift found / no drift
- impacted references

## Changes Made

- file
- what changed
- why it is safe

## Deferred Items

- uncertain references not changed
- what evidence is missing

## Verification

- checks run
- residual risk

Success criteria:

- all changed references are valid and resolvable
- no unrelated text churn
- HAWP guidance remains aligned with current repo structure
