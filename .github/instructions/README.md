# Instructions Folder

Files in this folder must use the `*.instructions.md` suffix and include frontmatter with `applyTo`.

These files are for **automatic** Copilot guidance when matching files are in scope.

For a quick setup/health check after prompt or instruction edits, see the [Validation Checklist](../README.md#validation-checklist).

Repository-wide baseline guidance lives in `.github/copilot-instructions.md` and includes required pre-task context intake from `README.md` and `docs/` standards.

Current instruction files:

- `repo-standards.instructions.md` (applies to all files; enforces docs-first context intake)
- `changelog.instructions.md` (applies to `docs/changelog.md` and `package.json`)
- `docs-drift.instructions.md` (applies to `README.md` and `docs/**`; prevents docs/API drift)
