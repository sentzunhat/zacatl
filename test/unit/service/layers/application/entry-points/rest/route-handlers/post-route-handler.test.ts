import { describe, it, expect } from "vitest";

import {
  PostRouteHandler,
  Request,
} from "../../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/post-route-handler";
import {
  createFakeFastifyReply,
  createFakeFastifyRequest,
} from "../../../../../../helpers/common/common";

class TestPostRouteHandler extends PostRouteHandler<
  {},
  {},
  { id: number },
  {}
> {
  constructor() {
    super({
      url: "/post-test",
      schema: {},
    });
  }

  async handler(_: Request<{}, {}, {}>): Promise<{ id: number }> {
    return { id: 1 };
  }
}

describe("PostRouteHandler", () => {
  it("executes POST handler and sends raw response by default", async () => {
    const testHandler = new TestPostRouteHandler();

    const fakeRequest = createFakeFastifyRequest() as Request<{}, {}, {}>;
    const fakeReply = createFakeFastifyReply();

    await testHandler.execute(fakeRequest, fakeReply);

    expect(fakeReply.code).toHaveBeenCalledWith(200);
    // Default behavior: raw data sent, no forced envelope
    expect(fakeReply.send).toHaveBeenCalledWith({ id: 1 });
  });
});
