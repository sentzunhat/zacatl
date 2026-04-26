# Handler Responsibilities

## Principle

Handlers own boundary orchestration while domain services own business decisions.

## Applies To

- HTTP or transport entrypoints
- event consumers
- job runners
- boundary adapters

## Guidance

- Keep handlers focused on translation, validation, and response shaping.
- Delegate business logic to service or domain layers.
- Test handler behavior through input/output contracts.

## Does Not Include

- framework-specific handler classes
- vendor middleware chains
- internal routing bootstraps
- project route inventories

## Related

- [service-boundaries.md](service-boundaries.md)
- [layered-composition.md](layered-composition.md)
