# Copilot Configuration

This repository intentionally uses **both** folders:

- `.github/instructions/` → always-on or path-specific rules (`*.instructions.md`)
- `.github/prompts/` → reusable slash commands (`*.prompt.md`)

## What to use when

- Use **instructions** for guardrails that should apply automatically.
- Use **prompts** for repeatable tasks users invoke manually (for example `/changelog-entry`).

## Current Files

- `.github/copilot-instructions.md` (repository-wide baseline guidance)
- `.github/instructions/changelog.instructions.md` (path-specific release-note rules)
- `.github/prompts/*.prompt.md` (release workflow prompt commands)

## Publishing Guard

- `npm run prepublish` runs `scripts/prepublish-guard.mjs` before tests/build.
- Emergency bypass is supported only with explicit reason:
  - `SKIP_PREPUBLISH_GUARD=1 SKIP_PREPUBLISH_GUARD_REASON="<reason>" npm run prepublish`
