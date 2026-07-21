import { describe, expect, it } from 'vitest';

import { CustomError } from '../../../src/error/custom';

describe('CustomError', () => {
  class TestError extends CustomError {}

  it('should generate a correlationId if not provided', () => {
    const error = new TestError({ message: 'Something went wrong' });

    expect(error.correlationId).toBeDefined();
    expect(typeof error.correlationId).toBe('string');
    expect(error.correlationId.length).toBeGreaterThan(0);
    // It should be different from id when generated
    expect(error.correlationId).not.toBe(error.id);
  });

  it('should use the provided correlationId', () => {
    const customCorrelationId = 'req-12345';
    const error = new TestError({
      message: 'Something went wrong',
      correlationId: customCorrelationId,
    });

    expect(error.correlationId).toBe(customCorrelationId);
    // Should not match ID since ID is always random uuid
    expect(error.correlationId).not.toBe(error.id);
  });

  it('toJSON() should expose only the concise public shape', () => {
    const metadata = { user: 'u1' };
    const error = new TestError({
      message: 'Test message',
      code: 400,
      reason: 'Bad Input',
      metadata,
    });

    const json = error.toJSON();

    expect(json).toEqual({
      message: 'Test message',
      code: 400,
      correlationId: error.correlationId,
    });
  });

  it('toJSON() should redact internal 5xx messages and diagnostic data', () => {
    const originalError = new Error('password=secret at /private/app/database.ts');
    const error = new TestError({
      message: 'Database failed at /private/app/database.ts',
      code: 500,
      reason: 'password=secret',
      metadata: { password: 'secret', path: '/private/app/database.ts' },
      error: originalError,
      component: 'Database',
      operation: 'connect',
    });

    const serialized = JSON.stringify(error);
    expect(error.toJSON()).toEqual({
      message: 'Internal Server Error',
      code: 500,
      correlationId: error.correlationId,
    });
    expect(serialized).not.toContain('secret');
    expect(serialized).not.toContain('/private/app');
    expect(serialized).not.toContain('stack');
    expect(serialized).not.toContain('Database');
  });

  it('toDiagnosticJSON() should retain trusted logging context', () => {
    const originalError = new Error('Database failed');
    const error = new TestError({
      message: 'Wrap error',
      reason: 'CONNECTION_FAILED',
      metadata: { database: 'primary' },
      error: originalError,
      component: 'Database',
      operation: 'connect',
    });

    const diagnostic = error.toDiagnosticJSON();
    expect(diagnostic.error?.message).toBe('Database failed');
    expect(diagnostic.error?.stack).toBeDefined();
    expect(diagnostic.metadata).toEqual({ database: 'primary' });
    expect(diagnostic.reason).toBe('CONNECTION_FAILED');
    expect(diagnostic.component).toBe('Database');
    expect(diagnostic.operation).toBe('connect');
    expect(diagnostic.stack).toBeDefined();
  });

  it('toString() should be formatted correctly with all details', () => {
    const error = new TestError({
      message: 'Test message',
      code: 500,
      correlationId: '123',
      metadata: { role: 'admin' },
    });

    const str = error.toString();

    expect(str).toContain('TestError: Test message');
    expect(str).toContain('CorrelationId: 123');
    expect(str).toContain('Code: 500');
    expect(str).toContain('Metadata: {\n  "role": "admin"\n}');
    expect(str).toContain('['); // Timestamp bracket
    expect(str).toContain(']');
  });
});
