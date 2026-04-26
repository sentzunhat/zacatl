import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { NodeSqliteAdapter } from '../../../../../../../src/service/layers/infrastructure/orm/nodesqlite/adapter';
import type { NodeSqliteRepositoryConfig } from '../../../../../../../src/service/layers/infrastructure/repositories/nodesqlite/types';

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
    vi.clearAllMocks();

    // Reset prepare mock for each test
    mockDatabase.prepare.mockReset();
    mockDatabase.exec.mockReset();

    // Setup table existence check
    const checkTableStmt = {
      get: vi.fn().mockReturnValue(null), // Table doesn't exist initially
    };
    mockDatabase.prepare.mockReturnValueOnce(checkTableStmt);
    mockDatabase.exec.mockResolvedValue(undefined);

    const config = {
      type: 'nodesqlite' as const,
      database: mockDatabase as unknown as NodeSqliteRepositoryConfig['database'],
      tableName: 'test_items',
    };

    adapter = new NodeSqliteAdapter(config);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize and ensure table exists', () => {
      expect(mockDatabase.prepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT name FROM sqlite_master'),
      );
      expect(mockDatabase.exec).toHaveBeenCalled();
    });

    it('should not create table if it already exists', () => {
      vi.clearAllMocks();

      // Reset with existing table
      const checkTableStmt = {
        get: vi.fn().mockReturnValue({ name: 'test_items' }), // Table exists
      };
      mockDatabase.prepare.mockReturnValueOnce(checkTableStmt);

      const config = {
        type: 'nodesqlite' as const,
        database: mockDatabase as unknown as NodeSqliteRepositoryConfig['database'],
        tableName: 'test_items',
      };

      new NodeSqliteAdapter(config);

      // Should check for table but not create
      expect(mockDatabase.prepare).toHaveBeenCalled();
      expect(mockDatabase.exec).not.toHaveBeenCalled();
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
      expect(result).toEqual(data);
    });

    it('should handle object input directly', () => {
      const data = { name: 'John', email: 'john@example.com' };
      const result = adapter.toLean(data);
      expect(result).toEqual(data);
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
      const data = { name: 'John', email: 'john@example.com' };
      const stmt = { get: vi.fn().mockReturnValue({ data: JSON.stringify(data) }) };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await adapter.findById('123');
      expect(result).toEqual(data);
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
      const data1 = { name: 'John', email: 'john@example.com' };
      const data2 = { name: 'Jane', email: 'jane@example.com' };
      const stmt = {
        all: vi
          .fn()
          .mockReturnValue([{ data: JSON.stringify(data1) }, { data: JSON.stringify(data2) }]),
      };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await adapter.findMany();
      expect(result).toEqual([data1, data2]);
      expect(result).toHaveLength(2);
    });
  });

  describe('create', () => {
    it('should create record with id, timestamps', async () => {
      const input: TestInput = { name: 'John', email: 'john@example.com' };
      const stmt = { run: vi.fn() };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

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
      const original = { name: 'John', email: 'john@example.com' };

      // Setup findById
      const findStmt = { get: vi.fn().mockReturnValue({ data: JSON.stringify(original) }) };
      mockDatabase.prepare.mockReturnValueOnce(findStmt);

      // Setup update
      const updateStmt = { run: vi.fn() };
      mockDatabase.prepare.mockReturnValueOnce(updateStmt);

      const result = await adapter.update('123', { name: 'Updated' });

      expect(result).not.toBeNull();
      expect(result!.name).toBe('Updated');
      expect(result!.email).toBe('john@example.com');
      expect(updateStmt.run).toHaveBeenCalled();
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
      const data = { name: 'John', email: 'john@example.com' };

      // Setup findById
      const findStmt = { get: vi.fn().mockReturnValue({ data: JSON.stringify(data) }) };
      mockDatabase.prepare.mockReturnValueOnce(findStmt);

      // Setup delete
      const deleteStmt = { run: vi.fn() };
      mockDatabase.prepare.mockReturnValueOnce(deleteStmt);

      const result = await adapter.delete('123');

      expect(result).toEqual(data);
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
