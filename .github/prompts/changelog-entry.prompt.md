---
name: "changelog-entry"
description: "Draft and apply a Zacatl changelog entry from branch changes"
argument-hint: "version=<x.y.z> status=<Current release|Patch release> date=<YYYY-MM-DD>"
agent: "agent"
---

Create a new release-notes entry for Zacatl using the repository conventions.

Use [Version Updates](../../docs/skills/version-updates.md) and update [Release Notes](../../docs/changelog.md).

## Inputs

- Target version: `${input:version:0.0.39}`
- Release date: `${input:date:2026-02-15}`
- Release status: `${input:status:Patch release}`
- Workspace: `${workspaceFolderBasename}`
- Current file context (if any): `${file}`
- Selected context (if any): `${selection}`

## Requirements

1. Read `docs/skills/version-updates.md` and follow its format rules.
2. Inspect current branch changes and summarize only user-relevant outcomes.
3. Update `docs/changelog.md` by inserting the new entry immediately below the first `---`.
4. Keep sections concise and use emoji categories already used in this repository.
5. Use past tense and avoid speculative statements.
6. Do not modify previous release entries.

## Output

- Apply the changelog edit directly.
- Return a brief summary of what was added.
