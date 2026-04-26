This repository uses HAWP as a lightweight workflow method.

Follow the repo-local HAWP guidance in:

- .hawp/kit/start-here.md
- .hawp/kit/usage/status-report.md

Use .hawp/kit/start-here.md as the operating guide for how this repo applies HAWP in practice.

Use .hawp/kit/usage/status-report.md when the user asks for a:

- status report
- checkpoint summary
- context transfer summary
- second-brain review artifact

Use .github/prompts/hawp-change-review-and-reference-sync.prompt.md when the user asks to review recent changes and synchronize HAWP/docs references.

Saved status reports belong in:

- .hawp/work/status/YYYY/MM/DD/

For bugs/tasks, track in .hawp/work/BACKLOG.md. Active plan files go in .hawp/work/active/. Deferred items can live in .hawp/work/parked/. Close by moving to .hawp/work/closed/YYYY/MM/DD/.
Do not append completed work endlessly to BACKLOG.md. Move closed work to .hawp/work/closed/YYYY/MM/DD/ and keep BACKLOG.md compact.
When BACKLOG.md has many Done rows, create a work item titled "Compact BACKLOG.md and archive closed work." before adding more Done entries.
Follow backlog compaction guardrails in .github/instructions/hawp-backlog-alignment.instructions.md.
Use .github/prompts/hawp-backlog-alignment.prompt.md when asked to review or compact a backlog.

Keep the repo-local HAWP layer lean.

HAWP in this repository is a practical workflow layer, not a runtime engine, compiler, validator, orchestrator, or memory system.

Do not:

- invent per-field folders such as input/, context/, mission/, constraints/, output/, or checkpoint/
- imply a runtime engine, compiler, validator, orchestrator, persistence layer, or memory system
- overstate certainty; keep direct evidence separate from inference

Prefer compact, decision-useful outputs.
