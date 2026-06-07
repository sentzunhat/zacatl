# Standards mirror (`public/`)

## What this folder is

A **read-only archive** of upstream standards intake. It exists so promotions into the canonical kit can be reviewed with full history.

## What this folder is not

- Not the place to run install or update scripts
- Not the default place to cite rules in PRs or audits
- Not guaranteed free of historical internal names in lineage files

## What to use instead

| Need | Go here |
| ---- | ------- |
| Rules for your project | `../guidelines/`, `../nodejs/`, `../database/`, `../docs/`, `../patterns/`, `../service-design/` |
| Install/update safety | `../docs/hawp-install-update-safety.md` |
| New standards to absorb | `exports/hawp-absorbable/manifest.json` |

## Subfolders (plain names)

- **guidelines/**, **standards/nodejs/**, **standards/database/**, **standards/docs/** — mirror copies of shared guidance
- **standards/framework-domain/** — optional framework-specific pack (mirror only; prefer canonical `service-design/` for portable rules)
- **exports/hawp-absorbable/** — approved list for future promotions
- **exports/machine-readable/** — maintainer lineage maps (CSV/JSON); ignore for daily work
- **context/** — reserved for future public-safe context payloads (empty today)

## Downstream rule

After HAWP install, **start in canonical folders** at `.hawp/kit/standards/` (siblings of this `public/` tree). Skim `public/` only when tracing why a canonical file was promoted.
