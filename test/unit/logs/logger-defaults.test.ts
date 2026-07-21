import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createLogger, pinoLogger } from '../../../src/logs/pino/default';
import { consoleLogger } from '../../../src/logs/console/default';
import { PinoLoggerAdapter } from '../../../src/logs/pino/adapter';
import { ConsoleLoggerAdapter } from '../../../src/logs/console/adapter';

describe('createLogger()', () => {
  it('returns a Logger that delegates to the provided adapter', () => {
    const adapter = { log: vi.fn(), info: vi.fn(), trace: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn() };
    const logger = createLogger(adapter);

    logger.log('log');
    logger.info('info');
    logger.trace('trace');
    logger.warn('warn');
    logger.error('error');
    logger.fatal('fatal');

    expect(adapter.log).toHaveBeenCalledWith('log', undefined);
    expect(adapter.info).toHaveBeenCalledWith('info', undefined);
    expect(adapter.trace).toHaveBeenCalledWith('trace', undefined);
    expect(adapter.warn).toHaveBeenCalledWith('warn', undefined);
    expect(adapter.error).toHaveBeenCalledWith('error', undefined);
    expect(adapter.fatal).toHaveBeenCalledWith('fatal', undefined);
  });

  it('defaults to PinoLoggerAdapter when no adapter is provided', () => {
    const logger = createLogger();
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
  });
});

describe('pinoLogger (default export)', () => {
  beforeEach(() => {
    vi.spyOn(PinoLoggerAdapter.prototype, 'log').mockImplementation(vi.fn());
    vi.spyOn(PinoLoggerAdapter.prototype, 'info').mockImplementation(vi.fn());
    vi.spyOn(PinoLoggerAdapter.prototype, 'trace').mockImplementation(vi.fn());
    vi.spyOn(PinoLoggerAdapter.prototype, 'warn').mockImplementation(vi.fn());
    vi.spyOn(PinoLoggerAdapter.prototype, 'error').mockImplementation(vi.fn());
    vi.spyOn(PinoLoggerAdapter.prototype, 'fatal').mockImplementation(vi.fn());
  });

  it('delegates each method to the underlying PinoLoggerAdapter', () => {
    pinoLogger.log('a');
    pinoLogger.info('b');
    pinoLogger.trace('c');
    pinoLogger.warn('d');
    pinoLogger.error('e');
    pinoLogger.fatal('f');

    expect(PinoLoggerAdapter.prototype.log).toHaveBeenCalledWith('a', undefined);
    expect(PinoLoggerAdapter.prototype.info).toHaveBeenCalledWith('b', undefined);
    expect(PinoLoggerAdapter.prototype.trace).toHaveBeenCalledWith('c', undefined);
    expect(PinoLoggerAdapter.prototype.warn).toHaveBeenCalledWith('d', undefined);
    expect(PinoLoggerAdapter.prototype.error).toHaveBeenCalledWith('e', undefined);
    expect(PinoLoggerAdapter.prototype.fatal).toHaveBeenCalledWith('f', undefined);
  });
});

describe('consoleLogger (default export)', () => {
  beforeEach(() => {
    vi.spyOn(ConsoleLoggerAdapter.prototype, 'log').mockImplementation(vi.fn());
    vi.spyOn(ConsoleLoggerAdapter.prototype, 'info').mockImplementation(vi.fn());
    vi.spyOn(ConsoleLoggerAdapter.prototype, 'trace').mockImplementation(vi.fn());
    vi.spyOn(ConsoleLoggerAdapter.prototype, 'warn').mockImplementation(vi.fn());
    vi.spyOn(ConsoleLoggerAdapter.prototype, 'error').mockImplementation(vi.fn());
    vi.spyOn(ConsoleLoggerAdapter.prototype, 'fatal').mockImplementation(vi.fn());
  });

  it('delegates each method to the underlying ConsoleLoggerAdapter', () => {
    consoleLogger.log('a');
    consoleLogger.info('b');
    consoleLogger.trace('c');
    consoleLogger.warn('d');
    consoleLogger.error('e');
    consoleLogger.fatal('f');

    expect(ConsoleLoggerAdapter.prototype.log).toHaveBeenCalledWith('a', undefined);
    expect(ConsoleLoggerAdapter.prototype.info).toHaveBeenCalledWith('b', undefined);
    expect(ConsoleLoggerAdapter.prototype.trace).toHaveBeenCalledWith('c', undefined);
    expect(ConsoleLoggerAdapter.prototype.warn).toHaveBeenCalledWith('d', undefined);
    expect(ConsoleLoggerAdapter.prototype.error).toHaveBeenCalledWith('e', undefined);
    expect(ConsoleLoggerAdapter.prototype.fatal).toHaveBeenCalledWith('f', undefined);
  });
});
