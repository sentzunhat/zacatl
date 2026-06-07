---
name: "HAWP Intake"
description: "HAWP modular intake for .hawp work folders"
globs:
  - "**/.hawp/**"
alwaysApply: false
---

<!-- Generated from core/providers/shared/behaviors — edit shared source and run npm run providers:sync -->

# HAWP Modular Intake

Layer HAWP on existing repo rules. Scope: `.hawp/**` workflows only.

## Integration intent

- Layer HAWP behavior on top of existing repository rules.
- Do not replace or duplicate repository baseline instructions.
- Keep HAWP guidance scoped to HAWP-related folders and workflows.

## Source resolution order

When a task asks for status, handoff, bounded review, audit, planning, or comparison output, resolve HAWP guidance in this order:

1. `.hawp/kit/start-here.md` and `.hawp/kit/usage/status-report.md`
2. `.hawp/kit/README.md`, `.hawp/kit/spec.md`, and `.hawp/kit/authoring-patterns.md`
3. Repo-local extensions under `.hawp/kit/usage/` when present

If a higher-priority path is missing, continue to the next source without failing.

## Behavior rules

- Keep outputs compact and decision-useful.
- Separate direct evidence from inference for substantive findings.
- Avoid inventing runtime engines, validators, orchestrators, or memory systems.
- Do not introduce per-field runtime folders unless explicitly required by repo policy.

## Non-conflict rule

If existing repository instructions conflict with this file, prefer the more specific path-scoped rule.
