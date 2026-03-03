import { describe, it, expect } from 'vitest';

import type { Request } from '../../../../../../../../src/service/layers/application';
import { GetRouteHandler } from '../../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/get-route-handler';
import {
  createFakeFastifyReply,
  createFakeFastifyRequest,
} from '../../../../../../helpers/common/common';

class TestGetRouteHandler extends GetRouteHandler<unknown, string, unknown> {
  async handler(_: unknown): Promise<string> {
    return 'Test GET response';
  }
}

describe('GetRouteHandler', () => {
  it('executes GET handler and sends raw response by default', async () => {
    const testHandler = new TestGetRouteHandler({
      url: '/get-test',
      schema: {},
    });

    const fakeRequest = createFakeFastifyRequest() as Request<unknown, string>;
    const fakeReply = createFakeFastifyReply();

    await testHandler.execute(fakeRequest, fakeReply);

    expect(fakeReply.code).toHaveBeenCalledWith(200);
    // Default behavior: raw data sent, no forced envelope
    expect(fakeReply.send).toHaveBeenCalledWith('Test GET response');
  });
});
