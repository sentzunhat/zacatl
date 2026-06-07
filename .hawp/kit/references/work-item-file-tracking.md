# Work Item File Tracking — Reference

## Purpose

Define the file-tracking convention for HAWP work items. This allows agents to coordinate work safely without colliding or misunderstanding scope boundaries.

---

## Problem

HAWP projects involve multiple agents coordinating changes. Without clear file-ownership boundaries:

- Agents may overwrite each other's changes.
- Scope boundaries are implicit and hard to discover.
- Agents cannot safely lock or reserve files.
- File coordination happens outside the work item, making it invisible to future audits.

---

## Solution: Workflow-First File Tracking

Each work item may include a file-tracking document that declares:

1. **Owned files** — files this task creates or edits
2. **Read-only files** — files this task reads for context but does not edit
3. **Do-not-touch files** — files explicitly out of scope
4. **Locked/reserved files** — files currently reserved by this task
5. **Changed files** — files actually changed during the task (updated as work progresses)

---

## Core Design Principles

### 1. Workflow-First, Not CLI-First

File tracking is a **manual convention** for now.

- Humans and agents can use file tracking immediately without CLI tools.
- File tracking lives in version-controlled markdown, not in a database.
- Future CLI/automation may validate or enforce file tracking, but the core workflow is human-readable today.

### 2. Source of Truth in Work Item, Not Backlog

**The backlog is a summary/report surface only.**

- File tracking lives in `.hawp/work/active/<TASK-ID>-files.md`.
- The backlog may link to a work item and summarize status.
- The backlog must not rebuild file ownership from scratch.
- The backlog must not list files per task.

### 3. Exact Repo-Relative Paths Only

All paths must be:

- Full and unambiguous (e.g., `.hawp/kit/standards/docs/hawp-install-update-safety.md`, not `hawp-install-update-safety.md`)
- Repo-relative (start with `.` or end with `/`)
- Specific (e.g., `librarian/scripts/cli.ts`, not `librarian/`)

### 4. Plain Text Path Evidence Required (v0.2)

Clickable editor, IDE, or GitHub Copilot file references do not count as path evidence.

Path evidence must be written as plain text exact repo-relative paths from the repository root.
Use fenced `txt` or `text` blocks for path lists when possible.

Accepted:

```txt
.hawp/kit/instructions/da-file-tracking.md
.hawp/kit/references/work-item-file-tracking.md
.hawp/kit/templates/work-item-files.md
```

Unsafe:

```txt
da-file-tracking.md
work-item-file-tracking.md
work-item-files.md
```

### 5. Optional Encoded Path-Key Index (v0.3)

When a workflow needs filename-safe lock/index artifacts, use task-local encoded path-key files under:

```text
.hawp/work/files/<TASK-ID>/
```

Keep plain-text exact repo-relative paths in the task tracking document as the source of truth.
Encoded path-key files are optional coordination helpers.

Deterministic key algorithm:

1. Input: exact repo-relative path with `/` separators.
2. Encode UTF-8 bytes using base64url.
3. Remove trailing `=` padding.
4. Filename: `pk-<base64url-no-pad>.txt`

Prefix meaning:

- `pk` means `path-key`.
- The prefix is a type marker for safe filtering and future tooling.

If the key is too long for safe filesystem limits, use a shortened filename:

- `.hawp/work/files/<TASK-ID>/pk/<chunk1>/<chunk2>/.../entry.txt`
- Split the same base64url token into deterministic chunks (for example 120 chars per folder segment).
- Store full path and full base64url token in file content.

Minimum artifact content:

```text
.hawp/kit/templates/work-item-files.md
```

Why this model:

- filename-safe across macOS/Linux/Windows
- deterministic and automation-friendly for future CLI support
- reversible and human-auditable from the encoded token

---

## Structure

### File Location

```
.hawp/work/active/
  TASK-030.md                    # Work item plan
  TASK-030-files.md              # File tracking (separate from plan)
```

