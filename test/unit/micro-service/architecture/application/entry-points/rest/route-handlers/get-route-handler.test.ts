import { describe, it, expect, vi } from "vitest";
import i18n from "i18n";

import { GetRouteHandler } from "../../../../../../../../src/micro-service/architecture/application";
import {
  createFakeFastifyReply,
  createFakeFastifyRequest,
} from "../../../../../../helpers/common/common";
import { Request } from "../../../../../../../../src/micro-service/architecture/application";

class TestGetRouteHandler extends GetRouteHandler<unknown, string, unknown> {
  async handler(_: unknown, __: unknown): Promise<string> {
    return "Test GET response";
  }
}

describe("GetRouteHandler", () => {
  it("executes GET handler and sends proper response", async () => {
    vi.spyOn(i18n, "__").mockReturnValue("Default success GET");

    const testHandler = new TestGetRouteHandler({
      url: "/get-test",
      schema: {}, // Use an empty schema for test purposes.
    });

    const fakeRequest = createFakeFastifyRequest() as Request<unknown, string>;
    const fakeReply = createFakeFastifyReply();

    await testHandler.execute(fakeRequest, fakeReply);

    expect(fakeReply.code).toHaveBeenCalledWith(200);
    expect(fakeReply.send).toHaveBeenCalledWith({
      ok: true,
      message: "Default success GET",
      data: "Test GET response",
    });
  });
});
