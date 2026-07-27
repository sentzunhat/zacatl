import { mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

import { uuidv4 } from '@sentzunhat/zacatl/third-party/uuid';

type JsonObject = Record<string, string | number | boolean | null>;

interface Session {
  id: string;
  userId: string;
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

interface ArchiveItem {
  id: string;
  sessionId: string;
  source: string;
  title: string;
  metadata: JsonObject;
  createdAt: string;
}

interface TrainingSelection {
  id: string;
  archiveItemId: string;
  label: string;
  selectedAt: string;
}

type SessionRow = {
  id: string;
  user_id: string;
  status: Session['status'];
  created_at: string;
  updated_at: string;
};

type ArchiveItemRow = {
  id: string;
  session_id: string;
  source: string;
  title: string;
  metadata_json: string;
  created_at: string;
};

type TrainingSelectionRow = {
  id: string;
  archive_item_id: string;
  label: string;
  selected_at: string;
};

class LocalArchiveStore {
  private readonly db: DatabaseSync;

  constructor(dbPath: string) {
    mkdirSync(dirname(dbPath), { recursive: true });
    this.db = new DatabaseSync(dbPath, { defensive: true });
    this.db.exec('PRAGMA foreign_keys = ON');
  }

  close(): void {
    this.db.close();
  }

  migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `);

    if (this.hasMigration('001_local_archive_store')) {
      return;
    }

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('active', 'closed')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_user_id
        ON sessions(user_id);

      CREATE TABLE IF NOT EXISTS archive_items (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        source TEXT NOT NULL,
        title TEXT NOT NULL,
        metadata_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_archive_items_session_id
        ON archive_items(session_id);

      CREATE TABLE IF NOT EXISTS training_selections (
        id TEXT PRIMARY KEY,
        archive_item_id TEXT NOT NULL REFERENCES archive_items(id) ON DELETE CASCADE,
        label TEXT NOT NULL,
        selected_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_training_archive_item_id
        ON training_selections(archive_item_id);
    `);

    this.run('INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)', [
      '001_local_archive_store',
      nowIso(),
    ]);
  }

  createSession(userId: string): Session {
    const session: Session = {
      id: uuidv4(),
      userId,
      status: 'active',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    this.run(
      `
        INSERT INTO sessions (id, user_id, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `,
      [session.id, session.userId, session.status, session.createdAt, session.updatedAt],
    );

    return session;
  }

  getSession(id: string): Session | null {
    const row = this.get<SessionRow>(
      'SELECT id, user_id, status, created_at, updated_at FROM sessions WHERE id = ?',
      [id],
    );

    return row == null ? null : mapSession(row);
  }

  listSessionsByUser(userId: string): Session[] {
    return this.all<SessionRow>(
      `
        SELECT id, user_id, status, created_at, updated_at
        FROM sessions
        WHERE user_id = ?
        ORDER BY created_at DESC
      `,
      [userId],
    ).map(mapSession);
  }

  recordArchiveItem(input: {
    sessionId: string;
    source: string;
    title: string;
    metadata: JsonObject;
  }): ArchiveItem {
    const item: ArchiveItem = {
      id: uuidv4(),
      sessionId: input.sessionId,
      source: input.source,
      title: input.title,
      metadata: input.metadata,
      createdAt: nowIso(),
    };

    this.run(
      `
        INSERT INTO archive_items (id, session_id, source, title, metadata_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        item.id,
        item.sessionId,
        item.source,
        item.title,
        JSON.stringify(item.metadata),
        item.createdAt,
      ],
    );

    return item;
  }

  listArchiveItemsForSession(sessionId: string): ArchiveItem[] {
    return this.all<ArchiveItemRow>(
      `
        SELECT id, session_id, source, title, metadata_json, created_at
        FROM archive_items
        WHERE session_id = ?
        ORDER BY created_at ASC
      `,
      [sessionId],
    ).map(mapArchiveItem);
  }

  selectForTraining(archiveItemId: string, label: string): TrainingSelection {
    const selection: TrainingSelection = {
      id: uuidv4(),
      archiveItemId,
      label,
      selectedAt: nowIso(),
    };

    this.run(
      `
        INSERT INTO training_selections (id, archive_item_id, label, selected_at)
        VALUES (?, ?, ?, ?)
      `,
      [selection.id, selection.archiveItemId, selection.label, selection.selectedAt],
    );

    return selection;
  }

  listTrainingSelections(): TrainingSelection[] {
    return this.all<TrainingSelectionRow>(
      `
        SELECT id, archive_item_id, label, selected_at
        FROM training_selections
        ORDER BY selected_at ASC
      `,
    ).map(mapTrainingSelection);
  }

  closeSession(id: string): Session | null {
    const updatedAt = nowIso();

    this.run('UPDATE sessions SET status = ?, updated_at = ? WHERE id = ?', [
      'closed',
      updatedAt,
      id,
    ]);

    return this.getSession(id);
  }

  deleteSession(id: string): Session | null {
    const existing = this.getSession(id);

    if (existing == null) {
      return null;
    }

    this.run('DELETE FROM sessions WHERE id = ?', [id]);
    return existing;
  }

  private hasMigration(id: string): boolean {
    return (
      this.get<{ id: string }>('SELECT id FROM schema_migrations WHERE id = ? LIMIT 1', [id]) !=
      null
    );
  }

  private run(sql: string, values: ReadonlyArray<string | number | null> = []): void {
    this.db.prepare(sql).run(...values);
  }

  private get<T extends object>(
    sql: string,
    values: ReadonlyArray<string | number | null> = [],
  ): T | undefined {
    return this.db.prepare(sql).get(...values) as T | undefined;
  }

  private all<T extends object>(
    sql: string,
    values: ReadonlyArray<string | number | null> = [],
  ): T[] {
    return this.db.prepare(sql).all(...values) as T[];
  }
}

const mapSession = (row: SessionRow): Session => ({
  id: row.id,
  userId: row.user_id,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapArchiveItem = (row: ArchiveItemRow): ArchiveItem => ({
  id: row.id,
  sessionId: row.session_id,
  source: row.source,
  title: row.title,
  metadata: parseJsonObject(row.metadata_json),
  createdAt: row.created_at,
});

const mapTrainingSelection = (row: TrainingSelectionRow): TrainingSelection => ({
  id: row.id,
  archiveItemId: row.archive_item_id,
  label: row.label,
  selectedAt: row.selected_at,
});

const parseJsonObject = (value: string): JsonObject => {
  const parsed: unknown = JSON.parse(value);
  return parsed != null && typeof parsed === 'object' && !Array.isArray(parsed)
    ? (parsed as JsonObject)
    : {};
};

const nowIso = (): string => new Date().toISOString();

const exampleRoot = dirname(fileURLToPath(import.meta.url));
const dbPath = join(exampleRoot, '..', 'data', 'local-store.sqlite');

rmSync(dbPath, { force: true });

const store = new LocalArchiveStore(dbPath);

try {
  store.migrate();

  const session = store.createSession('user_demo');
  const archiveItem = store.recordArchiveItem({
    sessionId: session.id,
    source: 'ollama-capture',
    title: 'Prompt and response capture',
    metadata: {
      model: 'llama-local',
      promptTokens: 42,
      retained: true,
    },
  });
  const trainingSelection = store.selectForTraining(archiveItem.id, 'useful-answer');
  const closedSession = store.closeSession(session.id);

  const beforeDelete = {
    sessions: store.listSessionsByUser('user_demo'),
    archiveItems: store.listArchiveItemsForSession(session.id),
    trainingSelections: store.listTrainingSelections(),
  };

  const deletedSession = store.deleteSession(session.id);

  const afterDelete = {
    session: store.getSession(session.id),
    archiveItems: store.listArchiveItemsForSession(session.id),
    trainingSelections: store.listTrainingSelections(),
  };

  console.log(
    JSON.stringify(
      {
        ok: true,
        database: dbPath,
        created: {
          sessionId: session.id,
          archiveItemId: archiveItem.id,
          trainingSelectionId: trainingSelection.id,
          closedSessionStatus: closedSession?.status,
        },
        displayedBeforeDelete: {
          sessions: beforeDelete.sessions.length,
          archiveItems: beforeDelete.archiveItems.length,
          trainingSelections: beforeDelete.trainingSelections.length,
        },
        deleted: {
          sessionId: deletedSession?.id,
          cascadeRemovedArchiveItems: afterDelete.archiveItems.length === 0,
          cascadeRemovedTrainingSelections: afterDelete.trainingSelections.length === 0,
        },
      },
      null,
      2,
    ),
  );
} finally {
  store.close();
}
