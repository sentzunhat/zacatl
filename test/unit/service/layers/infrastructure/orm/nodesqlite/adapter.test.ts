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

    // The constructor calls initialize() fire-and-forget, which calls ensureTableExists()
    // synchronously. Set a default prepare stub so that call resolves without errors.
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

    adapter = new NodeSqliteAdapter(config);
  });

  afterEach(() => {
    clearContainer();
    vi.clearAllMocks();
  });

  describe('constructor bootstrap', () => {
    it('should create the table when it does not exist', async () => {
      // Override default: table does not exist on this call
      mockDatabase.prepare.mockReturnValueOnce({
        get: vi.fn().mockReturnValue(null),
      });
      mockDatabase.exec.mockReturnValue(undefined);

      const localAdapter = new NodeSqliteAdapter<TestInput, TestOutput>({
        type: ORMType.NodeSqlite as const,
        name: 'test_items',
      });

      await new Promise((resolve) => setImmediate(resolve));

      expect(localAdapter.model).toBe(mockDatabase);
      expect(mockDatabase.prepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT name FROM sqlite_master'),
      );
      expect(mockDatabase.exec).toHaveBeenCalled();
    });

    it('should not create table if it already exists', async () => {
      // Default mock already returns table exists; clear call counts from constructor
      vi.clearAllMocks();

      new NodeSqliteAdapter<TestInput, TestOutput>({
        type: ORMType.NodeSqlite as const,
        name: 'test_items',
      });

      await new Promise((resolve) => setImmediate(resolve));

      expect(mockDatabase.prepare).toHaveBeenCalled();
      expect(mockDatabase.exec).not.toHaveBeenCalled();
    });

    it('constructor resolves model eagerly', () => {
      expect(adapter.model).toBe(mockDatabase);
    });
  });

  describe('model', () => {
    it('should return the database instance', () => {
      expect(adapter.model).toBe(mockDatabase);
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

  describe('findMany', () => {
    it('should return empty array when no records exist', async () => {
      const stmt = { all: vi.fn().mockReturnValue([]) };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await adapter.findMany();
      expect(result).toEqual([]);
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
