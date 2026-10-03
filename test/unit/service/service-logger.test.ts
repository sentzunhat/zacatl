import { describe, expect, it, vi } from 'vitest';

import { logger as defaultLogger } from '../../../src/logs';
import type { Logger } from '../../../src/logs/types';
import {
  ServerType,
  ServerVendor,
} from '../../../src/service/platforms/server/types/server-config';
import { Service, ServiceType, type ServiceConfig } from '../../../src/service/service';

const { createExpressApiAdapter, createFastifyApiAdapter } = vi.hoisted(() => {
  const port = (): Record<string, unknown> => ({
    registerRoute: vi.fn(),
    registerHook: vi.fn(),
    registerProxy: vi.fn(),
    listen: vi.fn(),
    close: vi.fn(),
  });
  return { createExpressApiAdapter: vi.fn(port), createFastifyApiAdapter: vi.fn(port) };
});

vi.mock('../../../src/service/platforms/server/providers/express/api-adapter', () => ({
  createApiAdapter: createExpressApiAdapter,
}));
vi.mock('../../../src/service/platforms/server/providers/fastify/api-adapter', () => ({
  createApiAdapter: createFastifyApiAdapter,
}));

const makeLogger = (): Logger => ({
  log: vi.fn(),
  info: vi.fn(),
  trace: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  fatal: vi.fn(),
});

const serviceConfig = (vendor: ServerVendor, logger?: Logger): ServiceConfig => ({
  type: ServiceType.SERVER,
  layers: { application: { entryPoints: { rest: { routes: [] } } } },
  platforms: {
    server: {
      name: 'logger-wiring',
      server: { type: ServerType.SERVER, vendor, instance: { use: vi.fn() } as unknown as never },
      databases: [],
      port: 0,
    },
  },
  run: { auto: false },
  ...(logger != null ? { logger } : {}),
});

describe('ServiceConfig.logger reaches the framework adapters', () => {
  it('passes the configured logger to the Express adapter', () => {
    const logger = makeLogger();

    new Service(serviceConfig(ServerVendor.EXPRESS, logger));

    expect(createExpressApiAdapter).toHaveBeenLastCalledWith(expect.anything(), '', logger);
  });

  it('passes the configured logger to the Fastify adapter', () => {
    const logger = makeLogger();

    new Service(serviceConfig(ServerVendor.FASTIFY, logger));

    expect(createFastifyApiAdapter).toHaveBeenLastCalledWith(expect.anything(), '', logger);
  });

  it('uses the Zacatl logger when none is configured', () => {
    new Service(serviceConfig(ServerVendor.EXPRESS));

    expect(createExpressApiAdapter).toHaveBeenLastCalledWith(expect.anything(), '', defaultLogger);
  });
});
