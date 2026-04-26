# Guardrail ADR

## Purpose

This is the stable onboarding reference for HAWP improvement work. It preserves the decision that HAWP should grow through optional patterns, examples, and workflow discipline—not mandatory schema expansion.

## Decision

Treat HAWP as a lightweight authoring and workflow discipline, not as a runtime system, validator, orchestrator, agent framework, or documentation platform.

Improvements should strengthen clarity, repeatability, evidence quality, handoff usefulness, drift reduction, and adoption. They should avoid unnecessary fields, required tooling, heavy process for simple work, and complexity for its own sake.

## Guardrails

- Keep the core shape small.
- Make new concepts optional patterns, templates, or examples first.
- Do not require tooling for basic HAWP use.
- Do not turn HAWP into a runtime, framework, or agent engine.
- Preserve usefulness for small tasks.
- Prefer evidence-backed reporting and explicit uncertainty.

## Decision Rule

Before adding an improvement, ask:

1. Does it reduce drift?
2. Does it improve handoff quality?
3. Does it make evidence clearer?
4. Does it preserve the small core shape?
5. Can someone ignore it for simple tasks?
6. Does it help humans, not only AI agents?

Reject the improvement when these answers do not support the change.

## Historical Record

The original dated decision record remains in the repository work history. This stable file is the canonical onboarding reference so guides do not depend on date-based work paths.
