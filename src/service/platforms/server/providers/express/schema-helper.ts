import type { Request } from 'express';
import type { ParsedQs } from 'qs';

interface RouteSchema {
  body?: { parseAsync: (input: unknown) => Promise<unknown> };
  querystring?: { parseAsync: (input: unknown) => Promise<unknown> };
  params?: { parseAsync: (input: unknown) => Promise<unknown> };
}

export const applyZodSchema = async (schema: unknown, req: Request): Promise<void> => {
  if (schema == null) return;
  const s = schema as RouteSchema;
  if (s.body != null) req.body = await s.body.parseAsync(req.body);
  if (s.querystring != null) {
    const parsedQuery = (await s.querystring.parseAsync(req.query)) as ParsedQs;
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
    req.params = (await s.params.parseAsync(req.params)) as Record<string, string>;
};
