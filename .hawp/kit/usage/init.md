# HAWP Repo-Local Initialization (v0.1)

This repository uses HAWP as a structured workflow protocol for shaping work.

## Source of Truth

The HAWP v0.1 protocol definition lives in:

- [README.md](../README.md)
- [spec.md](../spec.md)
- [types/shape.ts](../types/shape.ts)
- [authoring-patterns.md](../authoring-patterns.md)

Use those documents as the protocol source of truth.
This repo-local setup is downstream usage guidance, not a protocol redesign.

## How to Use HAWP Here

Use HAWP to frame tasks with these fields:

- input
- context
- mission
- optional checkpoint
- constraints
- output

Keep usage lightweight in v0.1.
Do not introduce runtime architecture, compiler, validator, orchestration, persistence, or memory-engine assumptions.
In v0.1, HAWP fields are framing aids and do not need separate per-field files or folders.

Optional starter templates and patterns live in:

- [../templates](../templates)
- [../patterns](../patterns)
- [../reviews](../reviews)

These are optional usage aids. They do not expand the required HAWP core shape.

## Working Loop

Shape the task with HAWP fields, execute in conversation/editor/agent flow, then write a status report when context should be preserved or shared.

## Working Context

Work can happen in:

- a conversation
- an editor session
- an agent session

The continuity artifact saved in this repo-local setup is a status report.

## Status Reports as Continuity Artifact

Status reports are for context sharing and second-brain review.
They are companion artifacts layered on top of HAWP task shaping, not part of the protocol schema.
They are not automatic continuation machinery.

When writing a status report, capture:

- intent
- current state
- what was inspected
- what changed
- what was directly verified
- what remains unproven
- constraints
- help wanted
- suggested next step

Save reports over time in [../../work/status](../../work/status) using the dated layout `../../work/status/YYYY/MM/DD/`.

## Intake Workflow

When using HAWP for active task or bug tracking, [intake-workflow.md](intake-workflow.md) describes the operating loop: intake → analyze → plan → review gate → implement → verify → close.
Track active and recently closed coordination in [../../work/BACKLOG.md](../../work/BACKLOG.md), and keep full history in `../../work/closed/YYYY/MM/DD/`. Use [../templates/intake-plan.md](../templates/intake-plan.md) for plan files saved to `../../work/active/`.
This is optional. Not all HAWP usage requires tracked work items.

## Guardrail ADR

For improvement work that should preserve HAWP's lean scope, see `../../work/decisions/` for the Guardrail ADR.
It frames review and adoption improvements as optional patterns, examples, and workflow discipline rather than schema expansion.
