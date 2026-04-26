import type { Request } from 'express';

import { z } from '@zacatl/third-party/zod';

/** Reusable inner data schema for envelope and route validation tests. */
export const greetingDataSchema = z.object({
  id: z.string(),
  name: z.string(),
});

/** Sample valid envelope payload built from {@link greetingDataSchema}. */
export const validGreetingEnvelope = {
  ok: true,
  message: 'Success',
  data: { id: '1', name: 'Zacatl' },
} as const;

export type MockExpressRequestParts = {
  body?: unknown;
  query?: unknown;
  params?: unknown;
};

/** Minimal Express `Request` stub for schema-helper tests. */
export const createMockExpressRequest = (
  parts: MockExpressRequestParts = {},
): Request =>
  ({
    body: parts.body ?? {},
    query: parts.query ?? {},
    params: parts.params ?? {},
  }) as Request;
