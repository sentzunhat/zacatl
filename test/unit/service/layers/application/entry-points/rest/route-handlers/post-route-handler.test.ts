import { describe, it, expect, vi } from "vitest";
import i18n from "i18n";

import {
  PostRouteHandler,
  Request,
} from "../../../../../../../../src/service/layers/application/entry-points/rest/route-handlers/post-route-handler";
import {
  createFakeFastifyReply,
  createFakeFastifyRequest,
} from "../../../../../../helpers/common/common";

class TestPostRouteHandler extends PostRouteHandler<{}, {}, {}, {}> {
  constructor() {
    super({
      url: "/post-test",
      schema: {}, // Use an empty schema for test purposes.
    });
  }

  handler(_: Request<{}, {}, {}>): {} | Promise<{}> {
    // Dummy implementation
    return {};
  }
}

describe("PostRouteHandler", () => {
  it("executes POST handler and sends proper response", async () => {
    vi.spyOn(i18n, "__").mockReturnValue("Default success POST");

    const testHandler = new TestPostRouteHandler();

    const fakeRequest = createFakeFastifyRequest() as Request<{}, {}, {}>;
    const fakeReply = createFakeFastifyReply();

    await testHandler.execute(fakeRequest, fakeReply);

    expect(fakeReply.code).toHaveBeenCalledWith(200);
    expect(fakeReply.send).toHaveBeenCalledWith({
      ok: true,
      message: "Default success POST",
      data: {},
    });
  });
});
