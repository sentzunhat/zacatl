import { readFileSync } from 'fs';

import { parse as parseJsonc, printParseErrorCode, type ParseError } from 'jsonc-parser';

import { BadRequestError, NotFoundError, ValidationError } from '@zacatl/error';
import type { ZodType } from '@zacatl/third-party/zod';
import { isNodeError, isSyntaxError, isZodError } from '@zacatl/utils';

export const loadJSON = <T = unknown>(filePath: string, schema?: ZodType<T>): T => {
  try {
    const content = readFileSync(filePath, 'utf-8');

    // Parse JSONC with proper string-literal awareness using jsonc-parser
    // For .jsonc files, strip comments; for .json, strict JSON only
    let data: unknown;
    const errors: ParseError[] = [];

    if (filePath.endsWith('.jsonc')) {
      data = parseJsonc(content, errors, {
        allowTrailingComma: true,
        allowEmptyContent: false,
      });

      const firstError = errors[0];
      if (firstError !== undefined) {
        throw new SyntaxError(
          `JSONC parse error at offset ${firstError.offset}: ${printParseErrorCode(firstError.error)}`,
        );
      }
    } else {
      data = JSON.parse(content);
    }

    if (schema) {
      return schema.parse(data);
    }

    return data as T;
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      throw new NotFoundError({
        message: `JSON file not found: ${filePath}`,
        component: 'JSONLoader',
        operation: 'loadJSON',
      });
    }

    if (isSyntaxError(error)) {
      throw new BadRequestError({
        message: `Invalid JSON in file: ${filePath}`,
        reason: error.message,
        component: 'JSONLoader',
        operation: 'loadJSON',
      });
    }

    if (isZodError(error)) {
      throw new ValidationError({
        message: `JSON validation failed for file: ${filePath}`,
        reason: "Data doesn't match the expected schema",
        component: 'JSONLoader',
        operation: 'loadJSON',
        metadata: {
          filePath,
          issues: error.issues,
        },
      });
    }

    throw error;
  }
};
