# NoSQL Schema Standards

These standards apply when modeling data for document databases or when planning a future migration away from SQL.

## Principles

- Model the document around the primary read path.
- Embed data only when the child data is owned by the parent and updated together.
- Reference data when it is shared, large, or independently queried.
- Keep the design opinionated and simple enough to explain in one pass.

## Naming

- Use explicit, lower_snake_case field names where practical.
- Keep collection names plural and descriptive.
- Match SQL reference naming only where it improves cross-model clarity.
- Use flattened names for embedded fields when the path needs to stay stable.

## Document Shape

- Include a stable identifier for each top-level document.
- Store timestamps consistently across collections.
- Avoid deep nesting unless the access pattern clearly benefits from it.
- Prefer one obvious owner for each embedded object.

## References

- Use references for shared entities and high-cardinality relationships.
- Use embedding for owned subdocuments that are always read with the parent.
- Record the reason for the choice when the boundary is not obvious.

## MongoDB Equivalence

- Treat this document as the canonical MongoDB-oriented companion to the SQL guide.
- Write down how SQL entities flatten into document fields.
- Capture any collection rename or nesting change that would affect migration.
- Note compatibility concerns when multiple SQL tables map to one document shape.

## Validation Checklist

- [ ] The document model matches the read path.
- [ ] Embedded versus referenced data is explicit.
- [ ] Field names are stable and clear.
- [ ] Timestamps are handled consistently.
- [ ] SQL equivalence is documented when relevant.
- [ ] The design choice is captured in evidence.
