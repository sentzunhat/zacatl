import { inject, injectable } from 'tsyringe';
import { describe, expect, it, vi } from 'vitest';

import { logger as defaultLogger, LoggerToken } from '../../../src/logs';
import type { Logger } from '../../../src/logs/types';
import {
  ServerType,
  ServerVendor,
} from '../../../src/service/platforms/server/types/server-config';
import { Service, ServiceType, type ServiceConfig } from '../../../src/service/service';

vi.mock('../../../src/service/platforms/server/providers/express/api-adapter', () => ({
  createApiAdapter: vi.fn(() => ({
    registerRoute: vi.fn(),
    registerHook: vi.fn(),
    registerProxy: vi.fn(),
    listen: vi.fn(),
    close: vi.fn(),
  })),
}));

const injected: Logger[] = [];

@injectable()
class WhoLogsHandler {
  public url = '/who';
  public method = 'GET' as const;
  public schema = {};

  constructor(@inject(LoggerToken) logger: Logger) {
    injected.push(logger);
  }

  async execute(): Promise<Record<string, never>> {
    return {};
  }
}

const serviceConfig = (logger?: Logger): ServiceConfig => ({
  type: ServiceType.SERVER,
  layers: { application: { entryPoints: { rest: { routes: [WhoLogsHandler] } } } },
  platforms: {
    server: {
      name: 'di-test',
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

describe('LoggerToken', () => {
  it('injects ServiceConfig.logger into layer classes', () => {
    const logger: Logger = {
      log: vi.fn(),
      info: vi.fn(),
      trace: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
    };

    new Service(serviceConfig(logger));

    expect(injected.at(-1)).toBe(logger);
  });

  it('injects the default Zacatl logger when none is configured', () => {
    new Service(serviceConfig());

    expect(injected.at(-1)).toBe(defaultLogger);
  });
});
