# Copilot Configuration

This repository intentionally uses **both** folders:

- `.github/instructions/` → always-on or path-specific rules (`*.instructions.md`)
- `.github/prompts/` → reusable slash commands (`*.prompt.md`)

## What to use when

- Use **instructions** for guardrails that should apply automatically.
- Use **prompts** for repeatable tasks users invoke manually (for example `/changelog-entry`).

## Agent Startup Expectations

- On task start, agents should first review `README.md` and relevant guidance in `docs/`, especially `docs/guidelines/`.
- Treat documentation standards and coding standards in `docs/` as project source-of-truth before making changes.

## Current Files

- `.github/copilot-instructions.md` (repository-wide baseline guidance)
- `.github/instructions/repo-standards.instructions.md` (always-on docs-first context intake)
- `.github/instructions/changelog.instructions.md` (path-specific release-note rules)
- `.github/prompts/*.prompt.md` (release workflow prompt commands)

## Publishing Guard

- `npm run prepublish` runs `scripts/prepublish-guard.mjs` before tests/build.
- Emergency bypass is supported only with explicit reason:
  - `SKIP_PREPUBLISH_GUARD=1 SKIP_PREPUBLISH_GUARD_REASON="<reason>" npm run prepublish`

## Validation Checklist

1. Open Copilot Chat, type `/`, and confirm workspace prompts from `.github/prompts/*.prompt.md` appear.
2. Run **Chat: Configure Prompt Files** and verify the source is this workspace and diagnostics show no prompt-file errors.
3. Confirm instructions are active by checking `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md` are present and up to date.
