# Work Intake Workflow

This is the operating loop for bugs, tasks, and improvements in a HAWP-enabled repo.
It is built on top of the HAWP task-shaping protocol — keep it lean.

---

## The Loop

```
1. INTAKE       You drop a bug or task (natural language is fine)
2. INVESTIGATE  Every item becomes an investigation task first — I investigate,
                shape it as a HAWP task, and fill the intake template
3. PLAN         I write a plan file with root cause, options, and recommended fix
4. REVIEW GATE  Auto-implement if low-risk; hold for your approval if risky
5. IMPLEMENT    Execute the fix
6. VERIFY       Confirm it works / document what is still unproven
7. CLOSE        Move backlog row to Recently Closed; save status report if context matters
```

**Investigation-first rule:** every task that enters through HAWP is made into an
investigation task before anything else. No plan is written and no implementation
starts until the investigation record exists. Planning is required for all items —
the investigation output feeds the plan, and the plan feeds the review gate.

---

## Step 1 — Intake

You can drop work in natural language, for example:

> "this feature is broken in production"
> "add X to the Y screen"
> "the output from this command is wrong"

I will:

- Assign a backlog ID and add a row to [../../work/BACKLOG.md](../../work/BACKLOG.md) with status `inbox`
- Turn the item into an investigation task and move to it immediately unless you say "just log it"

---

## Step 2 — Investigate (required for every item)

Every incoming item becomes an investigation task before planning or implementation.
I investigate and produce a filled-in intake form (see `../templates/work-intake.md`,
which carries forward into `../templates/intake-plan.md`).
The backlog row moves to `analyzing`.

The investigation covers:

- Where the problem lives (files, lines)
- Root cause (or most likely cause if not directly provable)
- Scope — is anything else affected?
- Confidence level — what is proven vs inferred

---

## Step 3 — Plan (required for every item)

Planning is not optional: every item gets a plan built from the investigation
findings before any implementation starts.

I write a plan file to `work/active/<ID>.md`.
The backlog row moves to `plan-ready` and links to the plan file.

On close, the file moves to `work/closed/YYYY/MM/DD/<ID>.md`.

The plan includes:

- Root cause summary
- Options considered (at least 2 when non-trivial)
- Recommended fix with rationale
- Risk level: **low / medium / high**
- What the fix touches
- What to verify after

---

## Step 4 — Review Gate

| Risk   | Default                                                               |
| ------ | --------------------------------------------------------------------- |
| Low    | I implement immediately after writing the plan, note it in the status |
| Medium | I present the plan and ask: "OK to proceed?"                          |
| High   | I hold — you must explicitly approve                                  |

**Low risk examples:** typo, wrong path, missing config value, isolated utility fix
**Medium risk examples:** changes to shared code, routing or auth-adjacent change
**High risk examples:** schema migration, deploy config, security-related change

You can override: say "just do it" or "hold for review" at any point.

---

## Step 5 — Implement

I make the changes. The backlog row moves to `in-progress`.

I use the smallest correct fix — no refactoring beyond scope unless it is the root cause.

Before editing files, confirm the plan's overlap check shows `Can implement now: yes` or explicit user approval for overlap.

---

## Path Discipline (Required for Path-Sensitive Work)

- All file paths in DA reports, plans, diffs, staging lists, commit summaries, evidence, and handoff notes must be exact repo-relative paths from the repository root.
- Basenames alone are unsafe evidence during path-sensitive work. They are only acceptable when the file truly lives at repository root and the report explicitly says so.
- Before path-sensitive edits, record repo-root proof with exact command output:

```bash
pwd
git rev-parse --show-toplevel
git rev-parse --show-prefix
git status --short
```

- Do not persist machine-local absolute paths in plans, evidence, status reports, or prompts.
- If repo-root proof outputs include host-local absolute paths, redact only the machine-local prefix with a placeholder (for example `<repo-root-abs>`), while preserving command identity and all repo-relative path evidence.

- Before commit, record staged-path proof with exact command output:

```bash
git diff --name-status
git diff --check
git diff --cached --name-status
git diff --cached --check
git status --short
```

- If any path-sensitive report collapses paths to basenames, mark the report unsafe and do not commit until corrected.
- Loop-breaker: after two basename/path-collapse failures on the same task, stop and restart with a fresh path-locked pass.
- Parallel lanes: unrelated working-tree changes are lane boundaries and must remain untouched.

