# Dependency Registration

## Principle

Dependency registration should be explicit, deterministic, and verifiable.

## Applies To

- Service startup composition
- Shared infrastructure components
- Adapter registration
- Integration boundaries

## Guidance

- Use clear registration ownership and lifecycle expectations.
- Validate registration graphs with startup or integration checks.
- Keep registration strategy stable and documented.

## Does Not Include

- Internal DI container mechanics
- Specific decorators or framework helpers
- Runtime-specific registration APIs
- Project-specific token maps

## Related

- [README.md](README.md) — framework-domain mirror index
- [layered-composition.md](layered-composition.md) — Composition patterns
- [contract-testing.md](contract-testing.md) — Testing registration
