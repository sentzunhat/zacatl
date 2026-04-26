# Workflow Loop (Instruction-Based)

Multi-iteration work pattern for tasks that exceed one agent session or need explicit review between passes.
This guide is **prompt and artifact guidance only** — no CLI, bash scripts, or runtime orchestration.

HAWP remains a shaping protocol. The loop reuses existing work artifacts (BACKLOG, active plans, status reports, the optional `checkpoint` field) and extends [intake-workflow.md](intake-workflow.md); it does not replace it.

---

## When to Use

Use the Workflow Loop when:

- A backlog item is too large for one session (multi-file refactors, feature epics, audit remediation)
- You want a repeatable **continue → execute → review → approve/reject → reflect → retry or close** cycle
- Context must survive across sessions — with optional **autonomous** multi-pass runs (no human "loop again" between iterations)

Skip the loop for trivial one-shot items — follow intake workflow only.

---

## Loop Contract

Every loop run declares a fixed contract in the active plan. Agents read these fields before iteration 1 and honor them through the final handoff.

| Field | Required values | Purpose |
| ----- | --------------- | ------- |
| **Loop mode** | `autonomous` \| `gated` | Whether the agent auto-advances to iteration N+1 without human prompts |
| **Iteration budget** | `3` \| `5` \| `8` | Hard cap on execution passes for this loop run |
| **Current iteration** | integer (0 before first pass) | Tracks progress; handoff filenames use this number |
| **Auto-approve** | `true` \| `false` (optional) | Override medium/high per-iteration gates when stakeholders accept agent-only transitions |

Plan snippet: [../templates/workflow-loop-plan-section.md](../templates/workflow-loop-plan-section.md)

**Budget guidance:**

| Budget | Typical use |
| ------ | ----------- |
| **3** | Tight doc fixes, small refactors, validation-only passes |
| **5** | Default — feature slices, audit remediation, trial runs |
| **8** | Large epics where each pass is a scoped slice |

**Hard stops** (both modes): success transition, park, escalate, blocked, or budget exhausted → no further auto-advance.

**Final human gate:** After all N iterations **or** early success, produce one summary handoff (`.hawp/work/status/YYYY/MM/DD/<ID>-loop-final.md` or last iter handoff marked `success`) for human review before intake close.

---

## Relationship to Intake Workflow

| Intake step | Loop behavior |
| ----------- | ------------- |
| 1–3 Intake, Investigate, Plan | Once per backlog item (before the loop starts) |
| 4 Review gate | Applies at plan approval **and** at each iteration transition |
| 5 Implement | Repeats each iteration until done or parked |
| 6 Verify | Each iteration; evidence accumulates in the plan |
| 7 Close | Once when the item succeeds or is wont-fix |

The loop adds **iteration discipline** and **structured reflection** on retry. Closing still follows intake Step 7.

---

## Participants (Interchangeable)

Any stage can be carried out by a **human** or an **agent**. Assign roles in the prompt, not in code.

| Role | Responsibility |
| ---- | -------------- |
| **Executor** | Implements changes per the active plan and current iteration brief |
| **Reviewer** | Reviews work against plan constraints; produces pass/issues (no implementation) |
| **Approver** | Decides transition: success, retry, park, or escalate |

**Agent-as-reviewer:** Use a **separate session** or explicit reviewer prompt so the reviewer does not continue implementing. Paste the iteration handoff and ask for review only.

**Human-as-reviewer:** Read the iteration status report and diff; reply with approve, reject, or park.

Risk levels from intake Step 4 still apply: low may auto-advance; medium/high require explicit approver sign-off at each transition **unless** `loop-mode: autonomous` with `auto-approve: true` in the plan.

---

## Autonomous vs Gated Mode

| Mode | Human "loop again" between iterations? | When to use |
| ---- | -------------------------------------- | ----------- |
| **autonomous** | **No** — agent continues 1→N in one session (or chained sessions) using the same Continue contract | Low risk, or `auto-approve: true`; doc improvements; bounded slices with clear verification |
| **gated** | **Yes** — agent stops after each handoff; human approver must reply before iteration N+1 | Medium/high risk (default); production code; ambiguous scope |

