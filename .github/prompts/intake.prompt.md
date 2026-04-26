---
name: intake
description: Run the full work intake loop — analyze, plan, implement or hold based on risk
---

You are running the work intake loop for this repository.

Read `.hawp/kit/usage/intake-workflow.md` for the full operating loop before proceeding.
Read `.hawp/work/BACKLOG.md` to find the next available backlog ID.

Adapt paths to the local layout: `.hawp/work/` in downstream projects, repo-root `.hawp/work/` in the HAWP source repo.
For this repo, write project work to `.hawp/work/`; do not write repo work into `core/.hawp/work/`.
Treat `core/.hawp/work/` as downstream scaffold source only, and `core/.hawp/kit/` as reusable package source only.
Do not store machine-local absolute paths in created artifacts. If command output includes host-local prefixes (for example `<user-home>/...`), redact only the machine-local prefix using placeholders like `<repo-root-abs>` while keeping command identity and repo-relative evidence.
Do not append completed work endlessly to `BACKLOG.md`; move closed work to `.hawp/work/closed/YYYY/MM/DD/` and keep the backlog compact.
When `BACKLOG.md` has many Done rows, create a work item titled `Compact BACKLOG.md and archive closed work.` before adding more Done entries.
Apply `.github/instructions/hawp-backlog-alignment.instructions.md` while handling backlog updates.
Use `.github/prompts/hawp-backlog-alignment.prompt.md` when the user asks for explicit backlog review or compaction.

## Your job

Given the bug or task the user described, execute steps 1–4 of the workflow:

### 1. Assign & log

- Pick the next backlog ID (`TASK-XXX`)
- Add a row to `.hawp/work/BACKLOG.md` with status `analyzing`

### 2. Investigate

- Search the codebase for the affected area
- Identify root cause or most likely cause
- Note scope — what else could be affected
- Be explicit about what is directly verified vs inferred

### 3. Write the plan

- Use `.hawp/kit/templates/intake-plan.md` as the template
- Save to `.hawp/work/active/<ID>.md`
- Update the BACKLOG.md row to `plan-ready` with a link to the plan file

### 4. Apply the review gate

- **Low risk** (wrong path, missing asset, typo, isolated config fix): implement immediately, note it in the plan
- **Medium risk** (shared module, routing, layout change): present the plan and ask "OK to proceed?"
- **High risk** (auth, API, env vars, deploy config, security): hold — do not implement until user explicitly approves

## Output format

After analysis, respond with:

1. A one-paragraph plain-English summary of what you found
2. The risk level and gate decision
3. Either the fix applied (low risk) or the plan for review (medium/high)

Keep it compact and decision-useful.
