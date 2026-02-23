---
name: 'next-release-plan'
description: 'Describe what to build next and propose the next Zacatl release scope'
argument-hint: 'goal=<what to ship next>'
agent: 'agent'
---

Describe what to build next for the upcoming Zacatl release.

Use these references:

- [Version Updates](../../docs/skills/version-updates.md)
- [Release Notes](../../docs/changelog.md)
- [Architecture](../../docs/guidelines/framework-overview.md)

## Inputs

- User goal: `${input:goal:improve framework reliability}`
- Workspace: `${workspaceFolderBasename}`
- Current file context (if any): `${file}`
- Selected context (if any): `${selectedText}`

## Required Output

1. Recommend one semver bump type (patch, minor, or major) with a short reason.
2. Propose the next 3-5 build items in priority order.
3. Add a draft changelog section outline with emoji categories.
4. Include a minimal validation checklist using npm scripts from `package.json`.

Keep the plan practical and minimal.
