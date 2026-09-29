import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { describe, expect, it, vi } from 'vitest';

import { clearContainer, registerValue } from '@zacatl/dependency-injection';
import { NodeSqliteToken } from '@zacatl/service/layers/infrastructure/orm/tokens/nodesqlite';
import { BaseRepository } from '@zacatl/service/layers/infrastructure/repositories/nodesqlite/repository';
import { ORMType } from '@zacatl/service/layers/infrastructure/repositories/types';

// Optional peers must never be loaded by the node:sqlite path. vi.mock is
// hoisted above the imports, so if any module in their graph pulls a peer in,
// the factory throws and this file fails to load, which mirrors
// ERR_MODULE_NOT_FOUND in an app that never installed the peer.
vi.mock('sqlite3', () => {
  throw new Error('sqlite3 must not be imported by the node:sqlite path');
});
vi.mock('sequelize', () => {
  throw new Error('sequelize must not be imported by the node:sqlite path');
});
vi.mock('mongoose', () => {
  throw new Error('mongoose must not be imported by the node:sqlite path');
});

describe('node:sqlite BaseRepository without optional database peers', () => {
  it('imports and round-trips a record without sqlite3, sequelize or mongoose', async () => {
    class NoteRepository extends BaseRepository<
      { title: string },
      { id: string; title: string; createdAt: Date; updatedAt: Date }
    > {
      constructor() {
        super({ type: ORMType.NodeSqlite, name: 'notes' });
      }
    }

    clearContainer();
    const db = new DatabaseSync(':memory:');
    registerValue(NodeSqliteToken, db);

    try {
      const notes = new NoteRepository();
      const created = await notes.create({ title: 'hello' });
      const found = await notes.findById(created.id);

      expect(found).toMatchObject({ id: created.id, title: 'hello' });
    } finally {
      db.close();
      clearContainer();
    }
  });
});

describe('third-party barrel without optional database peers', () => {
  it('loads without sqlite3, sequelize or mongoose', async () => {
    const barrel = await import('../../../../../../../src/third-party');

    expect(barrel.z).toBeDefined();
    expect(barrel.uuidv4).toBeTypeOf('function');
    expect('sqlite3' in barrel).toBe(false);
  });
});

describe('src runtime imports of the third-party barrel', () => {
  // `src/third-party.ts` re-exports optional peers (e.g. sqlite3), so library
  // code must import specific `third-party/<module>` files instead.
  const srcRoot = join(process.cwd(), 'src');
  const barrelImport =
    /^\s*import\s+(?!type\b)[^;]*?from\s+['"](?:@zacatl\/third-party|(?:\.\.?\/)+third-party)['"]/m;

  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return walk(path);
      return /\.(ts|mts|cts)$/.test(entry.name) && !entry.name.endsWith('.d.ts') ? [path] : [];
    });

  it('has no value imports from the barrel', () => {
    const offenders = walk(srcRoot)
      .filter((file) => barrelImport.test(readFileSync(file, 'utf8')))
      .map((file) => relative(process.cwd(), file));

    expect(offenders).toEqual([]);
  });
});
