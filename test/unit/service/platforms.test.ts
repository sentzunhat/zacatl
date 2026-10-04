import { describe, it, expect, vi } from 'vitest';

import {
  createChildContainer,
  getContainer,
  registerValue,
} from '../../../src/dependency-injection/container';
import type { ApplicationEntryPoints } from '../../../src/service/layers/application/types';
import { Platforms } from '../../../src/service/platforms/platforms';
import type { PlatformsConfig } from '../../../src/service/platforms/types';
import {
  ApplicationContainerToken,
  PlatformsConfigToken,
  ServiceContainerToken,
} from '../../../src/service/tokens';

// Mock the platform implementations to keep the test isolated and simple
const serverStart = vi.fn(async () => {});
const serverRegister = vi.fn(async () => {});
const serverScopes = vi.fn();
vi.mock('../../../src/service/platforms/server/server', async () => {
  const { inject, injectable } = await import(
    '../../../src/third-party/dependency-injection/tsyringe'
  );
  const { ServerConfigToken: serverConfigToken } = await import(
    '../../../src/service/platforms/server/tokens'
  );
  const {
    ApplicationContainerToken: applicationContainerToken,
    ServiceContainerToken: serviceContainerToken,
  } = await import('../../../src/service/tokens');
  const exportsObj: Record<string, unknown> = {};
  class MockServer {
    public cfg: unknown;
    constructor(
      cfg: unknown,
      serviceContainer: unknown,
      applicationContainer: unknown,
    ) {
      this.cfg = cfg;
      serverScopes({ serviceContainer, applicationContainer });
    }
    registerEntrypoints = serverRegister;
    start = serverStart;
  }
  inject(serverConfigToken)(MockServer, undefined, 0);
  inject(serviceContainerToken)(MockServer, undefined, 1);
  inject(applicationContainerToken)(MockServer, undefined, 2);
  injectable()(MockServer);
  exportsObj['Server'] = MockServer;
  return exportsObj;
});

const cliStart = vi.fn(async () => {});
const cliRegister = vi.fn(async () => {});
vi.mock('../../../src/service/platforms/cli/cli', async () => {
  const { inject, injectable } = await import(
    '../../../src/third-party/dependency-injection/tsyringe'
  );
  const { CliConfigToken: cliConfigToken } = await import(
    '../../../src/service/platforms/tokens'
  );
  const exportsObj: Record<string, unknown> = {};
  class MockCLI {
    public cfg: unknown;
    constructor(cfg: unknown) {
      this.cfg = cfg;
    }
    registerEntrypoints = cliRegister;
    start = cliStart;
  }
  inject(cliConfigToken)(MockCLI, undefined, 0);
  injectable()(MockCLI);
  exportsObj['CLI'] = MockCLI;
  return exportsObj;
});

const desktopStart = vi.fn(async () => {});
const desktopRegister = vi.fn(async () => {});
vi.mock('../../../src/service/platforms/desktop/desktop', async () => {
  const { inject, injectable } = await import(
    '../../../src/third-party/dependency-injection/tsyringe'
  );
  const { DesktopConfigToken: desktopConfigToken } = await import(
    '../../../src/service/platforms/tokens'
  );
  const exportsObj: Record<string, unknown> = {};
  class MockDesktop {
    public cfg: unknown;
    constructor(cfg: unknown) {
      this.cfg = cfg;
    }
    registerEntrypoints = desktopRegister;
    start = desktopStart;
  }
  inject(desktopConfigToken)(MockDesktop, undefined, 0);
  injectable()(MockDesktop);
  exportsObj['Desktop'] = MockDesktop;
  return exportsObj;
});

