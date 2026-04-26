# Database Standards (mirror)

**Purpose:** Mirror copy of database design guidance.

**Normative copy:** use `.hawp/kit/standards/database/` (canonical siblings outside `public/`).

## What belongs here

- Document database schema principles
- Embedding vs referencing strategies
- Naming, indexing, and migration patterns

## Standards in this mirror category

- MongoDB schema design (see also canonical `mongodb-schema-design.md`)

## Review triggers

- Performance or schema issues repeat across projects
- New database vendors or ORM choices
- Migration strategy changes

## Key concepts

1. **Embedding** — favor for one-to-few relationships
2. **Minimalism** — keep schemas concise
3. **Naming** — short property names
4. **Lifecycle** — embedded data shares parent lifecycle
5. **Cardinality** — references for high-cardinality data
