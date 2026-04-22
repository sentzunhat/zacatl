# Example: Bounded Truthful Standards Audit

## Scenario

A user asks for a standards audit of a subsystem (`agent/`) against documented repo conventions,
with the expectation that the result will drive cleanup or validation work — not a redesign.

This is the **canonical reference example** for audit-style HAWP usage. It demonstrates all
required audit quality constraints: strict category usage, confidence labels, direct evidence
vs inference split, non-findings, within-inspected-scope wording, the present/not-ignored/tracked
distinction, and a labeled closing operational sequence.

## Filled HAWP Shape

```ts
const shape: Shape = {
  input:
    'audit agent/ for standards drift and hygiene issues that matter for maintainability and correctness',
  context:
    'The agent/ directory contains TypeScript source, tests, fixtures, and tooling config. The inspected material for this audit includes agent/ files, package.json scripts, local sample directories, and repo-level documentation that points to authoring guidance rather than additional schema. No ADR was found for agent/ layout, so standards claims must rely on explicit docs, tooling contracts, or strong repeated repo conventions that are clearly intentional.',
  mission:
    'Produce a bounded standards audit of agent/ using only the categories truth-risk drift, validation drift, maintainability drift, and standard mismatch. Support the decision of what to clean up or verify first.',
  constraints:
    'Separate directly observed findings from inference or uncertainty. Do not present interpretation as fact. Do not collapse present on disk, not ignored, tracked by git, enforced in CI, and documented in inspected scope into one claim — each is a separate state that must be verified individually. When claiming absence, use within inspected scope or no evidence found in inspected files. Only call something a standard mismatch when supported by repo docs, ADRs, tooling contracts, or a strong repeated convention that is clearly intentional. Use only these category labels: truth-risk drift, validation drift, maintainability drift, standard mismatch. When a finding contains both a confirmed problem and an unresolved policy or intent question, state both parts explicitly using the split format: Confirmed and Unresolved. Include compact non-findings when they materially improve trust. Do not expand into redesign or speculative refactor plans. Mark each finding with confirmed, likely, or unclear confidence, and make confidence match the weakest part of the claim.',
  output:
    'A prioritized bounded audit report. Each finding should include: category, confidence, directly observed, inference or uncertainty, significance, and recommended action. Include compact non-findings where useful. Close with Fix first, Verify next, and Defer.',
};
```

## Example Output (Illustrative)

The following shows how a well-formed output looks under these constraints.

---

### Finding 1

**Category:** Maintainability drift
**Confidence:** Confirmed

**Directly observed:**

- **Present on disk:** `agent/` contains 50+ `doc-mutation-test-*/` directories alongside the main project files. This was verified by directory inspection.
- **Not excluded by tooling:** No `.gitignore` rule in the inspected scope (repo root and `agent/`-level) excludes these directories. They are not suppressed from the working tree.
- **Tracked by git:** These directories appear in the current working tree and are not listed as untracked by `git status` — they are committed, not merely local.

_These are three separate observations, each verified independently. Do not collapse them into one claim._

**Inference / uncertainty:** These appear to be generated test artifacts rather than stable project structure. It is not confirmed from inspected material whether all of them are disposable or whether some are kept intentionally for reproduction work.

**Significance:** Adds noise to directory listings, slows glob-based tooling, and increases cognitive load for anyone navigating the repo.

**Recommended action:** Verify which `doc-mutation-test-*/` directories are intentional. Remove the disposable ones first, then add a cleanup or ignore rule so the clutter does not recur.

---

### Finding 2

**Category:** Validation drift
**Confidence:** Likely

**Directly observed:** `agent/package.json` defines `typecheck` and `lint` scripts. Within inspected scope, no evidence was found in the reviewed `agent/` material that these checks are enforced automatically.

**Inference / uncertainty:** It is likely that these checks depend on manual execution, but that is not confirmed from inspected material because repo-level CI definitions outside the inspected scope were not audited here.

**Significance:** Type errors or lint violations in `agent/` could be merged without detection, reducing trust in the build.

**Recommended action:** Check the repo-level CI configuration to confirm whether `agent` typecheck and lint already run. If they do not, add or document that enforcement path.

---

### Finding 3

**Category:** Truth-risk drift
**Confidence:** Likely

