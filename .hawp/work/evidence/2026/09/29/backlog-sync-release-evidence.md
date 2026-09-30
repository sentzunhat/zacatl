# Backlog sync — release and closure evidence (2026-09-29)

Direct evidence gathered on 2026-09-29 to close finished items and record
releases. Commands were run from the repository root; outputs are quoted.

## Releases

| Release | Tag commit | GitHub Release | npm publish time (UTC) |
| ------- | ---------- | -------------- | ---------------------- |
| 0.0.60  | `9b0b2454` | `v0.0.60`, 2026-08-16T15:42:50Z | 2026-08-16T15:42:41Z |
| 0.0.61  | `dbc180fe` | `v0.0.61` (Latest), 2026-08-16T17:07:54Z | 2026-08-16T17:07:45Z |

Sources: `git rev-list -n1 v0.0.60` / `v0.0.61`, `gh release list --limit 4`,
`npm view @sentzunhat/zacatl time --json`.

## `0.0.60` — release candidate

Released: tag, GitHub Release and npm version above. `ec445250`
("docs: record 0.0.60 main release completion") is on `dev` and `main`.

## `5c2c9ef3` — DI layered child containers

Shipped in 0.0.60; absent from 0.0.59.

```
v0.0.59: layers.ts createChildContainer=0  service.ts=0
v0.0.60: layers.ts createChildContainer=4  service.ts=2
```

- `v0.0.60:src/dependency-injection/container.ts` exports `createChildContainer`.
- `v0.0.60:test/unit/service/service.test.ts:169` covers child-container isolation.
- `v0.0.60:docs/changelog.md:58` describes the layer child containers.
- Original commits `287f44a1`/`ad78a504` are not ancestors of the tag
  (landed via squash merge); the released source above is the evidence.

## `GH-NOTIFY-001` — notification noise

```
gh api repos/sentzunhat/zacatl --jq '{has_discussions,has_issues,has_wiki,has_projects}'
{"has_discussions":false,"has_issues":true,"has_projects":false,"has_wiki":false}
```

Drift prevention: the owner's repo-hardener policy (`default-policy.json`)
sets `"has_discussions": false`, commit `610e5d5`
("chore(hardener): disable discussions by default across repos").

## `RUNTIME-FIX-001` — kept open (in review)

PR #115 (`fix/optional-peers-and-fastify-double-send` → `dev`), commits
`c8e8d8ee` (fixes + tests) and `0ae6c6e1` (production audit fix). Local
validation: 670/670 tests, type check, lint, build, consumer smoke fixtures
pass; `npm audit --omit=dev` reports 0 vulnerabilities. Close after merge and
release.

## Housekeeping — plan files already closed on 2026-07-25

`75df2542` and `754afa86` were listed in Recently Closed (2026-07-25) but
their plan files were still in `active/`. Moved to `closed/2026/07/25/`
without content changes. `75df2542`'s `active/` file is the original
branching plan; the closure write-up already in `closed/2026/07/25/` is a
different document, so both are kept.
