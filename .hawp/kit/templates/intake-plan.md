# Work Intake — Plan Template

Use this template for plan files saved to `work/active/<ID>.md`.
Fill it after the investigation task record (`work-intake.md`) exists —
the Analysis section below carries the investigation findings forward.

---

## Bug / Task: [Short title]

**Backlog ID:** TASK-XXX
**Type:** bug | task | improvement
**Reported:** YYYY-MM-DD
**Risk Level:** low | medium | high

---

### Input (what was reported)

> Paste the original bug report or task description verbatim.

---

### Context

What area of the codebase is affected? What is the user-visible symptom?

---

### Analysis

**Root cause (or most likely cause):**
_What is broken and why._

**Directly verified:**
_What I confirmed by reading files or running checks._

**Inferred (not yet proven):**
_What I believe to be true but cannot confirm without a live environment._

**Scope — what else is affected:**
_Other files, routes, or modules touched by this._

---

### Work Coordination

**Owner:** human | agent | unassigned
**Implementation status:** not-started | in-progress | blocked | done
**Overlapping files:**

- `path/to/file`

**Parallel work risk:** low | medium | high
**Can implement now:** yes | no | only after approval

**Coordination note:**
_Explain whether another active item touches the same files._

**Path discipline:**

- Use exact repo-relative paths from repository root for all files in this plan.
- Basenames alone are unsafe for path-sensitive work unless the file is truly at repository root and explicitly marked as such.

**Repo-root proof (required before path-sensitive edits):**

```bash
pwd
git rev-parse --show-toplevel
git rev-parse --show-prefix
git status --short
```

Record exact output in this plan before implementation.

If output contains machine-local absolute paths (for example `<user-home>/...`, `<linux-home>/...`, `<windows-user-home>\\...`), redact only the machine-local prefix with a placeholder such as `<repo-root-abs>` before saving the plan. Keep command identity and repo-relative path evidence unchanged.

---

### Options

#### Option A — [Name]

_Description. Trade-offs._

#### Option B — [Name]

_Description. Trade-offs._

---

### Recommended Fix

**Option chosen:** A | B
**Rationale:**

**Files to change:**

- `path/to/file` — what changes (exact repo-relative path from repository root)

**What to verify after:**

- [ ] Verify item 1
- [ ] Verify item 2

---

### Implementation Notes

_Any gotchas, ordering concerns, or things to watch for during implementation._

---

## Outcome (filled at close)

_What was actually implemented. Include scope changes, trade-offs made during execution._

---

## Verification (filled at close)

**Direct evidence required for each claim.** Evidence can be:

- Inline if <50 words (e.g., "file confirmed at `path/to/file`")
- Linked to `../evidence/YYYY/MM/DD/<ID>-<claim>.md` if larger (screenshots, output logs, test results)
- Marked explicitly if unproven: "NOT YET VERIFIED — requires live environment"
- Path-sensitive claims must cite exact repo-relative file paths from repository root

Format:

```
- [x] Claim 1: **Evidence:** inline or link to ../evidence/YYYY/MM/DD/<ID>-claim1.md
- [x] Claim 2: **Evidence:** inline or link to ../evidence/YYYY/MM/DD/<ID>-claim2.md
- [ ] Claim 3 — NOT YET VERIFIED (reason)
```

---

## Close Checklist

**Before marking this task done in BACKLOG.md, verify ALL:**

- [ ] Outcome section filled (what was actually implemented)
- [ ] Verification section filled (all checks listed, each with direct evidence or "unproven" tag)
- [ ] All evidence files referenced exist in `../evidence/YYYY/MM/DD/` or are noted as inline
- [ ] Plan file will be moved to `../closed/YYYY/MM/DD/<ID>.md`
- [ ] BACKLOG.md row moved from Active to Recently Closed (or marked done)
- [ ] Status report written (optional: only if non-trivial OR if something remains unproven OR if a decision/pattern emerged)
- [ ] Decision file created if applicable (only if this task resolves a design question)
- [ ] Staged-path proof captured before commit:
  - [ ] `git diff --name-status`
  - [ ] `git diff --check`
  - [ ] `git diff --cached --name-status`
  - [ ] `git diff --cached --check`
  - [ ] `git status --short`
- [ ] If basename-only paths appeared during path-sensitive work, mark report unsafe and restart after correction (fresh path-locked pass after two failures)

**Status:**

- [ ] Plan written
- [ ] Approved / auto-approved (low risk)
- [ ] Implemented
- [ ] Verified
- [ ] Closed
