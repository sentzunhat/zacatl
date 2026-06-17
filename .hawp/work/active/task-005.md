# Work Intake — Plan Template

## Bug / Task: Create pull request for update-dependencies branch

**Backlog ID:** task-005
**Type:** task
**Reported:** 2026-06-17
**Risk Level:** low

---

### Input (what was reported)

> create a pr from this branch plesse  update-dependencies

---

### Context

The repository has an existing branch `copilot/update-dependencies` containing version bumps, workflow enhancements, and code cleanup. The user wants to open a pull request targeting `main` to merge these changes.

---

### Analysis

**Root cause (or most likely cause):**
N/A - This is a PR creation and closure task.

**Directly verified:**
- Current branch is `copilot/update-dependencies`.
- There are no open pull requests for this branch.
- No uncommitted changes are present in the working tree.

**Inferred (not yet proven):**
- A pull request from `copilot/update-dependencies` to `main` is requested.

**Scope — what else is affected:**
- Pull requests list for the repository.
- HAWP backlog tracking is updated to close this item.

---

### Work Coordination

**Owner:** agent
**Implementation status:** in-progress
**Overlapping files:**
None.

**Parallel work risk:** low
**Can implement now:** yes

**Coordination note:**
No code modifications other than HAWP documentation updates are required.

**Path discipline:**
- Use exact repo-relative paths from repository root for all files in this plan.
- Basenames alone are unsafe for path-sensitive work unless the file is truly at repository root and explicitly marked as such.

**Repo-root proof (required before path-sensitive edits):**

```bash
pwd
# Output: <repo-root-abs>/zacatl
git rev-parse --show-toplevel
# Output: <repo-root-abs>/zacatl
git rev-parse --show-prefix
# Output: (empty)
git status --short
# Output: (empty)
```

---

### Options

#### Option A — Create Pull Request
Create a pull request for branch `copilot/update-dependencies` targeting `main`, then update/close the HAWP task.

---

### Recommended Fix

**Option chosen:** A
**Rationale:**
Directly fulfills the user's request.

**Files to change:**
- `.hawp/work/BACKLOG.md` — register task and update status (existing)
- `.hawp/work/active/task-005.md` — create plan (planned-but-not-present, this file)

**What to verify after:**
- [ ] Pull request is successfully created on GitHub.

---

### Implementation Notes
- Use the `runtime-tools-create_pull_request` tool to create the PR.
- Write a clear title and description summarizing all commits on the branch.

---

## Outcome (filled at close)

---

## Verification (filled at close)

---

## Close Checklist

- [ ] Outcome section filled
- [ ] Verification section filled (all claims have direct evidence or "unproven" tag)
- [ ] Evidence files created if large/complex
- [ ] Plan file will be moved to `../closed/2026/06/17/`
- [ ] BACKLOG.md updated
- [ ] Status report written (optional: not needed for this simple/clean addition)
- [ ] Decision file created if applicable (N/A)
- [ ] Staged-path proof captured before commit:
  - [ ] `git diff --name-status`
  - [ ] `git diff --check`
  - [ ] `git diff --cached --name-status`
  - [ ] `git diff --cached --check`
  - [ ] `git status --short`
- [ ] If basename-only paths appeared during path-sensitive work, mark report unsafe and restart after correction

**Status:**
- [x] Plan written
- [ ] Approved / auto-approved (low risk)
- [ ] Implemented
- [ ] Verified
- [ ] Closed
