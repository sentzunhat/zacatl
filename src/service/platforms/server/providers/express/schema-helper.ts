import type { Request } from 'express';
import type { ParsedQs } from 'qs';

import { BadRequestError } from '@zacatl/error';
import { z } from '@zacatl/third-party/zod';

interface RouteSchema {
  body?: { parseAsync: (input: unknown) => Promise<unknown> };
  querystring?: { parseAsync: (input: unknown) => Promise<unknown> };
  params?: { parseAsync: (input: unknown) => Promise<unknown> };
}

type ValidationContext = 'body' | 'querystring' | 'params';

/**
 * Raised when a request fails its route schema on Express.
 *
 * Carries `statusCode` / `status` 400 so Express's default error handler and
 * app error handlers that read `err.statusCode` answer 400 Bad Request, like
 * Fastify does for the same request. The message follows Fastify's
 * `<context>/<path> <issue>` format.
 */
export class RequestValidationError extends BadRequestError {
  public readonly statusCode = 400;
  public readonly status = 400;
  public readonly validationContext: ValidationContext;
  public readonly validation: z.ZodError['issues'];

  constructor(context: ValidationContext, error: z.ZodError) {
    super({
      message: error.issues
        .map((issue) => `${[context, ...issue.path.map(String)].join('/')} ${issue.message}`)
        .join(', '),
      reason: 'Request failed schema validation',
      metadata: { validationContext: context, validation: error.issues },
      error,
    });
    this.validationContext = context;
    this.validation = error.issues;
  }
}

const parse = async (
  context: ValidationContext,
  schema: { parseAsync: (input: unknown) => Promise<unknown> },
  input: unknown,
): Promise<unknown> => {
  try {
    return await schema.parseAsync(input);
  } catch (error) {
    if (error instanceof z.ZodError) throw new RequestValidationError(context, error);
    throw error;
  }
};

export const applyZodSchema = async (schema: unknown, req: Request): Promise<void> => {
  if (schema == null) return;
  const s = schema as RouteSchema;
  if (s.body != null) req.body = await parse('body', s.body, req.body);
  if (s.querystring != null) {
    const parsedQuery = (await parse('querystring', s.querystring, req.query)) as ParsedQs;
    // Express 5's `req.query` is a getter-only accessor on the prototype —
    // plain assignment throws "Cannot set property query of #<IncomingMessage>
    // which has only a getter". Object.defineProperty creates a writable own
    // property on this request instance that shadows the prototype accessor.
    Object.defineProperty(req, 'query', {
      value: parsedQuery,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
  if (s.params != null)
    req.params = (await parse('params', s.params, req.params)) as Record<string, string>;
};