**Directly observed:** The workspace contains sample and scratch-style directories near the active `agent/` project path, including `agent/sandbox-testing/hello-ts-project`. Within inspected scope, no short explanation file was found adjacent to that sample path.

**Inference / uncertainty:** This likely creates ambiguity about what is production-facing project content versus local smoke-test material. It is not confirmed whether contributors already understand the boundary or whether a higher-level doc elsewhere explains it.

**Significance:** Moderate. Confusing repo boundaries increase the chance of misleading summaries, accidental edits, and noisy review scope.

**Recommended action:** Add a short note or README that explains what `sandbox-testing/` is for, or move it under a clearly documented fixture area if that better matches repo conventions.

---

### Finding 4 (Mixed)

**Category:** Validation drift
**Confidence:** Likely (confirmed gap, unresolved policy)

**Directly observed:** `agent/eslint.config.mjs` is present on disk and defines lint rules for the `agent/` scope. Within inspected scope, `package.json` exposes a `lint` script. No evidence was found in inspected material that the `lint` script is invoked in a CI enforcement path.

**Confirmed:** Lint configuration is present on disk and rules would produce failures on at least some inspected patterns within the scope. The enforcement path from disk-presence to CI-blocking is not confirmed from inspected material.

**Unresolved:** Whether the lint rules currently in the config are meant to be hard enforcement requirements now, or whether some are still migration-stage pressure with known exceptions pending cleanup.

**Significance:** If enforcement is already intended to be hard, the absence of confirmed CI enforcement is a real validation gap. If some rules are still in a migration window with known exceptions, the concern softens until that window closes.

**Recommended action:** Clarify current enforcement intent. If rules are meant to be blocking, confirm or add them to the CI enforcement path and document that. If still in transition, document the active exception list explicitly so future audits can close this quickly rather than re-investigating.

---

### Resolved Non-Finding 1

**Type:** Confirmed intentional exception
**Category:** Maintainability drift
**Confidence:** Confirmed

**Directly observed:** `agent/sandbox-testing/hello-ts-project` looks at first glance like misplaced project drift. Within inspected scope, the existing example workflow explicitly invokes that path for a folder-scoped CLI smoke run.

**Inference / uncertainty:** The remaining uncertainty is only whether the current placement is ideal. The concern that this path is an accidental leftover does not hold within inspected scope.

**Why this is not a finding:** The directory is being used intentionally as part of the documented smoke workflow, so calling its mere presence drift would overstate the case.

**Useful takeaway:** Keep the path if it supports smoke testing, but clarify the purpose so future audits do not reopen the same question.

---

### Resolved Non-Finding 2

**Type:** Verified enforcement already in place
**Category:** Standard mismatch
**Confidence:** Confirmed

**Directly observed:** The repo README states that HAWP improvement work should favor stronger authoring guidance and examples rather than schema growth.

**Inference / uncertainty:** None needed for the core point.

**Why this is not a finding:** A bounded-audit improvement pass does not need protocol-shape changes here. The documented repo posture already supports handling this through guidance and examples.

**Useful takeaway:** Keep the shape lean and concentrate audit-quality improvements in authoring patterns and examples.

---

### Fix First

Clarify and clean the `doc-mutation-test-*/` directories because that is the most direct confirmed maintainability issue within inspected scope.

### Verify Next

Confirm whether `agent` lint and typecheck are enforced by repo-level CI. That check determines whether the validation concern remains a finding or becomes another non-finding.

### Defer

Do not redesign the `agent/` layout. If the boundary around smoke-test material still feels confusing after cleanup and a short explanatory note, reassess then with explicit repo-standard evidence.

---

## Notes

- The HAWP shape constrained this audit to four categories and required confidence labeling, which prevented speculative observations from appearing as violations.
- `constraints` explicitly separated direct observation from inference, required bounded wording for absence claims, and prevented present-on-disk claims from being overstated as tracked, not-ignored, or enforced facts — each is a distinct state requiring separate verification.
- **Finding 4** demonstrates the split pattern: the confirmed part (lint present on disk, no confirmed CI enforcement path) stands independently; the unresolved part (whether all lint rules are currently hard requirements) is stated separately rather than collapsing both into vague "may be missing" language.
- The non-findings show how an initially suspicious path can be checked and retained as intentional without weakening the audit.
- The closing sequence gives one clean operational entry point instead of an undifferentiated recommendation list.
- Nothing in this output required schema changes to the HAWP shape.
