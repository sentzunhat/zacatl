# Database Standards

Opinionated database guidance for this repository lives here.

This folder is the canonical home for database modeling decisions, migration notes, and cross-database mapping guidance used by the HAWP kit.

## Files

| File                                                 | Purpose                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [sql.md](sql.md)                                     | SQL and SQLite schema standards, naming rules, migration rules, and validation checks       |
| [nosql.md](nosql.md)                                 | NoSQL and document-model guidance, including MongoDB equivalence and embedding rules        |
| [mongodb-schema-design.md](mongodb-schema-design.md) | Absorbed public MongoDB schema design best practices (see nosql.md for repo-specific rules) |

## How to Use

- Read the SQL guide for current relational schema planning.
- Read the NoSQL guide when reviewing shared standards or planning a document-model equivalent.
- For detailed MongoDB best practices, see the absorbed public guidance in `mongodb-schema-design.md`.
- Keep repo-specific choices opinionated but small enough to review and maintain.
- Capture implementation decisions with the evidence template under `.hawp/work/evidence/`.
