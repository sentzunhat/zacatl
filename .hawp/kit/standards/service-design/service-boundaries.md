# Service Boundaries

## Principle

Services expose clear contracts and should not leak runtime internals.

## Applies To

- API services
- background workers
- adapters
- integration boundaries

## Guidance

- Define contracts before implementation details.
- Keep callers dependent on behavior, not structure.
- Document inputs, outputs, errors, and ownership.

## Does Not Include

- startup boot order
- framework wiring specifics
- DI internals
- project-specific route inventories

## Related

- [handler-responsibilities.md](handler-responsibilities.md)
- [layered-composition.md](layered-composition.md)
