# START_HERE

This is the fastest place to start with HAWP. Copy the template below, fill it in, and hand it to an AI agent. Keep it simple. Do not add fields.

---

## Minimal Template

```text
input: |
  <the request as received>

context: |
  <minimal background needed to interpret the input>

mission: |
  <one concrete objective derived from input + context>

checkpoint: |
  <optional pause point or handoff marker>

constraints: |
  <scope limits, required quality bars, and non-goals>

output: |
  <what done looks like — the expected artifact or response form>
```

`checkpoint` is optional. Add it only when you need a handoff marker or pause point.

---

## Usage Notes

- **context** — minimal but sufficient. Stable facts only. No transcript dumps.
- **mission** — one concrete objective. Name the lens (review, audit, plan, handoff).
- **constraints** — state what must not happen as clearly as what must.
- **output** — describe the artifact form, not just "an answer."
- **checkpoint** — omit unless you need a handoff or pause anchor.

---

## Good First Uses

- repo review
- implementation plan
- handoff / status report
- gap analysis
- standards drift audit

---

## Evidence Discipline Quick Tips

- Separate directly observed facts from inference in your findings.
- Use `within inspected scope` or `no evidence found in inspected material` when claiming absence.
- Only call a standard mismatch when supported by docs, ADRs, contracts, or strong repeated conventions.
- Label confidence: `Confirmed`, `Likely`, or `Unclear`. Match to the weakest part of the claim.

---

## Boundary Reminder

HAWP is a **shaping protocol**, not a runtime. Better results come from stronger authoring, not more fields. The shape is locked to v0.1; quality improvements are achieved through guidance and examples.

## Optional Resources

- Templates: [templates/micro-hawp.md](templates/micro-hawp.md), [templates/standard-hawp.md](templates/standard-hawp.md), [templates/status-report.md](templates/status-report.md), [templates/audit-report.md](templates/audit-report.md)
- Patterns: [patterns/evidence-discipline.md](patterns/evidence-discipline.md), [patterns/non-findings.md](patterns/non-findings.md)
- Review checklist: [reviews/project-review-checklist.md](reviews/project-review-checklist.md)
- Guardrail ADR: [usage/GUARDRAIL_ADR.md](usage/GUARDRAIL_ADR.md)

Templates and patterns are optional usage aids. They do not expand the HAWP core protocol.

---

### Notes for Clarity

- **Formatting**: The template is enclosed in triple backticks for code-block rendering.
- **Consistency**: All fields use the same structure (`field: |`).
- **Grammar**: Minor adjustments for clarity (e.g., "achieved through" instead of "handled through").
- **Readability**: Line breaks and spacing improve scanning for users.