### Auto-advance rules (`loop-mode: autonomous`)

Proceed to iteration N+1 **without waiting** for human `approve` when **all** of:

1. Review outcome is `pass` (or issues are non-blocking and documented)
2. Transition is `retry` or `auto-advance` — not `park`, `escalate`, or `blocked`
3. `Current iteration` < **Iteration budget**
4. Risk is **low**, **or** plan sets **`auto-approve: true`**

Do **not** auto-advance when:

- Risk is medium/high **and** `auto-approve` is not `true`
- Review finds blockers or transition is `park` / `escalate`
- Budget is exhausted → default **park** or **escalate** with final summary handoff
- Early **success** → stop loop, run final human gate, then intake close

Gated mode is unchanged: executor stops after each handoff; approver must explicitly say `approve`, `retry`, `park`, or `escalate` before the next iteration.

---

## One Execution Loop (Single Iteration)

```
1. CONTINUE   Load BACKLOG row, active plan, prior iteration artifacts
2. EXECUTE    Implement the smallest correct slice for this iteration
3. REVIEW     Reviewer checks against constraints and verification bar
4. TRANSITION Approver decides: success | retry | park | escalate
5. REFLECT    (retry only) Record what failed and what changes next iteration
6. RETRY/CLOSE Retry → next iteration; success → verify and close per intake
```

---

## Artifacts (Reuse Existing Paths)

Do **not** create new runtime folders (`loop-runs/`, per-field shape folders, etc.).

| Artifact | Location | Purpose |
| -------- | -------- | ------- |
| Coordination index | `.hawp/work/BACKLOG.md` | Status: `in-progress`, `plan-ready`, `parked`, etc. |
| Source of truth | `.hawp/work/active/<ID>.md` | Plan + **Iteration Log** section (append each pass) |
| Iteration handoff | `.hawp/work/status/YYYY/MM/DD/<ID>-iter-<NNN>.md` | Compact continuity for the next session |
| Reflection on retry | Same status file or plan Iteration Log | What failed, what to try next |
| Evidence | `.hawp/work/evidence/YYYY/MM/DD/<ID>-*.md` | Large verification output |
| Pause marker | HAWP shape `checkpoint` field (optional string) | Short anchor in prompts only — not a log |

Template: [../templates/workflow-loop-handoff.md](../templates/workflow-loop-handoff.md)

---

## Starting a Loop

Prerequisites (from intake workflow):

1. Backlog row exists with plan file in `work/active/<ID>.md`
2. Investigation and plan are complete; risk level set
3. Plan approved (or low-risk auto-approved)

Add to the plan file (full snippet: [../templates/workflow-loop-plan-section.md](../templates/workflow-loop-plan-section.md)):

```markdown
### Workflow Loop

**Loop status:** active
**Loop mode:** autonomous | gated
**Iteration budget:** 5
**Current iteration:** 0
**Executor:** agent | human
**Reviewer:** human | agent (separate session)
**Approver:** human | agent per risk gate
**Auto-approve:** false
```

**Plan file path:** Prefer `.hawp/work/active/<Legacy ID>.md` (e.g. `TASK-079.md`) so `hawp backlog validate` and loop Continue steps resolve the plan by ID. If the plan uses a descriptive filename, keep the BACKLOG **Plan File** link accurate and expect the validator to flag a missing plan until renamed or aliased.

Set BACKLOG status to `in-progress`.

### Quick Start (first iteration)

1. Confirm plan at `.hawp/work/active/<Legacy ID>.md` and BACKLOG row `in-progress`
2. Add **Workflow Loop** block + empty **Iteration Log** table to the plan (see above)
3. Set **Current iteration** to `0`; open a new executor session
4. **Continue:** increment to `1`, read BACKLOG → plan → latest handoff
5. **Execute** one scoped slice → save handoff to `work/status/YYYY/MM/DD/<ID>-iter-001.md`
6. **Review** (separate hat/session) → **Transition** (`approve` | `retry` | `park`) before iteration 2

