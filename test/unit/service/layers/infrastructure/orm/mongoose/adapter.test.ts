import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { clearContainer } from '../../../../../../../src/dependency-injection';
import { MongooseAdapter } from '../../../../../../../src/service/layers/infrastructure/orm/mongoose/adapter';
import { MongooseToken } from '../../../../../../../src/service/layers/infrastructure/orm/tokens';
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

const makeModel = (): {
  createCollection: ReturnType<typeof vi.fn>;
  createIndexes: ReturnType<typeof vi.fn>;
  init: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
  find: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  findByIdAndUpdate: ReturnType<typeof vi.fn>;
  findByIdAndDelete: ReturnType<typeof vi.fn>;
  exists: ReturnType<typeof vi.fn>;
} => ({
  createCollection: vi.fn().mockResolvedValue(undefined),
  createIndexes: vi.fn().mockResolvedValue(undefined),
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
    vi.clearAllMocks();
    mockModel = makeModel();
    container.register(MongooseToken, { useValue: makeMockMongoose(mockModel) });
  });

  afterEach(() => {
    clearContainer();
    vi.clearAllMocks();
  });

  describe('constructor / resolveModel', () => {
    it('resolves model eagerly in constructor', () => {
      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser',
        schema: mockSchema as never,
      });

      expect(adapter.model).toBe(mockModel);
    });

    it('model property is readonly and stable across calls', () => {
      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser2',
        schema: mockSchema as never,
      });

      expect(adapter.model).toBe(adapter.model);
    });

    it('throws InternalServerError when DI token is not registered', () => {
      clearContainer();

      expect(
        () =>
          new MongooseAdapter<TestInput, TestInput, TestOutput>({
            type: ORMType.Mongoose,
            name: 'TestUser3',
            schema: mockSchema as never,
          }),
      ).toThrow('Mongoose instance not registered in DI container');
    });

    it('throws InternalServerError when DI resolves to null', () => {
      clearContainer();
      container.register(MongooseToken, { useFactory: () => null as never });

      expect(
        () =>
          new MongooseAdapter<TestInput, TestInput, TestOutput>({
            type: ORMType.Mongoose,
            name: 'TestUser4',
            schema: mockSchema as never,
          }),
      ).toThrow('Mongoose instance resolved to null from DI container');
    });

    it('throws InternalServerError when schema is null', () => {
      expect(
        () =>
          new MongooseAdapter<TestInput, TestInput, TestOutput>({
            type: ORMType.Mongoose,
            name: 'TestUser5',
            schema: null as never,
          }),
      ).toThrow('Mongoose model configuration is invalid');
    });

    it('throws InternalServerError when name is empty string', () => {
      expect(
        () =>
          new MongooseAdapter<TestInput, TestInput, TestOutput>({
            type: ORMType.Mongoose,
            name: '',
            schema: mockSchema as never,
          }),
      ).toThrow('Mongoose model configuration is invalid');
    });
  });

  describe('initialize', () => {
    it('calls createCollection, createIndexes, and init on the model', async () => {
      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser6',
        schema: mockSchema as never,
      });

      await adapter.initialize();

      expect(mockModel.createCollection).toHaveBeenCalled();
      expect(mockModel.createIndexes).toHaveBeenCalled();
      expect(mockModel.init).toHaveBeenCalled();
    });

    it('constructor triggers initialize fire-and-forget without blocking', () => {
      const startTime = Date.now();

      const adapter = new MongooseAdapter<TestInput, TestInput, TestOutput>({
        type: ORMType.Mongoose,
        name: 'TestUser7',
        schema: mockSchema as never,
      });

      const elapsed = Date.now() - startTime;
      expect(adapter.model).toBeDefined();
      expect(elapsed).toBeLessThan(50);
    });
  });
});
