import { describe, it, expect, vi } from "vitest";
import i18n from "i18n";

import {
  createFakeFastifyReply,
  createFakeFastifyRequest,
} from "../../../../../../helpers/common/common";
import {
  AbstractRouteHandler,
  Request,
} from "../../../../../../../../src/micro-service/architecture/application";

class TestRouteHandler extends AbstractRouteHandler<unknown, string, unknown> {
  async handler(_: unknown, __: unknown): Promise<string> {
    return "Test Data";
  }
}

describe("AbstractRouteHandler", () => {
  it("executes the handler and sends the proper response", async () => {
    vi.spyOn(i18n, "__").mockReturnValue("Default success");

    const fakeRequest = createFakeFastifyRequest() as Request<unknown, string>;

    const fakeReply: any = createFakeFastifyReply();

    const testHandler = new TestRouteHandler({
      url: "/test",
      method: "GET",
      schema: {},
    });

    await testHandler.execute(fakeRequest, fakeReply);

    expect(fakeReply.code).toHaveBeenCalledWith(200);
    expect(fakeReply.send).toHaveBeenCalledWith({
      ok: true,
      message: "Default success",
      data: "Test Data",
    });
  });
});
