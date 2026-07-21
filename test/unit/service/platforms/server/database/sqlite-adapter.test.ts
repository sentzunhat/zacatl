import { describe, it, expect, afterEach, beforeAll } from 'vitest';

import { CustomError } from '@zacatl/error';

import { clearContainer, resolveDependency } from '../../../../../../src/dependency-injection';
import { createDatabaseToken } from '../../../../../../src/service/layers/infrastructure/orm/tokens/factory';
import { SqliteAdapter } from '../../../../../../src/service/platforms/server/database/adapters/sqlite';
import { DatabaseVendor } from '../../../../../../src/service/platforms/server/database/port';

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
    clearContainer();
  });

  describe('connect()', () => {
    it('throws CustomError when connection URL is missing', async () => {
      adapter = new SqliteAdapter();

      await expect(
        adapter.connect('TestService', { vendor: DatabaseVendor.SQLITE, connection: { url: '' } }),
      ).rejects.toBeInstanceOf(CustomError);
    });

    it('opens an in-memory database when connection URL is :memory:', async () => {
      if (!sqliteAvailable) {
        // Skip test if node:sqlite is not available
        return;
      }

      adapter = new SqliteAdapter();

      await adapter.connect('TestService', {
        vendor: DatabaseVendor.SQLITE,
        connection: { url: ':memory:' },
      });

      expect(adapter.getDatabase()).toBeDefined();
      expect(resolveDependency(createDatabaseToken('SQLITE', 'SQLITE'))).toBe(adapter.getDatabase());
    });

    it('getDatabase() returns undefined before connect is called', () => {
      adapter = new SqliteAdapter();

      expect(adapter.getDatabase()).toBeUndefined();
    });

    it('uses a pre-provided DatabaseSync-like instance instead of opening a new one', async () => {
      adapter = new SqliteAdapter();
      const fakeDb = { prepare: () => undefined, close: () => undefined };

      await adapter.connect('TestService', {
        vendor: DatabaseVendor.SQLITE,
        connection: { url: ':memory:' },
        instance: fakeDb as never,
      });

      expect(adapter.getDatabase()).toBe(fakeDb);
    });

    it('invokes onDatabaseConnected with the opened database', async () => {
      if (!sqliteAvailable) {
        return;
      }
      adapter = new SqliteAdapter();
      let received: unknown;

      await adapter.connect('TestService', {
        vendor: DatabaseVendor.SQLITE,
        connection: { url: ':memory:' },
        onDatabaseConnected: (db) => {
          received = db;
        },
      });

      expect(received).toBe(adapter.getDatabase());
    });

    it('wraps open failures in CustomError with the offending path', async () => {
      if (!sqliteAvailable) {
        return;
      }
      adapter = new SqliteAdapter();

      await expect(
        adapter.connect('TestService', {
          vendor: DatabaseVendor.SQLITE,
          connection: { url: '/nonexistent-dir-zacatl-test/db.sqlite' },
        }),
      ).rejects.toThrow('Failed to open SQLite database');
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
        vendor: DatabaseVendor.SQLITE,
        connection: { url: ':memory:' },
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
        vendor: DatabaseVendor.SQLITE,
        connection: { url: ':memory:' },
      });

      await adapter.disconnect();
      await expect(adapter.disconnect()).resolves.toBeUndefined();
    });
  });
});
