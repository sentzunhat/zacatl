# Dependency Composition

## Principle

Dependency composition should be explicit, deterministic, and verifiable.

## Applies To

- service startup composition
- shared infrastructure components
- adapter registration
- integration boundaries

## Guidance

- Define registration ownership and lifecycle expectations.
- Validate composition graphs during startup or integration checks.
- Keep composition strategy stable and documented.

## Does Not Include

- container implementation internals
- framework helper specifics
- runtime-specific registration APIs
- project-specific token maps

## Related

- [layered-composition.md](layered-composition.md)
- [contract-testing.md](contract-testing.md)
