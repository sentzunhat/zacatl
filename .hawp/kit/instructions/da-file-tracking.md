---
applyTo: "**"
description: File tracking convention for HAWP work items — workflow-first coordination
---

# DA File Tracking — Work Item Instruction Reference

## Purpose

This instruction defines the file-tracking convention for digital agents coordinating work on HAWP projects. It allows agents to safely declare file ownership, read-only boundaries, and lock status without colliding or misunderstanding scope.

**This is workflow-first, not CLI-first.** File tracking is a manual convention for now. Future CLI/script support may automate validation or lock checking, but the core workflow remains human-readable.

---

## Core Rules

### 1. The Backlog is Summary Only

**The backlog (`BACKLOG.md`) is NOT the source of truth for file ownership.**

- Backlog rows are brief coordination signals.
- Backlog must not list files owned, read, or locked by a task.
- Backlog must remain compact and operational.
- **Do not redesign or rebuild the backlog to track files.**

---

### 2. Source of Truth: The Work Item File Tracking Document

**File tracking lives inside each work item**, not in the backlog.

Location: `.hawp/work/active/<TASK-ID>-files.md`

This document is the authoritative source for:

- Files this task owns (can edit)
- Files this task reads (for context only)
- Files this task must not touch (explicitly out of scope)
- Files currently locked/reserved (to avoid parallel agent conflicts)
- Files actually changed during the task (populate as work progresses)

---

### 3. Path Rules

**All paths must be repo-relative full paths.**

✅ **Good:**

- `.hawp/work/active/TASK-030.md`
- `.hawp/kit/templates/work-item-files.md`
- `README.md`
- `librarian/scripts/backlog-upgrade/cli.ts`

❌ **Bad:**

- `TASK-030.md` (ambiguous; missing context)
- `active/TASK-030.md` (incomplete without `.hawp/work/`)
- `src/` (incomplete; which specific file?)
- `file.ts` (basename-only; could be in multiple places)

### 3.1 Path-Lock Violation Categories (v0.2)

Use these exact categories when a path-lock check fails:

- `INVALID_REPO_RELATIVE_PATH` — path is not exact repo-relative from repository root.
- `BASENAME_ONLY_REFERENCE` — path contains no `/` and is ambiguous in path-sensitive output.
- `SELF_VALIDATION_FAILURE` — report was emitted without passing required pre-emit path checks.

These categories are reporting semantics first. CLI automation can consume the same labels later.

### 3.2 Plain Text Path Evidence Required (v0.2)

Clickable editor, IDE, or GitHub Copilot file references do not count as path evidence.

Path evidence must be written as plain text exact repo-relative paths from the repository root.
Use fenced `txt` or `text` blocks for path lists when possible.

Accepted format:

```txt
.hawp/kit/instructions/da-file-tracking.md
.hawp/kit/references/work-item-file-tracking.md
.hawp/kit/templates/work-item-files.md
```

Not accepted:

```txt
da-file-tracking.md
work-item-file-tracking.md
work-item-files.md
```

### 3.3 Optional Encoded Path-Key Artifacts (v0.3)

Plain-text exact repo-relative paths remain the source of truth.

For lock/index artifacts that must be filename-safe across OSes, you may add an optional task-local encoded path-key directory:

- `.hawp/work/files/<TASK-ID>/`
- One file per tracked path using deterministic path-key naming

Deterministic path-key algorithm:

1. Input is the exact repo-relative path using `/` separators.
2. UTF-8 encode the path bytes.
3. Base64url encode (characters `A-Z`, `a-z`, `0-9`, `-`, `_`) and remove `=` padding.
4. Filename format: `pk-<base64url-no-pad>.txt`

Prefix meaning:

- `pk` means `path-key`.
- The prefix is a type marker so these files are easy to identify and glob safely.

If the resulting filename would exceed filesystem limits, use:

- `.hawp/work/files/<TASK-ID>/pk/<chunk1>/<chunk2>/.../entry.txt`
- Split the same base64url token into deterministic chunks (for example 120 chars per folder segment).
- Store full path and full base64url token in file content.

