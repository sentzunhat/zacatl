# Example: Standards Drift Audit

## Scenario

A user asks for an audit of whether a service still matches the team's deployment standards.

## Filled HAWP Shape

```ts
const shape: Shape = {
  input:
    "audit this service for standards drift against our deployment baseline",
  context:
    "Team has an established deployment baseline covering naming, health checks, resource limits, observability labels, and rollback readiness. The baseline is documented in the team wiki and enforced partly through CI templates. The current service has changed incrementally over time and the deployment manifest was last touched during a resource-tuning pass.",
  mission:
    "Audit the service deployment manifest against the documented deployment baseline and identify deviations that matter for reliability, operability, or maintainability. Support the decision of what to align first.",
  constraints:
    "Use the baseline documentation as the comparison source. Separate directly observed evidence from inference. Use only the categories truth-risk drift, validation drift, maintainability drift, and standard mismatch. Do not collapse present on disk, not ignored, tracked by git, enforced in CI, and documented in inspected scope into a single claim — each is a distinct state. When claiming absence, use within inspected scope or no evidence found in inspected material. Only call something a standard mismatch when the violated standard is proven by the baseline document, an ADR, a tooling contract, or a strong repeated convention that is clearly intentional. When a finding has a confirmed problem but an unresolved policy question, split them using Confirmed and Unresolved. Include compact non-findings when they close likely questions. Do not expand into redesign recommendations.",
  output:
    "A bounded drift audit listing category, confidence, directly observed, inference or uncertainty, significance, and recommended action per item. Where applicable, use the Confirmed / Unresolved split for mixed findings. Close with Fix first, Verify next, and Defer.",
};
```

## Example Output (Illustrative)

---

### Finding 1

**Category:** Standard mismatch
**Confidence:** Confirmed

**Directly observed:** Within inspected scope, the deployment manifest does not include a `livenessProbe` or `readinessProbe` definition. The baseline documentation explicitly requires health-check endpoints on all services with no documented exceptions for this service.

**Inference / uncertainty:** None needed for the core claim. Absence of probe definitions in the manifest is confirmed from the inspected file.

**Significance:** High. Missing health checks prevent the cluster from detecting degraded instances and routing traffic safely — a direct reliability gap against the stated standard.

**Recommended action:** Add liveness and readiness probes matching the baseline specification.

---

### Finding 2

**Category:** Truth-risk drift
**Confidence:** Likely

**Directly observed:** Within inspected scope, the deployment manifest is present on disk. No `version` label matching the baseline observability schema was found in the inspected manifest.

**Inference / uncertainty:** It is not confirmed from inspected material whether a version label is injected at deploy time by CI pipeline tooling outside the manifest file. The absence is confirmed within inspected files; it is not confirmed absence at runtime.

**Significance:** Moderate. If no version label is present at runtime, incident correlation and rollback targeting become unreliable. This concern resolves or softens as soon as the pipeline injection path is checked.

**Recommended action:** Verify whether the pipeline injects a version label. If not, add it to the manifest. If injected separately, document that so future audits can close this without re-investigation.

---

### Finding 3 (Mixed)

**Category:** Validation drift
**Confidence:** Likely (confirmed gap, unresolved intent)

**Directly observed:** The deployment manifest does not define `resources.limits` for the main container. `resources.requests` are present. These are separate configurations — presence of requests does not imply limits are set.

**Confirmed:** Resource limits are absent from the inspected manifest. The baseline documentation requires limits on all deployments to prevent noisy-neighbor effects. No exception entry for this service was found within inspected scope.

**Unresolved:** Whether the absence of limits is intentional for this service (a known temporary exception) or an accidental omission during the resource-tuning pass. No exception documentation was found in inspected material, but the baseline exception register was not fully in scope for this audit.

**Significance:** Depends on resolution. If intentional and documented, this concern closes. If accidental, it is a confirmed baseline gap with real noisy-neighbor risk.

**Recommended action:** Check the baseline exception register. If no exception exists, add resource limits per the baseline specification. If an exception was granted, document it adjacent to the manifest so future audits do not re-open the same question.

---

### Resolved Non-Finding 1

**Type:** Resolved non-finding
**Category:** Standard mismatch
**Confidence:** Confirmed

**Initially appeared as:** Rollback readiness concern — the service appeared to use a floating image tag, which the baseline does not allow.

**What was checked:** The CI pipeline configuration and the image reference in the inspected manifest.

**What was observed:** Within inspected scope, the manifest uses a human-readable tag that the CI pipeline resolves to a pinned digest at deploy time. The pinned digest is present in the confirmed CI build artifact, not in the manifest itself.

**Confidence:** Confirmed

**Conclusion:** The rollback readiness standard is satisfied within inspected scope. What appeared to be a floating tag is a human-readable alias backed by a pinned digest in the confirmed pipeline path.

---

### Fix First

Add liveness and readiness probes to the deployment manifest. That closes a confirmed standard mismatch against the documented baseline without ambiguity and with no dependency on further verification.

### Verify Next

Check whether the CI pipeline injects a version label at deploy time. That resolves Finding 2 as either closed or confirmed, which determines what needs immediate action. In parallel, check the baseline exception register to resolve the limits question in Finding 3.

### Defer

Do not audit full baseline coverage across all services until the confirmed probe gap and the version-label ambiguity are resolved. Expanding scope before resolving high-confidence items creates noise and dilutes priority.

---

## Notes

- `context` names the deployment baseline as the comparison source; the audit does not invent standards from thin air.
- `constraints` prevent re-classifying absence-in-manifest as confirmed-absence-everywhere, which is the most common evidence discipline failure in deployment audits.
- Finding 3 demonstrates the split pattern: the confirmed gap (no limits in manifest, no exception found in scope) stands clearly; the unresolved question (intentional exception or accidental omission) is stated separately rather than collapsing both into hedged "may be missing" language.
- The non-finding shows that an initially suspicious observation was investigated and closed — improving trust in the report without counting as a finding.
- The four-category taxonomy maps cleanly to this deployment context: probe absence is a standard mismatch, version label questions are truth-risk drift, resource-limit absence is validation drift.
- No schema changes were needed to produce this output.
