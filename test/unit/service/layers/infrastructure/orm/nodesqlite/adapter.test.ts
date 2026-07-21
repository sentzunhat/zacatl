import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { clearContainer } from '@zacatl/dependency-injection';
import { NodeSqliteAdapter } from '@zacatl/service/layers/infrastructure/orm/nodesqlite/adapter';
import { NodeSqliteToken } from '@zacatl/service/layers/infrastructure/orm/tokens/nodesqlite';
import { ORMType } from '@zacatl/service/layers/infrastructure/repositories/types';
import { container } from '@zacatl/third-party/dependency-injection/tsyringe';

interface TestInput {
  name: string;
  email: string;
}

interface TestOutput {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

describe('NodeSqliteAdapter', () => {
  // Mock DatabaseSync from node:sqlite
  const mockDatabase = {
    prepare: vi.fn(),
    exec: vi.fn(),
  };

  let adapter: NodeSqliteAdapter<TestInput, TestOutput>;
  beforeEach(() => {
    clearContainer();
    vi.clearAllMocks();

    mockDatabase.prepare.mockReset();
    mockDatabase.exec.mockReset();

    // The model is resolved lazily on first access. Set a default prepare stub
    // so ensureTableExists (called on first model access) resolves without errors.
    mockDatabase.prepare.mockReturnValue({
      get: vi.fn().mockReturnValue({ name: 'test_items' }),
      run: vi.fn(),
      all: vi.fn().mockReturnValue([]),
    });

    container.register(NodeSqliteToken, {
      useValue: mockDatabase,
    });

    const config = {
      type: ORMType.NodeSqlite as const,
      name: 'test_items',
    };

    // Construction is now safe without a registered token —
    // resolution happens on first model access.
    adapter = new NodeSqliteAdapter(config);

    // Trigger lazy init here so ensureTableExists runs during beforeEach,
    // not during individual tests. This keeps each test's mockReturnValueOnce
    // available for the test's own SQL statement.
    void adapter.model;
  });

  afterEach(() => {
    clearContainer();
    vi.clearAllMocks();
  });

  describe('model lazy resolution', () => {
    it('resolves the model on first access and returns the database instance', () => {
      // Construction must not throw even though the token is registered.
      const localAdapter = new NodeSqliteAdapter<TestInput, TestOutput>({
        type: ORMType.NodeSqlite as const,
        name: 'test_items',
      });
      // First access triggers resolution and ensureTableExists.
      expect(localAdapter.model).toBe(mockDatabase);
    });

    it('construction succeeds before the token is registered', () => {
      clearContainer();
      // No token registered — construction must not throw.
      expect(
        () =>
          new NodeSqliteAdapter<TestInput, TestOutput>({
            type: ORMType.NodeSqlite as const,
            name: 'test_items',
          }),
      ).not.toThrow();
    });

    it('throws only when the model is accessed with no registered token', () => {
      clearContainer();
      const localAdapter = new NodeSqliteAdapter<TestInput, TestOutput>({
        type: ORMType.NodeSqlite as const,
        name: 'test_items',
      });
      expect(() => localAdapter.model).toThrow('node:sqlite database instance is not valid');
    });

    it('should create the table when it does not exist on first model access', () => {
      mockDatabase.prepare.mockReturnValueOnce({
        get: vi.fn().mockReturnValue(null),
      });
      mockDatabase.exec.mockReturnValue(undefined);

      const localAdapter = new NodeSqliteAdapter<TestInput, TestOutput>({
        type: ORMType.NodeSqlite as const,
        name: 'test_items',
      });

      // Access the model to trigger lazy init.
      expect(localAdapter.model).toBe(mockDatabase);
      expect(mockDatabase.prepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT name FROM sqlite_master'),
      );
      expect(mockDatabase.exec).toHaveBeenCalled();
    });

    it('should not create table if it already exists on first model access', () => {
      vi.clearAllMocks();
      mockDatabase.prepare.mockReturnValue({
        get: vi.fn().mockReturnValue({ name: 'test_items' }),
        run: vi.fn(),
        all: vi.fn().mockReturnValue([]),
      });

      const localAdapter = new NodeSqliteAdapter<TestInput, TestOutput>({
        type: ORMType.NodeSqlite as const,
        name: 'test_items',
      });

      expect(localAdapter.model).toBe(mockDatabase);
      expect(mockDatabase.exec).not.toHaveBeenCalled();
    });

    it('caches the resolved model — does not re-resolve on repeated access', () => {
      const first = adapter.model;
      const second = adapter.model;
      expect(first).toBe(second);
      // prepare is called once for ensureTableExists, not on every access
      const prepareCalls = mockDatabase.prepare.mock.calls.length;
      void adapter.model;
      expect(mockDatabase.prepare.mock.calls.length).toBe(prepareCalls);
    });
  });

  describe('toLean', () => {
    it('should return null for null input', () => {
      expect(adapter.toLean(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(adapter.toLean(undefined)).toBeNull();
    });

    it('should parse JSON string to object', () => {
      const data = { name: 'John', email: 'john@example.com' };
      const result = adapter.toLean(JSON.stringify(data));
      expect(result).toMatchObject({ ...data, id: '' });
      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle object input directly', () => {
      const data = { name: 'John', email: 'john@example.com' };
      const result = adapter.toLean(data);
      expect(result).toMatchObject({ ...data, id: '' });
      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.updatedAt).toBeInstanceOf(Date);
    });

    it('should return null for invalid JSON', () => {
      const result = adapter.toLean('invalid json {');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return null when record not found', async () => {
      const stmt = { get: vi.fn().mockReturnValue(undefined) };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await adapter.findById('nonexistent');
      expect(result).toBeNull();
      expect(stmt.get).toHaveBeenCalledWith('nonexistent');
    });

    it('should return parsed record when found', async () => {
      const data = {
        id: '123',
        name: 'John',
        email: 'john@example.com',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      };
      const stmt = {
        get: vi.fn().mockReturnValue({
          id: data.id,
          data: JSON.stringify({ name: data.name, email: data.email }),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }),
      };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await adapter.findById('123');
      expect(result).toMatchObject({
        id: data.id,
        name: data.name,
        email: data.email,
      });
      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('statement cache', () => {
    type CacheInternals = {
      prepare: (sql: string) => unknown;
      _stmtCache: Map<string, unknown>;
    };

    it('caps the cache and evicts the least-recently-used statement', () => {
      const internals = adapter as unknown as CacheInternals;
      const max = 128;

      for (let i = 0; i < max + 10; i++) {
        internals.prepare(`SELECT ${i}`);
      }

      expect(internals._stmtCache.size).toBeLessThanOrEqual(max);
      // The earliest statements were evicted; the latest survive.
      expect(internals._stmtCache.has('SELECT 0')).toBe(false);
      expect(internals._stmtCache.has(`SELECT ${max + 9}`)).toBe(true);
    });

    it('refreshes recency on cache hit so hot statements survive eviction', () => {
      const internals = adapter as unknown as CacheInternals;
      const max = 128;

      internals.prepare('SELECT hot');
      for (let i = 0; i < max - 1; i++) {
        internals.prepare(`SELECT ${i}`);
      }
      // Cache is full; touch the hot statement, then overflow by one.
      internals.prepare('SELECT hot');
      internals.prepare('SELECT overflow');

      expect(internals._stmtCache.has('SELECT hot')).toBe(true);
      expect(internals._stmtCache.has('SELECT 0')).toBe(false);
    });

    it('returns the same statement object on repeated prepare of identical SQL', () => {
      const internals = adapter as unknown as CacheInternals;
      const first = internals.prepare('SELECT same');
      const second = internals.prepare('SELECT same');
      expect(second).toBe(first);
    });
  });

  describe('findMany', () => {
    it('should return empty array when no records exist', async () => {
      const stmt = { all: vi.fn().mockReturnValue([]) };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await adapter.findMany();
      expect(result).toEqual([]);
      expect(stmt.all).toHaveBeenCalledWith(20, 0);
    });

    it('should return array of parsed records', async () => {
      const data1 = {
        id: '1',
        name: 'John',
        email: 'john@example.com',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      };
      const data2 = {
        id: '2',
        name: 'Jane',
        email: 'jane@example.com',
        createdAt: '2026-01-03T00:00:00.000Z',
        updatedAt: '2026-01-04T00:00:00.000Z',
      };
      const stmt = {
        all: vi.fn().mockReturnValue([
          {
            id: data1.id,
            data: JSON.stringify({ name: data1.name, email: data1.email }),
            createdAt: data1.createdAt,
            updatedAt: data1.updatedAt,
          },
          {
            id: data2.id,
            data: JSON.stringify({ name: data2.name, email: data2.email }),
            createdAt: data2.createdAt,
            updatedAt: data2.updatedAt,
          },
        ]),
      };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await adapter.findMany();
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ id: data1.id, name: data1.name, email: data1.email });
      expect(result[1]).toMatchObject({ id: data2.id, name: data2.name, email: data2.email });
      expect(result[0]?.createdAt).toBeInstanceOf(Date);
      expect(result[1]?.updatedAt).toBeInstanceOf(Date);
    });

    it('pushes filters into SQL before applying pagination', async () => {
      const stmt = { all: vi.fn().mockReturnValue([]) };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      await adapter.findMany({ name: 'Jane' }, { limit: 5, offset: 20 });

      expect(mockDatabase.prepare).toHaveBeenCalledWith(
        expect.stringContaining('WHERE json_extract(data, ?) IS ? LIMIT ? OFFSET ?'),
      );
      expect(stmt.all).toHaveBeenCalledWith('$."name"', 'Jane', 5, 20);
    });

    it('uses the id column for id filters', async () => {
      const stmt = { all: vi.fn().mockReturnValue([]) };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      await adapter.findMany({ id: 'user-123' });

      expect(mockDatabase.prepare).toHaveBeenCalledWith(expect.stringContaining('WHERE id IS ?'));
      expect(stmt.all).toHaveBeenCalledWith('user-123', 20, 0);
    });

    it('caps the limit and prevents negative pagination values from becoming unbounded', async () => {
      const stmt = { all: vi.fn().mockReturnValue([]) };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      await adapter.findMany({}, { limit: -1, offset: -1 });

      expect(stmt.all).toHaveBeenCalledWith(0, 0);
    });
  });

  describe('create', () => {
    it('should create record with id, timestamps', async () => {
      const input: TestInput = { name: 'John', email: 'john@example.com' };
      const stmt = { run: vi.fn() };
      mockDatabase.prepare.mockReturnValueOnce(stmt);
      mockDatabase.exec.mockResolvedValue(undefined);

      const result = await adapter.create(input);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('John');
      expect(result.email).toBe('john@example.com');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(stmt.run).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should return null when record not found', async () => {
      // Setup findById to return null
      const findStmt = { get: vi.fn().mockReturnValue(undefined) };
      mockDatabase.prepare.mockReturnValueOnce(findStmt);

      const result = await adapter.update('nonexistent', { name: 'Updated' });
      expect(result).toBeNull();
    });

    it('should update record and return updated data', async () => {
      const original = {
        id: '123',
        name: 'John',
        email: 'john@example.com',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      };

      // Setup findById
      const findStmt = {
        get: vi.fn().mockReturnValue({
          id: original.id,
          data: JSON.stringify({ name: original.name, email: original.email }),
          createdAt: original.createdAt,
          updatedAt: original.updatedAt,
        }),
      };
      mockDatabase.prepare.mockReturnValueOnce(findStmt);

      // Setup update
      const updateStmt = { run: vi.fn() };
      mockDatabase.prepare.mockReturnValueOnce(updateStmt);

      const result = await adapter.update('123', { name: 'Updated' });

      expect(result).not.toBeNull();
      expect(result!.name).toBe('Updated');
      expect(result!.email).toBe('john@example.com');
      expect(result!.id).toBe(original.id);
      expect(updateStmt.run).toHaveBeenCalled();
      expect(updateStmt.run).toHaveBeenCalledWith(
        JSON.stringify({ name: 'Updated', email: 'john@example.com' }),
        expect.any(String),
        '123',
      );
    });
  });

  describe('delete', () => {
    it('should return null when record not found', async () => {
      const findStmt = { get: vi.fn().mockReturnValue(undefined) };
      mockDatabase.prepare.mockReturnValueOnce(findStmt);

      const result = await adapter.delete('nonexistent');
      expect(result).toBeNull();
    });

    it('should delete record and return deleted data', async () => {
      const data = {
        id: '123',
        name: 'John',
        email: 'john@example.com',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      };

      // Setup findById
      const findStmt = {
        get: vi.fn().mockReturnValue({
          id: data.id,
          data: JSON.stringify({ name: data.name, email: data.email }),
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }),
      };
      mockDatabase.prepare.mockReturnValueOnce(findStmt);

      // Setup delete
      const deleteStmt = { run: vi.fn() };
      mockDatabase.prepare.mockReturnValueOnce(deleteStmt);

      const result = await adapter.delete('123');

      expect(result).toMatchObject({ id: data.id, name: data.name, email: data.email });
      expect(deleteStmt.run).toHaveBeenCalledWith('123');
    });
  });

  describe('exists', () => {
    it('should return false when record does not exist', async () => {
      const stmt = { get: vi.fn().mockReturnValue(undefined) };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await adapter.exists('nonexistent');
      expect(result).toBe(false);
    });

    it('should return true when record exists', async () => {
      const stmt = { get: vi.fn().mockReturnValue({ count: 1 }) };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await adapter.exists('123');
      expect(result).toBe(true);
    });
  });
});
