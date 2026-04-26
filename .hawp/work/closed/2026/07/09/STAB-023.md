## STAB-023 — Unify the "exported abstract class" naming rule

Status: inbox
Scope: `src/eslint/naming-conventions.mjs`, `docs/guidelines/architecture.md`

### Direct evidence

`src/eslint/naming-conventions.mjs` currently signals "this exported class is
abstract, extend it" via **two unrelated mechanisms** instead of one:

1. A generic rule (lines ~82-88): exported abstract classes must be prefixed
   `Abstract` or `Base` — this is what `BaseRepository` (STAB-021) relies on.
2. A pile of one-off filtered exemptions that bypass rule 1 entirely for
   specific suffixes: `Handler$` (route handlers), and a hardcoded regex
   allowlist (`^(Service|Application|Infrastructure|Domain|CLI|Desktop|Server|PageModule|Provider)$`).

Both `GetRouteHandler` (suffix-based, no prefix) and `BaseRepository`
(prefix-based) are exported abstract classes meant to be extended by
consumers — the same semantic role — but they satisfy lint through two
completely different code paths. Every new role name that wants to skip the
`Abstract`/`Base` prefix needs its own filter carve-out added to the regex.
This is real rule sprawl, not a principled design — flagged directly by the
user while reviewing STAB-021's naming decision (2026-07-08): "if handlers
is allowed to be an abstract [without Base/Abstract] then repo too — it just
makes the rules a bit shaky."

### Goal

Collapse to a single coherent rule: an exported abstract class must satisfy
**one** of:

- end in an explicit, documented allowlist of role suffixes (`Handler`,
  `Repository`, `Adapter`, `Service`, `Provider`, etc. — the same list
  already scattered across the current filters), **or**
- start with `Abstract` or `Base`.

This is one rule with one allowlist, not a base rule plus a growing pile of
independent exemptions. Functionally this may not change which class names
pass lint today (both existing conventions are preserved as sub-cases), but
it makes the *rule itself* legible and prevents the next new role name from
needing another ad-hoc filter entry.

### Non-goals

- Do not rename any existing class (`GetRouteHandler`, `BaseRepository`,
  etc.) as part of this ticket — this is a lint-rule clarity change, not
  another naming migration.
- Do not touch handler names — STAB-021 already recorded the decision to
  leave handlers alone; this ticket only concerns the *rule structure*, not
  handler naming itself.

### Verification

- `npx eslint src` — zero new warnings/errors compared to before (the
  unified rule must be provably equivalent in coverage to the current
  scattered rules, just expressed as one allowlist).
- `docs/guidelines/architecture.md` documents the single rule once, instead
  of the reader having to infer it from two different filter blocks in
  `naming-conventions.mjs`.
