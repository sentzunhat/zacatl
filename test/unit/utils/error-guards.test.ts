import { describe, it, expect } from 'vitest';
import {
  isError,
  isZodError,
  isCustomError,
  isNodeError,
  isSyntaxError,
} from '../../../src/utils/error-guards';
import { CustomError } from '../../../src/error/custom';
import { z } from '../../../src/third-party/zod';

describe('Error Guard Utilities', () => {
  describe('isError()', () => {
    it('should identify standard Error instances', () => {
      const err = new Error('Test error');
      expect(isError(err)).toBe(true);
    });

    it('should identify TypeError instances', () => {
      const err = new TypeError('Type error');
      expect(isError(err)).toBe(true);
    });

    it('should identify ReferenceError instances', () => {
      const err = new ReferenceError('Reference error');
      expect(isError(err)).toBe(true);
    });

    it('should reject null', () => {
      expect(isError(null)).toBe(false);
    });

    it('should reject undefined', () => {
      expect(isError(undefined)).toBe(false);
    });

    it('should reject plain objects', () => {
      expect(isError({})).toBe(false);
    });

    it('should reject strings', () => {
      expect(isError('error')).toBe(false);
    });

    it('should reject numbers', () => {
      expect(isError(123)).toBe(false);
    });

    it('should identify SyntaxError', () => {
      try {
        JSON.parse('invalid json');
      } catch (err) {
        expect(isError(err)).toBe(true);
      }
    });
  });

  describe('isZodError()', () => {
    it('should identify ZodError from schema validation', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const result = schema.safeParse({ name: 'John', age: 'not a number' });

      if (!result.success) {
        expect(isZodError(result.error)).toBe(true);
      }
    });

    it('should identify ZodError with multiple validation failures', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      const result = schema.safeParse({
        email: 'invalid-email',
        age: 10,
      });

      if (!result.success) {
        expect(isZodError(result.error)).toBe(true);
      }
    });

    it('should reject regular Error instances', () => {
      const err = new Error('Regular error');
      expect(isZodError(err)).toBe(false);
    });

    it('should reject plain objects without ZodError structure', () => {
      expect(isZodError({ name: 'CustomError' })).toBe(false);
    });

    it('should reject null', () => {
      expect(isZodError(null)).toBe(false);
    });

    it('should reject undefined', () => {
      expect(isZodError(undefined)).toBe(false);
    });

    it('should reject objects with name field but not ZodError', () => {
      expect(isZodError({ name: 'CustomError' })).toBe(false);
    });
  });

  describe('isCustomError()', () => {
    it('should identify CustomError instances', () => {
      const err = new CustomError({
        code: 500,
        message: 'Test error',
      });
      expect(isCustomError(err)).toBe(true);
    });

    it('should identify CustomError with correlation ID', () => {
      const err = new CustomError({
        code: 400,
        message: 'Validation failed',
        reason: 'test-reason',
      });
      expect(isCustomError(err)).toBe(true);
    });

    it('should identify CustomError with metadata', () => {
      const err = new CustomError({
        code: 401,
        message: 'Auth failed',
        metadata: { reason: 'invalid_token' },
      });
      expect(isCustomError(err)).toBe(true);
    });

    it('should reject regular Error instances', () => {
      const err = new Error('Regular error');
      expect(isCustomError(err)).toBe(false);
    });

    it('should reject objects with code but not Error instances', () => {
      expect(isCustomError({ code: 500, message: 'error' })).toBe(false);
    });

    it('should reject null', () => {
      expect(isCustomError(null)).toBe(false);
    });

    it('should reject undefined', () => {
      expect(isCustomError(undefined)).toBe(false);
    });

    it('should reject plain objects', () => {
      expect(isCustomError({})).toBe(false);
    });
  });

  describe('isNodeError()', () => {
    it('should identify Node.js filesystem errors', () => {
      const err = new Error('ENOENT: no such file or directory');
      Object.assign(err, { code: 'ENOENT', errno: -2, syscall: 'open' });
      expect(isNodeError(err)).toBe(true);
    });

    it('should identify Error with code property', () => {
      const err = new Error('Error');
      Object.assign(err, { code: 'ERR_SOMETHING' });
      expect(isNodeError(err)).toBe(true);
    });

    it('should identify Error with errno property', () => {
      // isNodeError only checks for 'code' in error
      const err = new Error('Error');
      Object.assign(err, { code: 'EACCES', errno: -1 });
      expect(isNodeError(err)).toBe(true);
    });

    it('should identify Error with syscall property', () => {
      // isNodeError only checks for 'code' in error
      const err = new Error('Error');
      Object.assign(err, { code: 'ENOENT', syscall: 'read' });
      expect(isNodeError(err)).toBe(true);
    });

    it('should reject regular Error without properties', () => {
      const err = new Error('Regular error');
      expect(isNodeError(err)).toBe(false);
    });

    it('should reject non-Error objects with code property', () => {
      expect(isNodeError({ code: 'ERR_SOMETHING' })).toBe(false);
    });

    it('should reject null', () => {
      expect(isNodeError(null)).toBe(false);
    });

    it('should reject undefined', () => {
      expect(isNodeError(undefined)).toBe(false);
    });

    it('should handle combined error properties', () => {
      const err = new Error('Multi-property error');
      Object.assign(err, {
        code: 'EACCES',
        errno: -13,
        syscall: 'write',
      });
      expect(isNodeError(err)).toBe(true);
    });
  });

  describe('isSyntaxError()', () => {
    it('should identify SyntaxError from JSON parsing', () => {
      try {
        JSON.parse('{ invalid json }');
      } catch (err) {
        expect(isSyntaxError(err)).toBe(true);
      }
    });

    it('should identify manually created SyntaxError', () => {
      const err = new SyntaxError('Unexpected token');
      expect(isSyntaxError(err)).toBe(true);
    });

    it('should reject regular Error', () => {
      const err = new Error('Regular error');
      expect(isSyntaxError(err)).toBe(false);
    });

    it('should reject TypeError', () => {
      const err = new TypeError('Type error');
      expect(isSyntaxError(err)).toBe(false);
    });
    it('should reject null', () => {
      expect(isSyntaxError(null)).toBe(false);
    });

    it('should reject undefined', () => {
      expect(isSyntaxError(undefined)).toBe(false);
    });

    it('should reject plain objects', () => {
      expect(isSyntaxError({})).toBe(false);
    });

    it('should identify SyntaxError with custom message', () => {
      const err = new SyntaxError('Custom syntax error message');
      expect(isSyntaxError(err)).toBe(true);
    });
  });

  describe('Error guard combinations', () => {
    it('should identify CustomError and reject as ZodError', () => {
      const err = new CustomError({
        code: 500,
        message: 'Error',
      });
      expect(isCustomError(err)).toBe(true);
      expect(isZodError(err)).toBe(false);
    });
    it('should handle error chains', () => {
      const originalErr = new Error('Original error');
      const wrappedErr = new CustomError({
        code: 500,
        message: 'Wrapped error',
        error: originalErr,
      });

      expect(isError(originalErr)).toBe(true);
      expect(isCustomError(wrappedErr)).toBe(true);
      expect(isZodError(wrappedErr)).toBe(false);
    });

    it('should correctly identify various error types in array', () => {
      const errors = [
        new Error('Regular error'),
        new SyntaxError('Syntax error'),
        new CustomError({
          code: 400,
          message: 'Custom',
        }),
      ];

      const regular = errors.filter(isError);
      const syntax = errors.filter(isSyntaxError);
      const custom = errors.filter(isCustomError);

      expect(regular.length).toBe(3);
      expect(syntax.length).toBe(1);
      expect(custom.length).toBe(1);
    });
  });
});
