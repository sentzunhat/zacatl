# Service Boundaries

## Principle

Services expose clear contracts and should not leak internal runtime details.

## Applies To

- API services
- Background workers
- Adapters
- Integration boundaries

## Guidance

- Define the contract before implementation details.
- Keep callers dependent on behavior, not internal structure.
- Document inputs, outputs, errors, and ownership.

## Does Not Include

- Boot order
- Framework wiring
- Internal DI mechanics
- Project-specific routes

## Related

- [README.md](README.md) — framework-domain mirror index
- [handler-responsibilities.md](handler-responsibilities.md) — Request orchestration
- [layered-composition.md](layered-composition.md) — Adapter boundaries
