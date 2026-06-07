# HAWP Status Report Guide (v0.1)

Status reports are **optional context-transfer companions** to plan files, not required for every task.

Use a status report to help another conversational system or reviewer think, review, challenge assumptions, and suggest next steps.
This guide is a repo-local companion to HAWP task shaping, not an expansion of the HAWP schema.

## When to Write a Status Report

**Always write if:**

- Something was unproven or requires a live environment to verify
- The task reveals a pattern, decision, or lesson learned
- Context needs to survive across sessions

**Optional if:**

- Task is trivial (typo fix, one-line config change, isolated utility fix)
- Everything was directly verified and is documented in the plan file

**Location:** Save reports to `work/status/YYYY/MM/DD/<ID>-status.md`

---

## Structure

Use this structure:

### Status Report

#### Intent

_Why was this task created? What decision or next action does it support?_

#### Current State

_What is the state now?_

#### What Was Inspected

_What files, logs, or environments did you check?_

#### What Changed

_Summary of changes made. (For full details, see the plan file.)_

#### What Was Directly Verified

_Confirmed facts. Only put observed results here._

#### What Remains Unproven

_Hypotheses, edge cases, or claims that require a live environment._

#### Constraints

_Scope limits or assumptions that bounded this work._

#### Help Wanted

_Specific support needed: reviewing a risk, challenging an assumption, proposing next steps._

#### Suggested Next Step

_What should happen next?_

### Optional Attached Artifact

## Quality Rules

- Keep it compact.
- Keep it portable.
- Do not paste a full transcript unless essential; link to artifacts instead.
- Separate direct evidence from inference.
- Do not overstate maturity or certainty.
- Make it decision-useful.
- Make it useful for a second conversational system or reviewer.
- Reference the plan file for full detail; status reports are companions, not replacements.
- Default to one report per intent/work thread; split into a new report if the thread branches.

## Evidence Discipline

In every report:

- Put observed facts and direct checks under What Was Directly Verified.
- Put hypotheses, interpretations, and open reasoning under What Remains Unproven.
- If something is not directly verified, do not present it as fact.

## Usage Notes

- Save report files over time in your `.hawp/work/status/` folder (using `YYYY/MM/DD/` date-based subfolders).
- Keep one report focused on one intent thread when possible.
- In Help Wanted, ask for specific support such as challenging an assumption, reviewing a risk, or proposing the next 2-3 steps.
- Link to plan files, evidence, and artifacts instead of copying large raw outputs.
