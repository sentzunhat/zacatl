## Status Report

### Intent

Review the HAWP project for improvements based on the proposed ADR, identify where optional starter templates and evidence/reporting patterns should be added, and provide a bounded implementation plan that preserves the core shape and guardrails.

### Current State

HAWP has a clear lean core, strong authoring guidance, examples, and repo-local usage docs. It does not yet have dedicated optional starter templates, standalone evidence/non-findings pattern files, or a dedicated project review checklist artifact path.

### What Was Inspected

- Repository root docs and layout
- core/.hawp protocol docs and examples
- core/.hawp usage guidance and guardrail ADR
- .github Copilot/overlay instruction files

Files reviewed:

- README.md
- core/.hawp/README.md
- core/.hawp/START_HERE.md
- core/.hawp/SPEC.md
- core/.hawp/AUTHORING_PATTERNS.md
- core/.hawp/usage/INIT.md
- core/.hawp/usage/STATUS_REPORT.md
- core/.hawp/usage/GUARDRAIL_ADR.md
- .github/copilot-instructions.md
- .github/instructions/human-ai-workflow-protocol-intake.instructions.md

### What Changed

Read-only sweep only. No protocol or documentation files were modified during this phase.

### What Was Directly Verified

- The current HAWP core is documented as lean and non-runtime.
- The v0.1 shape is stable and documented in multiple files.
- Existing directories: examples, usage, types.
- Missing directories/files for this ADR scope: templates, patterns, reviews.
- Evidence discipline and non-finding guidance currently exist inside AUTHORING_PATTERNS.md but not as standalone quick-copy pattern docs.

Current structure (relevant):

- core/.hawp/
  - README.md
  - START_HERE.md
  - SPEC.md
  - AUTHORING_PATTERNS.md
  - examples/
  - usage/
    - INIT.md
    - STATUS_REPORT.md
    - GUARDRAIL_ADR.md
    - status/

Recommended new files:

- core/.hawp/templates/micro-hawp.md
- core/.hawp/templates/standard-hawp.md
- core/.hawp/templates/status-report.md
- core/.hawp/templates/audit-report.md
- core/.hawp/patterns/evidence-discipline.md
- core/.hawp/patterns/non-findings.md
- core/.hawp/reviews/project-review-checklist.md

Recommended edits:

- README.md: add minimal navigation note for optional templates/patterns.
- core/.hawp/README.md: add templates/patterns/reviews to repo layout and mark optionality.
- core/.hawp/START_HERE.md: add links to optional templates/patterns/review checklist and guardrail.
- core/.hawp/usage/INIT.md: add explicit note that templates/patterns are optional aids and do not expand required core shape.

Risks of scope creep:

- Treating optional templates as required schema.
- Contradicting current v0.1 shape wording by introducing new required fields.
- Duplicating existing guidance too heavily between AUTHORING_PATTERNS.md and new pattern files.
- Spreading process language that implies runtime tooling/validation.

Exact implementation plan:

1. Add templates, patterns, and review directories/files with compact content.
2. Keep templates explicitly optional and copy-first.
3. Reference evidence levels and non-findings discipline without changing schema.
4. Apply only minimal navigation updates in four agreed docs.
5. Avoid changes to protocol type/spec fields and avoid tooling additions.

Files that should not be touched:

- core/.hawp/types/shape.ts
- core/.hawp/SPEC.md
- core/.hawp/examples/\*
- benchmark/\*
- core/install.md
- core/update.md
- .github/prompts/\*

### What Remains Unproven

- Whether every new template label and wording is optimal for first-time adopters until tested with real workflows.
- Whether additional templates (for example decision memo or scope control) are needed now versus later.

### Constraints

- Do not change the core protocol shape.
- Do not add runtime tooling or validators.
- Keep additions compact and optional.
- Avoid unrelated file changes.

### Out of Scope

- LICENSE
- core/.hawp/LICENSE
- Any pre-existing untracked GUARDRAIL_ADR.md outside the intended HAWP usage path

### Help Wanted

Confirm accepted scope for implementation. Current accepted set assumed:

- Add 7 new files listed above.
- Update only README.md, core/.hawp/README.md, core/.hawp/START_HERE.md, core/.hawp/usage/INIT.md.

### Suggested Next Step

Implement only the accepted documentation additions and minimal navigation updates, then run a quick changed-file verification pass.
