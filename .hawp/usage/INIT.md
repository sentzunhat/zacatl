# HAWP Repo-Local Initialization (v0.1)

This repository uses HAWP as a structured workflow protocol for shaping work.

## Source of Truth

The HAWP v0.1 protocol definition lives in:

- [README.md](../README.md)
- [SPEC.md](../SPEC.md)
- [types/shape.ts](../types/shape.ts)
- [AUTHORING_PATTERNS.md](../AUTHORING_PATTERNS.md)

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

Save reports over time in [status](status).
