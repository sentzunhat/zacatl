# ESLINT-010 — ESLint 10 Migration

**Status**: parked  
**Parked**: 2026-07-10  
**Type**: tooling upgrade

---

## What

Upgrade ESLint from `^9.x` to `^10.x`.

## Why parked

`eslint-plugin-import` declares peer dependency `eslint: '^2 || ... || ^9'` — it explicitly does not support ESLint 10. No ESLint 10–compatible release exists as of 2026-07-10.

`@typescript-eslint/eslint-plugin@latest` already declares `eslint: '^8.57.0 || ^9.0.0 || ^10.0.0'` so the TS-ESLint toolchain is ready, but `eslint-plugin-import` is the blocker.

## How to unpark

When `eslint-plugin-import` publishes a release with `eslint: '... || ^10'` in its peer dependencies, upgrade in this order:

1. `eslint` → `^10.x` in root `package.json`
2. `eslint-plugin-import` → whatever release adds ESLint 10 support
3. Run `npm run lint` and fix any breaking rule changes
4. Update `src/eslint/` config if any plugin APIs changed

## Related

- `src/eslint/` — ESLint flat config entrypoint
- Lock: `typescript` must stay `^6.0.3`; `@typescript-eslint/parser@8.x` peer breaks on TS 7
