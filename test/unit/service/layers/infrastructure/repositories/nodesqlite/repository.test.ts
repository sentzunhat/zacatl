import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AbstractNodeSqliteRepository } from '../../../../../../../src/service/layers/infrastructure/repositories/nodesqlite/repository';
import type { NodeSqliteRepositoryConfig } from '../../../../../../../src/service/layers/infrastructure/repositories/nodesqlite/types';

interface UserInput {
  name: string;
  email: string;
}

interface UserOutput {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock concrete implementation
class UserRepository extends AbstractNodeSqliteRepository<UserInput, UserOutput> {}

describe('AbstractNodeSqliteRepository', () => {
  // Mock DatabaseSync from node:sqlite
  const mockDatabase = {
    prepare: vi.fn(),
    exec: vi.fn(),
  };

  let repository: UserRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup table existence check (called in adapter constructor)
    const checkTableStmt = {
      get: vi.fn().mockReturnValue(null), // Table doesn't exist
    };
    mockDatabase.prepare.mockReturnValueOnce(checkTableStmt);
    mockDatabase.exec.mockResolvedValue(undefined);

    const config = {
      type: 'nodesqlite' as const,
      database: mockDatabase as unknown as NodeSqliteRepositoryConfig['database'],
      tableName: 'users',
    };

    repository = new UserRepository(config);
  });

  describe('constructor', () => {
    it('should accept config and initialize adapter', () => {
      expect(repository).toBeDefined();
      expect(repository.model).toBe(mockDatabase);
    });
  });

  describe('model getter', () => {
    it('should return the database instance', () => {
      expect(repository.model).toBe(mockDatabase);
    });
  });

  describe('toLean', () => {
    it('should handle null input', () => {
      const result = repository.toLean(null);
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const userData = { name: 'John', email: 'john@example.com' };
      const stmt = { get: vi.fn().mockReturnValue({ data: JSON.stringify(userData) }) };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await repository.findById('user-123');
      expect(result).toEqual(userData);
      expect(stmt.get).toHaveBeenCalled();
    });

    it('should return null if user not found', async () => {
      const stmt = { get: vi.fn().mockReturnValue(undefined) };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await repository.findById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('should find all users', async () => {
      const user1 = { name: 'John', email: 'john@example.com' };
      const user2 = { name: 'Jane', email: 'jane@example.com' };
      const stmt = {
        all: vi
          .fn()
          .mockReturnValue([{ data: JSON.stringify(user1) }, { data: JSON.stringify(user2) }]),
      };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await repository.findMany();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(user1);
      expect(result[1]).toEqual(user2);
    });

    it('should return empty array when no users exist', async () => {
      const stmt = { all: vi.fn().mockReturnValue([]) };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await repository.findMany();
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new user with timestamps', async () => {
      const input: UserInput = { name: 'John', email: 'john@example.com' };
      const stmt = { run: vi.fn() };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await repository.create(input);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('John');
      expect(result.email).toBe('john@example.com');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(stmt.run).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update user data', async () => {
      const original = { name: 'John', email: 'john@example.com' };

      // Setup findById
      const findStmt = { get: vi.fn().mockReturnValue({ data: JSON.stringify(original) }) };
      mockDatabase.prepare.mockReturnValueOnce(findStmt);

      // Setup update
      const updateStmt = { run: vi.fn() };
      mockDatabase.prepare.mockReturnValueOnce(updateStmt);

      const result = await repository.update('user-123', { email: 'newemail@example.com' });

      expect(result).not.toBeNull();
      expect(result!.email).toBe('newemail@example.com');
      expect(result!.name).toBe('John'); // Unchanged
      expect(updateStmt.run).toHaveBeenCalled();
    });

    it('should return null if user does not exist', async () => {
      const stmt = { get: vi.fn().mockReturnValue(undefined) };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await repository.update('nonexistent', { name: 'Updated' });
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete user and return deleted data', async () => {
      const userData = { name: 'John', email: 'john@example.com' };

      // Setup findById
      const findStmt = { get: vi.fn().mockReturnValue({ data: JSON.stringify(userData) }) };
      mockDatabase.prepare.mockReturnValueOnce(findStmt);

      // Setup delete
      const deleteStmt = { run: vi.fn() };
      mockDatabase.prepare.mockReturnValueOnce(deleteStmt);

      const result = await repository.delete('user-123');

      expect(result).toEqual(userData);
      expect(deleteStmt.run).toHaveBeenCalledWith('user-123');
    });

    it('should return null if user does not exist', async () => {
      const stmt = { get: vi.fn().mockReturnValue(undefined) };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await repository.delete('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('exists', () => {
    it('should return true if user exists', async () => {
      const stmt = { get: vi.fn().mockReturnValue({ count: 1 }) };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await repository.exists('user-123');
      expect(result).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      const stmt = { get: vi.fn().mockReturnValue(undefined) };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await repository.exists('nonexistent');
      expect(result).toBe(false);
    });
  });
});
