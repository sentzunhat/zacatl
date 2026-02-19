import { describe, it, expect, vi } from "vitest";

import {
  createFakeFastifyReply,
  createFakeFastifyRequest,
} from "../../../../../../helpers/common/common";
import {
  AbstractRouteHandler,
  Request,
} from "../../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/abstract";

class TestRouteHandler extends AbstractRouteHandler<
  void, // Body
  Record<string, string>, // Querystring
  { id: number; name: string }, // Response type
  void, // Params
  void // Headers
> {
  constructor() {
    super({
      url: "/test",
      schema: {},
      method: "GET",
    });
  }

  async handler(
    _: Request<void, Record<string, string>, void>,
  ): Promise<{ id: number; name: string }> {
    return { id: 1, name: "Test" };
  }
}

class HandlerWithManualReply extends AbstractRouteHandler<
  void,
  void,
  { custom: string },
  void,
  void
> {
  constructor() {
    super({ url: "/manual", schema: {}, method: "POST" });
  }

  async handler(
    _: Request<void, void, void>,
    reply: any,
  ): Promise<{ custom: string }> {
    // Handler sends the reply itself with custom status
    await reply.code(201).send({ custom: "value", manually: true });
    return { custom: "value" };
  }
}

class HandlerWithCustomEnvelope extends TestRouteHandler {
  protected override buildResponse(data: { id: number; name: string }) {
    return { ok: true, message: "Success", data };
  }
}

describe("AbstractRouteHandler", () => {
  it("auto-sends the raw handler return value with status 200", async () => {
    const fakeRequest = createFakeFastifyRequest() as Request<
      void,
      Record<string, string>,
      void
    >;
    const fakeReply: any = createFakeFastifyReply();

    const handler = new TestRouteHandler();
    const result = await handler.execute(fakeRequest, fakeReply);

    expect(result).toEqual({ id: 1, name: "Test" });
    expect(fakeReply.code).toHaveBeenCalledWith(200);
    expect(fakeReply.send).toHaveBeenCalledWith({ id: 1, name: "Test" });
  });

  it("skips auto-send if the handler already sent the reply", async () => {
    const fakeRequest = createFakeFastifyRequest() as any;
    const fakeReply: any = {
      sent: false,
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockImplementation(function (this: any) {
        this.sent = true;
        return this;
      }),
    };

    const handler = new HandlerWithManualReply();
    const result = await handler.execute(fakeRequest, fakeReply);

    // Handler called reply.code(201).send(...) inside handler()
    expect(fakeReply.code).toHaveBeenCalledWith(201);
    expect(fakeReply.send).toHaveBeenCalledWith({
      custom: "value",
      manually: true,
    });

    // execute() should NOT have called reply.code(200).send() again
    expect(fakeReply.code).toHaveBeenCalledTimes(1); // Only the 201 from handler
    expect(result).toEqual({ custom: "value" });
  });

  it("allows overriding buildResponse to wrap the data", async () => {
    const fakeRequest = createFakeFastifyRequest() as Request<
      void,
      Record<string, string>,
      void
    >;
    const fakeReply: any = createFakeFastifyReply();

    const handler = new HandlerWithCustomEnvelope();
    await handler.execute(fakeRequest, fakeReply);

    expect(fakeReply.send).toHaveBeenCalledWith({
      ok: true,
      message: "Success",
      data: { id: 1, name: "Test" },
    });
  });
});
