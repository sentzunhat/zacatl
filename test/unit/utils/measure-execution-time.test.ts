import { describe, it, expect, vi, beforeEach } from 'vitest';

const infoMock = vi.hoisted(() => vi.fn());

vi.mock('@zacatl/logs', () => ({
  logger: { info: infoMock },
}));

import { measureExecutionTime } from '../../../src/utils/measure-execution-time';

describe('measureExecutionTime()', () => {
  beforeEach(() => {
    infoMock.mockClear();
  });

  it('executes the callback and logs start/end messages by default', async () => {
    const fn = vi.fn(async () => {});

    await measureExecutionTime({ name: 'my-process', fn });

    expect(fn).toHaveBeenCalledOnce();
    expect(infoMock).toHaveBeenCalledTimes(2);
    expect(infoMock.mock.calls[0]![0]).toContain('[my-process] Started');
    expect(infoMock.mock.calls[1]![0]).toMatch(/\[my-process\] Completed in \d+\.\d{2}ms/);
  });

  it('displays duration in seconds when >= 1000ms', async () => {
    const fn = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    });

    await measureExecutionTime({ name: 'long-process', fn });

    expect(fn).toHaveBeenCalledOnce();
    expect(infoMock).toHaveBeenCalledTimes(2);
    expect(infoMock.mock.calls[1]![0]).toMatch(
      /\[long-process\] Completed in \d+\.\d{3}s \(\d+\.\d{2}ms\)/,
    );
  });

  it('skips all log output when silent is true', async () => {
    const fn = vi.fn(async () => {});

    await measureExecutionTime({ name: 'silent-process', fn, silent: true });

    expect(fn).toHaveBeenCalledOnce();
    expect(infoMock).not.toHaveBeenCalled();
  });

  it('propagates errors thrown by the callback', async () => {
    const err = new Error('boom');

    await expect(
      measureExecutionTime({
        name: 'failing-process',
        fn: async () => {
          throw err;
        },
      }),
    ).rejects.toThrow('boom');
  });
});
