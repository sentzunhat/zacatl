# Define Domain client boundaries for entry points

**UUID:** `4c4365a1-8a3e-4c94-b370-b04bc68a57d5`
**Type:** improvement
**Reported:** 2026-10-19

## Input (verbatim)

> Domain has providers and clients: clients connect the application's entry points to providers or are called from those entry points.

## Intake summary

Define whether a separate Domain client concept improves the existing
Application → Domain contract, and identify the smallest public API or example
that would express it. This is future architecture work, not a PR #138 fix.

## Initial analysis

**Directly verified:** `DomainConfig` currently exposes `providers` and
`services`. No dedicated Domain `clients/` registration was found in the
inspected `src/service/layers/domain/` tree. REST entry points already resolve
configured handlers through the Application scope.

**Inferred:** a client could give applications a reusable way to connect entry
points to business providers. The boundary, name and lifecycle remain open.

**Likely scope:** `src/service/layers/domain/`,
`src/service/layers/application/`, public config types, one small consumer
example, and `docs/service/architecture.md`.

**Risk:** medium; a new public registration type can constrain future API
design. **Gate:** compare at least two consumer shapes and review before code.

## Plan

1. Map current handler → Domain provider/service flows and identify the
   specific duplication or dependency problem a client would solve.
2. Compare a plain consumer-owned class with a Domain client port/adapter and
   a `DomainConfig.clients` registration; keep provider business logic separate.
3. Choose the smallest design justified by examples, with explicit scope and
   dependency direction. Coordinate with composition item `19965b11`.
4. If a framework API is justified, implement it in a separate small PR with
   type/runtime coverage and docs; otherwise publish a usage pattern only.

## Acceptance

- The Domain client role and dependency direction are unambiguous.
- Current consumers keep working; new API claims are backed by examples.
- The design remains outside the current `0.0.65` development PR and release
  gate unless a concrete blocker is demonstrated.

**Status:** plan-ready for design review; implementation is deferred.
