import { describe, it, expect } from 'vitest';

import type { Request } from '../../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/post-route-handler';
import { PostRouteHandler } from '../../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/post-route-handler';
import {
  createFakeFastifyReply,
  createFakeFastifyRequest,
} from '../../../../../../helpers/common/common';

class TestPostRouteHandler extends PostRouteHandler<{}, {}, { id: number }, {}> {
  constructor() {
    super({
      url: '/post-test',
      schema: {},
    });
  }

  async handler(_: Request<{}, {}, {}>): Promise<{ id: number }> {
    return { id: 1 };
  }
}

describe('PostRouteHandler', () => {
  it('executes POST handler and sends raw response by default', async () => {
    const testHandler = new TestPostRouteHandler();

    const fakeRequest = createFakeFastifyRequest() as Request<{}, {}, {}>;
    const fakeReply = createFakeFastifyReply() as unknown;

    await testHandler.execute(fakeRequest, fakeReply as any);

    const mockReply = fakeReply as Record<string, any>;
    // Handler sends raw data directly without status code manipulation
    expect(mockReply['send']).toHaveBeenCalledWith({ id: 1 });
  });
});
