# HAWP Status Report Guide (v0.1)

Status reports are the preferred context-transfer artifact in this repo.
Use a status report to help another conversational system or reviewer think, review, challenge assumptions, and suggest next steps.
This guide is a repo-local companion to HAWP task shaping, not an expansion of the HAWP schema.

Status reports first, checkpoints second.

## Required Structure

Return reports with this structure:

## Status Report

### Intent

### Current State

### What Was Inspected

### What Changed

### What Was Directly Verified

### What Remains Unproven

### Constraints

### Help Wanted

### Suggested Next Step

### Optional Attached Artifact

## Quality Rules

- Keep it compact.
- Keep it portable.
- Do not paste a full transcript unless essential.
- Separate direct evidence from inference.
- Do not overstate maturity or certainty.
- Make it decision-useful.
- Make it useful for a second conversational system or reviewer.
- Default to one report per intent/work thread; split into a new report if the thread branches.

## Evidence Discipline

In every report:

- Put observed facts and direct checks under What Was Directly Verified.
- Put hypotheses, interpretations, and open reasoning under What Remains Unproven.
- If something is not directly verified, do not present it as fact.

## Usage Notes

- Save report files over time in [status](status).
- Keep one report focused on one intent thread when possible.
- In Help Wanted, ask for specific support such as challenging an assumption, reviewing a risk, or proposing the next 2-3 steps.
- Link to artifacts when needed instead of copying large raw outputs.
