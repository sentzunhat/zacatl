# Handler Responsibilities

## Principle

Handlers own boundary orchestration, while domain services own business decisions.

## Applies To

- HTTP or transport entrypoints
- Event consumers
- Job runners
- Boundary adapters

## Guidance

- Keep handlers focused on translation, validation, and response shaping.
- Delegate business logic to service/domain layers.
- Keep handler behavior testable via input-output contracts.

## Does Not Include

- Framework-specific handler classes
- Vendor-specific middleware chains
- Internal routing bootstraps
- Project route inventories

## Related

- [README.md](README.md) — framework-domain mirror index
- [service-boundaries.md](service-boundaries.md) — Contract clarity
- [layered-composition.md](layered-composition.md) — Layer boundaries
