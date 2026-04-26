# HAWP Authoring Patterns

This guide shows how to use the same six HAWP fields for recurring task types.
It does not redefine the protocol.
It gives compact authoring patterns that improve consistency without expanding schema.

## Review Tasks

Use review tasks when the goal is to inspect a bounded target through a defined lens and surface decision-useful findings.

- mission: name the review target, review lens, and what decision or prioritization the review should support
- constraints: set scope limits, evidence bar, anti-drift rules, and what kinds of findings should be excluded
- output: ask for a prioritized review artifact, not a generic summary; cap the *detailed* findings but keep an uncapped minor/deferred one-liner list, include a compact positive-confirmation element, and require an explicit surface sweep of the scoped units so coverage and balance are not lost (see Coverage and Balance)

## Audit Tasks

Use audit tasks when the work compares observed reality against an explicit standard, baseline, or expectation.

- mission: name the audited target and the standard or baseline it should be checked against
- constraints: require separation of direct observation from inference, name the proof basis for any standards claim, and keep the audit bounded to the stated scope
- output: ask for drift-oriented results such as category, confidence, directly observed evidence, inference or uncertainty, significance, and a bounded action sequence; tier the findings (capped detailed findings plus an uncapped minor/deferred list), confirm the areas verified sound, and require an explicit surface sweep of the scoped units so the report stays both complete and balanced (see Coverage and Balance)

## Planning Tasks

Use planning tasks when the goal is to convert a broad request into a bounded implementation path.

- mission: define the planning target, the supported outcome, and the intended planning horizon or scope
- constraints: state non-goals, assumptions, dependencies, realism limits, and anti-redesign boundaries
- output: ask for a phased or sequenced plan with risks, dependencies, and next steps

## Comparison Tasks

Use comparison tasks when the work must evaluate options against explicit criteria.

- mission: name the compared options and the decision the comparison should support
- constraints: require bounded criteria, avoid invented certainty, and prevent premature recommendation when evidence is thin
- output: ask for tradeoffs, criteria-by-criteria comparison, and a bounded recommendation or no-decision result

## Handoff And Task Packaging

Use handoff and task-packaging patterns when the goal is to preserve intent and working state for another human or agent without replaying full history.

- mission: focus on continuity, current state, and immediate next action
- constraints: include only verified facts, keep it concise, and list open questions explicitly
- output: ask for a portable handoff artifact with intent, current state, risks, and next steps

## Evidence Discipline Rule

Every substantive finding in an audit or review must distinguish between what was directly observed and what is inferred.

**Directly observed** — something confirmed by reading the file, running a check, or finding an explicit document.

**Inference / uncertainty** — something suggested by structural patterns, naming, or incomplete evidence.

Rules:

- If a claim depends on interpreting intent, incomplete migration state, or structural pattern alone, label it as inference.
- Do not present interpretation as fact.
- Do not collapse distinct facts into one claim. These are separate states and must each be described separately unless explicitly verified:
  - present on disk
  - not ignored by tooling
  - tracked by git
  - enforced in CI
  - documented in inspected scope
- When claiming absence, use bounded wording such as within inspected scope, no evidence found in inspected files, or not confirmed from inspected material.
- Do not present pattern divergence as a hard violation unless backed by explicit repo standards, ADRs, documented conventions, or tooling contracts.
- When evidence is missing, name that gap explicitly rather than filling it with confident-sounding language.

## Standard Proof Rule

Call something a standard violation only when the violated standard is supported by at least one of the following:

- an ADR
- explicit repo documentation
- a tooling contract
- a strong repeated repo convention that is clearly intentional

If that basis is not proven, use softer language:

- pattern divergence
- boundary inconsistency
- likely incomplete transition
- unclear if intentional
- inconsistent with observed convention

## Audit Finding Categories

When producing bounded repo audits or standards reviews, use only these four categories. This keeps findings decision-useful and prevents scope from creeping into architecture commentary.

- **Truth-risk drift** — something that makes repo state, docs, or runtime signals misleading. Affects anyone trying to interpret what the system is or does.
- **Validation drift** — missing, insufficient, or broken proof. Test coverage gaps, unverified claims, missing checks on critical paths.
- **Maintainability drift** — clutter, ambiguity, naming inconsistency, or cleanup burden that increases future friction without a clear benefit.
- **Standard mismatch** — divergence from a documented standard, explicit repo convention, ADR decision, or tooling contract.

Rules:

- Do not invent extra category names for bounded repo audits.
- Use this mapping to guide category selection:
  - hygiene and clutter issues → usually **maintainability drift**
  - mutable committed runtime state or signals that make repo truth misleading → usually **truth-risk drift**
  - missing or failing checks, unverified claims, or weak proof → usually **validation drift**
  - divergence from explicit docs, ADRs, or strong repeated repo conventions → usually **standard mismatch**
- If a finding fits more than one category, pick the most decision-relevant one and explain the framing if needed.
- If a concern does not fit any category cleanly, say so and explain why rather than stretching the taxonomy.
- If a concern does not fit any category and cannot be framed clearly, it is likely out of scope for a bounded audit.

## Confidence Framing

Each finding in a review or audit should carry a confidence signal. Use plain language rather than invented metrics.

- **Confirmed** — directly proven by inspected code, docs, commands, config, or runtime evidence.
- **Likely** — supported by evidence, but still interpretive or partially dependent on missing scope.
- **Unclear** — plausible concern, but intent, significance, or standard basis is not proven.

