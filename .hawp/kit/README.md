# HAWP (Human-AI Workflow Protocol)

## What HAWP is

HAWP is a minimal protocol shape for reliable collaboration between humans and AI agents.
It provides a small, durable carrier for intent and task framing.
It is a lean shaping protocol for turning vague work into bounded, portable task packages.

## Why it exists

Work drifts when requests mix goals, constraints, context, and expected outputs in inconsistent ways.
HAWP reduces drift by separating these concerns into explicit fields and using a simple draft usage flow.

That same shape is sufficient for many serious task types when authored well, including:

- bounded repo review
- standards drift audit
- architecture or design review
- implementation planning
- gap analysis
- decision-support work
- handoff and task packaging

## v0.1 shape

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

In v0.1, clarification is a pipeline stage, not a top-level schema field.

## What HAWP is good for

HAWP is a good fit when the work benefits from explicit framing before execution.
It is especially useful when the task needs bounded scope, portable context, and a clear done shape.

Typical good fits:

- review work that needs a defined lens and output
- audits that must separate expectation, evidence, and open uncertainty
- plans that need bounded scope, assumptions, and deliverables
- decision-support tasks that should produce a decision-useful artifact rather than an unstructured answer
- handoffs that need to preserve intent and current state without replaying full history

The main improvement path for HAWP is stronger authoring guidance and examples, not schema growth.

Recent HAWP quality improvements — including tighter evidence discipline, confidence framing, category mapping, split-finding rules, and non-finding guidance — are intentionally handled through authoring guidance, examples, and reporting discipline. Schema growth is reserved for recurring shape weaknesses that cannot be solved at the authoring level.

## What HAWP is not

HAWP is not a runtime engine, memory system, validator, orchestration framework, persistence model, or scoring system.
It does not define how work must be executed.
It defines a compact carrier for shaping work so execution is less likely to drift.

## Practical posture

HAWP is intentionally:

- lean
- portable across chat, editor, and agent contexts
- readable by humans and models
- non-runtime in scope
- suitable for practical analysis and reporting without becoming a framework

## Repo layout

- start-here.md: fastest on-ramp — copy-paste template and first-use notes.
- references/spec.md: v0.1 semantics, pipeline draft, principles, and non-goals.
- types/shape.ts: locked TypeScript shape for v0.1.
- references/authoring-patterns.md: compact guidance for recurring task types using the five required fields and optional checkpoint.
- templates/: optional starter templates for micro tasks, standard shaping, intake/bug planning, status reports, and audits.
- references/: core spec, authoring guidance, and canonical policy references for recurring operational passes (for example backlog alignment and docs alignment).
- patterns/: quick-links to standards/patterns/ (edit canonical standards copy only).
- standards/: portable engineering standards; canonical folders are normative, standards/public/ is a read-only mirror.
- reviews/: optional review artifacts for HAWP maintenance and scope checks.
- examples/: concrete examples of applying the shape to real requests.
- usage/: reusable workflow guides (`init.md`, `intake-workflow.md`, `status-report.md`) that downstream installs can copy and adopt.
- scripts/: utility scripts for workflow validation and maintenance (e.g., `validate-hawp-workflow.py` for checking backlog consistency and closed task completeness).
- reviews/project-review-checklist.md: review checklist for improving HAWP without expanding core scope.
- reviews/public-safety-checklist.md and reviews/publication-safety-guidelines.md: publication-safety guidance for keeping the public core generic and privacy-safe.

Templates and patterns are optional usage aids. They do not expand the HAWP core protocol.
Examples in the public core should stay fictional or clearly generic so the protocol remains reusable across projects.
Repo-local backlog, ADRs, status reports, and evidence live in `../work/` and are not part of the install kit.

## Current status and non-goals

Status: foundation pass for v0.1.
The shape is the durable v0.1 contract, while the pipeline is draft guidance documented in references/spec.md rather than a runtime commitment.
HAWP v0.1 does not define or imply a runtime engine, compiler, validator, or persistence layer.
Non-goals: no rules engine, no checkpoint schema, no runtime orchestration framework, and no persistence or scoring model yet.

## Improving audit quality

HAWP audit quality is improved through authoring guidance and examples, not schema changes.

`references/authoring-patterns.md` contains the authoritative guidance for evidence discipline, audit taxonomy,
confidence labeling, standard proof requirements, non-finding format, anti-overreach boundaries,
and the closing operational sequence.

`examples/bounded-truthful-standards-audit.md` is the canonical reference example and demonstrates
all required audit constraints in one coherent output.
