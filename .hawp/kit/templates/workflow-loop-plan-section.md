# Workflow Loop — Plan Section Snippet

Copy this block into an active plan (`.hawp/work/active/<ID>.md`) when starting a multi-iteration loop.
Adjust fields per risk and scope. See [../usage/workflow-loop.md](../usage/workflow-loop.md).

---

```markdown
### Workflow Loop

**Loop status:** active | closed | parked
**Loop mode:** autonomous | gated
**Iteration budget:** 3 | 5 | 8
**Current iteration:** 0
**Executor:** agent | human
**Reviewer:** human | agent (separate session)
**Approver:** human | agent per risk gate
**Auto-approve:** false | true

_(Set `auto-approve: true` to override medium/high per-iteration gates when stakeholders accept agent-only transitions. Default: false.)_

---

### Iteration Log

| Iter | Date | Outcome | Handoff |
| ---- | ---- | ------- | ------- |
```

**Field guide:**

| Field | Values | Notes |
| ----- | ------ | ----- |
| **Loop mode** | `autonomous` | Agent runs iterations 1→N without human "loop again" between passes (low risk or `auto-approve: true`). Stops at budget, success, park, or blocked. |
| | `gated` | Human approver required between each iteration (default for medium/high risk). |
| **Iteration budget** | `3`, `5`, or `8` | Fixed cap for this loop run. Pick 3 for tight doc fixes; 5 default; 8 for large epics. |
| **Current iteration** | integer | Increment before each Execute pass. Handoff filenames use this number (`<ID>-iter-<NNN>.md`). |
| **Auto-approve** | boolean | When `true`, autonomous mode may auto-advance even at medium/high risk. Document rationale in plan. |

After the loop completes (budget exhausted or early success), add a **Final handoff** row or link to `.hawp/work/status/YYYY/MM/DD/<ID>-loop-final.md`.
