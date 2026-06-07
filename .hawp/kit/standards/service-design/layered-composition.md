# Layered Composition

## Principle

Composition preserves layer boundaries and enables adapter replacement without rewriting domain behavior.

## Applies To

- application/domain/infrastructure composition
- adapter wiring and replacement
- service module boundaries
- runtime portability decisions

## Guidance

- Keep domain logic independent from platform and transport details.
- Isolate framework and infrastructure concerns behind adapters.
- Prefer composition patterns that allow controlled replacement.

## Does Not Include

- exact startup sequence requirements
- framework bootstraps
- project folder contracts
- runtime vendor lock-in assumptions

## Related

- [service-boundaries.md](service-boundaries.md)
- [handler-responsibilities.md](handler-responsibilities.md)
- [dependency-composition.md](dependency-composition.md)
