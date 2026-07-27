import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { clearContainer } from '../../../../../../../src/dependency-injection';
import { MongooseAdapter } from '../../../../../../../src/service/layers/infrastructure/orm/mongoose/adapter';
import {
  clearMongooseIndexRegistry,
  registerMongooseIndexOptions,
} from '../../../../../../../src/service/layers/infrastructure/orm/mongoose/index-policy';
import { createDatabaseToken } from '../../../../../../../src/service/layers/infrastructure/orm/tokens/factory';
import { MongooseToken } from '../../../../../../../src/service/layers/infrastructure/orm/tokens/mongoose';
import { ORMType } from '../../../../../../../src/service/layers/infrastructure/repositories/types';
import { container } from '../../../../../../../src/third-party';

interface TestInput {
  name: string;
}

interface TestOutput {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const makeQueryChain = <T>(
  result: T,
): {
  setOptions: ReturnType<typeof vi.fn>;
  skip: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  lean: ReturnType<typeof vi.fn>;
  exec: ReturnType<typeof vi.fn>;
} => ({
  setOptions: vi.fn().mockReturnThis(),
  skip: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  lean: vi.fn().mockReturnThis(),
  exec: vi.fn().mockResolvedValue(result),
});

const makeModel = (): {
  modelName: string;
  collection: { collectionName: string };
  createCollection: ReturnType<typeof vi.fn>;
  createIndexes: ReturnType<typeof vi.fn>;
  syncIndexes: ReturnType<typeof vi.fn>;
  diffIndexes: ReturnType<typeof vi.fn>;
  init: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  find: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  findByIdAndUpdate: ReturnType<typeof vi.fn>;
  findByIdAndDelete: ReturnType<typeof vi.fn>;
  exists: ReturnType<typeof vi.fn>;
} => ({
  modelName: 'TestUser',
  collection: { collectionName: 'testusers' },
  createCollection: vi.fn().mockResolvedValue(undefined),
  createIndexes: vi.fn().mockResolvedValue(undefined),
  syncIndexes: vi.fn().mockResolvedValue(['legacy_index']),
  diffIndexes: vi.fn().mockResolvedValue({
    toCreate: [{ key: { email: 1 }, name: 'email_1' }],
    toDrop: ['legacy_index'],
  }),
  init: vi.fn().mockResolvedValue(undefined),
  findById: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  findByIdAndDelete: vi.fn(),
  exists: vi.fn(),
});

const mockSchema = { type: 'MockSchema' };

const makeMockMongoose = (
  model: ReturnType<typeof makeModel>,
): { model: ReturnType<typeof vi.fn> } => ({
  model: vi.fn().mockReturnValue(model),
});

describe('MongooseAdapter', () => {
  let mockModel: ReturnType<typeof makeModel>;

  beforeEach(() => {
    clearContainer();
    clearMongooseIndexRegistry();
    vi.clearAllMocks();
    mockModel = makeModel();
    container.register(MongooseToken, { useValue: makeMockMongoose(mockModel) });
  });

  afterEach(() => {
    clearContainer();
    clearMongooseIndexRegistry();
    vi.clearAllMocks();
  });

  describe('model lazy resolution', () => {
    it('resolves model on first access and returns the Mongoose model', () => {
      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser',
        schema: mockSchema as never,
      });

      expect(adapter.model).toBe(mockModel);
    });

    it('model property is stable across repeated accesses', () => {
      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser2',
        schema: mockSchema as never,
      });

      expect(adapter.model).toBe(adapter.model);
    });

    it('construction succeeds when DI token is not yet registered', () => {
      clearContainer();

      expect(
        () =>
          new MongooseAdapter<TestInput, TestInput, TestOutput>({
            type: ORMType.Mongoose,
            name: 'TestUser3',
            schema: mockSchema as never,
          }),
      ).not.toThrow();
    });

    it('throws InternalServerError on first model access when DI token is not registered', () => {
      clearContainer();

      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser3',
        schema: mockSchema as never,
      });

