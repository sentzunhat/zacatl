---
applyTo: "docs/**,README.md,CHANGELOG.md"
---

# HAWP Docs Alignment Overlay

Use this guidance when the task is documentation alignment, docs drift review, or safe docs cleanup.

## Source-of-Truth Rule

When docs conflict with implementation, trust in this order:

1. runtime code and public exports
2. package scripts and config files
3. CI workflow definitions
4. tests that assert behavior
5. prose docs and roadmap notes

## Operating Constraints

- keep edits implementation-driven and minimal
- do not invent features or behavior
- do not change source code unless explicitly requested
- do not make architecture decisions in docs without evidence
- separate directly verified facts from inference for uncertain claims

## Required Review Output Before Patching

Produce:

1. mismatch summary
2. conservative edit plan
3. deferred items (if any) with reason

Then apply only low-risk, targeted documentation edits.

## Quality Bar

- commands are copy/paste-ready
- paths match the current repository
- docs avoid duplication and unnecessary abstraction
- wording is concise and decision-useful
