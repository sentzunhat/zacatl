import { describe, it, expect } from 'vitest';

import { BadRequestError } from '../../../src/error/bad-request';
import { BadResourceError } from '../../../src/error/bad-resource';
import { ForbiddenError } from '../../../src/error/forbidden';
import { InternalServerError } from '../../../src/error/internal-server';
import { NotFoundError } from '../../../src/error/not-found';
import { UnauthorizedError } from '../../../src/error/unauthorized';
import { ValidationError } from '../../../src/error/validation';

describe('Error Types', () => {
  const commonArgs = {
    message: 'Test message',
    reason: 'Test reason',
    metadata: { key: 'value' },
  };

  it('BadRequestError should have code 400', () => {
    const error = new BadRequestError(commonArgs);
    expect(error.code).toBe(400);
    expect(error.message).toBe(commonArgs.message);
    expect(error.reason).toBe(commonArgs.reason);
    expect(error.metadata).toEqual(commonArgs.metadata);
  });

  it('BadResourceError should have code 400', () => {
    const error = new BadResourceError(commonArgs);
    expect(error.code).toBe(400);
    expect(error.message).toBe(commonArgs.message);
  });

  it('ForbiddenError should have code 403', () => {
    const error = new ForbiddenError(commonArgs);
    expect(error.code).toBe(403);
    expect(error.message).toBe(commonArgs.message);
  });

  it('InternalServerError should have code 500', () => {
    const error = new InternalServerError(commonArgs);
    expect(error.code).toBe(500);
    expect(error.message).toBe(commonArgs.message);
  });

  it('NotFoundError should have code 404', () => {
    const error = new NotFoundError(commonArgs);
    expect(error.code).toBe(404);
    expect(error.message).toBe(commonArgs.message);
  });

  it('UnauthorizedError should have code 401', () => {
    const error = new UnauthorizedError(commonArgs);
    expect(error.code).toBe(401);
    expect(error.message).toBe(commonArgs.message);
  });

  it('ValidationError should have code 422', () => {
    const error = new ValidationError(commonArgs);
    expect(error.code).toBe(422);
    expect(error.message).toBe(commonArgs.message);
  });
});
