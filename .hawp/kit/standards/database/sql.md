# SQLite Schema Design Standards

## Objective

Maintain consistent, readable, and maintainable database schemas across the application using a canonical entity-relationship pattern with flattened, descriptive column naming.

---

## Naming Conventions

### 1. Table Names

- **Format:** `{domain}_{entity}` or plural noun
- **Pattern:** snake_case, lowercase
- **Examples:**
  - `profiles` (top-level entity)
  - `note_spaces` (app-facing compatibility view)
  - `notespaces` (physical storage table)
  - `note_recordings` (recording → belongs to note)
  - `note_recording_transcript_runs` (transcript run → belongs to note_recording)
  - `note_tags` (join table: many-to-many)

### 2. Primary Keys

- **Format:** Always `id TEXT PRIMARY KEY`
- **Type:** TEXT (UUIDs or snowflake IDs)
- **Example:**
  ```sql
  CREATE TABLE notes (
  	id TEXT PRIMARY KEY,
  	...
  );
  ```

### 3. Foreign Keys

- **Format:** `{parent_table_singular}_id`
- **Referential Integrity:** Always include ON DELETE cascade or SET NULL
- **Examples:**
  ```sql
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note_space_id TEXT NOT NULL REFERENCES note_spaces(id) ON DELETE CASCADE,
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  recording_id TEXT NOT NULL REFERENCES note_recordings(id) ON DELETE CASCADE,
  ```

### 3a. Notespace Naming Authority (This Repo)

- App-facing schema/API naming is `note_space_id` and `note_spaces`.
- Physical storage currently uses `notespaces` table and may include `notespace_id` in transitional schemas.
- New app/repository/IPC code should prefer `note_space_id` and `note_spaces` unless a specific migration task states otherwise.

### 4. Embedded/Nested References (Flattened Pattern)

When representing object hierarchies in denormalized form, use the pattern:

- **Format:** `{parent_entity}_{child_entity}_{property}`
- **Examples:**

  ```sql
  -- For Note with embedded Tags (as flat columns)
  note_tags_tag_id TEXT,
  note_tags_tag_name TEXT,

  -- For Recording with embedded TranscriptChunk
  recording_transcript_chunk_start_time_ms INTEGER,
  recording_transcript_chunk_end_time_ms INTEGER,
  recording_transcript_chunk_text TEXT,
  ```

- **When to use:** Only in denormalized views or reporting tables; prefer normal form for operational tables

### 5. Join/Bridge Tables

- **Format:** `{entity1}_{entity2}` or `{entity1}_{entity2}_{relation}`
- **Composite PK:** Primary key on `(entity1_id, entity2_id)` or add `id` if additional metadata
- **Example:**
  ```sql
  CREATE TABLE note_tags (
  	note_id TEXT NOT NULL REFERENCES notes(id),
  	tag_id TEXT NOT NULL REFERENCES tags(id),
  	source TEXT NOT NULL DEFAULT 'manual',
  	created_at TEXT NOT NULL,
  	PRIMARY KEY (note_id, tag_id)
  );
  ```

### 6. Timestamps

- **Format:** Always ISO 8601 TEXT format (e.g., `2026-05-15T11:30:00Z`)
- **Required on all tables:**
  - `created_at TEXT NOT NULL DEFAULT (datetime('now'))`
  - `updated_at TEXT NOT NULL DEFAULT (datetime('now'))`
  - `deleted_at TEXT` (optional, for soft deletes)
- **Example:**
  ```sql
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
  ```

### 7. Status/Enum Columns

- **Format:** Use CHECK constraints to limit values
- **Pattern:** lowercase, descriptive values
- **Example:**
  ```sql
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'complete', 'failed')),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'suggested', 'generated', 'approved_ai', 'system')),
  ```

---

## Entity Relationship Model (Current & Canonical)

### Canonical Tables (No Duplicates)

