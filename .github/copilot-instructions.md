# Zacatl Copilot Instructions

When helping in this repository, prefer minimal and practical changes aligned with existing docs and scripts.

## Required Context Intake (Before Doing the Task)

- Before implementing changes, review repository context in this order:
  1. `README.md`
  2. `docs/README.md`
  3. `docs/guidelines/framework-overview.md`
  4. Relevant standards in `docs/guidelines/` (at minimum: `code-style.md`, `documentation.md`, and `testing.md` when applicable)
- Treat the `docs/` folder as source of truth for coding standards, architecture conventions, and documentation standards.
- Use only the docs relevant to the user request, but always verify assumptions against `README.md` and `docs/guidelines/` before editing.
- If guidance conflicts, prefer the most specific document for the files being changed, then align with repository defaults in this file.

## Repository Defaults

- Use Node.js `24+` and npm scripts from `package.json`.
- Validate changes with the smallest relevant command first (`npm run type:check`, `npm run lint`, `npm test`, `npm run build`).
- Keep changes modular and consistent with the layered architecture in `src/`.
- Prefer updating existing docs over adding parallel documentation.

## Release Notes Workflow

- The release notes file is `docs/changelog.md`.
- Add new release entries at the top, right below the first `---` separator.
- Follow the established format:
  - `## [VERSION] - YYYY-MM-DD`
  - `**Status**: ...`
  - emoji-based categories (`✨`, `🐛`, `🔧`, `📚`, etc.)
- Keep entries factual, concise, and in past tense.
- If version-related files change, ensure release notes are updated consistently.

## Source of Truth

- For versioning and release procedures, use `docs/skills/version-updates.md`.
- For project structure and conventions, use `docs/guidelines/framework-overview.md` and module docs in `docs/`.
