import { describe, it, expect, vi } from 'vitest';

// Mock the platform implementations to keep the test isolated and simple
const serverStart = vi.fn(async () => {});
const serverRegister = vi.fn(async () => {});
vi.mock('../../../src/service/platforms/server/server', () => ({
  Server: class {
    constructor(public cfg: unknown) {
      // noop
    }
    registerEntrypoints = serverRegister;
    start = serverStart;
  },
}));

const cliStart = vi.fn(async () => {});
const cliRegister = vi.fn(async () => {});
vi.mock('../../../src/service/platforms/cli', () => ({
  CLI: class {
    constructor(public cfg: unknown) {}
    registerEntrypoints = cliRegister;
    start = cliStart;
  },
}));

const desktopStart = vi.fn(async () => {});
const desktopRegister = vi.fn(async () => {});
vi.mock('../../../src/service/platforms/desktop', () => ({
  Desktop: class {
    constructor(public cfg: unknown) {}
    registerEntrypoints = desktopRegister;
    start = desktopStart;
  },
}));

import { Platforms } from '../../../src/service/platforms/platforms';

describe('Platforms wrapper', () => {
  it('forwards registerEntrypoints and start to server when only server configured', async () => {
    const platforms = new Platforms({ server: { foo: 'bar' } as any });

    await platforms.registerEntrypoints({ rest: {} } as any);
    expect(serverRegister).toHaveBeenCalled();

    await platforms.start({ port: 123 });
    expect(serverStart).toHaveBeenCalledWith({ port: 123 });
  });

  it('forwards to all configured platforms', async () => {
    const platforms = new Platforms({
      server: { foo: 1 } as any,
      cli: { bar: 2 } as any,
      desktop: { baz: 3 } as any,
    });

    await platforms.registerEntrypoints({ rest: {}, cli: {}, ipc: {} } as any);
    expect(serverRegister).toHaveBeenCalled();
    expect(cliRegister).toHaveBeenCalled();
    expect(desktopRegister).toHaveBeenCalled();

    await platforms.start({});
    expect(serverStart).toHaveBeenCalled();
    expect(cliStart).toHaveBeenCalled();
    expect(desktopStart).toHaveBeenCalled();
  });
});
