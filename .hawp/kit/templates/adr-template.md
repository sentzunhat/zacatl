# Architecture Decision Record (ADR)

Use this template to capture architecture and design decisions in a HAWP-aligned, repo-agnostic way.

The goal is to record why a decision was made, what alternatives were considered, and what evidence supports the chosen direction.

## Decision ID

- ADR-XXX

## Title

A short, specific title for the decision.

## Status

- proposed
- accepted
- superseded
- deprecated
- rejected

## Date

- YYYY-MM-DD

## Owners

List the decision owners and reviewers.

## Context

Describe the situation that requires a decision.

Include:

- constraints that matter now
- boundaries that must be preserved
- what is known vs what is still uncertain

## Problem Statement

State the exact decision question in one to three sentences.

## Decision Drivers

List the criteria used to evaluate options.

Examples:

- safety and boundary integrity
- maintainability and clarity
- portability and reuse
- implementation risk
- validation cost

## Options Considered

Document each serious option, including a do-nothing option when relevant.

### Option A — [name]

Summary:

Pros:

-

Cons:

-

### Option B — [name]

Summary:

Pros:

-

Cons:

-

### Option C — [name]

Summary:

Pros:

-

Cons:

-

## Decision

State the selected option and what is approved.

## Rationale

Explain why the selected option is preferred over others.

Separate direct evidence from inference.

### Direct Evidence

-

### Inference

-

### Assumptions

-

## Scope and Boundaries

What is in scope for this decision:

-

What is explicitly out of scope:

-

Paths and areas explicitly forbidden in this decision scope:

-

## Consequences

Expected positive consequences:

-

Expected trade-offs or costs:

-

Risks introduced and mitigation approach:

-

## Implementation Notes

Capture only high-level implementation intent needed for traceability.

Do not place runtime-specific, provider-specific, or framework-specific instructions here.

## Verification Plan

How this decision will be validated.

Automated checks:

-

Manual checks:

-

Evidence artifacts to capture:

-

## Related Artifacts

Related planning, status, and decision records under work:

- .hawp/work/active/
- .hawp/work/closed/
- .hawp/work/status/
- .hawp/work/decisions/
- .hawp/work/evidence/

Related reusable guidance under kit:

- .hawp/kit/references/
- .hawp/kit/patterns/
- .hawp/kit/templates/

## Change Control

If this ADR is superseded or updated:

- keep this record immutable except for status updates
- create a new ADR and link both records
- summarize the reason for change and boundary impact

## Supersedes / Superseded By

- Supersedes: [ADR-XXX] or none
- Superseded by: [ADR-XXX] or none
