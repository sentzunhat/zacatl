---
name: 'changelog-from-selection'
description: 'Convert selected notes or diffs into a Zacatl changelog section'
argument-hint: 'version=<x.y.z> status=<release status>'
agent: 'ask'
---

Convert the selected content into a release-note section that matches Zacatl conventions.

Use:

- [Version Updates](../../docs/skills/version-updates.md)
- [Release Notes](../../docs/changelog.md)

## Inputs

- Version: `${input:version:0.0.39}`
- Status: `${input:status:Patch release}`
- Selected source text: `${selection}`
- Source file (if any): `${file}`

## Requirements

1. Produce only Markdown ready to paste into `docs/changelog.md`.
2. Use established emoji sections and past tense verbs.
3. Keep bullets concise and user-facing.
4. If selected text is empty, ask for missing details instead of inventing them.
