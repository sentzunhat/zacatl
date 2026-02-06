import { describe, it, expect, vi } from "vitest";
import i18n from "i18n";

import {
  createFakeFastifyReply,
  createFakeFastifyRequest,
} from "../../../../../../helpers/common/common";
import {
  AbstractRouteHandler,
  Request,
} from "../../../../../../../../src/service/layers/application/entry-points/rest/route-handlers/abstract";

class TestRouteHandler extends AbstractRouteHandler<
  void, // Body
  Record<string, string>, // Querystring
  void, // Params
  void // Response
> {
  constructor() {
    super({
      url: "/",
      schema: {},
      method: "GET",
    });
  }

  handler(
    _: Request<
      void, // Body
      Record<string, string>, // Querystring
      void // Params
    >,
  ): void | Promise<void> {
    // Dummy implementation
    return;
  }
}

describe("AbstractRouteHandler", () => {
  it("executes the handler and sends the proper response", async () => {
    vi.spyOn(i18n, "__").mockReturnValue("Default success");

    const fakeRequest = createFakeFastifyRequest() as Request<
      void, // Body
      Record<string, string>, // Querystring
      void // Params
    >;

    const fakeReply: any = createFakeFastifyReply();

    const testHandler = new TestRouteHandler();

    await testHandler.execute(fakeRequest, fakeReply);

    expect(fakeReply.code).toHaveBeenCalledWith(200);
    expect(fakeReply.send).toHaveBeenCalledWith({
      ok: true,
      message: "Default success",
      data: undefined,
    });
  });
});