You may inline file tracking in the plan file for simple tasks with only a few files.

### File Tracking Document Sections

1. **Owned Files** — Files this task can create or edit
2. **Read-Only Context Files** — Files this task reads but does not edit
3. **Do-Not-Touch Files** — Files explicitly out of scope
4. **Locked / Reserved Files** — Files currently reserved to prevent collisions
5. **Changed Files** — Files actually modified (populate as work progresses)
6. **Verification Notes** — Commands to confirm accuracy

---

## Usage for Agents

When starting work on a HAWP task:

1. Read the work item plan (`.hawp/work/active/TASK-XXX.md`).
2. Read the file-tracking document (if it exists).
3. Before editing any file:
   - Verify it is in "Owned Files".
   - Verify it is NOT in "Do-Not-Touch Files".
   - Verify it is NOT in "Locked / Reserved Files" (unless you are the owning task).
4. Edit only files in "Owned Files".
5. Update "Changed Files" frequently as work progresses.
6. Before closing:
   - Verify all changed files are listed.

- Compare changed files against `git diff --name-only`.
- Run verification commands.
- Check that no files remain locked.
- Treat basename-only visible output as unsafe evidence even if clickable in the UI.

---

## Benefits

### For Agents

- Clear file ownership prevents collision and confusion.
- Explicit boundaries reduce bugs and rework.
- Ability to reserve/lock files enables safe parallel work.
- File tracking is discoverable in the work item, not hidden in chats.

### For Humans

- File tracking is human-readable and auditable.
- Scope changes are visible in version control.
- Work item git history shows who touched which files.
- Supports future automation without forcing it.

### For Project Coordination

- Transparent file ownership supports parallel agent scheduling.
- Lock status prevents parallel agent conflicts.
- Changed files section provides accurate work-done evidence.
- Future CLI tools can validate consistency without redesigning the workflow.

---

## When File Tracking Applies

Use file tracking when:

- A task touches multiple files
- A task overlaps with parallel work
- File boundaries are non-obvious
- You want to reserve files proactively
- A task spans multiple stages or sub-tasks

You may skip file tracking for:

- Trivial single-file tasks
- Read-only investigation or audit tasks
- Brief documentation fixes

---

## Backlog Integration (Minimal)

The backlog may reference work item file tracking:

```md
| TASK-030 | task | Implement file-tracking v0.1 | in-progress | [plan](active/TASK-030.md) | Files: [tracking](active/TASK-030-files.md) |
```

The backlog must NOT:

- List files per task
- Rebuild file ownership
- Duplicate file-tracking information

---

## Version History

- **v0.1** (2026-05-12): Workflow-first file tracking. Workflow manual; no CLI.
- **v0.2** (2026-05-12): Path-lock enforcement semantics with deterministic pre-emit self-validation.
  - Violation categories: `INVALID_REPO_RELATIVE_PATH`, `BASENAME_ONLY_REFERENCE`, `SELF_VALIDATION_FAILURE`
  - Required behavior: reject unsafe path-sensitive reports before final output
  - Plain text evidence requirement: clickable references do not count as path evidence
  - Scope: workflow/instruction/template enforcement only (no CLI implementation)
- **v0.3** (2026-05-13): Deterministic encoded path-key artifacts for cross-OS file-safe indexing.
  - Optional location: `.hawp/work/files/<TASK-ID>/`
  - Deterministic format: `pk-<base64url-no-pad>.txt`
  - Source-of-truth rule: plain-text exact repo-relative paths remain authoritative
- **v1.0** (future): Automated lock conflict detection; file-ownership aggregation.

---

## Template

Use the standard template at `.hawp/kit/templates/work-item-files.md`.

---

## Related

- **Template:** `.hawp/kit/templates/work-item-files.md`
- **DA Instruction:** `.hawp/kit/instructions/da-file-tracking.md`
- **Backlog Reference:** `.hawp/kit/references/backlog-alignment.md`
- **Intake Workflow:** `.hawp/kit/usage/intake-workflow.md`
