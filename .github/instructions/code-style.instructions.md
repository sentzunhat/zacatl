---
applyTo: "**/*.ts,**/*.tsx,**/*.js,**/*.mjs"
description: Apply the shared code style standard when writing or reviewing TypeScript/JavaScript code in this repo
---

# Code Style

Full standard: [.hawp/kit/standards/guidelines/code-style.md](../../.hawp/kit/standards/guidelines/code-style.md)

Key rules enforced in this repo:

- Prefer arrow functions for declarations and callbacks; class methods remain regular methods.
- Import groups in order: Node built-ins → external packages → internal modules. Alphabetical within groups.
- Named exports only — avoid default exports.
- Kebab-case file and folder names; `README.md` and `CHANGELOG.md` are exceptions.
- `strict: true` always on; `noImplicitAny`, `exactOptionalPropertyTypes`, `strictNullChecks`.
- No `any`; explicit return types on public functions and methods.
