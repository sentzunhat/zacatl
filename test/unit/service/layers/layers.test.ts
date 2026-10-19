import { DatabaseSync } from 'node:sqlite';

import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  clearContainer,
  createChildContainer,
  getContainer,
  registerValue,
} from '../../../../src/dependency-injection';
import { BaseRepository } from '../../../../src/service/layers/infrastructure/repositories/nodesqlite/repository';
import { Layers } from '../../../../src/service/layers/layers';
import { LayersConfigToken } from '../../../../src/service/layers/tokens';
import type { LayersConfig } from '../../../../src/service/layers/types';
import { registerOrmInstance } from '../../../../src/service/platforms/server/database/orm-instance';
import { DatabaseVendor } from '../../../../src/service/platforms/server/database/port';
import {
  ServiceContainerToken,
} from '../../../../src/service/tokens';
import { injectable } from '../../../../src/third-party/dependency-injection/tsyringe';

beforeEach(() => {
  clearContainer();
});

describe('Layers', () => {
  @injectable()
  class DirectRepository extends BaseRepository<{ label: string }, { id: string; label: string }> {
    constructor() {
      super({ name: 'direct_items' });
    }
  }

  it('constructs with an empty config without throwing', () => {
    expect(() => new Layers({})).not.toThrow();
  });

  it('keeps standalone scope registrations out of the global container', () => {
    const layers = new Layers({});

    expect('getApplicationContainer' in layers).toBe(false);
    expect(getContainer().isRegistered(ServiceContainerToken, false)).toBe(false);
  });

  it('preserves direct construction with a Service container by deriving layer scopes', () => {
    const serviceContainer = createChildContainer(getContainer());

    expect(() => new Layers({}, serviceContainer)).not.toThrow();
    expect(serviceContainer.resolve(ServiceContainerToken)).toBe(serviceContainer);
  });

  it('fails DI resolution when the Service-managed layer scopes are missing', () => {
    const container = createChildContainer(getContainer());
    registerValue(LayersConfigToken, {}, container);
    registerValue(ServiceContainerToken, createChildContainer(container), container);

    expect(() => container.resolve(Layers)).toThrow(/service\/layers\/container-scopes/);
  });

  it('constructs with infrastructure config', () => {
    expect(() => new Layers({ infrastructure: { repositories: [] } })).not.toThrow();
  });

  it('constructs with domain config', () => {
    expect(() => new Layers({ domain: { providers: [], services: [] } })).not.toThrow();
  });

  it('constructs with application config', () => {
    const config: LayersConfig = {
      application: { entryPoints: { rest: { routes: [], hooks: [] } } },
    };
    expect(() => new Layers(config)).not.toThrow();
  });

  it('start() resolves when infrastructure is undefined', async () => {
    const layers = new Layers({});
    await expect(layers.start()).resolves.toBeUndefined();
  });

  it('start() awaits infrastructure start when present', async () => {
    const layers = new Layers({ infrastructure: { repositories: [] } });
    // infrastructure.start() resolves when repositories list is empty
    await expect(layers.start()).resolves.toBeUndefined();
  });

  it('uses the global ORM registration for direct standalone Layers', async () => {
    const database = new DatabaseSync(':memory:');
    try {
      registerOrmInstance(DatabaseVendor.SQLITE, { url: ':memory:' }, database);
      const layers = new Layers({ infrastructure: { repositories: [DirectRepository] } });

      await layers.start();
      expect(database.prepare("SELECT name FROM sqlite_master WHERE name = 'direct_items'").get())
        .toBeDefined();
    } finally {
      database.close();
    }
  });

  it('preserves the global ORM source when direct Layers has a parent container', async () => {
    const database = new DatabaseSync(':memory:');
    const parentDatabase = new DatabaseSync(':memory:');
    try {
      const parent = createChildContainer(getContainer());
      registerOrmInstance(DatabaseVendor.SQLITE, { url: ':memory:' }, database);
      registerOrmInstance(DatabaseVendor.SQLITE, { url: ':memory:' }, parentDatabase, parent);
      const layers = new Layers({ infrastructure: { repositories: [DirectRepository] } }, parent);

      await layers.start();
      expect(database.prepare("SELECT name FROM sqlite_master WHERE name = 'direct_items'").get())
        .toBeDefined();
      expect(parentDatabase.prepare("SELECT name FROM sqlite_master WHERE name = 'direct_items'").get())
        .toBeUndefined();
    } finally {
      database.close();
      parentDatabase.close();
    }
  });

  it('start() propagates infrastructure start failures', async () => {
    const layers = new Layers({ infrastructure: { repositories: [] } });

    // Inject a failing infrastructure stub
    const stub = { start: vi.fn().mockRejectedValue(new Error('infra-fail')) };
    (layers as unknown as { infrastructure: typeof stub }).infrastructure = stub;

    await expect(layers.start()).rejects.toThrow('infra-fail');
  });
});
