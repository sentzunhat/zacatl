import { describe, it, expect, vi } from 'vitest';

import type { ApplicationEntryPoints } from '../../../src/service/layers/application/types';
import { Platforms } from '../../../src/service/platforms/platforms';
import type { ConfigPlatforms } from '../../../src/service/platforms/types';

// Mock the platform implementations to keep the test isolated and simple
const serverStart = vi.fn(async () => {});
const serverRegister = vi.fn(async () => {});
vi.mock('../../../src/service/platforms/server/server', () => {
  const exportsObj: Record<string, unknown> = {};
  exportsObj['Server'] = class {
    constructor(public cfg: unknown) {
      // noop
    }
    registerEntrypoints = serverRegister;
    start = serverStart;
  };
  return exportsObj;
});

const cliStart = vi.fn(async () => {});
const cliRegister = vi.fn(async () => {});
vi.mock('../../../src/service/platforms/cli', () => {
  const exportsObj: Record<string, unknown> = {};
  exportsObj['CLI'] = class {
    constructor(public cfg: unknown) {}
    registerEntrypoints = cliRegister;
    start = cliStart;
  };
  return exportsObj;
});

const desktopStart = vi.fn(async () => {});
const desktopRegister = vi.fn(async () => {});
vi.mock('../../../src/service/platforms/desktop', () => {
  const exportsObj: Record<string, unknown> = {};
  exportsObj['Desktop'] = class {
    constructor(public cfg: unknown) {}
    registerEntrypoints = desktopRegister;
    start = desktopStart;
  };
  return exportsObj;
});

describe('Platforms wrapper', () => {
  it('forwards registerEntrypoints and start to server when only server configured', async () => {
    const config: ConfigPlatforms = {
      server: { foo: 'bar' } as unknown as ConfigPlatforms['server'],
    };
    const platforms = new Platforms(config);

    const entryPoints: ApplicationEntryPoints = { rest: { routes: [] } };
    await platforms.registerEntrypoints(entryPoints);
    expect(serverRegister).toHaveBeenCalled();

    await platforms.start({ port: 123 });
    expect(serverStart).toHaveBeenCalledWith({ port: 123 });
  });

  it('forwards to all configured platforms', async () => {
    const config: ConfigPlatforms = {
      server: { foo: 1 } as unknown as ConfigPlatforms['server'],
      cli: { bar: 2 } as unknown as ConfigPlatforms['cli'],
      desktop: { baz: 3 } as unknown as ConfigPlatforms['desktop'],
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
