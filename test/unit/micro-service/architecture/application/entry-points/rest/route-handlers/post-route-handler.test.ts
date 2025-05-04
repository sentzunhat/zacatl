import { describe, it, expect, vi } from "vitest";
import i18n from "i18n";

import {
  PostRouteHandler,
  Request,
} from "../../../../../../../../src/micro-service/architecture/application";
import {
  createFakeFastifyReply,
  createFakeFastifyRequest,
} from "../../../../../../helpers/common/common";

class TestPostRouteHandler extends PostRouteHandler<unknown, string, unknown> {
  async handler(_: unknown, __: unknown): Promise<string> {
    return "Test POST response";
  }
}

describe("PostRouteHandler", () => {
  it("executes POST handler and sends proper response", async () => {
    vi.spyOn(i18n, "__").mockReturnValue("Default success POST");

    const testHandler = new TestPostRouteHandler({
      url: "/post-test",
      schema: {}, // Use an empty schema for test purposes.
    });

    const fakeRequest = createFakeFastifyRequest() as Request<unknown, string>;
    const fakeReply = createFakeFastifyReply();

    await testHandler.execute(fakeRequest, fakeReply);

    expect(fakeReply.code).toHaveBeenCalledWith(200);
    expect(fakeReply.send).toHaveBeenCalledWith({
      ok: true,
      message: "Default success POST",
      data: "Test POST response",
    });
  });
});
