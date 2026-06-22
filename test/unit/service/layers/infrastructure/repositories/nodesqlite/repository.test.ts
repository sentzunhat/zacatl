import { describe, it, expect, vi, beforeEach } from 'vitest';

import { clearContainer } from '@zacatl/dependency-injection';
import { NodeSqliteToken } from '@zacatl/service/layers/infrastructure/orm/tokens';
import { AbstractNodeSqliteRepository } from '@zacatl/service/layers/infrastructure/repositories/nodesqlite/repository';
import { ORMType } from '@zacatl/service/layers/infrastructure/repositories/types';
import { container } from '@zacatl/third-party/dependency-injection/tsyringe';

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
    clearContainer();
    vi.clearAllMocks();

    mockDatabase.prepare.mockReturnValue({
      get: vi.fn().mockReturnValue(undefined),
      run: vi.fn(),
      all: vi.fn().mockReturnValue([]),
    });
    mockDatabase.exec.mockResolvedValue(undefined);

    container.register(NodeSqliteToken, {
      useValue: mockDatabase,
    });

    const config = {
      type: ORMType.NodeSqlite as const,
      name: 'users',
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
      const userData = {
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      };
      const stmt = {
        get: vi.fn().mockReturnValue({
          id: userData.id,
          data: JSON.stringify({ name: userData.name, email: userData.email }),
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        }),
      };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await repository.findById('user-123');
      expect(result).toMatchObject({
        id: userData.id,
        name: userData.name,
        email: userData.email,
      });
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
      const user1 = {
        id: '1',
        name: 'John',
        email: 'john@example.com',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      };
      const user2 = {
        id: '2',
        name: 'Jane',
        email: 'jane@example.com',
        createdAt: '2026-01-03T00:00:00.000Z',
        updatedAt: '2026-01-04T00:00:00.000Z',
      };
      const stmt = {
        all: vi.fn().mockReturnValue([
          {
            id: user1.id,
            data: JSON.stringify({ name: user1.name, email: user1.email }),
            createdAt: user1.createdAt,
            updatedAt: user1.updatedAt,
          },
          {
            id: user2.id,
            data: JSON.stringify({ name: user2.name, email: user2.email }),
            createdAt: user2.createdAt,
            updatedAt: user2.updatedAt,
          },
        ]),
      };
      mockDatabase.prepare.mockReturnValueOnce(stmt);

      const result = await repository.findMany();
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ id: user1.id, name: user1.name, email: user1.email });
      expect(result[1]).toMatchObject({ id: user2.id, name: user2.name, email: user2.email });
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
      mockDatabase.exec.mockResolvedValue(undefined);

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
      const original = {
        id: 'user-123',
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

      const result = await repository.update('user-123', { email: 'newemail@example.com' });

      expect(result).not.toBeNull();
      expect(result!.email).toBe('newemail@example.com');
      expect(result!.name).toBe('John'); // Unchanged
      expect(result!.id).toBe(original.id);
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
      const userData = {
        id: 'user-123',
        name: 'John',
        email: 'john@example.com',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      };
      // Setup findById
      const findStmt = {
        get: vi.fn().mockReturnValue({
          id: userData.id,
          data: JSON.stringify({ name: userData.name, email: userData.email }),
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        }),
      };
      mockDatabase.prepare.mockReturnValueOnce(findStmt);

      // Setup delete
      const deleteStmt = { run: vi.fn() };
      mockDatabase.prepare.mockReturnValueOnce(deleteStmt);

      const result = await repository.delete('user-123');

      expect(result).toMatchObject({
        id: userData.id,
        name: userData.name,
        email: userData.email,
      });
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
