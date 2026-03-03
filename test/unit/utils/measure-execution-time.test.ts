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
    const callback = vi.fn(async () => {});

    await measureExecutionTime('my-process', callback);

    expect(callback).toHaveBeenCalledOnce();
    expect(infoMock).toHaveBeenCalledTimes(2);
    expect(infoMock.mock.calls[0]![0]).toContain('my-process execution started');
    expect(infoMock.mock.calls[1]![0]).toMatch(/my-process execution time: \d+\.\d{2} ms/);
  });

  it('skips all log output when skipOutput is true', async () => {
    const callback = vi.fn(async () => {});

    await measureExecutionTime('silent-process', callback, true);

    expect(callback).toHaveBeenCalledOnce();
    expect(infoMock).not.toHaveBeenCalled();
  });

  it('propagates errors thrown by the callback', async () => {
    const err = new Error('boom');

    await expect(
      measureExecutionTime('failing-process', async () => {
        throw err;
      }),
    ).rejects.toThrow('boom');
  });
});
