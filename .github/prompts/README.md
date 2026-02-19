# Prompt Files

Workspace prompt files live in `.github/prompts` and are available as slash commands in Copilot Chat.

This folder is for **manual** command-style prompts, not always-on rules.

## Available Prompts

- `changelog-entry`
- `next-release-plan`
- `changelog-from-selection`
- `pre-release-guard`

## Verify Prompt Selection Works

1. Open Copilot Chat and type `/`.
2. Confirm the prompt names above appear in the prompt picker.
3. Run `Chat: Configure Prompt Files` and verify source is this workspace.
4. Open chat diagnostics (`Configure Chat` → `Diagnostics`) and confirm no prompt-file errors.

## Verify Dynamic References Work

1. Select text in a file and run `/changelog-from-selection`.
2. Confirm selected text appears through `${selection}` in the response.
3. Run `/changelog-entry version=0.0.39 status=Patch release date=2026-02-15`.
4. Confirm variables from `${input:*}` are reflected in the generated output.

## Verify Reference Scope (Only Needed Files)

1. Run `/pre-release-guard version=0.0.39`.
2. Confirm the response references only:
   - `docs/skills/version-updates.md`
   - `docs/changelog.md`
   - `package.json`
3. Open chat diagnostics and confirm prompt files load without missing-link or parsing warnings.
4. Avoid adding broad references unless required for that specific prompt workflow.
