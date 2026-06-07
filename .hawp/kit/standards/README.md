# Standards

Portable engineering standards shipped with the HAWP kit.

## Two layers (simple rule)

| Folder | Name | Use it when |
| ------ | ---- | ----------- |
| **Canonical** | `guidelines/`, `nodejs/`, `database/`, `docs/`, `patterns/`, `service-design/` | You want rules to follow in real work |
| **Mirror** | `public/` | You need intake history or promotion lineage — not for day-to-day execution |

**Default:** read and cite files in the canonical folders only.

## Canonical standards (normative)

These folders are the source of truth for downstream projects:

- **guidelines/** — architecture, code style, docs, git, security, testing
- **nodejs/** — Node/TypeScript structure, areas, build/env
- **database/** — SQL, NoSQL, MongoDB schema design
- **docs/** — documentation process; [hawp-install-update-safety.md](docs/hawp-install-update-safety.md) for install/update safety
- **patterns/** — evidence discipline, non-findings, parallel-work guardrails
- **service-design/** — boundaries, handlers, composition, contract testing

Kit quick-links at `.hawp/kit/patterns/*.md` redirect here — edit canonical files only.

## public/ mirror (non-normative archive)

`public/` keeps a read-only snapshot used when absorbing or auditing standards promotions.

- Do **not** treat mirror files as install scripts or live policy.
- Do **not** copy private project names or internal repo paths from mirror content into your project docs.
- Machine-readable files under `public/exports/machine-readable/` are **lineage metadata** for maintainers, not user guides.

See [public/README.md](public/README.md).

## Approved absorbable export

New promotions into the canonical tree should be listed in:

`public/exports/hawp-absorbable/manifest.json`

The manifest is an **inclusion list for new absorbs**, not an inventory of every canonical file already promoted.

## Consolidation map (canonical files)

- `guidelines/architecture.md`, `code-style.md`, `documentation.md`, `git-workflow.md`, `security.md`, `testing.md`
- `nodejs/area-composition.md`, `build-and-env.md`, `code-style.md`, `git-workflow.md`, `project-structure.md`
- `database/sql.md`, `nosql.md`, `mongodb-schema-design.md`
- `docs/hawp-install-update-safety.md`
- `patterns/evidence-discipline.md`, `parallel-work-guardrails.md`, `non-findings.md`
- `service-design/service-boundaries.md`, `handler-responsibilities.md`, `dependency-composition.md`, `layered-composition.md`, `contract-testing.md`, `evidence-linked-documentation.md`

## Supporting indexes (non-normative)

- `database/README.md`, `docs/README.md`, `service-design/README.md`, `patterns/README.md`
- `.hawp/work/evidence/db-decision-template.md` — evidence template (in your project's work tree after install)

## Exclusion policy

Only **public-safe, portable** content belongs in the canonical standards tree.

- No employer-specific playbooks, client workflows, or private product roadmaps.
- No secrets, credentials, or environment-specific paths in standards text.
- Framework-specific packs stay in the mirror under `public/standards/framework-domain/` until abstracted into `service-design/` or `nodejs/`.

When unsure, keep content in `.hawp/work/` as a project-local plan until reviewed for promotion.

## Related

- [start-here.md](../start-here.md) — standards map for new users
- [references/install-update-safety.md](../references/install-update-safety.md) — principle summary (points to `docs/hawp-install-update-safety.md`)
- [reviews/publication-safety-guidelines.md](../reviews/publication-safety-guidelines.md)