Artifact file content must contain only:

- one line with the exact repo-relative file path (including filename and extension)

Example content:

```txt
.hawp/kit/templates/work-item-files.md
```

These artifacts are coordination helpers only. They never replace plain-text path evidence in reports.

---

### 4. DA Workflow for File Tracking

When starting or coordinating a work item:

1. **Check the work item plan** (`.hawp/work/active/TASK-XXX.md`).
   - Read the "Constraints" and "Scope" sections.
   - Check for file-tracking document references.

2. **Read the file tracking document** (`.hawp/work/active/TASK-XXX-files.md`).
   - Before editing any file, verify it is in "Owned Files" section.
   - Before reading a file, verify it is in "Owned Files" or "Read-Only Context Files".
   - Before touching any file, check it is NOT in "Do-Not-Touch Files".
   - If a file is in "Locked / Reserved Files", note that another task has claimed it; coordinate before editing.

3. **Edit only files in "Owned Files".**
   - Do not edit files in "Read-Only Context Files".
   - Do not edit files in "Do-Not-Touch Files".
   - Do not edit files in "Locked / Reserved Files" unless you are the owning task.

4. **Update "Changed Files" frequently** as you make progress.
   - Include exact repo-relative paths.
   - Update before committing or handing off.
   - This keeps the work item visible and verifiable.

5. **Before closing a task:**
   - Verify all changed files are listed in "Changed Files" section.
   - Run the verification commands listed in the file-tracking document.
   - Update the work item plan with close date and verification results.

### 4.1 Pre-Emit Report Gate (Required)

Before emitting any path-sensitive DA report, run a self-validation gate and reject output if any file reference fails:

1. Every file path must contain at least one `/`.
2. Every file path must start with an allowed repo-root prefix (for example `.hawp/`, `.github/`, `core/`, `librarian/`, `docs/`, `src/`, `tests/`).
3. Every listed path must be either:
   - explicitly marked as planned-but-not-present, or
   - verified as existing in the workspace.
4. Do not rely on clickable file references, editor chips, breadcrumbs, or basename-only visible text as evidence.
5. For path lists, prefer fenced `txt` blocks containing plain text exact repo-relative paths.

If any check fails, do not emit the report as valid. Emit a correction pass tagged with one or more categories:

- `INVALID_REPO_RELATIVE_PATH`
- `BASENAME_ONLY_REFERENCE`
- `SELF_VALIDATION_FAILURE`

### 4.2 Manual DA Rule Set for v0.2

For v0.2 file-tracking enforcement lanes, execute this sequence:

1. Read the task file-tracking document before editing.
2. Report owned/read-only/locked paths as plain text exact repo-relative paths.
3. Do not rely on clickable file references.
4. Before completion, compare changed files against `git diff --name-only`.
5. Report violations using plain text exact repo-relative paths.
6. If a path appears as a basename in visible output, treat it as unsafe evidence even if clickable.

### 4.3 Cross-OS Path-Key Commands (v0.3)

Use one of the commands below to deterministically generate a path-key from an exact repo-relative path.

Node.js (macOS/Linux/Windows):

```bash
node -e 'const p=process.argv[1];const b=Buffer.from(p,"utf8").toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"" );console.log(`pk-${b}.txt`);' ".hawp/kit/templates/work-item-files.md"
```

Python 3 (macOS/Linux/Windows):

```bash
python3 -c 'import base64,sys;p=sys.argv[1];b=base64.urlsafe_b64encode(p.encode()).decode().rstrip("=");print(f"pk-{b}.txt")' ".hawp/kit/templates/work-item-files.md"
```

PowerShell (Windows):

```powershell
$p = ".hawp/kit/templates/work-item-files.md"
$b = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($p)).TrimEnd('=') -replace '\+','-' -replace '/','_'
"pk-$b.txt"
```

---

### 5. File Tracking Template

Use the standard template at `.hawp/kit/templates/work-item-files.md` to create a file-tracking document for each work item that needs it.

Template structure:

