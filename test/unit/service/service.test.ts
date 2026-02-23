import { describe, expect, it } from 'vitest';

import { InternalServerError } from '../../../src/error';
import { Service, ServiceType } from '../../../src/service';

describe('Service (unit)', () => {
  it('throws when config.type is missing', () => {
    expect(() => new Service({} as any)).toThrow(InternalServerError);
  });

  it('throws when ServiceType.SERVER is used without server platforms', () => {
    const cfg = {
      type: ServiceType.SERVER,
      layers: { application: { entryPoints: { rest: {} } } },
    } as any;
    // platforms.server is missing -> validation should fail
    expect(() => new Service(cfg)).toThrow(InternalServerError);
  });

  it('start() propagates platform start errors', async () => {
    const cfg = {
      type: ServiceType.SERVER,
      layers: { application: { entryPoints: { rest: {} } } },
      platforms: {
        server: {
          name: 'test',
          server: { type: 'SERVER', vendor: 'EXPRESS', instance: {} },
          databases: [],
          port: 0,
        },
      },
      run: { auto: false },
    } as any;

    const svc = new Service(cfg);

    // Replace the internal platforms with a failing stub to exercise start error path
    (svc as any).platforms = {
      registerEntrypoints: async () => {},
      start: async () => {
        throw new Error('start-failure');
      },
    };

    await expect(svc.start()).rejects.toThrow('start-failure');
  });
});
