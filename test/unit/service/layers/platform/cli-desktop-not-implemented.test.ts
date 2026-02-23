/**
 * Tests that CLI and Desktop platforms throw an InternalServerError
 * when start() is called, making it explicit that they are not
 * implemented rather than silently doing nothing.
 */

import { describe, it, expect } from 'vitest';

import { InternalServerError } from '../../../../../src/error';
import { CLI } from '../../../../../src/service/platforms/cli/cli';
import { Desktop } from '../../../../../src/service/platforms/desktop/desktop';

describe('CLI.start() — not implemented', () => {
  it('throws an InternalServerError with a clear message', async () => {
    const cli = new CLI({ name: 'my-tool', version: '1.0.0' });

    await expect(cli.start()).rejects.toBeInstanceOf(InternalServerError);
  });

  it('error message mentions the CLI platform name', async () => {
    const cli = new CLI({ name: 'deploy-cli', version: '2.0.0' });

    const err = await cli.start().catch((e) => e);
    expect((err as Error).message).toMatch(/deploy-cli/);
  });

  it('error message hints at v0.1.0 timeline', async () => {
    const cli = new CLI({ name: 'tool', version: '1.0.0' });
    const err = await cli.start().catch((e) => e);
    // Check the reason field where the v0.1.0 timeline is documented
    expect((err as any).reason).toMatch(/v0\.1\.0/);
  });

  it('stop() resolves without throwing', async () => {
    const cli = new CLI({ name: 'tool', version: '1.0.0' });
    await expect(cli.stop()).resolves.toBeUndefined();
  });
});

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

  it('error message hints at v0.1.0 timeline', async () => {
    const desktop = new Desktop(config);
    const err = await desktop.start().catch((e) => e);
    // Check the reason field where the v0.1.0 timeline is documented
    expect((err as any).reason).toMatch(/v0\.1\.0/);
  });

  it('stop() resolves without throwing', async () => {
    const desktop = new Desktop(config);
    await expect(desktop.stop()).resolves.toBeUndefined();
  });
});
