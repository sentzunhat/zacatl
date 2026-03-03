import { describe, it, expect, afterEach } from 'vitest';

import { createPinoConfig } from '../../../src/logs/config';

describe('createPinoConfig', () => {
  const originalEnv = process.env['NODE_ENV'];
  const originalLogLevel = process.env['LOG_LEVEL'];

  afterEach(() => {
    if (originalEnv) {
      process.env['NODE_ENV'] = originalEnv;
    } else {
      delete process.env['NODE_ENV'];
    }
    process.env['LOG_LEVEL'] = originalLogLevel;
  });

  it('enables pino-pretty transport in development', () => {
    process.env['NODE_ENV'] = 'development';

    const config = createPinoConfig();

    expect(config.transport).toBeDefined();
    const transport = config.transport as { target?: string } | undefined;
    expect(transport?.target).toBe('pino-pretty');
  });

  it('disables pretty transport in production', () => {
    process.env['NODE_ENV'] = 'production';

    const config = createPinoConfig();

    expect(config.transport).toBeUndefined();
  });

  it('uses LOG_LEVEL env when provided', () => {
    process.env['LOG_LEVEL'] = 'debug';

    const config = createPinoConfig();

    expect(config.level).toBe('debug');
  });
});