Rules:

- Confidence must match the weakest part of the claim, not the strongest supporting detail.
- Do not omit confidence when the finding is uncertain. Unclear is a valid and honest answer.
- If one part of a claim is observed but the conclusion still depends on unproven intent or missing scope, do not label the whole finding Confirmed.

## Non-Finding Guidance

Bounded audits may include non-findings when they materially improve trust in the report.

Useful non-findings include:

- resolved non-findings
- confirmed intentional exceptions
- verified enforcement already in place

Format: each non-finding entry should include:

- **Initially appeared as** — what the concern looked like before investigation
- **What was checked** — the specific scope or files inspected
- **What was observed** — the evidence that resolved the concern
- **Confidence** — Confirmed or Likely
- **Conclusion** — a one-sentence closure statement

Rules:

- Use non-findings to show that an expected concern was checked and did not hold.
- Keep them compact. They should improve trust, not overwhelm the report.
- Do not write non-findings for every clean area inspected — reserve them for concerns likely to surface in review or follow-up.
- Apply the same evidence discipline and confidence labeling used for findings.

## Coverage and Balance

A finding cap keeps a report focused, but a hard numeric cap alone can suppress valid items and make the report look less complete than the underlying investigation actually was. It can also skew the report toward problems only. Two authoring habits prevent both failure modes without reopening scope creep.

**Tier the findings instead of using one flat cap.** Cap only the *primary* findings — the ones that carry full Observed / Inference / Significance detail — and allow an uncapped, compact *Minor / deferred* list of one-line items beneath them.

- primary findings: capped (for example ≤7), full structure each
- minor / deferred: uncapped one-liners, each naming the file or area and the issue in a single line
- genuinely out-of-scope items still go under a separate "Out of scope, flagged only" list

This preserves breadth of coverage while keeping the detailed section short and decision-useful.

**State what is correct, not only what is broken.** A report that lists only problems gives a distorted picture and is harder to trust. Include a short positive-confirmation element so the reader sees the whole surface:

- a compact "Verified correct" list of areas checked and found sound, and/or
- non-findings for the specific concerns a reviewer would expect to surface

Keep positives compact and evidence-backed — the goal is balance and trust, not padding. Do not confirm areas you did not actually inspect, and do not let the minor/deferred list become a dumping ground that dilutes signal.

**Sweep the scoped surface before finalizing.** Tiering and positive confirmation only help if the investigation actually covered the scope. A bounded lens can quietly under-sweep — inspecting the obvious entry points and missing sibling files, configs, or contracts that are still in scope. Before writing findings, enumerate the concrete units inside scope and confirm each was looked at:

- list the in-scope units — folders, entry points, shared modules, config files, and contract/spec docs — and treat that list as the coverage checklist
- make the sweep visible in the artifact: name the units covered in the scope/method line or the "Verified correct" list, so a reader can see what was and was not inspected
- when a unit was not inspected, say so explicitly (bounded-absence wording) rather than implying full coverage
- a unit producing no finding is still swept: record it as verified-correct or a non-finding, not as silence

This closes the gap where the cap is not the limiter — the *lens* is. It complements the tiering habit: the sweep finds the items, the minor/deferred list carries the smaller ones, and the positive-confirmation list accounts for the units that were sound.

## Split Rule for Mixed Findings

When a finding contains both a confirmed problem and an unresolved policy or intent question, the report must say so explicitly.

Do not collapse both into a single ambiguous finding claim. State each part separately.

Required format for split findings:

- **Confirmed** — what is directly proven by the inspected evidence
- **Unresolved** — what about intent, scope, or the appropriate policy response is not yet answerable from the inspected material

Example:

- Confirmed: lint currently fails on the inspected paths.
- Unresolved: whether all failing rules are intended as hard requirements now or are still migration-stage pressure with known exceptions.

Rules:

- The confirmed part should stand regardless of how the unresolved question resolves.
- The unresolved part should be a genuine open question, not a hedge on a confirmed claim.
- Use **Likely** confidence when the confirmed part is solid but the policy response is undecided. Use **Unclear** when the unresolved question is the main reason the finding cannot be acted on.

## Anti-Overreach Rule

Bounded audits should not drift into architecture redesign exercises or lectures on system structure.

- Prefer bounded correction, validation, and clarity over speculative restructuring.
- The presence of a structural inconsistency does not automatically justify re-architecture.
- If a finding would require broad refactoring to resolve, the finding is likely out of scope for a standards or hygiene audit.
- Scope creep in findings usually signals that the mission was not bounded tightly enough. Revisit the constraints field before expanding.
- Do not use local inconsistency alone as the basis for "should be rewritten" style conclusions.

Preferred action types for bounded audits:

- cleanup
- clarification
- verification
- small alignment
- documentation correction
- bounded enforcement follow-through

## Closing Operational Sequence

Every bounded audit or review should close with a short operational sequence, not a generic recommendation list.

Required structure:

- **Fix first** — the highest-confidence, lowest-risk, highest-leverage action
- **Verify next** — the next check that resolves a likely or unclear concern
- **Defer** — anything that should wait until the first fix or verification step lands

This prevents reports from becoming unordered lists of concerns with no clear entry point.

## Practical Reminder

Across task types, the biggest quality gains usually come from tightening three fields:

- mission: clarify the target, lens, and supported decision
- constraints: bound scope, evidence bar, and non-goals
- output: define a decision-useful artifact

When HAWP feels weak, strengthen authoring first before considering any schema change.
