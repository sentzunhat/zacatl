# Layered Composition

## Principle

Composition should preserve layer boundaries and enable adapter replacement without rewriting domain behavior.

## Applies To

- Application/domain/infrastructure composition
- Adapter wiring and replacement
- Service module boundaries
- Runtime portability decisions

## Guidance

- Keep domain logic independent from platform or transport details.
- Isolate framework and infrastructure concerns behind adapters.
- Prefer composition patterns that allow controlled replacement.

## Does Not Include

- Exact startup sequence requirements
- Framework-specific bootstraps
- Project folder contracts
- Runtime vendor lock-in assumptions

## Related

- [README.md](README.md) — framework-domain mirror index
- [service-boundaries.md](service-boundaries.md) — Contract clarity
- [handler-responsibilities.md](handler-responsibilities.md) — Boundary adapters
- [dependency-registration.md](dependency-registration.md) — Composition setup
