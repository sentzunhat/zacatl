# HAWP Docs Alignment

## Purpose

Define the official docs alignment model for HAWP projects.

Documentation drifts from source code over time. This reference describes when to run a docs alignment pass, which mode to use, and what the expected output is.

## Source-of-Truth Hierarchy

When docs conflict with implementation, trust in this order:

1. active runtime code and public exports
2. package scripts and config files
3. CI workflow definitions
4. tests that assert behavior
5. latest accepted ADRs
6. prose docs and roadmap notes

Never present inference as confirmed fact. Separate observed evidence from interpretation in all findings.

## Three Alignment Modes

### 1. Deterministic Audit

Use when: you need machine-readable output, a health score, or structured drift data for automation.

Prompt: `.github/prompts/hawp-docs-alignment-deterministic.prompt.md`

Output phases:

- Phase 1 — `codeStructure` JSON extracted from `src/**`
- Phase 2 — `docsClaims` JSON extracted from `docs/**`
- Phase 3 — `driftAnalysis` with typed findings and file-path evidence
- Phase 4 — `proposedDocsStructure` reconstruction plan
- Phase 5 — `documentationHealthScore` (0–100) and risk summary

Drift classification types:

- `DOCUMENTED_BUT_NOT_IMPLEMENTED`
- `IMPLEMENTED_BUT_NOT_DOCUMENTED`
- `PARTIALLY_IMPLEMENTED`
- `OUTDATED_DOCUMENTATION`
- `INCORRECT_SECURITY_CLAIM`
- `VERSION_MISMATCH`
- `RUNTIME_MISMATCH`
- `ARCHITECTURE_DRIFT` (advanced: DDD, hexagonal, event-driven, multi-tenant, JWT)

Scoring guide:

- 90–100: fully aligned
- 70–89: minor drift
- 40–69: moderate drift
- 0–39: severe misalignment

### 2. Simplicity Pass

Use when: docs are structurally present but need targeted cleanup — outdated commands, broken paths, redundant sections, over-complicated phrasing.

Prompt: `.github/prompts/hawp-docs-alignment-simplicity.prompt.md`

Required output order:

1. mismatch summary
2. minimal change plan
3. applied edits summary
4. residual uncertainties

Editing rules:

- keep docs short, concrete, and step-by-step where useful
- prefer copy/paste-ready commands and real folder paths
- remove redundancy and repeated explanations
- do not restructure unless clearly wrong

### 3. Conservative Drift Cleanup

Use when: you want a safe, low-risk cleanup pass with explicit deferred items — suitable for CI or a cautious review.

Prompt: `.github/prompts/hawp-conservative-docs-drift-cleanup.prompt.md`

Cleanup classification:

- `Safe to remove`
- `Safe to keep`
- `Deferred`

## Instruction Overlay

The instruction file `.github/instructions/hawp-docs-alignment.instructions.md` applies automatically to `docs/**`, `README.md`, and `CHANGELOG.md`. It enforces:

- source-of-truth hierarchy
- implementation-driven, minimal edits only
- required review output before patching
- quality bar (copy/paste-ready commands, valid paths)

## Constraints That Apply to All Modes

- do not introduce new architecture decisions
- do not refactor source code
- do not invent undocumented features
- do not change folder structure unless clearly wrong
- keep scope tight; do not expand beyond reported issue

## When to Use Each Mode

| Situation                            | Mode                             |
| ------------------------------------ | -------------------------------- |
| Automated audit or CI health check   | Deterministic                    |
| Agent or orchestrator pipeline input | Deterministic (JSON-only output) |
| Targeted manual cleanup sprint       | Simplicity Pass                  |
| Safe, cautious pre-release cleanup   | Conservative Drift Cleanup       |
| Post-merge docs review               | Conservative Drift Cleanup       |

## Related Files

- `.github/instructions/hawp-docs-alignment.instructions.md` — auto-applied instruction overlay
- `.github/prompts/hawp-docs-alignment-deterministic.prompt.md` — deterministic audit prompt
- `.github/prompts/hawp-docs-alignment-simplicity.prompt.md` — simplicity pass prompt
- `.github/prompts/hawp-conservative-docs-drift-cleanup.prompt.md` — conservative cleanup prompt
