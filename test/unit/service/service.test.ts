import { describe, expect, it } from 'vitest';

import { InternalServerError } from '../../../src/error';
import type { ConfigService } from '../../../src/service';
import { Service, ServiceType } from '../../../src/service';
import {
  ServerType,
  ServerVendor,
} from '../../../src/service/platforms/server/types/server-config';

describe('Service (unit)', () => {
  it('throws when config.type is missing', () => {
    expect(() => new Service({})).toThrow(InternalServerError);
  });

  it('throws when ServiceType.SERVER is used without server platforms', () => {
    const cfg: ConfigService = {
      type: ServiceType.SERVER,
      layers: { application: { entryPoints: { rest: { routes: [] } } } },
    };
    // platforms.server is missing -> validation should fail
    expect(() => new Service(cfg)).toThrow(InternalServerError);
  });

  it('start() propagates platform start errors', async () => {
    const cfg: ConfigService = {
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

  it('accepts builtInLocalesDir in localization config', () => {
    const cfg: ConfigService = {
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