describe('Platforms wrapper', () => {
  it('keeps standalone Service and Application containers distinct', () => {
    const config: PlatformsConfig = {
      server: { foo: 'bar' } as unknown as PlatformsConfig['server'],
    };

    new Platforms(config);

    expect(serverScopes).toHaveBeenLastCalledWith(
      expect.objectContaining({
        serviceContainer: expect.any(Object),
        applicationContainer: expect.any(Object),
      }),
    );
    const [{ serviceContainer, applicationContainer }] = serverScopes.mock.lastCall ?? [];
    expect(serviceContainer).not.toBe(applicationContainer);
    expect(serviceContainer).not.toBe(getContainer());
    expect(applicationContainer.resolve(ServiceContainerToken)).toBe(serviceContainer);
    expect(applicationContainer.resolve(ApplicationContainerToken)).toBe(applicationContainer);
  });

  it('fails DI resolution when the Service scope is missing', () => {
    const container = createChildContainer();
    const applicationContainer = createChildContainer();
    registerValue(
      PlatformsConfigToken,
      { server: { foo: 'bar' } } as unknown as PlatformsConfig,
      container,
    );
    registerValue(ApplicationContainerToken, applicationContainer, container);

    expect(() => container.resolve(Platforms)).toThrow(/service\/container/);
  });

  it('uses the real Service scope inherited by a Service-managed Application scope', () => {
    const serviceContainer = createChildContainer();
    registerValue(ServiceContainerToken, serviceContainer, serviceContainer);
    const applicationContainer = createChildContainer(serviceContainer);
    registerValue(ApplicationContainerToken, applicationContainer, applicationContainer);
    const config: PlatformsConfig = {
      server: { foo: 'bar' } as unknown as PlatformsConfig['server'],
    };

    new Platforms(config, serviceContainer, applicationContainer);

    expect(serverScopes).toHaveBeenLastCalledWith({
      serviceContainer,
      applicationContainer,
    });
  });

  it('preserves direct construction with a Service container by deriving the Application scope', () => {
    const config: PlatformsConfig = {
      server: { foo: 'bar' } as unknown as PlatformsConfig['server'],
    };
    const serviceContainer = createChildContainer();

    expect(() => new Platforms(config, serviceContainer)).not.toThrow();
    expect(serverScopes).toHaveBeenLastCalledWith({
      serviceContainer,
      applicationContainer: expect.any(Object),
    });
    const [{ applicationContainer }] = serverScopes.mock.lastCall ?? [];
    expect(applicationContainer.resolve(ServiceContainerToken)).toBe(serviceContainer);
    expect(applicationContainer.resolve(ApplicationContainerToken)).toBe(applicationContainer);
  });

  it('registers direct entry points in its derived Application scope', async () => {
    class DirectRoute {}
    const platforms = new Platforms({
      server: { foo: 'bar' } as unknown as PlatformsConfig['server'],
    });
    const entryPoints: ApplicationEntryPoints = { rest: { routes: [DirectRoute] as never } };

    await platforms.registerEntrypoints(entryPoints);

    const [{ applicationContainer }] = serverScopes.mock.lastCall ?? [];
    expect(applicationContainer.isRegistered(DirectRoute, false)).toBe(true);
    expect(serverRegister).toHaveBeenCalledWith(entryPoints.rest);
  });

  it('forwards registerEntrypoints and start to server when only server configured', async () => {
    const config: PlatformsConfig = {
      server: { foo: 'bar' } as unknown as PlatformsConfig['server'],
    };
    const platforms = new Platforms(config);

    const entryPoints: ApplicationEntryPoints = { rest: { routes: [] } };
    await platforms.registerEntrypoints(entryPoints);
    expect(serverRegister).toHaveBeenCalled();

    await platforms.start({ port: 123 });
    expect(serverStart).toHaveBeenCalledWith({ port: 123 });
  });

  it('forwards to all configured platforms', async () => {
    const config: PlatformsConfig = {
      server: { foo: 1 } as unknown as PlatformsConfig['server'],
      cli: { bar: 2 } as unknown as PlatformsConfig['cli'],
      desktop: { baz: 3 } as unknown as PlatformsConfig['desktop'],
    };
    const platforms = new Platforms(config);

    const entryPoints: ApplicationEntryPoints = {
      rest: { routes: [] },
      cli: { commands: [] },
      ipc: { handlers: [] },
    };
    await platforms.registerEntrypoints(entryPoints);
    expect(serverRegister).toHaveBeenCalled();
    expect(cliRegister).toHaveBeenCalled();
    expect(desktopRegister).toHaveBeenCalled();

    await platforms.start({});
    expect(serverStart).toHaveBeenCalled();
    expect(cliStart).toHaveBeenCalled();
    expect(desktopStart).toHaveBeenCalled();
  });
});