      expect(() => adapter.model).toThrow('Mongoose instance not registered in DI container');
    });

    it('throws InternalServerError on first model access when DI resolves to null', () => {
      clearContainer();
      container.register(MongooseToken, { useFactory: () => null as never });

      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser4',
        schema: mockSchema as never,
      });

      expect(() => adapter.model).toThrow('Mongoose instance resolved to null from DI container');
    });

    it('throws InternalServerError on first model access when schema is null', () => {
      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser5',
        schema: null as never,
      });

      expect(() => adapter.model).toThrow('Mongoose model configuration is invalid');
    });

    it('throws InternalServerError on first model access when name is empty string', () => {
      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: '',
        schema: mockSchema as never,
      });

      expect(() => adapter.model).toThrow('Mongoose model configuration is invalid');
    });
  });

  describe('model readiness', () => {
    it('defaults to create mode and does not call model.init()', async () => {
      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser6',
        schema: mockSchema as never,
      });

      expect(adapter.model).toBe(mockModel);

      await adapter.ready();

      expect(mockModel.createCollection).toHaveBeenCalled();
      expect(mockModel.createIndexes).toHaveBeenCalled();
      expect(mockModel.syncIndexes).not.toHaveBeenCalled();
      expect(mockModel.init).not.toHaveBeenCalled();
    });

    it('bootMode off resolves and registers the model without mutating indexes', async () => {
      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser6Off',
        schema: mockSchema as never,
        indexes: { bootMode: 'off' },
      });

      await adapter.ready();

      expect(mockModel.createCollection).not.toHaveBeenCalled();
      expect(mockModel.createIndexes).not.toHaveBeenCalled();
      expect(mockModel.syncIndexes).not.toHaveBeenCalled();
      expect(mockModel.init).not.toHaveBeenCalled();
    });

    it('bootMode create creates declared indexes without syncing or init()', async () => {
      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser6Create',
        schema: mockSchema as never,
        indexes: { bootMode: 'create' },
      });

      await adapter.ready();

      expect(mockModel.createCollection).toHaveBeenCalled();
      expect(mockModel.createIndexes).toHaveBeenCalled();
      expect(mockModel.syncIndexes).not.toHaveBeenCalled();
      expect(mockModel.init).not.toHaveBeenCalled();
    });

    it('bootMode sync runs syncIndexes only when explicitly configured', async () => {
      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser6Sync',
        schema: mockSchema as never,
        indexes: { bootMode: 'sync' },
      });

      await adapter.ready();

      expect(mockModel.createCollection).toHaveBeenCalled();
      expect(mockModel.createIndexes).not.toHaveBeenCalled();
      expect(mockModel.syncIndexes).toHaveBeenCalled();
      expect(mockModel.init).not.toHaveBeenCalled();
    });

    it('uses the connection-level boot policy when repository config omits indexes', async () => {
      registerMongooseIndexOptions('reporting', { bootMode: 'off' });
      container.register(createDatabaseToken('MONGOOSE', 'reporting'), {
        useValue: makeMockMongoose(mockModel),
      });

      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser6ConnectionPolicy',
        schema: mockSchema as never,
        connection: { name: 'reporting' },
      });

      await adapter.ready();

      expect(mockModel.createCollection).not.toHaveBeenCalled();
      expect(mockModel.createIndexes).not.toHaveBeenCalled();
      expect(mockModel.syncIndexes).not.toHaveBeenCalled();
    });

    it('ready() is stable across repeated calls', async () => {
      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser7',
        schema: mockSchema as never,
      });

      await expect(adapter.ready()).resolves.toBeUndefined();
      await expect(adapter.ready()).resolves.toBeUndefined();
      expect(mockModel.createCollection).toHaveBeenCalledTimes(1);
      expect(mockModel.createIndexes).toHaveBeenCalledTimes(1);
      expect(mockModel.syncIndexes).not.toHaveBeenCalled();
      expect(mockModel.init).not.toHaveBeenCalled();
    });

    it('propagates initialization failures through ready()', async () => {
      mockModel.createIndexes.mockRejectedValueOnce(new Error('init-failure'));

      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser7b',
        schema: mockSchema as never,
      });

      await expect(adapter.ready()).rejects.toThrow('init-failure');
    });
  });

  describe('findMany', () => {
    it('passes literal filters through sanitizeFilter and returns lean results', async () => {
      const chain = makeQueryChain([
        { _id: '1', name: 'Iris', createdAt: new Date(), updatedAt: new Date() },
      ]);
      mockModel.find.mockReturnValueOnce(chain as never);

      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser8',
        schema: mockSchema as never,
      });

      const results = await adapter.findMany({ name: 'Iris' });

      expect(mockModel.find).toHaveBeenCalledWith({ name: 'Iris' });
      expect(chain.setOptions).toHaveBeenCalledWith({ sanitizeFilter: true });
      expect(results).toHaveLength(1);
      expect(results[0]?.name).toBe('Iris');
    });

    it('rejects top-level operator filters', async () => {
      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser9',
        schema: mockSchema as never,
      });

      await expect(adapter.findMany({ $where: 'true' } as never)).rejects.toThrow(
        'Invalid repository filter',
      );
    });
  });

  describe('update', () => {
    it('wraps updates in $set by default', async () => {
      const chain = makeQueryChain({
        _id: 'abc',
        name: 'Michelle',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockModel.findByIdAndUpdate.mockReturnValueOnce(chain as never);

      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser10',
        schema: mockSchema as never,
      });

      const updated = await adapter.update('abc', { name: 'Michelle' });

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'abc',
        { $set: { name: 'Michelle' } },
        { returnDocument: 'after' },
      );
      expect(updated?.name).toBe('Michelle');
    });

    it('allows raw operator updates through the escape hatch', async () => {
      const chain = makeQueryChain({
        _id: 'abc',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockModel.findByIdAndUpdate.mockReturnValueOnce(chain as never);

      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser11',
        schema: mockSchema as never,
      });

      await adapter.update('abc', { $unset: { name: 1 } } as never, { raw: true });

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'abc',
        { $unset: { name: 1 } },
        { returnDocument: 'after' },
      );
    });
  });

  describe('CastError handling', () => {
    it('returns null for CastError in findById and propagates other errors', async () => {
      const castError = Object.assign(new Error('bad id'), { name: 'CastError' });
      const dbError = new Error('db down');
      mockModel.findById.mockReturnValueOnce({
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockRejectedValueOnce(castError),
      } as never);
      mockModel.findById.mockReturnValueOnce({
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockRejectedValueOnce(dbError),
      } as never);

      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser12',
        schema: mockSchema as never,
      });

      await expect(adapter.findById('bad')).resolves.toBeNull();
      await expect(adapter.findById('bad')).rejects.toThrow('db down');
    });

    it('returns false for CastError in exists and propagates other errors', async () => {
      const castError = Object.assign(new Error('bad id'), { name: 'CastError' });
      const dbError = new Error('db down');
      mockModel.exists.mockRejectedValueOnce(castError);
      mockModel.exists.mockRejectedValueOnce(dbError);

      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser13',
        schema: mockSchema as never,
      });

      await expect(adapter.exists('bad')).resolves.toBe(false);
      await expect(adapter.exists('bad')).rejects.toThrow('db down');
    });
  });
});
