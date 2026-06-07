# Contract Testing

## Principle

Testing should prioritize observable contracts and behavior at service and boundary edges.

## Applies To

- Handler and service boundaries
- Adapter contracts
- Dependency composition checks
- Error and validation behavior

## Guidance

- Test behavior visible to callers, not internal implementation details.
- Validate boundary error mapping and input/output contracts.
- Include dependency composition tests where startup behavior matters.

## Does Not Include

- Framework internals testing
- Vendor implementation parity assumptions
- Project-specific endpoint snapshots
- Internal runtime profiling conventions

## Related

- [README.md](README.md) — framework-domain mirror index
- [service-boundaries.md](service-boundaries.md) — Contract definition
- [handler-responsibilities.md](handler-responsibilities.md) — Boundary testing
- [dependency-registration.md](dependency-registration.md) — Composition validation
