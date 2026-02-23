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
  if (s.querystring != null) req.query = (await s.querystring.parseAsync(req.query)) as ParsedQs;
  if (s.params != null)
    req.params = (await s.params.parseAsync(req.params)) as Record<string, string>;
};
