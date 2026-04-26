# Work Item File Tracking Template

Use this template to track files for a work item.

**Save as:** `.hawp/work/active/<TASK-ID>-files.md`

---

## TASK-XXX: [Task Title] — File Tracking

**Purpose:** Track files related to this work item using exact repo-relative paths. Source of truth for file ownership, read-only context, and lock status.

**Work Item:** `.hawp/work/active/TASK-XXX.md`

**Last Updated:** YYYY-MM-DD

---

### Owned Files

Files this task is allowed to create or edit.

- `.hawp/work/active/TASK-XXX.md` — this work item plan
- `path/to/file.md` — file 1
- `path/to/another-file.ts` — file 2

---

### Read-Only Context Files

Files this task may read for context but must not edit.

- `.hawp/kit/references/backlog-alignment.md`
- `README.md`
- `package.json`

---

### Do-Not-Touch Files

Files explicitly out of scope. Agents must not edit these even if they appear related.

- `.hawp/kit/templates/micro-hawp.md` — separate initiative
- `librarian/scripts/backlog-upgrade/` — separate work (TASK-027, TASK-028, TASK-029)

---

### Locked / Reserved Files

Files currently reserved for this task. Other agents must not touch these while the task is active.

- `.hawp/work/BACKLOG.md` — TASK-030 will add a single row for this item

---

### Changed Files

Files actually changed during this task. Populate as work progresses.

**Not started yet.** Will include:

- `.hawp/kit/templates/work-item-files.md` (new)
- `.hawp/kit/instructions/da-file-tracking.md` (new)
- `.hawp/kit/references/work-item-file-tracking.md` (new)
- `.hawp/work/active/TASK-030.md` (this work item)
- `.hawp/work/BACKLOG.md` (updated with TASK-030 row)

---

### Optional Encoded Path-Key Artifacts (v0.3)

Use this section only when filename-safe lock/index artifacts are needed.

Artifact directory:

- `.hawp/work/files/TASK-XXX/`

Deterministic filename rule:

- `pk-<base64url-no-pad>.txt`
- Input must be the exact repo-relative path with `/` separators.
- If key length is too long for the filesystem, use `.hawp/work/files/TASK-XXX/pk/<chunk1>/<chunk2>/.../entry.txt` with deterministic token chunks and store full token in file content.

Prefix meaning:

- `pk` means `path-key`.

Example artifact files:

- `.hawp/work/files/TASK-XXX/pk-Y29yZS8uaGF3cC9raXQvdGVtcGxhdGVzL3dvcms....txt`

Required artifact content:

```txt
.hawp/kit/templates/work-item-files.md
```

---

### Verification Notes

Commands to verify accuracy before closing:

```bash
# Show new/modified files
git status --short

# Show exact paths changed
git diff --name-status

# Check no trailing whitespace
git diff --check

# Verify TypeScript (if applicable)
npm run typecheck

# Verify HAWP workflow structure
npm run validate:workflow

# Final commit validation
git log -1 --oneline
```

### Self-Validation Gate (v0.2)

Before publishing any path-sensitive report from this task, verify:

- [ ] Every referenced file path contains `/`
- [ ] Every referenced file path starts with an allowed repo-root prefix (`.hawp/`, `.github/`, `core/`, `librarian/`, `docs/`, `src/`, `tests/`, or another real repo-root directory)
- [ ] Every referenced path is either verified to exist or explicitly marked planned-but-not-present
- [ ] No basename-only path appears in candidate lists, file tables, acceptance criteria, or do-not-touch sections
- [ ] Path evidence is plain text exact repo-relative paths from repository root
- [ ] No clickable editor/IDE/Copilot file chip is used as path evidence

Use fenced `txt` blocks for path evidence when possible:

```txt
.hawp/kit/instructions/da-file-tracking.md
.hawp/kit/references/work-item-file-tracking.md
.hawp/kit/templates/work-item-files.md
```

If any check fails, reject report output and classify the failure with:

- `INVALID_REPO_RELATIVE_PATH`
- `BASENAME_ONLY_REFERENCE`
- `SELF_VALIDATION_FAILURE`

### v0.2 Completion Checks

Before completion, confirm:

- [ ] File-tracking document was read before edits
- [ ] Owned/Read-Only/Locked paths are reported as plain text exact repo-relative paths
- [ ] Changed files were compared against `git diff --name-only`
- [ ] Any path shown as basename in visible output is treated as unsafe evidence, even if clickable

### v0.3 Completion Checks

Before completion, confirm when encoded artifacts are used:

- [ ] Encoded artifact filenames were generated deterministically from exact repo-relative paths
- [ ] Every encoded artifact file contains only one exact repo-relative file path line
- [ ] Plain-text path evidence in reports still uses exact repo-relative paths (encoded filenames are not path evidence)

---

## Notes

- All paths must be repo-relative (start with `.` or end with `/`).
- No basename-only paths (e.g., never list just `file.md`).
- No ambiguous paths like `src/` when you mean `src/file.ts`.
- If unsure about file scope, list it in Read-Only or Do-Not-Touch rather than leaving it implicit.
- Keep locked files minimal; reserve only files that are actively being edited.
- Update Changed Files frequently as work progresses for visibility and verification.
