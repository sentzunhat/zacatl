# Work Item: TASK-003

## Metadata

- Backlog ID: TASK-003
- Type: task
- Reported: 2026-06-04
- Risk level: medium
- Owner: agent
- Status: planning-only (pending approval)
- Approval required: yes
- Implementation status: not-started

---

## Input

we need to keep sequelize not creating new sqlite inantaces per service on the file so we can connect more services after

---

## Context

Current Mawiltia backend uses Sequelize with SQLite and initializes one Sequelize instance in apps/backend/src/platform/database.ts during bootstrap.

This work item tracks a Zacatl-level plan for dependency injection and shared runtime configuration so multiple services can connect consistently without accidental duplicate SQLite runtime creation.

Note: This item is planning and coordination only in this repository. Runtime implementation belongs to Zacatl framework follow-up work.

---

## Analysis

### Root Cause (Most Likely)

Framework-level runtime ownership and DI boundaries for Sequelize instances are not explicitly codified for multi-service SQLite usage. This can lead to service-level patterns that accidentally create duplicate runtime instances.

### Directly Verified (From Reporting Context)

- apps/backend/src/platform/database.ts creates a Sequelize SQLite instance per bootstrap call.
- apps/backend/src/config.ts registers the same Sequelize instance in Zacatl service platform database config.
- Health repository now extends Zacatl SequelizeRepository and consumes a model bound to the bootstrap Sequelize instance.

### Inferred (Not Yet Proven in This Repo)

- A framework-level shared runtime provider pattern in Zacatl should reduce per-service variance and lower duplicate-instance risk.

### Scope Impact

- Zacatl database adapter design docs and DI patterns.
- Service templates that currently instantiate Sequelize directly in app bootstrap layers.

---

## Options

### Option A: Keep Service-Owned Sequelize Bootstrap

Allow each service to create and register its own Sequelize instance with Zacatl.

Trade-off: Simple and explicit, but can drift across services and increases duplicate-instance risk as ecosystems grow.

### Option B: Introduce Shared DB Runtime Provider + DI Token

Define a framework-level runtime provider/factory in Zacatl for Sequelize/SQLite with explicit singleton-scoped DI semantics and usage guidance.

Trade-off: Better consistency and scaling path, but requires framework changes and migration guidance.

---

## Recommendation

- Chosen option: B
- Rationale: Best long-term pattern for multi-service SQLite/Sequelize deployments and requested shared runtime behavior.

Planned framework workstream (not implemented in this item):

- Add shared runtime provider/factory in Zacatl.
- Add explicit DI token wiring for runtime ownership.
- Add migration guidance for existing bootstrap patterns.

---

## Verification Targets (After Framework Work)

- [ ] One runtime instance per service process by default.
- [ ] Optional shared-connection strategy documented for multi-service deployments.
- [ ] Existing service templates continue to work with minimal migration.

---

## Work Coordination

- Parallel work risk: medium
- Can implement now: only after approval
- Coordination note: Keep this item as planning/reference in current scope; execute framework changes in dedicated Zacatl implementation workstream.

---

## Outcome

Planning artifact created. No framework runtime changes implemented under this item.

---

## Close Checklist

- [x] Plan written
- [ ] Approved
- [ ] Implemented
- [ ] Verified
- [ ] Closed
