# Start Here

A minimal guide for working on this repository.

## 1) Prerequisites

- Node.js 24.14.0+
- npm 11+

Optional (recommended): use the Node version from `.nvmrc`.

## 2) First-Time Setup

```bash
npm run setup:dev
```

This installs dependencies, checks peers, and regenerates barrel exports.

## 3) Daily Workflow

```bash
npm run type:check
npm run lint
npm test
npm run build
```

Use the smallest relevant command first while iterating:

- Types only: `npm run type:check`
- Lint only: `npm run lint`
- Tests only: `npm test`

## 4) Project Shape (high level)

- `src/` — framework source code
- `test/` — unit tests
- `docs/` — architecture, module docs, and standards
- `scripts/` — build/dev/publish utilities
- `examples/` — reference apps

## 5) Read These Docs First

- `README.md`
- `docs/README.md`
- `docs/guidelines/framework-overview.md`
- `docs/guidelines/code-style.md`
- `docs/guidelines/documentation.md`
- `CONTRIBUTING.md`

## 6) Useful Commands

```bash
npm run build:watch
npm run test:watch
npm run clean:build
npm run check:peers
```

## 7) Before Opening a PR

Run:

```bash
npm run type:check && npm run lint && npm test && npm run build
```

If your change affects release metadata, keep `package.json` version and `docs/changelog.md` aligned.
