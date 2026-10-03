import { inject, injectable } from 'tsyringe';
import { describe, expect, it, vi } from 'vitest';

import { logger as defaultLogger, LoggerToken } from '../../../src/logs';
import type { Logger } from '../../../src/logs/types';
import type { ApplicationRestRoutes } from '../../../src/service/layers/application/types';
import {
  ServerType,
  ServerVendor,
} from '../../../src/service/platforms/server/types/server-config';
import { Service, ServiceType, type ServiceConfig } from '../../../src/service/service';
import { singleton } from '../../../src/third-party/dependency-injection/tsyringe';

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

// The pattern the docs show: @singleton() registers in the global container at
// module load; it must still receive each Service's own logger.
const singletonInjected: Logger[] = [];

@singleton()
class SingletonLogsHandler {
  public url = '/singleton';
  public method = 'GET' as const;
  public schema = {};

  constructor(@inject(LoggerToken) logger: Logger) {
    singletonInjected.push(logger);
  }

  async execute(): Promise<Record<string, never>> {
    return {};
  }
}

const makeLogger = (): Logger => ({
  log: vi.fn(),
  info: vi.fn(),
  trace: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  fatal: vi.fn(),
});

const serviceConfig = (
  logger?: Logger,
  routes: ApplicationRestRoutes = [WhoLogsHandler],
): ServiceConfig => ({
  type: ServiceType.SERVER,
  layers: { application: { entryPoints: { rest: { routes } } } },
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

  it("gives @singleton() classes each Service's own logger", () => {
    const first = makeLogger();
    const second = makeLogger();

    new Service(serviceConfig(first, [SingletonLogsHandler]));
    new Service(serviceConfig(second, [SingletonLogsHandler]));

    expect(singletonInjected.slice(-2)).toEqual([first, second]);
  });

  it('injects the default Zacatl logger when none is configured', () => {
    new Service(serviceConfig());

    expect(injected.at(-1)).toBe(defaultLogger);
  });
});
