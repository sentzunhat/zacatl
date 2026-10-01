import { describe, expect, it, vi } from 'vitest';

import type { Logger } from '../../../src/logs/types';
import {
  ServerType,
  ServerVendor,
} from '../../../src/service/platforms/server/types/server-config';
import { Service, ServiceType, type ServiceConfig } from '../../../src/service/service';

const { createExpressApiAdapter } = vi.hoisted(() => ({
  createExpressApiAdapter: vi.fn(() => ({
    registerRoute: vi.fn(),
    registerHook: vi.fn(),
    registerProxy: vi.fn(),
    listen: vi.fn(),
    close: vi.fn(),
  })),
}));

vi.mock('../../../src/service/platforms/server/providers/express/api-adapter', () => ({
  createApiAdapter: createExpressApiAdapter,
}));

const expressServiceConfig = (logger?: Logger): ServiceConfig => ({
  type: ServiceType.SERVER,
  layers: { application: { entryPoints: { rest: { routes: [] } } } },
  platforms: {
    server: {
      name: 'test',
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.EXPRESS,
        instance: { use: vi.fn() } as unknown as never,
      },
      databases: [],
      port: 0,
    },
  },
  run: { auto: false },
  ...(logger != null ? { logger } : {}),
});

describe('ServiceConfig.logger', () => {
  it('passes the configured logger to the server adapters', () => {
    const logger: Logger = {
      log: vi.fn(),
      info: vi.fn(),
      trace: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
    };

    new Service(expressServiceConfig(logger));

    expect(createExpressApiAdapter).toHaveBeenLastCalledWith(expect.anything(), '', logger);
  });

  it('keeps a logger set directly on the server config', () => {
    const makeLogger = (): Logger => ({
      log: vi.fn(),
      info: vi.fn(),
      trace: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
    });
    const serviceLogger = makeLogger();
    const serverLogger = makeLogger();
    const config = expressServiceConfig(serviceLogger);
    const server = config.platforms?.server;
    if (server == null) throw new Error('server config missing');

    new Service({
      ...config,
      platforms: { ...config.platforms, server: { ...server, logger: serverLogger } },
    });

    expect(createExpressApiAdapter).toHaveBeenLastCalledWith(expect.anything(), '', serverLogger);
  });

  it('leaves the adapter on its default logger when none is configured', () => {
    new Service(expressServiceConfig());

    const lastCall = createExpressApiAdapter.mock.calls.at(-1) as unknown[] | undefined;
    expect(lastCall?.[2]).toBeUndefined();
  });
});
