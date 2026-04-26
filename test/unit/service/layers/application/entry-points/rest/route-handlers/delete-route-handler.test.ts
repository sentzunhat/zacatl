import { describe, it, expect } from 'vitest';

import type { Request } from '../../../../../../../../src/service/layers/application/entry-points/rest/common/request';
import { DeleteRouteHandler } from '../../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/delete-route-handler';
import {
  createFakeFastifyReply,
  createFakeFastifyRequest,
} from '../../../../../../helpers/common/common';

class TestDeleteRouteHandler extends DeleteRouteHandler<unknown, string, unknown> {
  async handler(_: unknown): Promise<string> {
    return 'Test DELETE response';
  }
}

type MockReply = {
  send: {
    (...args: unknown[]): unknown;
    mock: { calls: unknown[][] };
  };
};

describe('DeleteRouteHandler', () => {
  it('executes DELETE handler and sends raw response by default', async () => {
    const testHandler = new TestDeleteRouteHandler({
      url: '/delete-test',
      schema: {},
    });

    const fakeRequest = createFakeFastifyRequest() as Request<unknown, string>;
    const fakeReply = createFakeFastifyReply() as MockReply;

    await testHandler.execute(fakeRequest, fakeReply as never);

    // Handler sends raw data directly without status code manipulation
    expect(fakeReply.send).toHaveBeenCalledWith('Test DELETE response');
  });
});
