import { describe, it, expect, afterEach, beforeAll } from 'vitest';

import { CustomError } from '@zacatl/error';

import { SqliteAdapter } from '../../../../../../src/service/platforms/server/database/sqlite-adapter';

describe('SqliteAdapter', () => {
  let adapter: SqliteAdapter;
  let sqliteAvailable = false;

  beforeAll(async () => {
    // Check if node:sqlite is available before running tests
    try {
      await import('node:sqlite');
      sqliteAvailable = true;
    } catch {
      sqliteAvailable = false;
    }
  });

  afterEach(async () => {
    // Ensure the DB is closed between tests
    if (adapter) {
      await adapter.disconnect();
    }
  });

  describe('connect()', () => {
    it('throws CustomError when connectionString is missing', async () => {
      adapter = new SqliteAdapter();

      await expect(
        adapter.connect('TestService', { vendor: 'SQLITE' as any, connectionString: '' }),
      ).rejects.toBeInstanceOf(CustomError);
    });

    it('opens an in-memory database when connectionString is :memory:', async () => {
      if (!sqliteAvailable) {
        // Skip test if node:sqlite is not available
        return;
      }

      adapter = new SqliteAdapter();

      await adapter.connect('TestService', {
        vendor: 'SQLITE' as any,
        connectionString: ':memory:',
      });

      expect(adapter.getDatabase()).toBeDefined();
    });

    it('getDatabase() returns undefined before connect is called', () => {
      adapter = new SqliteAdapter();

      expect(adapter.getDatabase()).toBeUndefined();
    });
  });

  describe('disconnect()', () => {
    it('closes the database and sets it to undefined', async () => {
      if (!sqliteAvailable) {
        // Skip test if node:sqlite is not available
        return;
      }

      adapter = new SqliteAdapter();

      await adapter.connect('TestService', {
        vendor: 'SQLITE' as any,
        connectionString: ':memory:',
      });

      expect(adapter.getDatabase()).toBeDefined();

      await adapter.disconnect();

      expect(adapter.getDatabase()).toBeUndefined();
    });

    it('is a no-op when called before connect', async () => {
      adapter = new SqliteAdapter();

      await expect(adapter.disconnect()).resolves.toBeUndefined();
    });

    it('can be called multiple times without error', async () => {
      if (!sqliteAvailable) {
        // Skip test if node:sqlite is not available
        return;
      }

      adapter = new SqliteAdapter();

      await adapter.connect('TestService', {
        vendor: 'SQLITE' as any,
        connectionString: ':memory:',
      });

      await adapter.disconnect();
      await expect(adapter.disconnect()).resolves.toBeUndefined();
    });
  });
});
