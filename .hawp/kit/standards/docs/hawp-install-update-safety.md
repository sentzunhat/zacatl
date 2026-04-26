# HAWP Install and Update Safety

Safety rules for HAWP install/update execution, ownership boundaries, and re-run behavior.

**Normative for installed projects.** Principle-only summary: [references/install-update-safety.md](../../references/install-update-safety.md).

## Safety Principles

### Project Work Is Never Overwritten

- `.hawp/work/` is project-owned and must not be overwritten.
- This includes backlog, active work, parked work, closed work, decisions, and evidence.
- Install and update preserve existing `.hawp/work/**` files.

### Copilot Instructions Behavior (GitHub guide)

- `.github/copilot-instructions.md` is seeded on install only when missing.
- Update refreshes `.github/copilot-instructions.md` from `core/providers/.github/`.
- Cursor and Continue guides refresh their own overlay paths; see provider boundaries in each distribution guide.

### Provider overlay scope

Each install/update guide sets one `PROVIDER` and refreshes kit plus that provider's overlay only. Source packs live under `core/providers/.<provider>/`.

### Install and Update Are Safe to Re-Run

- Operations are idempotent for project-owned files.
- Re-running install/update should be safe and supported.
- No-clobber behavior is required where project-owned files are involved.

### Legacy Layout Migration Is Automatic

When legacy layouts are present, migration should preserve work records and move them into the current `.hawp/work/` structure.

### Active Work Reconciliation Runs Automatically

During update, completed or retired active items may be moved from `active/` to `closed/` based on backlog evidence.

## Repository Boundaries

### HAWP-Managed Files (refreshed)

- `.hawp/LICENSE`
- `.hawp/kit/**`
- `.github/instructions/*.instructions.md`
- `.github/prompts/*.prompt.md`
- `.github/copilot-instructions.md` (refreshed on update; seeded on install if missing)

Source install packs: `core/providers/.github/`, `.cursor/`, `.continue/` (planned). Each distribution guide installs kit plus one provider overlay.

### Provider overlays (refreshed per guide)

| Provider | Source | Target |
|----------|--------|--------|
| GitHub | `core/providers/.github/` | `.github/instructions/`, `.github/prompts/`, `.github/copilot-instructions.md` |
| Cursor | `core/providers/.cursor/` | `.cursor/rules/*.mdc`, `AGENTS.md` |
| Continue | `core/providers/.continue/` | `.continue/rules/hawp-*.md` |

### Project-Owned Files (preserved)

- `.hawp/work/**`
- repository code, docs, and configuration outside HAWP-managed scope

### Scaffold Files (seeded only when missing)

- `.hawp/work/README.md`, `.hawp/work/STATUS.md`, `.hawp/work/BACKLOG.md`
- `.hawp/work/active/README.md`, `.hawp/work/parked/README.md`, `.hawp/work/closed/README.md`
- `.hawp/work/decisions/README.md`, `.hawp/work/evidence/README.md`, `.hawp/work/status/README.md`, `.hawp/work/notes/README.md`

## Update Behavior

Update should:

1. refresh HAWP-managed files from source
2. preserve project-owned files
3. seed only missing scaffold files
4. run migration/reconciliation passes when eligible
5. remain safe to run multiple times

Update should not:

- overwrite project work records
- delete project-owned history
- overwrite `.github/copilot-instructions.md` on install when the file already exists

## Verification Checklist

- Confirm source, provider, and source mode lines in execution output.
- Confirm refreshed files under `.hawp/kit/` and the provider overlay paths listed in your guide's boundaries section.
- Confirm `.hawp/work/**` records remain intact.
- Confirm reconciliation output lines only move eligible active items.

## Privacy-Safe Evidence Logging

- Keep evidence paths repo-relative in saved artifacts.
- Do not persist machine-local absolute paths.
- Redact only the host-local prefix when proof output includes absolute paths.

## Install and update commands

Use your project's published install or update guide (from the HAWP distribution for your branch). Those guides are the operational source for copy-paste scripts.

**Recommended path:** open the guide, review the **Install Command (Copy/Paste)** or **Update Command (Copy/Paste)** block, then run it in a terminal from the repository root.

**Optional guide fetch:** some guides include a review-first helper that downloads the remote guide and writes the command block to a local script file under `/tmp`. Inspect that file before running it. Do not pipe remote content directly to `bash`.

Do not treat files under `.hawp/kit/standards/public/` as install script sources.
