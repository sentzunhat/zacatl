import { describe, it, expect } from 'vitest';

import { applyZodSchema } from '../../../../../../src/service/platforms/server/providers/express/schema-helper';
import { z } from '@zacatl/third-party/zod';

import { createMockExpressRequest } from '../../../../helpers/rest/schema-fixtures';

describe('applyZodSchema()', () => {
  it('is a no-op when schema is null or undefined', async () => {
    const req = createMockExpressRequest({
      body: { raw: true },
      query: { page: '1' },
      params: { id: 'abc' },
    });

    await applyZodSchema(null, req);
    await applyZodSchema(undefined, req);

    expect(req.body).toEqual({ raw: true });
    expect(req.query).toEqual({ page: '1' });
    expect(req.params).toEqual({ id: 'abc' });
  });

  it('parses and replaces request body', async () => {
    const req = createMockExpressRequest({
      body: { name: 'Zacatl', count: '3' },
    });

    await applyZodSchema(
      {
        body: z.object({
          name: z.string(),
          count: z.coerce.number(),
        }),
      },
      req,
    );

    expect(req.body).toEqual({ name: 'Zacatl', count: 3 });
  });

  it('parses and replaces querystring values', async () => {
    const req = createMockExpressRequest({
      query: { page: '2', active: 'true' },
    });

    await applyZodSchema(
      {
        querystring: z.object({
          page: z.coerce.number().int().positive(),
          active: z.coerce.boolean(),
        }),
      },
      req,
    );

    expect(req.query).toEqual({ page: 2, active: true });
  });

  it('parses and replaces route params', async () => {
    const req = createMockExpressRequest({
      params: { id: '42' },
    });

    await applyZodSchema(
      {
        params: z.object({
          id: z.coerce.number(),
        }),
      },
      req,
    );

    expect(req.params).toEqual({ id: 42 });
  });

  it('parses body, querystring, and params together', async () => {
    const req = createMockExpressRequest({
      body: { title: 'Hello' },
      query: { limit: '10' },
      params: { slug: 'greeting' },
    });

    await applyZodSchema(
      {
        body: z.object({ title: z.string().min(1) }),
        querystring: z.object({ limit: z.coerce.number().max(100) }),
        params: z.object({ slug: z.string() }),
      },
      req,
    );

    expect(req.body).toEqual({ title: 'Hello' });
    expect(req.query).toEqual({ limit: 10 });
    expect(req.params).toEqual({ slug: 'greeting' });
  });

  it('does not parse query or params when they are omitted from the schema', async () => {
    const req = createMockExpressRequest({
      body: { name: 'Zacatl' },
      query: { keep: 'me' },
      params: { id: '1' },
    });

    await applyZodSchema(
      {
        body: z.object({ name: z.string() }),
      },
      req,
    );

    expect(req.body).toEqual({ name: 'Zacatl' });
    expect(req.query).toEqual({ keep: 'me' });
    expect(req.params).toEqual({ id: '1' });
  });

  it('propagates Zod validation errors from body parsing', async () => {
    const req = createMockExpressRequest({
      body: { name: 123 },
    });

    await expect(
      applyZodSchema({ body: z.object({ name: z.string() }) }, req),
    ).rejects.toThrow();
  });

  it('propagates Zod validation errors from querystring parsing', async () => {
    const req = createMockExpressRequest({
      query: { page: 'not-a-number' },
    });

    await expect(
      applyZodSchema(
        { querystring: z.object({ page: z.coerce.number().int() }) },
        req,
      ),
    ).rejects.toThrow();
  });
});
