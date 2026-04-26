---
applyTo: "**/*.ts"
description: TypeScript and Node.js tooling conventions for this project
---

# TypeScript Conventions

## Imports

- Use extensionless relative imports — tsconfig uses bundler resolution, `.js` extensions are wrong
- Prefix Node built-ins with `node:` (e.g. `import { join } from "node:path"`)

```ts
// correct
import { join } from "node:path";
import { findRepoRoot } from "../lib";

// wrong
import { join } from "path";
import { findRepoRoot } from "../lib.js";
```

## npm scripts

- Use `domain:action` naming (e.g. `workflow:validate`, `distribution:sync`)
- Run from repo root using `npm --prefix librarian run <script>` — never `cd librarian && npm run <script>`

## Script boundaries

Follow the three-file boundary pattern (`index.ts` / `cli.ts` / `script.ts`) for any user-facing command:

- `index.ts` — argv in, `process.exitCode` out, nothing else
- `cli.ts` — argument parsing and help text; no file I/O
- `script.ts` — logic returning structured results; no `process.argv`