| Entity                | Table Name                                               | Domain     | Parent                    | FK to Parent                                  | Purpose                        |
| --------------------- | -------------------------------------------------------- | ---------- | ------------------------- | --------------------------------------------- | ------------------------------ |
| User Profile          | `profiles`                                               | core       | —                         | —                                             | User account root              |
| Workspace             | `note_spaces` (via compatibility view over `notespaces`) | core       | profile                   | `profile_id`                                  | User workspace container       |
| Folder                | `folders`                                                | notes      | notespace                 | `note_space_id`                               | Hierarchical note organization |
| Note                  | `notes`                                                  | notes      | folder, notespace         | `folder_id`, `note_space_id`                  | Core content entity            |
| Tag                   | `tags`                                                   | tagging    | —                         | —                                             | Reusable tag library           |
| Note-Tag              | `note_tags`                                              | tagging    | note, tag                 | `note_id`, `tag_id`                           | Many-to-many assignment        |
| Recording             | `note_recordings`                                        | recordings | note                      | `note_id`                                     | Audio recording metadata       |
| Recording Audio Chunk | `note_recording_audio_chunks`                            | recordings | recording                 | `recording_id`                                | Streamed audio segments        |
| Transcript Run        | `note_recording_transcript_runs`                         | recordings | recording, note           | `recording_id`, `note_id`                     | Transcription attempt          |
| Transcript Chunk      | `note_recording_transcript_chunks`                       | recordings | transcript_run, recording | `recording_transcript_run_id`, `recording_id` | Segmented transcript text      |

### Deprecated/Compatibility Tables (For Migration Only)

- `recording_transcript_runs` → migrate to `note_recording_transcript_runs`
- `recording_audio_chunks` → migrate to `note_recording_audio_chunks`
- _Note: Compatibility views exist during transition; remove after cutover_

---

## Column Naming Summary

| Column Type | Pattern                       | Example                                               |
| ----------- | ----------------------------- | ----------------------------------------------------- |
| Primary Key | `id`                          | `id TEXT PRIMARY KEY`                                 |
| Foreign Key | `{table_singular}_id`         | `note_id`, `profile_id`, `recording_id`               |
| Embedded FK | `{parent}_{child}_{property}` | `note_tags_tag_id`, `recording_transcript_chunk_text` |
| Status      | lowercase values              | `status IN ('pending', 'complete')`                   |
| Timestamp   | ISO 8601 TEXT                 | `created_at`, `updated_at`, `deleted_at`              |
| Data Fields | snake_case                    | `display_name`, `mime_type`, `duration_ms`            |
| Boolean     | `is_*` or `has_*`             | `is_archived`, `has_content`                          |

---

## Index Guidelines

Create indexes on:

- All foreign keys: `CREATE INDEX idx_{table}_{fk_column} ON {table}({fk_column})`
- Frequently queried columns: `created_at`, `updated_at`, `slug`, `status`
- Composite queries: `(recording_id, sequence)` for chunk lookup
- Soft-delete filters: `deleted_at` on any table supporting soft deletes

**Example:**

```sql
CREATE INDEX idx_notes_note_space_id ON notes(note_space_id);
CREATE INDEX idx_note_tags_tag_id ON note_tags(tag_id);
CREATE INDEX idx_note_recording_audio_chunks_recording_id_sequence ON note_recording_audio_chunks(recording_id, sequence);
```

---

## MongoDB Cross-Reference

If migrating to MongoDB in future:

- **Collection names:** Use plural or `{domain}_{entity}` pattern (same as SQL)
- **Document structure:** Embed related objects as nested documents or references
- **Example MongoDB document:**
  ```json
  {
    "_id": "uuid",
    "profile_id": "uuid",
    "name": "My Notespace",
    "created_at": "2026-05-15T11:30:00Z",
    "updated_at": "2026-05-15T11:30:00Z",
    "deleted_at": null,
    "folders": [
      {
        "id": "uuid",
        "name": "Folder 1",
        "parent_id": null,
        "created_at": "2026-05-15T11:30:00Z"
      }
    ]
  }
  ```
- **Flattened naming:** Still use `{entity}_{property}` for flat array elements if not embedded

---

## Validation Checklist

Before creating or modifying a table:

- [ ] Table name follows `{domain}_{entity}` or plural pattern
- [ ] All tables have `id TEXT PRIMARY KEY`
- [ ] All FK columns follow `{parent_singular}_id` pattern
- [ ] All timestamps use `created_at`, `updated_at`, and optional `deleted_at`
- [ ] All foreign keys have referential constraints (ON DELETE CASCADE/SET NULL)
- [ ] Status/enum columns use CHECK constraints
- [ ] Appropriate indexes exist on FKs and query columns
- [ ] No duplicate tables for the same entity (migrate/consolidate if found)
- [ ] Column names are snake_case and descriptive
- [ ] Embedded references use `{parent}_{child}_{property}` pattern

---

## References

- **Schema management:** `src/main/features/notes/notes-schema.ts`
- **Repository layer:** `src/main/features/notes/notes-repository.ts`
- **Migrations:** `.hawp/work/evidence/db-migrations/`
- **Related tasks:** TASK-039 (schema normalization), TASK-042 (transcript chunks), TASK-043 (compatibility cleanup)
