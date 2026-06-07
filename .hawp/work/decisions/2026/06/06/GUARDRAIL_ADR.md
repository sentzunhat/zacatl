# ADR: Review HAWP for Improvement Opportunities Without Expanding Scope

Date: 2026-04-26
Status: Proposed
Owner: Diego Beltran
Project: Human AI Workflow Protocol

## Context

HAWP exists to reduce AI drift by shaping work before execution and reporting truthfully after.
Its current core shape is intentionally small:

Input -> Context -> Mission -> Constraints -> Output

In practice, HAWP has also developed useful operating habits around checkpoints, bounded audits, status reports, uncertainty framing, and evidence-based reporting.

The main risk now is not that HAWP is too small.
The main risk is that, as it matures, it could become too broad: a schema system, runtime framework, validator, orchestrator, agent engine, or documentation bureaucracy.

This ADR defines how to review HAWP for improvements while preserving its core purpose.

## Decision

We will review HAWP as a lightweight authoring and workflow discipline, not as a runtime system.

Improvements should strengthen:

1. Clarity
2. Repeatability
3. Evidence quality
4. Handoff usefulness
5. Drift reduction
6. Adoption by other people and repos

Improvements should avoid:

1. Adding unnecessary fields
2. Turning HAWP into a framework
3. Requiring tooling to be useful
4. Making every task feel heavy
5. Over-formalizing simple work
6. Creating schema complexity for its own sake

## Current Strengths

HAWP already has strong foundations:

- The core shape is memorable and teachable.
- It focuses the work before execution.
- It separates mission, context, and constraints.
- It encourages bounded work instead of open-ended exploration.
- It supports truthful closeouts through status reports.
- It makes uncertainty and evidence easier to communicate.
- It works well across product audits, code reviews, launch checks, and AI-assisted workflows.

## Problems and Gaps to Review

### 1. Entry friction

HAWP may still feel too formal for small tasks.

Review question:

> Can someone use HAWP in 60 seconds for a small task?

Possible improvement:

Add usage tiers:

- Micro HAWP: 3-5 lines
- Standard HAWP: normal full shape
- Audit HAWP: evidence-heavy review mode
- Status HAWP: closeout/reporting mode

Example:

```md
## Micro HAWP

Input:
Context:
Mission:
Constraints:
Output:
```

### 2. Checkpoint clarity

Checkpoints are useful, but they may need clearer separation from the core shape.

Review question:

> Is checkpoint a field, a workflow step, or a report artifact?

Recommended direction:

Keep checkpoint as an optional workflow artifact, not a mandatory core field.

Possible language:

```md
Checkpoint is not part of the core HAWP shape. It is an optional continuity artifact used when a decision, status change, or strategic shift should be preserved.
```

### 3. Status report consistency

Status reports are one of HAWP's strongest practical uses, but they may benefit from stricter patterns.

Review question:

> Does every status report clearly separate evidence, inference, uncertainty, and next steps?

Possible improvement:

Standardize status reports around:

```md
# Status Report

## Mission

## What was reviewed

## Findings

### Proven

### Likely

### Unproven

### Risks

## Recommended next step

## Open questions
```

### 4. Evidence discipline

HAWP's value increases when it prevents confident but unsupported answers.

Review question:

> Does HAWP force the author to say what they actually know?

Possible improvement:

Add a simple evidence classification system:

```md
Evidence levels:

- Direct evidence: observed in code, docs, tests, logs, or user-provided material.
- Inference: reasonable conclusion from available evidence.
- Assumption: useful working belief not yet verified.
- Unknown: not enough evidence.
```

This could become one of HAWP's strongest differentiators.

### 5. Non-finding reporting

Audits often fail because they only report findings. HAWP can improve trust by reporting what was checked but not found.

Review question:

> Does the report say what was searched for and not found?

Possible improvement:

Add a small optional section:

```md
## Non-findings

The review did not find evidence of:

- ...
- ...
```

This is especially useful for launch audits, security checks, and repo reviews.

### 6. Scope control

HAWP should make it harder for AI or humans to drift into side quests.

