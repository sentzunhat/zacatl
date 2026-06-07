# HAWP Install and Update Safety (Reference)

## Purpose

Principle-level safety for HAWP install and update work. For the full normative rules (boundaries, idempotency, verification), use the canonical standard:

**[standards/docs/hawp-install-update-safety.md](../standards/docs/hawp-install-update-safety.md)**

This reference does not include copy-paste install/update scripts or distribution build procedures.

## Scope

Applies when changing kit guidance while preserving project-owned work.

Covers: safety boundaries, ownership boundaries, change-scoping, verification expectations.

Does not cover: script implementation, distribution generation, branch rollout mechanics.

## Safety Principles (summary)

### Treat install/update as explicit work items

- Install when `.hawp/` is missing.
- Update when `.hawp/` already exists.
- Do not run update before first install.

### Project-owned work must not be clobbered

Never overwrite `.hawp/work/**` (backlog, active, closed, evidence, status, decisions, parked, notes).

### Separate kit guidance from project records

- Kit-level assets = reusable protocol and standards.
- Work-level records = this project's execution history.

### Path-scoped changes only

Edit only approved paths. Stop and ask if a needed edit is outside scope.

### Distribution is a separate lane

Do not mix reference-only kit edits with distribution source or generated guide edits unless the task is explicitly distribution-scoped.

### Verify before close

Confirm approved paths only, work records preserved, and safety claims match direct evidence.

### Destructive actions need explicit approval

Deleting, overwriting, or relocating project-owned records requires explicit human approval.

## High-sensitivity paths (HAWP source repository maintainers)

When working in the **HAWP protocol source repository** (not a downstream install), treat these as distribution lanes — do not edit in reference-only kit tasks unless explicitly approved:

- `distribution/sources/**`
- `distribution/generated/**`
- `librarian/scripts/distribution/**`

Downstream projects use generated guides at install time (for example from the project's install/update documentation links). They do not maintain those paths locally.

## Review Checklist

- [ ] Scope limited to approved kit/reference paths
- [ ] No project-owned work records overwritten
- [ ] Canonical install/update doc used for normative rules
- [ ] Safety claims separate evidence from inference

## Related

- [standards/docs/hawp-install-update-safety.md](../standards/docs/hawp-install-update-safety.md)
- [docs-alignment.md](docs-alignment.md)
- [backlog-alignment.md](backlog-alignment.md)
- [../reviews/public-safety-checklist.md](../reviews/public-safety-checklist.md)
- [../reviews/publication-safety-guidelines.md](../reviews/publication-safety-guidelines.md)
