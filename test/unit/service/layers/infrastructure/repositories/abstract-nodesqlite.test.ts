import { describe, it, expect, beforeEach, vi } from 'vitest';

import { clearContainer } from '../../../../../../src/dependency-injection';
import { NodeSqliteToken } from '../../../../../../src/service/layers/infrastructure/orm/tokens';
import { BaseRepository } from '../../../../../../src/service/layers/infrastructure/repositories/abstract';
import { ORMType } from '../../../../../../src/service/layers/infrastructure/repositories/types';
import { container } from '../../../../../../src/third-party';

interface UserInput {
  name: string;
  email: string;
}

interface UserOutput extends UserInput {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

class UserRepository extends BaseRepository<UserInput, UserInput, UserOutput> {
  constructor() {
    super({ type: ORMType.NodeSqlite, name: 'users' });
  }
}

describe('BaseRepository node:sqlite', () => {
  const mockDatabase = {
    prepare: vi.fn(),
    exec: vi.fn(),
  };

  let repository: UserRepository;

  beforeEach(() => {
    clearContainer();
    vi.clearAllMocks();
    // Default stub: table exists, so initialize() does not exec CREATE TABLE
    mockDatabase.prepare.mockReturnValue({
      get: vi.fn().mockReturnValue({ name: 'users' }),
      run: vi.fn(),
      all: vi.fn().mockReturnValue([]),
    });
    mockDatabase.exec.mockReturnValue(undefined);
    container.register(NodeSqliteToken, { useValue: mockDatabase });
    repository = new UserRepository();
  });

  it('should expose the sqlite model through BaseRepository', () => {
    expect(repository.isNodeSqlite()).toBe(true);
    expect(repository.model).toBe(mockDatabase);
  });

  it('throws if DI is not registered when the repository is constructed', () => {
    clearContainer();
    vi.clearAllMocks();

    expect(() => new UserRepository()).toThrow();
  });

  it('resolves the model eagerly from DI on construction', () => {
    expect(repository.model).toBe(mockDatabase);
  });

  it('should delegate lean conversion to the node:sqlite adapter', () => {
    const result = repository.toLean({
      id: 'user-1',
      data: { name: 'John', email: 'john@example.com' },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });

    expect(result).toMatchObject({
      id: 'user-1',
      name: 'John',
      email: 'john@example.com',
    });
    expect(result?.createdAt).toBeInstanceOf(Date);
    expect(result?.updatedAt).toBeInstanceOf(Date);
  });
});
