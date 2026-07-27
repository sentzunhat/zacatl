import { describe, it, expect, vi } from 'vitest';

import { MongooseIndexManager } from '../../../../../../../src/service/layers/infrastructure/orm/mongoose/index-manager';
import type { MongooseRepositoryModel } from '../../../../../../../src/service/layers/infrastructure/repositories/mongoose/types';

const makeModel = (modelName: string, collectionName: string): MongooseRepositoryModel<unknown> =>
  ({
    modelName,
    collection: { collectionName },
    diffIndexes: vi.fn().mockResolvedValue({
      toCreate: [{ key: { email: 1 }, name: 'email_1' }],
      toDrop: ['legacy_index'],
    }),
    createIndexes: vi.fn().mockResolvedValue(undefined),
    syncIndexes: vi.fn().mockResolvedValue(['legacy_index']),
  }) as unknown as MongooseRepositoryModel<unknown>;

describe('MongooseIndexManager', () => {
  it('diff() returns read-only index changes without mutating', async () => {
    const model = makeModel('Session', 'sessions');
    const manager = new MongooseIndexManager({ models: [model] });

    const result = await manager.diff();

    expect(result).toEqual([
      {
        database: 'MONGOOSE',
        modelName: 'Session',
        collectionName: 'sessions',
        mode: 'diff',
        toCreate: [{ key: { email: 1 }, name: 'email_1' }],
        toDrop: ['legacy_index'],
      },
    ]);
    expect(model.diffIndexes).toHaveBeenCalledTimes(1);
    expect(model.createIndexes).not.toHaveBeenCalled();
    expect(model.syncIndexes).not.toHaveBeenCalled();
  });

  it('createMissing() creates declared indexes for allowlisted models only', async () => {
    const session = makeModel('Session', 'sessions');
    const archive = makeModel('ArchiveItem', 'archive_items');
    const manager = new MongooseIndexManager({ models: [session, archive] });

    const result = await manager.createMissing({ models: ['Session'] });

    expect(result).toEqual([
      {
        database: 'MONGOOSE',
        modelName: 'Session',
        collectionName: 'sessions',
        operation: 'createIndexes',
        status: 'completed',
      },
    ]);
    expect(session.createIndexes).toHaveBeenCalledTimes(1);
    expect(archive.createIndexes).not.toHaveBeenCalled();
  });

  it('createMissing() supports collection allowlists', async () => {
    const session = makeModel('Session', 'sessions');
    const archive = makeModel('ArchiveItem', 'archive_items');
    const manager = new MongooseIndexManager({ models: [session, archive] });

    await manager.createMissing({ collections: ['archive_items'] });

    expect(session.createIndexes).not.toHaveBeenCalled();
    expect(archive.createIndexes).toHaveBeenCalledTimes(1);
  });

  it('syncIndexes() refuses to run without force', async () => {
    const model = makeModel('Session', 'sessions');
    const manager = new MongooseIndexManager({ models: [model] });

    await expect(manager.syncIndexes({ models: ['Session'] })).rejects.toThrow(
      'Mongoose index sync requires force: true',
    );
    expect(model.syncIndexes).not.toHaveBeenCalled();
  });

  it('syncIndexes() runs with force and reports dropped indexes', async () => {
    const model = makeModel('Session', 'sessions');
    const manager = new MongooseIndexManager({ models: [model] });

    const result = await manager.syncIndexes({ force: true, models: ['Session'] });

    expect(result).toEqual([
      {
        database: 'MONGOOSE',
        modelName: 'Session',
        collectionName: 'sessions',
        operation: 'syncIndexes',
        status: 'completed',
        toDrop: ['legacy_index'],
      },
    ]);
    expect(model.syncIndexes).toHaveBeenCalledTimes(1);
  });
});
