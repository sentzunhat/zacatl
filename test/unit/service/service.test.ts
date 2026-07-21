import { describe, expect, it } from 'vitest';

import { InternalServerError } from '../../../src/error';
import type { ServiceConfig } from '../../../src/service/service';
import { Service, ServiceType } from '../../../src/service/service';
import {
  ServerType,
  ServerVendor,
} from '../../../src/service/platforms/server/types/server-config';

describe('Service (unit)', () => {
  it('throws when config.type is missing', () => {
    expect(() => new Service({})).toThrow(InternalServerError);
  });

  it('throws when ServiceType.SERVER is used without server platforms', () => {
    const cfg: ServiceConfig = {
      type: ServiceType.SERVER,
      layers: { application: { entryPoints: { rest: { routes: [] } } } },
    };
    // platforms.server is missing -> validation should fail
    expect(() => new Service(cfg)).toThrow(InternalServerError);
  });

  it('start() propagates platform start errors', async () => {
    const cfg: ServiceConfig = {
      type: ServiceType.SERVER,
      layers: { application: { entryPoints: { rest: { routes: [] } } } },
      platforms: {
        server: {
          name: 'test',
          server: {
            type: ServerType.SERVER,
            vendor: ServerVendor.EXPRESS,
            instance: {} as unknown as never,
          },
          databases: [],
          port: 0,
        },
      },
      run: { auto: false },
    };

    const svc = new Service(cfg);

    // Replace the internal platforms with a failing stub to exercise start error path
    const svcWithInternals = svc as unknown as {
      platforms: {
        registerEntrypoints: (entryPoints: unknown) => Promise<void>;
        start: () => Promise<void>;
      };
    };
    svcWithInternals.platforms = {
      registerEntrypoints: async (): Promise<void> => {},
      start: async (): Promise<void> => {
        throw new Error('start-failure');
      },
    };

    await expect(svc.start()).rejects.toThrow('start-failure');
  });

  it('start() awaits layer readiness after platform startup (databases connect during platform start)', async () => {
    const cfg: ServiceConfig = {
      type: ServiceType.SERVER,
      layers: { application: { entryPoints: { rest: { routes: [] } } } },
      platforms: {
        server: {
          name: 'test',
          server: {
            type: ServerType.SERVER,
            vendor: ServerVendor.EXPRESS,
            instance: {} as unknown as never,
          },
          databases: [],
          port: 0,
        },
      },
      run: { auto: false },
    };

    const svc = new Service(cfg);
    const calls: string[] = [];

    (svc as unknown as { layers: { start: () => Promise<void> } }).layers = {
      start: async (): Promise<void> => {
        calls.push('layers');
      },
    };

    (svc as unknown as {
      platforms: {
        registerEntrypoints: (entryPoints: unknown) => Promise<void>;
        start: () => Promise<void>;
      };
    }).platforms = {
      registerEntrypoints: async (): Promise<void> => {
        calls.push('entrypoints');
      },
      start: async (): Promise<void> => {
        calls.push('platforms');
      },
    };

    await svc.start();

    expect(calls).toEqual(['entrypoints', 'platforms', 'layers']);
  });

  it('stop() resolves cleanly without platforms', async () => {
    const svc = new Service({
      type: ServiceType.SERVER,
      layers: { application: { entryPoints: { rest: { routes: [] } } } },
      platforms: { server: { name: 't', server: { type: ServerType.SERVER, vendor: ServerVendor.EXPRESS, instance: {} as never }, databases: [], port: 0 } },
      run: { auto: false },
    });
    (svc as unknown as { platforms: undefined }).platforms = undefined;
    await expect(svc.stop()).resolves.toBeUndefined();
  });

  it('throws when ServiceType.SERVER is used without rest entry points', () => {
    expect(() => new Service({
      type: ServiceType.SERVER,
      layers: { application: { entryPoints: {} } },
      platforms: { server: { name: 't', server: { type: ServerType.SERVER, vendor: ServerVendor.EXPRESS, instance: {} as never }, databases: [], port: 0 } },
    })).toThrow(InternalServerError);
  });

  it('throws when ServiceType.CLI is used without cli platform', () => {
    expect(() => new Service({
      type: ServiceType.CLI,
      layers: { application: { entryPoints: { cli: { commands: [] } } } },
    })).toThrow(InternalServerError);
  });

  it('throws when ServiceType.CLI is used without cli entry points', () => {
    expect(() => new Service({
      type: ServiceType.CLI,
      layers: { application: { entryPoints: {} } },
      platforms: { cli: { name: 'test-cli', version: '0.0.1' } },
    })).toThrow(InternalServerError);
  });

  it('throws when ServiceType.DESKTOP is used without desktop platform', () => {
    expect(() => new Service({
      type: ServiceType.DESKTOP,
      layers: { application: { entryPoints: { ipc: { handlers: [] } } } },
    })).toThrow(InternalServerError);
  });

  it('throws when ServiceType.DESKTOP is used without ipc entry points', () => {
    expect(() => new Service({
      type: ServiceType.DESKTOP,
      layers: { application: { entryPoints: {} } },
      platforms: {
        desktop: {
          window: { title: 'test', width: 800, height: 600 },
          platform: 'neutralino',
        },
      },
    })).toThrow(InternalServerError);
  });

  it('accepts builtInLocalesDir in localization config', () => {
    const cfg: ServiceConfig = {
      type: ServiceType.SERVER,
      layers: { application: { entryPoints: { rest: { routes: [] } } } },
      platforms: {
        server: {
          name: 'test',
          server: {
            type: ServerType.SERVER,
            vendor: ServerVendor.EXPRESS,
            instance: {} as unknown as never,
          },
          databases: [],
          port: 0,
        },
      },
      localization: {
        builtInLocalesDir: '/tmp/zacatl-locales',
      },
      run: { auto: false },
    };

    expect(() => new Service(cfg)).not.toThrow();
  });
});