---

## Stage Instructions

### 1. Continue

**Executor or new session** reads in order:

1. `.hawp/work/BACKLOG.md` — confirm item is active
2. `.hawp/work/active/<ID>.md` — mission, constraints, **Loop Contract** fields, Iteration Log
3. Latest `.hawp/work/status/.../<ID>-iter-*.md` if any
4. Linked evidence files

Increment **Current iteration** in the plan before executing (0 → 1 on the first pass; handoff filenames use this number).

#### Standardized Continue prompt (same input every iteration)

Use this block unchanged across iterations — only substitute `<ID>`, `<N>`, and the one-line objective from **Next try** or plan scope:

```text
input: |
  Continue Workflow Loop iteration <N> for <ID>.
  Read plan Loop Contract (mode, budget, current iteration).
  Read latest handoff and Iteration Log reflection if any.
  Execute only this pass scope: <one-line objective>

context: |
  Plan: .hawp/work/active/<ID>.md
  Prior handoff: .hawp/work/status/YYYY/MM/DD/<ID>-iter-<NNN>.md (latest, if exists)
  Loop mode: (from plan — autonomous | gated)
  Iteration budget: (from plan — 3 | 5 | 8)

mission: |
  Execute iteration <N> — implement the scoped slice; run review; record transition.
  If loop-mode is autonomous and auto-advance rules pass, immediately continue iteration <N+1> without waiting for human "loop again".

checkpoint: |
  Gated mode: stop after handoff — await human approve/retry/park.
  Autonomous mode: if budget remains and transition is retry/auto-advance, proceed to next iteration in same session.

constraints: |
  - Smallest correct diff; no scope creep
  - Path discipline per intake-workflow.md
  - Same output path every iteration: .hawp/work/status/YYYY/MM/DD/<ID>-iter-<NNN>.md
  - Do not close the backlog item until final human gate after success or budget end

output: |
  Working changes + filled workflow-loop handoff template at fixed path above.
  Update plan Iteration Log row. If autonomous and budget remains, re-enter Continue for N+1.
```

#### Mandatory output (same every iteration)

Every execution pass **must** produce a handoff at:

`.hawp/work/status/YYYY/MM/DD/<ID>-iter-<NNN>.md`

Use [../templates/workflow-loop-handoff.md](../templates/workflow-loop-handoff.md). Append a row to the plan **Iteration Log**. Do not substitute ad-hoc paths or skip the handoff between autonomous iterations.

### 2. Execute

- Implement the iteration scope only (from plan Recommended Fix or last reflection **Next try**)
- Update plan **Implementation status** if needed
- Record repo-relative paths and verification attempts inline or in evidence

Stop when the iteration scope is done — do not auto-start review implementation fixes.

### 3. Review

**Reviewer** (human or agent in review-only mode) checks:

- Matches plan constraints and iteration scope
- Path discipline satisfied
- Verification claims separated: proven vs unproven
- No obvious scope creep or parallel-lane violations

Output a short review block:

```markdown
### Review (iteration N)

**Outcome:** pass | issues
**Findings:** (bulleted; evidence-backed)
**Blockers:** (if any)
```

Save in the iteration handoff under **Review** or inline in the plan Iteration Log.

### 4. Transition (Approve / Reject)

**Approver** decides:

| Decision | Action |
| -------- | ------ |
| **Success** | Item complete — run intake Step 6–7 (verify, close) |
| **Retry** | Go to Reflect; schedule iteration N+1 |
| **Park** | Move plan to `work/parked/`, BACKLOG → `parked` |
| **Escalate** | Status report to `work/status/`; hold for human decision |

**Gated mode:** Medium/high risk — approver must **explicitly** say `approve`, `retry`, `park`, or `escalate`. Low risk: executor may document auto-advance in the handoff if review passed.

**Autonomous mode:** Document transition as `auto-advance` when proceeding to N+1 per auto-advance rules. One human review at loop end (final handoff) unless early success triggers close checklist.

### 5. Reflect (Retry Only)

