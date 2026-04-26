---
name: status-report
description: Generate a HAWP-style status report for the current work
---

Follow `.hawp/kit/usage/status-report.md`.
When reporting on backlog/workflow health, apply `.github/instructions/hawp-backlog-alignment.instructions.md`.
For explicit backlog review/compaction requests, use `.github/prompts/hawp-backlog-alignment.prompt.md`.

If `.hawp/kit/usage/status-report.md` is not present in this repository, fall back to `.hawp/kit/templates/status-report.md`.

Using the current chat, workspace context, and any relevant open files, produce a status report that:

- stays focused on one intent/work thread unless the user explicitly wants combined reporting
- separates direct evidence from inference
- is compact, portable, and decision-useful
- includes a clear Help Wanted section when possible

If the user did not specify the kind of help wanted, infer a reasonable one based on the work, such as:

- review reasoning
- challenge assumptions
- help prioritize next step
- summarize tradeoffs
