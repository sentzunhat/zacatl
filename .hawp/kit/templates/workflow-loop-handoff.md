# Workflow Loop — Iteration Handoff

Save to: `.hawp/work/status/YYYY/MM/DD/<ID>-iter-<NNN>.md`

Compact continuity artifact for the next session. Not a transcript dump — link to plan and evidence.

---

## Header

**Backlog ID:** TASK-XXX / UUID
**Iteration:** NNN / **Budget:** 3 | 5 | 8
**Loop mode:** autonomous | gated
**Date:** YYYY-MM-DD
**Plan:** `.hawp/work/active/<ID>.md`
**Executor:** human | agent
**Reviewer:** human | agent
**Risk level:** low | medium | high
**Auto-approve:** false | true

---

## Iteration Scope

_What this pass was supposed to accomplish (one short paragraph)._

---

## What Changed

_Repo-relative paths and summary of edits. Link diff or evidence if large._

**Files touched:**

- `path/from/repo/root`

---

## Verification

### Proven

_Direct checks with evidence._

### Unproven

_Requires live env or follow-up._

---

## Review

**Outcome:** pass | issues | pending

**Findings:**

- (bulleted)

**Blockers:**

- (if any)

---

## Transition

**Decision:** success | retry | park | escalate | pending-approval | auto-advance

**Approver:** (name or role; `agent-auto` when autonomous mode advances)

**Notes:**

_(Why this decision; required for retry/park/escalate.)_

---

## Reflection (retry only)

**What failed:**

**Root cause hypothesis:** (label proven vs inferred)

**Next try:** _(concrete scope for iteration N+1)_

**Do not repeat:**

---

## Suggested Next Step

_One line for the next executor or reviewer._

_In **autonomous** mode with `retry` and budget remaining: next executor continues immediately — no human "loop again" prompt required._

---

## Links

- Plan: `.hawp/work/active/<ID>.md`
- Prior iteration: _(path or none)_
- Evidence: _(paths or none)_

---

## Example (minimal)

_Filled illustration only — delete this section from real handoffs._

**Backlog ID:** TASK-079
**Iteration:** 001 / **Budget:** 5
**Loop mode:** gated
**Iteration Scope:** Clarify iteration numbering in workflow-loop.md.
**What Changed:** `.hawp/kit/usage/workflow-loop.md` (2 lines).
**Verification — Proven:** Cross-link check; no contradict intake Step 7.
**Review Outcome:** pass
**Transition Decision:** retry — template still needs example (meta; fixed in iter 2).
**Next try:** Rename plan to TASK-079.md; verify validate.