### Path-Lock Report Gate (v0.2)

Before emitting a path-sensitive DA report, apply this deterministic self-validation gate:

1. Reject output if any file path has no `/`.
2. Reject output if any file path does not start with an expected repo-root directory (for example `.hawp/`, `.github/`, `core/`, `librarian/`, `docs/`, `src/`, `tests/`).
3. Reject output if any listed path is neither confirmed-existing nor explicitly marked planned-but-not-present.

Use these violation labels when the gate fails:

- `INVALID_REPO_RELATIVE_PATH`
- `BASENAME_ONLY_REFERENCE`
- `SELF_VALIDATION_FAILURE`

Do not proceed to implementation or commit from a report that fails this gate.

---

## Step 6 — Verify

I confirm the fix is structurally sound (imports resolve, build passes if checkable).
I note what is directly verified vs what requires a live environment to confirm.

**Evidence discipline:** Every verification claim must be backed by evidence:

- Direct evidence if available (file confirmed, test passed, output checked)
- Path-sensitive file evidence must use exact repo-relative paths from repository root
- Explicit "unproven" note if the claim requires a live environment or is deferred

Evidence will be stored when the task closes:

- Small evidence (<50 words) stays inline in the plan file Verification section
- Large evidence (screenshots, logs, output) goes to `work/evidence/YYYY/MM/DD/<ID>-*.md`

Reference evidence files by name in the Verification section so a reader can find them.

---

## Parked / Deferred

To defer an item without closing it, move the plan file to `work/parked/<ID>.md` and mark the backlog row `parked`.
When it becomes active again, move it back to `work/active/<ID>.md` and update the backlog row.

---

## Step 7 — Close

**Prerequisites:** Plan file must have Outcome, Verification sections filled with direct evidence.

Close is a structured handoff:

1. **Update the plan file** (`work/active/<ID>.md`):
   - Fill Outcome section (what was actually implemented)
   - Complete Verification section (all checks with direct evidence or "unproven" notes)
   - Check the Close Checklist
   - Mark all boxes ✓

2. **Move the plan file:**
   - From `work/active/<ID>.md` to `work/closed/YYYY/MM/DD/<ID>.md`
   - Use the close date for the folder

3. **Link evidence** (if exists):
   - Create `work/evidence/YYYY/MM/DD/<ID>-*.md` files for large/complex evidence
   - Reference by filename in plan file Verification section
   - (Small evidence can stay inline in the plan file)

4. **Write a status report** (optional — only if):
   - Item was non-trivial, OR
   - Something remains unproven/requires live environment, OR
   - A pattern, decision, or lesson emerged
   - Save to `work/status/YYYY/MM/DD/<ID>-status.md`
   - Reference the plan file; don't duplicate analysis

5. **Update BACKLOG.md:**
   - Remove row from Active Work
   - Add short row to Recently Closed (ID, Type, Title, Closed date, Link to plan)
   - If Recently Closed at cap (10 items), remove oldest rows

6. **Record decision** (optional — only if item resolves a design question):
   - Create `work/decisions/YYYY/MM/DD/<ID>-decision.md` (file naming helps discovery)
   - Link from plan file Recommended Fix section

**When in doubt:** Include more evidence, not less. Closed items should be self-contained — another reader can understand what was done, what was proven, and what remains open.

---

## Close Checklist Quick Reference

Print this or copy it to your plan file at close time:

```
- [ ] Outcome section filled
- [ ] Verification section filled (all claims have direct evidence or "unproven" tag)
- [ ] Evidence files created if large/complex
- [ ] Plan file moved to closed/YYYY/MM/DD/
- [ ] BACKLOG.md updated
- [ ] Status report written (if non-trivial / unproven / decision-bearing)
- [ ] Decision file created (if applicable)
```

---

## Parallel Safety

- The backlog is the active coordination index - check it before starting a new item
  - Each work item has one plan file in `work/active/` — never two agents working the same ID

---

## Quick Reference — Risk Levels

| Scenario                           | Risk   |
| ---------------------------------- | ------ |
| Typo, copy, or label fix           | Low    |
| Isolated config or path correction | Low    |
| Standalone utility or helper fix   | Low    |
| Shared module or component change  | Medium |
| New route, page, or API endpoint   | Medium |
| Auth, env var, or secrets change   | High   |
| Deploy config or infrastructure    | High   |
| Database or schema migration       | High   |
