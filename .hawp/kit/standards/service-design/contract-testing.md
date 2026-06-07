# Contract Testing

## Principle

Testing prioritizes observable contracts and behavior at service and boundary edges.

## Applies To

- handler and service boundaries
- adapter contracts
- dependency composition checks
- error and validation behavior

## Guidance

- Test behavior visible to callers, not internal implementation details.
- Validate boundary error mapping and input/output contracts.
- Include dependency composition tests when startup behavior matters.

## Does Not Include

- framework internals testing
- vendor parity assumptions
- project-specific endpoint snapshots
- internal runtime profiling conventions

## Related

- [service-boundaries.md](service-boundaries.md)
- [handler-responsibilities.md](handler-responsibilities.md)
- [dependency-composition.md](dependency-composition.md)
