---
name: "HAWP Docs Alignment"
description: "HAWP docs alignment when editing kit or workflow docs"
globs:
  - ".hawp/kit/**"
  - ".hawp/work/**"
alwaysApply: false
---

<!-- Generated from core/providers/shared/behaviors — edit shared source and run npm --prefix librarian run providers:sync -->

# HAWP Docs Alignment

Use when the task is documentation alignment, docs drift review, or safe docs cleanup.

Canonical policy: `.hawp/kit/references/docs-alignment.md`

## Source-of-truth rule

When docs conflict with implementation, trust in this order:

1. Runtime code and public exports
2. Package scripts and config files
3. CI workflow definitions
4. Tests that assert behavior
5. Prose docs and roadmap notes

## Operating constraints

- Keep edits implementation-driven and minimal.
- Do not invent features or behavior.
- Do not change source code unless explicitly requested.
- Do not make architecture decisions in docs without evidence.
- Separate directly verified facts from inference for uncertain claims.
- Do not store machine-local absolute paths in work artifacts.

## Required review output before patching

Produce:

1. Mismatch summary
2. Conservative edit plan
3. Deferred items (if any) with reason

Then apply only low-risk, targeted documentation edits.

## Quality bar

- Commands are copy/paste-ready
- Paths match the current repository
- Docs avoid duplication and unnecessary abstraction
- Wording is concise and decision-useful
