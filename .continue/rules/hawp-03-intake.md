---
name: "HAWP Intake"
description: "HAWP modular intake for .hawp work folders"
globs:
  - "**/.hawp/**"
alwaysApply: false
---

<!-- Generated from core/providers/shared/behaviors — edit shared source and run npm --prefix librarian run providers:sync -->

# HAWP Modular Intake

Layer HAWP guidance on top of existing repository rules. Primarily scoped to `.hawp/**` workflows but adaptable when explicitly agreed; when applying HAWP guidance outside of `.hawp/`, ensure repository baseline instructions take precedence and coordinate with repository maintainers.

## Integration intent

- Layer HAWP guidance on top of existing repository rules.
- Do not replace or duplicate repository baseline instructions.
- Keep HAWP guidance focused on HAWP-related folders and workflows; coordinate with repository maintainers before extending scope.

## Source resolution order

When a task asks for status, handoff, bounded review, audit, planning, comparison output, or **multi-iteration loop work**, resolve HAWP guidance in this order:

1. `.hawp/kit/start-here.md` and `.hawp/kit/usage/status-report.md`
2. `.hawp/kit/README.md`, `.hawp/kit/references/spec.md`, and `.hawp/kit/references/authoring-patterns.md`
3. Repo-local extensions under `.hawp/kit/usage/` when present — including `.hawp/kit/usage/workflow-loop.md` for continue/review/retry cycles across sessions

If a higher-priority path is missing, continue to the next source without failing.

## Behavior rules

- Route every incoming bug/task through investigation-first intake: record an investigation task before writing a plan, and write a plan before implementing (see `.hawp/kit/usage/intake-workflow.md`).
- For work that exceeds one session, follow the instruction-based Workflow Loop (see `.hawp/kit/usage/workflow-loop.md`) — no CLI or runtime orchestration unless explicitly requested.
- For **autonomous** multi-iteration runs, set `loop-mode: autonomous` and **Iteration budget** (`3` | `5` | `8`) in the active plan; agent continues without human "loop again" between passes unless gated by risk or `auto-approve: false`.
- Keep outputs compact and decision-useful.
- Separate direct evidence from inference for substantive findings.
- Avoid inventing runtime engines, validators, orchestrators, or memory systems.
- Do not introduce per-field runtime folders unless explicitly required by repo policy.

## Non-conflict rule

If existing repository instructions conflict with this file, prefer the more specific path-scoped rule.
