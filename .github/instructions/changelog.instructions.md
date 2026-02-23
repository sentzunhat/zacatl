---
applyTo: 'docs/changelog.md,package.json'
---

# Changelog and Version Update Instructions

When a task affects release/version metadata:

1. Determine whether the change is patch, minor, or major using `docs/skills/version-updates.md`.
2. If `package.json` version changes, ensure there is a matching top entry in `docs/changelog.md`.
3. Preserve the existing release notes style:
   - Keep newest version first.
   - Use emoji section headers.
   - Use clear, user-facing summaries.
4. Do not rewrite historical release entries unless explicitly requested.
