---
applyTo: ".hawp/**,**/.hawp/**"
---

<!-- Generated from core/providers/shared/behaviors — edit shared source and run npm --prefix librarian run providers:sync -->

Use this as a scoped, drop-in instruction when integrating HAWP into repos that already have Copilot instructions and prompts.

# HAWP Modular Intake

Layer HAWP guidance on top of existing repository rules. Primarily scoped to `.hawp/**` workflows but adaptable when explicitly agreed; when applying HAWP guidance outside of `.hawp/`, ensure repository baseline instructions take precedence and coordinate with repository maintainers.

## Integration intent

- Layer HAWP guidance on top of existing repository rules.
- Do not replace or duplicate repository baseline instructions.
- Keep HAWP guidance focused on HAWP-related folders and workflows; coordinate with repository maintainers before extending scope.

## Source resolution order

When a task asks for status, handoff, bounded review, audit, planning, or comparison output, resolve HAWP guidance in this order:

1. `.hawp/kit/start-here.md` and `.hawp/kit/usage/status-report.md`
2. `.hawp/kit/README.md`, `.hawp/kit/references/spec.md`, and `.hawp/kit/references/authoring-patterns.md`
3. Repo-local extensions under `.hawp/kit/usage/` when present

If a higher-priority path is missing, continue to the next source without failing.

## Behavior rules

- Route every incoming bug/task through investigation-first intake: record an investigation task before writing a plan, and write a plan before implementing (see `.hawp/kit/usage/intake-workflow.md`).
- Keep outputs compact and decision-useful.
- Separate direct evidence from inference for substantive findings.
- Avoid inventing runtime engines, validators, orchestrators, or memory systems.
- Do not introduce per-field runtime folders unless explicitly required by repo policy.

## Non-conflict rule

If existing repository instructions conflict with this file, prefer the more specific path-scoped rule.