Review question:

> Does each HAWP task define what is explicitly out of scope?

Possible improvement:

Strengthen the Constraints section with an optional sub-shape:

```md
## Constraints

Must:

- ...

Must not:

- ...

Out of scope:

- ...
```

### 7. Output quality

The Output field may need more guidance because output can mean a plan, patch, report, ADR, checklist, or recommendation.

Review question:

> Does the requested output format reduce ambiguity?

Possible improvement:

Add output types:

```md
Output type:

- Plan
- ADR
- Audit report
- Patch
- Checklist
- Status report
- Decision memo
- Implementation guide
```

### 8. Repo adoption

HAWP is portable, but adoption may improve if the repo has clear copy-this-first paths.

Review question:

> Can a new repo adopt HAWP in under 10 minutes?

Possible improvement:

Add a simple onboarding path:

```md
Start here:

1. Read INIT.md
2. Copy the Micro HAWP template
3. Run one bounded audit
4. Save one status report
5. Only add deeper patterns when needed
```

### 9. Avoiding schema growth

HAWP should not become more complex just because more use cases appear.

Review question:

> Is this improvement a pattern, template, or example instead of a required field?

Decision rule:

```md
New HAWP concepts should default to examples or optional templates before becoming protocol-level requirements.
```

## Improvement Principles

Any HAWP improvement should pass this test:

1. Does it reduce drift?
2. Does it improve handoff quality?
3. Does it make evidence clearer?
4. Does it preserve the small core shape?
5. Can someone ignore it for simple tasks?
6. Does it help humans, not just AI agents?

If the answer is no, the improvement should not be added.

## Proposed Review Plan

### Phase 1: Inventory

Review current HAWP files and identify:

- Core protocol files
- Usage guidance
- Status report templates
- ADR/template files
- GitHub/Copilot overlay files
- Example reports
- Any duplicated or outdated instructions

### Phase 2: Classify

Classify each HAWP concept as one of:

- Core
- Optional pattern
- Example
- Repo integration
- Deprecated or needs cleanup

### Phase 3: Simplify

Look for anything that can be:

- Shortened
- Merged
- Moved into examples
- Removed
- Renamed for clarity

### Phase 4: Strengthen

Add or improve only the pieces that increase practical value:

- Micro HAWP template
- Evidence classification
- Status report template
- Non-findings section
- Output type guidance
- Scope-control language
- Adoption quickstart

### Phase 5: Validate

Test HAWP against 3 real tasks:

1. A small coding task
2. A launch-truth audit
3. A status/reporting handoff

For each task, evaluate:

- Did HAWP reduce drift?
- Was the output clearer?
- Did it add too much overhead?
- Would another person understand the handoff?

## Recommended Changes

### Accept

- Add Micro HAWP template.
- Clarify checkpoint as optional artifact, not a core field.
- Strengthen status report template.
- Add evidence classification.
- Add non-findings section for audits.
- Add output type guidance.
- Add explicit out-of-scope guidance under Constraints.
- Add a quickstart adoption path.

### Reject

- Do not add more required core fields.
- Do not create a runtime validator.
- Do not turn HAWP into an agent framework.
- Do not require tooling for basic use.
- Do not make every task produce a full report.
- Do not make the protocol depend on GitHub, Copilot, VS Code, or any specific platform.

## Consequences

### Positive

- HAWP becomes easier to adopt.
- Reviews become more trustworthy.
- AI-assisted work becomes easier to bound.
- Status reports become more consistent.
- The protocol stays small while gaining practical depth.
- HAWP becomes easier to explain publicly.

### Negative and Tradeoffs

- More templates may create some maintenance burden.
- Too many examples could make the repo feel larger.
- Review discipline may still depend on user judgment.
- Some users may expect tooling even though HAWP is intentionally tool-independent.

## Final Decision Rule

HAWP should grow through optional patterns, examples, and review discipline, not through mandatory schema expansion.

The core protocol remains:

Input -> Context -> Mission -> Constraints -> Output

Everything else should support that shape without replacing it.
