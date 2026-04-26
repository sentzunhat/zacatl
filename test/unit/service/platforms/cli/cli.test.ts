import { describe, it, expect } from 'vitest';

import { InternalServerError } from '@zacatl/error';

import type { CliApplicationEntryPoints } from '../../../../../src/service/layers/application/types';
import { CLI } from '../../../../../src/service/platforms/cli/cli';

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

  it('error reason guides users to SERVER runtime', async () => {
    const cli = new CLI({ name: 'tool', version: '1.0.0' });
    const err = await cli.start().catch((e) => e);
    expect((err as { reason?: string }).reason).toMatch(/ServiceType\.SERVER/);
  });

  it('stop() resolves without throwing', async () => {
    const cli = new CLI({ name: 'tool', version: '1.0.0' });
    await expect(cli.stop()).resolves.toBeUndefined();
  });
});

describe('CLI.registerEntrypoints() — not implemented', () => {
  it('throws an InternalServerError', async () => {
    const cli = new CLI({ name: 'my-cli', version: '0.1.0' });
    const entryPoints: CliApplicationEntryPoints = { commands: [] };

    await expect(cli.registerEntrypoints(entryPoints)).rejects.toBeInstanceOf(InternalServerError);
  });

  it('error message mentions the CLI platform name', async () => {
    const cli = new CLI({ name: 'my-cli', version: '0.1.0' });
    const entryPoints: CliApplicationEntryPoints = { commands: [] };

    const err = await cli.registerEntrypoints(entryPoints).catch((e) => e);
    expect((err as Error).message).toMatch(/my-cli/);
  });
});
