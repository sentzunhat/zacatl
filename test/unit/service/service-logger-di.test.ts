import { inject, injectable } from 'tsyringe';
import { describe, expect, it, vi } from 'vitest';

import { getContainer } from '../../../src/dependency-injection/container';
import { logger as defaultLogger, LoggerToken } from '../../../src/logs';
import type { Logger } from '../../../src/logs/types';
import type { HookHandler } from '../../../src/service/layers/application/entry-points/rest/hook-handlers/hook-handler';
import type { ApplicationRestRoutes } from '../../../src/service/layers/application/types';
import {
  ServerType,
  ServerVendor,
} from '../../../src/service/platforms/server/types/server-config';
import { Service, ServiceType, type ServiceConfig } from '../../../src/service/service';
import { ApplicationContainerToken } from '../../../src/service/layers/application/tokens';
import { DomainContainerToken } from '../../../src/service/layers/domain/tokens';
import { InfrastructureContainerToken } from '../../../src/service/layers/infrastructure/tokens';
import { ServiceContainerToken } from '../../../src/service/tokens/service';
import type { DependencyContainer } from '../../../src/third-party/dependency-injection/tsyringe';
import { singleton } from '../../../src/third-party/dependency-injection/tsyringe';

vi.mock('../../../src/service/platforms/server/providers/express/api-adapter', () => ({
  createApiAdapter: vi.fn(() => ({
    registerRoute: vi.fn(),
    registerHook: vi.fn(),
    registerProxy: vi.fn(),
    listen: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
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

const scopedRouteInjected: Logger[] = [];
const scopedHookInjected: Logger[] = [];
const injectedScopes: Array<[
  DependencyContainer,
  DependencyContainer,
  DependencyContainer,
  DependencyContainer,
]> = [];

@injectable()
class ScopeTokenRoute {
  public url = '/scope-tokens';
  public method = 'GET' as const;
  public schema = {};

  constructor(
    @inject(ServiceContainerToken) service: DependencyContainer,
    @inject(InfrastructureContainerToken) infrastructure: DependencyContainer,
    @inject(DomainContainerToken) domain: DependencyContainer,
    @inject(ApplicationContainerToken) application: DependencyContainer,
  ) {
    injectedScopes.push([service, infrastructure, domain, application]);
  }

  async execute(): Promise<Record<string, never>> {
    return {};
  }
}

@injectable()
class ScopedRoute {
  public url = '/scoped';
  public method = 'GET' as const;
  public schema = {};

  constructor(@inject(LoggerToken) logger: Logger) {
    scopedRouteInjected.push(logger);
  }

  async execute(): Promise<Record<string, never>> {
    return {};
  }
}

@injectable()
class ScopedHook implements HookHandler {
  public name = 'onRequest' as const;
  public execute = vi.fn().mockResolvedValue(undefined);

  constructor(@inject(LoggerToken) logger: Logger) {
    scopedHookInjected.push(logger);
  }
}

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

  it('resolves Service-managed routes and hooks from their Service scope during platform registration', async () => {
    const logger = makeLogger();
    const config = serviceConfig(logger, [ScopedRoute]);
    config.layers!.application!.entryPoints!.rest!.hooks = [ScopedHook];
    const scopedService = new Service(config);

    await expect(scopedService.start()).resolves.toBeUndefined();
    expect(scopedRouteInjected.at(-1)).toBe(logger);
    expect(scopedHookInjected.at(-1)).toBe(logger);
    await scopedService.stop();
  });

  it('registers each scope token once in its own Service hierarchy, not globally', async () => {
    const scopedService = new Service(serviceConfig(undefined, [ScopeTokenRoute]));

    await scopedService.start();

    const [service, infrastructure, domain, application] = injectedScopes.at(-1)!;
    expect(service).not.toBe(getContainer());
    expect(service.isRegistered(ServiceContainerToken, false)).toBe(true);
    expect(service.isRegistered(InfrastructureContainerToken, false)).toBe(false);
    expect(infrastructure.isRegistered(InfrastructureContainerToken, false)).toBe(true);
    expect(infrastructure.isRegistered(DomainContainerToken, false)).toBe(false);
    expect(domain.isRegistered(DomainContainerToken, false)).toBe(true);
    expect(domain.isRegistered(ApplicationContainerToken, false)).toBe(false);
    expect(application.isRegistered(ApplicationContainerToken, false)).toBe(true);
    expect(getContainer().isRegistered(ServiceContainerToken, false)).toBe(false);

    await scopedService.stop();
  });
});