Append to plan **Iteration Log** and the status handoff:

```markdown
#### Iteration N — retry

**What failed:** (review findings or verification gaps)
**Root cause hypothesis:** (proven vs inferred)
**Next try:** (concrete scope for iteration N+1)
**Do not repeat:** (anti-patterns to avoid)
```

Set `checkpoint` in the next session prompt to the **Next try** one-liner.

### 6. Retry or Close

- **Retry:** New session reads handoff + reflection; increment iteration; return to Continue
- **Close:** Follow [intake-workflow.md](intake-workflow.md) Step 7; set Loop status **closed** in plan before move to `closed/`

After **max iterations** without success: default to **park** or **escalate** — do not unbounded retry.

---

## Iteration Log (in Plan File)

Add this section to the active plan when starting a loop:

```markdown
### Iteration Log

| Iter | Date | Outcome | Handoff |
| ---- | ---- | ------- | ------- |
| 1 | YYYY-MM-DD | retry | [status](../status/YYYY/MM/DD/<ID>-iter-001.md) |
| 2 | YYYY-MM-DD | success | [status](../status/YYYY/MM/DD/<ID>-iter-002.md) |
```

Keep rows compact. Detail lives in status files.

---

## Copy-Paste Prompts

**Start autonomous loop (executor — runs N iterations without mid-loop prompts):**

> Run Workflow Loop for `<ID>` in **autonomous** mode. Iteration budget: `<3|5|8>`. Read plan Loop Contract. For each iteration 1→N: use the standardized Continue prompt, execute scoped slice, review, save handoff to `work/status/YYYY/MM/DD/<ID>-iter-<NNN>.md`, update Iteration Log. Auto-advance per plan rules. Stop at success, park, blocked, or budget exhausted. Produce final summary handoff for human review.

**Start next iteration (executor — gated mode):**

> Continue Workflow Loop for `<ID>` iteration `<N>`. Read the active plan, latest handoff, and reflection. Execute only the **Next try** scope. Save handoff to `work/status/YYYY/MM/DD/<ID>-iter-<NNN>.md`. Stop before transition — I will approve or reject.

**Review-only (agent reviewer):**

> You are the **reviewer only** for `<ID>` iteration `<N>`. Read the plan, diff, and handoff. Do not implement. Output pass/issues with evidence. No transition decision unless I am the approver and risk is low.

**Human approver (short):**

> Review iteration `<N>` for `<ID>`. Handoff: `<path>`. Reply: `approve` | `retry: <reason>` | `park` | `escalate`.

---

## Parallel Safety

- One plan file per backlog ID — never two executors on the same ID
- Respect **Overlapping files** and **Can implement now** in the plan
- Unrelated working-tree changes are lane boundaries — do not touch

See [../standards/patterns/parallel-work-guardrails.md](../standards/patterns/parallel-work-guardrails.md).

---

## What This Is Not

- Not a CLI or librarian runtime (future optional tooling — see TASK-079 plan Phase 1+)
- Not a state machine, memory store, or validator
- Not a replacement for intake workflow or status reports

---

## Quick Reference

| Question | Answer |
| -------- | ------ |
| Where is state? | Plan file + BACKLOG + status handoffs |
| Must user say "loop again"? | **No** in `autonomous` mode; **yes** in `gated` mode between iterations |
| How to set 3/5/8 runs? | Plan field **Iteration budget:** `3` \| `5` \| `8` |
| Same input each pass? | Standardized Continue prompt block (plan + last handoff + log) |
| Same output each pass? | Handoff at `.hawp/work/status/YYYY/MM/DD/<ID>-iter-<NNN>.md` |
| How to pause? | Park per intake; optional `checkpoint` string in prompts |
| Who approves? | Per-iteration in gated mode; final human gate after autonomous run |
| Failed iteration? | Reflect → append Iteration Log → retry or auto-advance |
| Done? | Intake close checklist + loop marked closed |

Related: [intake-workflow.md](intake-workflow.md), [status-report.md](status-report.md), [start-here.md](../start-here.md)
