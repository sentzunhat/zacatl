import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ConsoleLoggerAdapter } from '../../../src/logs/adapters/console';

describe('ConsoleLoggerAdapter', () => {
  let spyLog: ReturnType<typeof vi.spyOn>;
  let spyWarn: ReturnType<typeof vi.spyOn>;
  let spyError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    spyLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    spyWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    spyError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('logs info with structured data', () => {
    const adapter = new ConsoleLoggerAdapter({
      colors: false,
      timestamps: true,
    });

    adapter.info('hello', { data: { foo: 1 }, details: { bar: 2 } });

    expect(spyLog).toHaveBeenCalledTimes(1);
    const output = spyLog.mock.calls[0]?.[0] ?? '';
    expect(output).toContain('[INFO]');
    expect(output).toContain('hello');
    expect(output).toContain('"data":{"foo":1}');
    expect(output).toContain('"details":{"bar":2}');
  });

  it('omits color codes when disabled', () => {
    const adapter = new ConsoleLoggerAdapter({ colors: false });

    adapter.warn('no-colors');

    const output = spyWarn.mock.calls[0]?.[0] ?? '';
    expect(output).not.toContain('\u001b');
  });

  it('routes error and fatal to console.error', () => {
    const adapter = new ConsoleLoggerAdapter({ colors: false });

    adapter.error('boom');
    adapter.fatal('really-boom');

    expect(spyError).toHaveBeenCalledTimes(2);
    expect(spyError.mock.calls[0]?.[0]).toContain('boom');
    expect(spyError.mock.calls[1]?.[0]).toContain('really-boom');
  });
});
