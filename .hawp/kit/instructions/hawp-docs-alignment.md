# HAWP Docs Alignment — Local Kit Guidance

## Purpose

Provide stable, repo-local guidance for a HAWP digital agent when editing `.hawp/kit/` docs, templates, or instruction files.

## Scope

Apply this guidance when the task includes:

- editing `.hawp/kit/` docs, templates, or instruction files
- aligning local HAWP core kit guidance with implementation
- fixing wording, examples, commands, or workflow docs inside `.hawp/kit/`

Do not use this guidance to patch runtime source code unless the request explicitly includes code changes.

## Canonical policy

- `.hawp/kit/references/docs-alignment.md`
- `.hawp/kit/standards/guidelines/documentation.md`

## Core rules

### 1. Prefer local kit guidance for `.hawp/kit/`

- Local `.hawp/kit/` instruction files are the primary source of stable policy for kit documentation alignment.
- Avoid relying on `.github/` overlay files as the authoritative guidance for `.hawp/kit/` edits.
- If `.github/` files exist, treat them as secondary overlays only.

### 2. Prioritize small and medium docs fixes

- `SMALL`: wording fixes, command corrections, link updates, short clarifications.
- `MEDIUM`: section rewrites, example refreshes, cross-link cleanup, minor template updates.
- `LARGE`: broad reference rewrites, architecture/API doc updates, or multi-file docs rework.
- `EXTRA_LARGE`: major new guides, full docs restructuring, or multi-doc overhaul.

Apply small and medium changes directly. For large or extra-large work, surface the item up front with a clear proposed scope and avoid applying broad edits in the same pass.

### 3. Keep edits local to the core kit

- Edit only `.hawp/kit/` files when the request is about kit docs or local workflow guidance.
- Prefer `.hawp/kit/instructions/` for agent-facing instruction updates.
- Do not use `.github/` files as the authoritative local kit policy.
- Do not patch runtime source code unless the task explicitly includes code changes.

### 4. Use exact repo-relative paths

- Report file paths as plain text exact repo-relative paths.
- Avoid basename-only references and editor-specific link chips.
- Example accepted format:

```txt
.hawp/kit/instructions/hawp-docs-alignment.md
.hawp/kit/references/docs-alignment.md
```

### 5. Provide review output before patching

Before making edits, produce:

1. mismatch summary
2. minimal change plan
3. change-size classification for each proposed update
4. deferred or large-item candidates with reasons

Then apply only the minimal targeted documentation edits allowed by the plan.

### 6. Preserve clarity and grammar

- Use concise, implementation-driven wording.
- Keep commands copy/paste-ready.
- Avoid unnecessary abstraction or duplicated explanation.
- Ensure edits are grammatically correct and easy to follow.

### 7. Use work-item tracking when needed

- If the task touches multiple files or spans multiple docs sections, use `.hawp/kit/templates/work-item-files.md` or a similar tracking document.
- Mark `LARGE` and `EXTRA_LARGE` items as deferred work if they require a separate intake or approval.
- Keep the work item plan and changed file list updated as edits progress.

## Verification

- Confirm any updated docs still match `.hawp/kit/references/docs-alignment.md` and local standards.
- Verify commands and paths with the current repository layout.
- Do not introduce new runtime behavior or architecture claims without evidence.
