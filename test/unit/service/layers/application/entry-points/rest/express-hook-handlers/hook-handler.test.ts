import { describe, expect, it } from 'vitest';

import type { HookHandler } from '../../../../../../../../src/service/layers/application/entry-points/rest/express/hook-handlers/hook-handler';

describe('Express HookHandler', () => {
  it('accepts an onRequest hook typed against Express Request/Response without casts', async () => {
    const calls: string[] = [];

    const hook: HookHandler = {
      name: 'onRequest',
      execute: async (request, reply) => {
        calls.push(`${request.method ?? 'unknown'}:${reply.statusCode ?? 0}`);
      },
    };

    await hook.execute(
      { method: 'GET' } as unknown as Parameters<HookHandler['execute']>[0],
      { statusCode: 200 } as unknown as Parameters<HookHandler['execute']>[1],
    );

    expect(hook.name).toBe('onRequest');
    expect(calls).toEqual(['GET:200']);
  });

  it('supports the preHandler hook name', () => {
    const hook: HookHandler = {
      name: 'preHandler',
      execute: async () => {
        return;
      },
    };

    expect(hook.name).toBe('preHandler');
  });
});
