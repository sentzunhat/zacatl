import { describe, it, expect } from 'vitest';

import { InternalServerError } from '@zacatl/error';

import { Desktop } from '../../../../../src/service/platforms/desktop/desktop';

describe('Desktop.start() — not implemented', () => {
  const config = {
    window: { title: 'My App', width: 1024, height: 768 },
    platform: 'electron' as const,
  };

  it('throws an InternalServerError with a clear message', async () => {
    const desktop = new Desktop(config);
    await expect(desktop.start()).rejects.toBeInstanceOf(InternalServerError);
  });

  it('error message mentions the window title and platform', async () => {
    const desktop = new Desktop(config);
    const err = await desktop.start().catch((e) => e);
    expect((err as Error).message).toMatch(/My App/);
    expect((err as Error).message).toMatch(/electron/);
  });

  it('error reason guides users to SERVER runtime', async () => {
    const desktop = new Desktop(config);
    const err = await desktop.start().catch((e) => e);
    expect((err as any).reason).toMatch(/ServiceType\.SERVER/);
  });

  it('stop() resolves without throwing', async () => {
    const desktop = new Desktop(config);
    await expect(desktop.stop()).resolves.toBeUndefined();
  });
});

describe('Desktop.registerEntrypoints() — not implemented', () => {
  const config = {
    window: { title: 'Test App', width: 800, height: 600 },
    platform: 'neutralino' as const,
  };

  it('throws an InternalServerError', async () => {
    const desktop = new Desktop(config);

    await expect(desktop.registerEntrypoints({} as any)).rejects.toBeInstanceOf(
      InternalServerError,
    );
  });

  it('error message mentions the window title', async () => {
    const desktop = new Desktop(config);

    const err = await desktop.registerEntrypoints({} as any).catch((e) => e);
    expect((err as Error).message).toMatch(/Test App/);
  });
});
