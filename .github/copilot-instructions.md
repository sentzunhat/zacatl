# Zacatl Copilot Instructions

When helping in this repository, prefer minimal and practical changes aligned with existing docs and scripts.

## Required Context Intake (Before Doing the Task)

- Before implementing changes, review repository context in this order:
  1. `START_HERE.md` (setup, daily workflow, and key commands)
  2. `README.md`
  3. `docs/README.md`
  4. `docs/guidelines/framework-overview.md`
  5. Relevant standards in `docs/guidelines/` (at minimum: `code-style.md`, `documentation.md`, and `testing.md` when applicable)
- Treat the `docs/` folder as source of truth for coding standards, architecture conventions, and documentation standards.
- Use only the docs relevant to the user request, but always verify assumptions against `README.md` and `docs/guidelines/` before editing.
- If guidance conflicts, prefer the most specific document for the files being changed, then align with repository defaults in this file.

## Repository Defaults

- Use Node.js `24+` and npm scripts from `package.json`.
- Validate changes with the smallest relevant command first (`npm run type:check`, `npm run lint`, `npm test`, `npm run build`).
- Keep changes modular and consistent with the layered architecture in `src/`.
- Prefer updating existing docs over adding parallel documentation.

## Documentation Drift Prevention

- Treat `src/` as the source of truth for API imports, exported symbols, and runtime behavior.
- When editing `README.md` or `docs/**`, validate package import examples against existing source-backed paths.
- Prefer stable public paths first (`@sentzunhat/zacatl`, `@sentzunhat/zacatl/error`, `@sentzunhat/zacatl/service`, `@sentzunhat/zacatl/dependency-injection`, `@sentzunhat/zacatl/configuration`, `@sentzunhat/zacatl/third-party/*`).
- If documentation claims runtime behavior (for example `run.auto`, platform support, adapter behavior), verify against current implementation before finalizing.

## Release Notes Workflow

- The release notes file is `docs/changelog.md`.
- Add new release entries at the top, right below the first `---` separator.
- Follow the established format:
  - `## [VERSION] - YYYY-MM-DD`
  - `**Status**: ...`
  - emoji-based categories: `✨` (Improvements), `🐛` (Fixes), `🔧` (Architecture), `📚` (Documentation), `🗺️` (Roadmap), `⚠️` (Breaking Changes)
- Keep entries factual, concise, and in past tense.
- If version-related files change, ensure release notes are updated consistently.

## Git Commit Conventions

Follow [docs/guidelines/git-workflow.md](../../docs/guidelines/git-workflow.md) for:

- Conventional commit format (`feat:`, `fix:`, `docs:`, `refactor:`, etc.)
- Branch naming conventions
- Pull request guidelines
- Scope classification

## Source of Truth

- For versioning and release procedures, use `docs/skills/version-updates.md`.
- For project structure and conventions, use `docs/guidelines/framework-overview.md` and module docs in `docs/`.
- For git workflow, commit conventions, and branch naming, use `docs/guidelines/git-workflow.md`.
- For code standards and patterns, use `docs/guidelines/code-style.md` and `docs/guidelines/architecture.md`.

## HAWP Workflow Overlay

This repository uses HAWP as a lightweight workflow method.

Follow the repo-local HAWP guidance in:

- `hawp/usage/INIT.md`
- `hawp/usage/STATUS_REPORT.md`

Use `hawp/usage/INIT.md` as the operating guide for how this repo applies HAWP in practice.

Use `hawp/usage/STATUS_REPORT.md` when the user asks for a:

- status report
- checkpoint summary
- context transfer summary
- second-brain review artifact

Saved status reports belong in:

- `hawp/usage/status/`

Keep the repo-local HAWP layer lean.

HAWP in this repository is a practical workflow layer, not a runtime engine, compiler, validator, orchestrator, or memory system.

Do not:

- invent per-field folders such as `input/`, `context/`, `mission/`, `constraints/`, `output/`, or `checkpoint/`
- imply a runtime engine, compiler, validator, orchestrator, persistence layer, or memory system
- overstate certainty; keep direct evidence separate from inference

Prefer compact, decision-useful outputs.
