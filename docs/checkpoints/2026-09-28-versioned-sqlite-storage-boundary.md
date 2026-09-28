# 2026-09-28 — Versioned SQLite storage boundary checkpoint

## Scope

Conversation/event date: 2026-09-28  
Archive date: 2026-09-28  
Repository: `sentzunhat/zacatl`  
Public-safety note: this checkpoint is written generically for a public repository. Private product names, personal context, and non-public roadmap details are intentionally excluded.

## Purpose

Preserve the architecture decision for using SQLite in Node.js/TypeScript systems that need remote access, change streaming, and versioned continuation across more than one application server.

This checkpoint does not describe a completed implementation. It records a design direction and the next work needed to turn that direction into reusable Zacatl guidance or an example.

## Before

Zacatl already had a local SQLite direction:

- A `node:sqlite` store example for small app-local persistence.
- A migration guide for moving simple Sequelize-backed SQLite use cases to explicit `node:sqlite` stores.
- SQLite guidance focused mainly on local application persistence, migrations, typed row mapping, prepared statements, and dependency simplification.

The unresolved question was whether an application could safely read from and write to SQLite through a storage server, with different servers streaming changes and tracking versions.

## During

The discussion clarified the distinction between safe and unsafe distributed SQLite patterns.

Unsafe direction:

- Do not treat a SQLite database file as a shared remote file that multiple machines can write to directly.
- Do not rely on network filesystem semantics for multi-machine SQLite writes.
- Do not stream or mutate the raw SQLite file as the primary integration contract between app servers.

Safe direction:

- Keep the SQLite file local to one owning process or one primary writer boundary.
- Expose storage behavior through an application-level API such as HTTP, gRPC, message bus commands, or a typed internal service boundary.
- Serialize writes inside the owner using explicit transactions, for example `BEGIN IMMEDIATE`.
- Track a monotonically increasing version per committed logical transaction.
- Append committed changes to a `changes` table or equivalent event log.
- Let other servers read by API, subscribe to change streams, or replicate from the owner instead of writing the same database file directly.

## After

Current architecture direction:

- SQLite remains a good fit for local durable persistence and small-to-medium bounded stores.
- Cross-server access should be modeled as a versioned storage boundary, not as direct multi-writer database-file sharing.
- The recommended baseline pattern is a single writer service that owns the SQLite file and provides:
  - transactional writes,
  - optimistic version checks,
  - append-only change records,
  - change streaming through SSE, WebSocket, NATS, or another transport,
  - read APIs for current state and `changes after version N`.

Alternative tools remain valid depending on deployment shape:

- LiteFS-style replication can fit local reads with a single primary writer.
- Litestream-style replication can fit backup and point-in-time restore.
- libSQL/Turso-style clients can fit remote SQLite-compatible access and embedded replicas.
- rqlite-style systems can fit highly available SQL APIs when the goal is distributed consensus rather than raw SQLite-file replication.

## Decision

For Zacatl guidance, prefer this rule:

> A SQLite database file must have one owning writer boundary. Distributed services may call that boundary, stream versioned changes from it, or replicate from it, but they must not concurrently write the same SQLite file across machines.

## Proposed storage boundary shape

A minimal reusable pattern can be documented or implemented around these concepts:

```sql
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS changes (
  version INTEGER PRIMARY KEY,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  source_node_id TEXT
);
```

Recommended write flow:

1. Open a transaction with a reserved writer lock, such as `BEGIN IMMEDIATE`.
2. Read the current global version.
3. If the client supplied `expectedVersion`, reject the write when it no longer matches.
4. Apply the SQL writes through prepared statements.
5. Increment the global version.
6. Insert one or more change records for the committed transaction.
7. Commit.
8. Publish or expose the new version to subscribers.

Recommended API shape:

```http
POST /tx
GET /changes?after=<version>
GET /changes/stream?after=<version>
```

The exact transport is not part of this decision.

## Non-goals

This checkpoint does not decide:

- whether Zacatl should ship a full distributed SQLite replication layer,
- whether to standardize on LiteFS, Litestream, libSQL, Turso, or rqlite,
- whether change payloads should be JSON Patch, domain events, SQL statements, or table-row snapshots,
- how to handle conflict resolution for offline multi-writer clients,
- how far retention of `changes` should extend,
- whether this belongs as a core package, documentation pattern, or example app.

## Strategic impact

This changes the SQLite architecture direction from "can multiple servers stream and write SQLite from storage?" to a safer boundary rule:

- SQLite can be used behind a service boundary.
- Versioning should be explicit and application-level.
- Streaming should publish committed logical changes, not raw database file writes.
- Reusable examples should teach ownership, transaction boundaries, version checks, and change feeds.

This keeps Zacatl aligned with explicit, boring persistence while avoiding a fragile distributed-filesystem assumption.

## Continuation state

Current state:

- Design direction clarified.
- No implementation was completed in this checkpoint.
- No code was changed.
- The checkpoint was archived as documentation only.

Next milestone:

- Decide whether to add this as:
  1. a `docs/guidelines/` architecture section,
  2. a `docs/service/` storage-boundary guide,
  3. an `examples/versioned-sqlite-storage-service/` example,
  4. or a `.hawp` work item first.

Recommended next actions:

1. Create a small work item for a versioned SQLite storage service pattern.
2. Design the public TypeScript interfaces for transaction requests, version responses, and change records.
3. Implement a minimal Fastify example with a single SQLite owner.
4. Add smoke tests for:
   - successful transaction commit,
   - stale `expectedVersion` rejection,
   - `GET /changes?after=N`,
   - streaming or polling continuation from the last seen version.
5. Document deployment warnings around network filesystems and multi-writer access.

Blockers / unresolved questions:

- Whether this should use Node 26 `node:sqlite` directly or Zacatl's existing database adapter layer.
- Whether the change log is generic enough for framework-level code or should remain app-owned.
- Whether streaming belongs in the example only or in a reusable service utility.
- How to model schema migrations alongside logical change versions.

## Resume summary

Resume from: the archived architecture decision that SQLite must have one owning writer boundary, with distributed servers consuming API calls, versioned change records, and streams rather than writing a shared SQLite file.

Next objective: turn the decision into either a HAWP work item or a small Zacatl example demonstrating `POST /tx`, `GET /changes?after=N`, optimistic version checks, and transaction-backed change logging.
