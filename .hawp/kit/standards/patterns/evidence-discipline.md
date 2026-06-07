# Evidence Discipline

Documentation should distinguish what is known from what is inferred.

This pattern is useful for all projects that maintain standards, audits, documentation, or verification artifacts.

## Principle

Documentation should stay linked to current, verifiable evidence and be clearly separated from future intent.

## Applies To

- Status and checkpoint summaries
- Planning and implementation notes
- Standards, boundaries, and architecture guidance
- Verification and audit-oriented artifacts

## Evidence Levels

### Direct Evidence

Observed directly in code, docs, tests, logs, screenshots, user-provided files, or explicit user instructions.

### Inference

A reasonable conclusion based on available evidence.

### Assumption

A useful working belief that has not been verified.

### Unknown

Something that cannot be claimed from available evidence.

## Rule

Do not present inference, assumption, or unknowns as direct evidence.

## Documentation Guidance

- State implemented and verifiable behavior as direct evidence.
- Label conclusions as inference when they are not directly observed.
- Label unverified working beliefs as assumptions.
- Call out unknowns instead of filling gaps with certainty.
- Keep planned follow-up work separate from current-state reporting.
- Link claims to concrete evidence artifacts whenever available.

## Does Not Include

- Framework-specific implementation assumptions
- Product or project roadmaps presented as current behavior
- Runtime claims that cannot be tied to direct evidence
- Internal-only details that are out of scope for the artifact

## Security Reminder

Do not present a security claim as proven unless it is supported by direct evidence.
