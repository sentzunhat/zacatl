import { describe, it, expect } from 'vitest';

import type { Request } from '../../../../../../../../src/service/layers/application/entry-points/rest/common/request';
import { PutRouteHandler } from '../../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/put-route-handler';
import {
  createFakeFastifyReply,
  createFakeFastifyRequest,
} from '../../../../../../helpers/common/common';

class TestPutRouteHandler extends PutRouteHandler<unknown, string, unknown> {
  async handler(_: unknown): Promise<string> {
    return 'Test PUT response';
  }
}

type MockReply = {
  send: {
    (...args: unknown[]): unknown;
    mock: { calls: unknown[][] };
  };
};

describe('PutRouteHandler', () => {
  it('executes PUT handler and sends raw response by default', async () => {
    const testHandler = new TestPutRouteHandler({
      url: '/put-test',
      schema: {},
    });

    const fakeRequest = createFakeFastifyRequest() as Request<unknown, string>;
    const fakeReply = createFakeFastifyReply() as MockReply;

    await testHandler.execute(fakeRequest, fakeReply as never);

    // Handler sends raw data directly without status code manipulation
    expect(fakeReply.send).toHaveBeenCalledWith('Test PUT response');
  });
});
