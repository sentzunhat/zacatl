import { describe, it, expect, afterEach } from 'vitest';

import { CustomError } from '@zacatl/error';

import { SqliteAdapter } from '../../../../../../src/service/platforms/server/database/sqlite-adapter';

describe('SqliteAdapter', () => {
  let adapter: SqliteAdapter;

  afterEach(async () => {
    // Ensure the DB is closed between tests
    await adapter.disconnect();
  });

  describe('connect()', () => {
    it('throws CustomError when connectionString is missing', async () => {
      adapter = new SqliteAdapter();

      await expect(
        adapter.connect('TestService', { vendor: 'SQLITE' as any, connectionString: '' }),
      ).rejects.toBeInstanceOf(CustomError);
    });

    it('opens an in-memory database when connectionString is :memory:', async () => {
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
