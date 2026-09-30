---
applyTo: "**/*.ts"
description: TypeScript and Node.js conventions for source files
---

# TypeScript Conventions

Follow the repository's TypeScript configuration and existing conventions.
Use the canonical [Node.js code-style guide](../standards/nodejs/code-style.md)
for naming, formatting, imports, and exports.

## Imports and module resolution

- Prefix Node.js built-ins with `node:` (for example,
  `import { join } from "node:path"`).
- Follow `tsconfig.json` for relative import extensions. With bundler-style
  resolution, use the project's established extensionless form; with Node ESM,
  use the extension required by its runtime and compiler settings.
- Do not copy import syntax from a different module configuration without
  checking the local compiler and runtime.

## Scripts and command boundaries

- Prefer descriptive `domain:action` npm script names when the repository uses
  npm scripts (for example, `workflow:validate`). Follow existing project
  naming when it differs.
- Run scripts from the repository root unless their documentation says
  otherwise; avoid hidden `cd` behavior in package scripts.
- For a user-facing CLI with meaningful parsing or behavior, separate argument
  parsing from the command logic and keep the entrypoint small. A three-file
  split such as `index.ts`, `cli.ts`, and `script.ts` is an option when it
  clarifies those boundaries, not a requirement for every short script.
