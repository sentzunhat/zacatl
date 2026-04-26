# Framework domain pack (mirror only)

**Purpose:** Optional framework-specific standards kept for intake review.

**Visibility:** Mirror archive — not normative for general HAWP use.

## Use canonical instead

Portable rules live in the sibling canonical tree:

- `.hawp/kit/standards/service-design/` — boundaries, handlers, composition, testing, evidence-linked docs

Read those folders for day-to-day work unless you explicitly maintain a framework-specific standards pack.

## Standards in this mirror pack

- [service-boundaries.md](service-boundaries.md)
- [handler-responsibilities.md](handler-responsibilities.md)
- [dependency-registration.md](dependency-registration.md)
- [layered-composition.md](layered-composition.md)
- [contract-testing.md](contract-testing.md)
- [evidence-linked-documentation.md](evidence-linked-documentation.md)

## Extraction boundary

Promote only principle-level guidance that does not require a specific framework runtime.

Keep deferred until rewritten as abstraction-only standards:

1. Exact boot order
2. Framework wiring details
3. Internal DI implementation specifics
4. Runtime-specific helper APIs
5. Project-specific folder contracts and route inventories

## Private content (keep out of public standards)

1. Auth/provider/tenant assumptions
2. Security-sensitive runtime internals
3. Endpoint-level operational topology
4. Cross-service private contracts

## Review triggers

Review when:

- A framework version changes service patterns materially
- A pattern is reused successfully across multiple projects
- DI, handler, or middleware approaches change in your stack
