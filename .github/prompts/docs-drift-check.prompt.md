---
name: 'docs-drift-check'
description: 'Audit and fix docs drift against current source exports and runtime behavior'
argument-hint: 'scope=<README|docs/service|docs/third-party|docs/all>'
agent: 'agent'
tools: ['search', 'changes', 'edit']
---

Run a bounded documentation drift audit and apply doc-only fixes.

## Inputs

- Scope: `${input:scope:docs/service}`
- Workspace: `${workspaceFolderBasename}`
- Current file context (if any): `${file}`
- Selected context (if any): `${selection}`

## Requirements

1. Treat `src/` as source of truth for imports, symbols, and runtime behavior.
2. Inspect the requested scope in docs plus matching implementation paths in `src/`.
3. Confirm drift with exact file/line evidence before editing.
4. Apply only documentation edits needed to align claims with implementation.
5. Do not modify code.
6. Do not rewrite historical changelog entries unless explicitly requested.

## Output

- Apply doc edits directly.
- Return a compact report with:
  - Scope checked
  - Confirmed drift fixed
  - Remaining possible drift (if any)
  - Recommended follow-up checks
