import { describe, it, expect } from 'vitest';

import type { Request } from '../../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/post-route-handler';
import { PostRouteHandler } from '../../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/post-route-handler';
import {
  createFakeFastifyReply,
  createFakeFastifyRequest,
} from '../../../../../../helpers/common/common';

type EmptyObject = Record<string, never>;
type PostRequest = Request<EmptyObject, EmptyObject, EmptyObject>;
type MockReply = {
  send: {
    (...args: unknown[]): unknown;
    mock: { calls: unknown[][] };
  };
};

class TestPostRouteHandler extends PostRouteHandler<
  EmptyObject,
  EmptyObject,
  { id: number },
  EmptyObject
> {
  constructor() {
    super({
      url: '/post-test',
      schema: {},
    });
  }

  async handler(_: PostRequest): Promise<{ id: number }> {
    return { id: 1 };
  }
}

describe('PostRouteHandler', () => {
  it('executes POST handler and sends raw response by default', async () => {
    const testHandler = new TestPostRouteHandler();

    const fakeRequest = createFakeFastifyRequest() as PostRequest;
    const fakeReply = createFakeFastifyReply() as MockReply;

    await testHandler.execute(fakeRequest, fakeReply as never);

    // Handler sends raw data directly without status code manipulation
    expect(fakeReply.send).toHaveBeenCalledWith({ id: 1 });
  });
});
