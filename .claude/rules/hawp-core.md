---
description: "HAWP workflow core — kit entry, status reports, backlog discipline"
---

<!-- Generated from core/providers/shared/behaviors — edit shared source and run npm --prefix librarian run providers:sync -->

# HAWP Core

This repo uses HAWP. Read `.hawp/kit/start-here.md` for task shaping, `.hawp/kit/usage/status-report.md` for handoffs, and `.hawp/kit/usage/workflow-loop.md` for multi-iteration work.

- Track work in `.hawp/work/BACKLOG.md`; plans in `.hawp/work/active/`; close to `.hawp/work/closed/YYYY/MM/DD/`.
- Do not append completed work endlessly to BACKLOG.md — keep Recently Closed capped.
- HAWP is not a runtime, validator, orchestrator, or memory system.
- Do not invent per-field runtime folders (input/, context/, mission/, constraints/, output/, checkpoint/) unless repo policy requires them.
- Prefer compact, decision-useful outputs. Separate direct evidence from inference.
