# HAWP v0.1 Specification

## Shape v0.1

The protocol carrier for v0.1 is locked to the following TypeScript shape.

```ts
export type Shape = {
  input: string;
  context: string;
  mission: string;
  checkpoint?: string;
  constraints: string;
  output: string;
};
```

Notes:

- Clarification is not a schema field.
- Clarification is a pipeline stage.
- The checkpoint field is optional and string-only in v0.1.

## Field Semantics

### input

The direct user or system request as received. This should preserve intent in plain language before interpretation.

### context

The minimal background needed to interpret the input correctly. This can include repository state, environment details, and prior decisions relevant to the current task.

Authoring guidance:

- Keep context minimal and source-oriented.
- Include only background that materially helps shape the task.
- Prefer stable facts, repository state, environment details, and prior decisions over transcript replay.
- Do not dump full conversation history when a compact summary will shape the work just as well.

### mission

A clear statement of what must be accomplished from this run. This is the concrete objective derived from input plus context.

Authoring guidance:

- State the target of the work clearly.
- Name the lens when the task is a review, audit, comparison, or plan.
- Make explicit what decision, output, or next action the work is meant to support.
- Keep the mission action-oriented and singular even when the input is broad.

### checkpoint

An optional short string used to capture a pause point, handoff marker, or progress anchor. In v0.1, this is not structured, has no policy engine behind it, and is not a memory store or persistence layer.

Checkpoint anti-patterns:

- not a running log
- not a memory store
- not an evidence archive
- not a state machine

### constraints

The hard boundaries and quality bars that must be respected while carrying out the mission. This includes scope limits, safety boundaries, and required deliverables.

Authoring guidance:

- Use constraints to set scope limits, evidence bar, anti-drift rules, and non-goals.
- State what must not happen as clearly as what must happen.
- When relevant, set expectations for proof, uncertainty handling, and overclaim avoidance.
- Keep constraints concrete enough that two different authors would shape the task similarly.

### output

The expected form of the response or artifact at completion. This defines what done looks like for the current run.

Authoring guidance:

- Define a decision-useful artifact, not just “an answer.”
- Specify the form of the deliverable in a way that supports action, review, or handoff.
- For analysis tasks, prefer outputs that surface findings, evidence, tradeoffs, owners, next actions, or open questions as appropriate.

## Evidence Discipline

HAWP does not add evidence fields in v0.1, but authors should still shape work so claims stay bounded.

- Separate direct evidence from inference in the resulting work.
- Bound claims to what was actually observed.
- Name uncertainty explicitly when something is not directly verified.
- Avoid overstating completeness, maturity, or confidence.
- Use constraints and output to enforce the required evidence bar when the task is review-heavy.

## Authoring Checks

Use these checks when filling the shape to reduce interpretation drift.

- input: preserves the original or normalized request in plain language.
- context: includes only background needed to execute the mission and avoids transcript dumping.
- mission: is action-oriented, focused on a single objective, and makes the task lens and supported decision clear when relevant.
- checkpoint: when present, stores only the minimum state needed to continue accurately, not a running log, memory dump, or evidence archive.
- constraints: are concrete guardrails that bound scope, quality, proof expectations, and non-goals.
- output: describes the expected result or decision-useful artifact shape clearly.

Boundary notes:

- context explains what is true around the task; constraints define what must or must not happen during execution.
- mission defines what to do; output defines what form done must take.

Common output patterns:

- review: prioritized findings with evidence, impact, and next action
- audit: observed drift, expected standard, evidence, and remediation recommendation
- plan: phased implementation plan with assumptions, dependencies, and open questions
- comparison: tradeoff summary with recommendation criteria and bounded conclusion
- handoff: concise continuation artifact with verified state, risks, and immediate next steps

## Pipeline Draft

This is the current draft usage flow for HAWP. It documents intended sequence, not a locked runtime implementation.
It is explanatory authoring guidance for how the shape may be used, not a required engine, validator, or orchestration design.
Stages are conceptual labels, not required software components.

1. read_input
2. clarify_if_needed
3. classify_task
4. retrieve_context
5. derive_mission
6. apply_constraints
7. choose_output
8. checkpoint_if_threshold_met
9. compile
10. execute

Stage intent (draft, plain-language):

- read_input: capture the request as given.
- clarify_if_needed: resolve ambiguity before committing to the workflow.
- classify_task: determine the task type and level of effort.
- retrieve_context: gather relevant facts needed for accurate execution.
- derive_mission: convert request plus context into a concrete objective.
- apply_constraints: bind the workflow to required limits and quality bars.
- choose_output: set the expected response or artifact format.
- checkpoint_if_threshold_met: optionally write a lightweight progress marker.
- compile: assemble an actionable response plan from the filled shape.
- execute: deliver the requested artifact or response.

Pipeline notes:

- clarify_if_needed runs in the pipeline and does not add a top-level field.
- checkpoint_if_threshold_met may set checkpoint, but trigger logic is not defined in v0.1.
- compile means preparing an actionable plan or response format from the filled shape, not introducing a compiler or runtime phase requirement.
- execute refers to producing the requested deliverable in a workflow sense, not to a protocol runtime.

## Explicit Non-Goals

The following are intentionally out of scope for v0.1:

- Checkpoint schema beyond optional string.
- Rules engine details.
- Runtime orchestration design.
- Persistence model.
- Memory or state model beyond checkpoint string.
- Scoring systems or numeric trigger systems.

## Design Principles

- Keep it lean.
- Do not overdesign early.
- Separate protocol shape from runtime policy.
- Separate clarification from schema.
- Separate durable fields from pipeline operations.
- Optimize for readability by humans and agents.

## Future Directions (Optional, Not v0.1)

- checkpoint policy evolution
- rules-engine triggers
- richer checkpoint structure
- machine-readable protocol representation