- Owned Files
- Read-Only Context Files
- Do-Not-Touch Files
- Locked / Reserved Files
- Changed Files
- Verification Notes

---

### 6. When to Create a File Tracking Document

Create a separate file-tracking document (`.hawp/work/active/TASK-XXX-files.md`) when:

- The task touches multiple files or folders
- The task risks overlapping with parallel work
- File boundaries are non-obvious
- You want to reserve files proactively to avoid agent conflicts
- The task spans multiple sub-tasks or stages

Simple tasks with only a few owned files may inline file boundaries in the main plan file instead.

---

### 7. Locked / Reserved Files

Use the "Locked / Reserved Files" section to prevent parallel agent collisions.

✅ **Reserve a file when:**

- You are actively editing it.
- Another task needs to know you are working on it.
- You want to prevent concurrent edits during a critical section.

❌ **Do not over-reserve:**

- Reserve only files you are actively changing.
- Move a file out of "Locked" once you are done editing it.
- Keep the locked list minimal and specific.

---

### 8. Backlog Linking (Optional)

The backlog may:

- Link to a work item plan file.
- Summarize the status of file-tracking in a brief note.
- Reference specific lock status if urgent.

The backlog must NOT:

- List owned files per task.
- Rebuild or maintain file ownership from scratch.
- Duplicate file-tracking information.

---

### 9. Verification

Before closing a work item, verify file accuracy:

```bash
# Show all files you changed
git status --short
git diff --name-status

# Check whitespace and formatting
git diff --check

# Run repo validation
npm run typecheck
npm run validate:workflow
```

Confirm that:

- All changed files are listed in the "Changed Files" section of the work item.
- All changed files are repo-relative full paths.
- No basename-only or ambiguous paths are listed.
- No files are locked/reserved after the task is complete.
- If pre-emit checks failed at any point, the report was rejected and corrected before final output.

---

### 10. Future Extensions (Out of Scope for v0.1)

These are deferred and not part of v0.1:

- CLI validation of file tracking
- Automated lock conflict detection
- Work item file-tracking database
- Backlog file ownership aggregation
- Generated file ownership reports

---

## Examples

### Example 1: Simple Task with Few Files

**`.hawp/work/active/TASK-029-files.md`**

```markdown
## TASK-029: Implement backlog upgrade data models

### Owned Files

- `librarian/scripts/backlog-upgrade/models/types.ts`
- `librarian/scripts/backlog-upgrade/models/__tests__/types.test.ts`
- `.hawp/work/active/TASK-029.md`

### Read-Only Context Files

- `librarian/package.json`
- `README.md`

### Do-Not-Touch Files

- `librarian/scripts/backlog-upgrade/cli.ts` (TASK-027 owns this)

### Changed Files

- `librarian/scripts/backlog-upgrade/models/types.ts`
```

### Example 2: Complex Task with Locks

**`.hawp/work/active/TASK-026-files.md`**

```markdown
## TASK-026: Audit install/update docs for workflow accuracy

### Owned Files

- `.hawp/kit/standards/docs/hawp-install-update-safety.md`
- `.hawp/kit/references/install-update-safety.md`
- `.hawp/work/active/TASK-026.md`

### Read-Only Context Files

- `.hawp/kit/standards/public/standards/docs/` (mirror only; not normative)
- `README.md`
- `.github/instructions/` (instruction files)

### Do-Not-Touch Files

- `librarian/` (separate tooling lane)
- `.hawp/kit/standards/public/exports/machine-readable/` (lineage metadata)

### Locked / Reserved Files

- `.hawp/work/BACKLOG.md` (brief row update only)

### Changed Files

- `.hawp/kit/standards/docs/hawp-install-update-safety.md` — aligned install/update boundaries
- `.hawp/kit/references/install-update-safety.md` — points to canonical doc
```

---

## Related

- Template: `.hawp/kit/templates/work-item-files.md`
- Backlog reference: `.hawp/kit/references/backlog-alignment.md`
- Work item intake: `.hawp/kit/usage/intake-workflow.md`
