import { describe, it, expect } from "vitest";
import { FastifyRequest } from "fastify";

import {
  AbstractRouteHandler,
  Application,
  ConfigApplication,
  HookHandler,
  HookHandlerName,
  Request,
} from "../../../../../src/micro-service/architecture/application";

class DummyHookHandler implements HookHandler {
  public name: HookHandlerName = "onRequest";

  async execute(_: FastifyRequest): Promise<void> {}
}

import { FastifyReply } from "fastify";

class DummyRouteHandler extends AbstractRouteHandler<
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
    __: FastifyReply
  ): void | Promise<void> {
    // Dummy implementation
    return;
  }
}

const fakeConfig: ConfigApplication = {
  entryPoints: {
    rest: {
      hookHandlers: [DummyHookHandler],
      routeHandlers: [DummyRouteHandler],
    },
  },
};

describe("Application", () => {
  it("should register hook and route handlers on start", () => {
    const app = new Application(fakeConfig);

    expect(app.hookHandlers).toHaveLength(0);
    expect(app.routeHandlers).toHaveLength(0);

    app.start();

    expect(app.hookHandlers).toHaveLength(1);
    expect(app.routeHandlers).toHaveLength(1);

    expect(app.hookHandlers[0]).toBeInstanceOf(DummyHookHandler);
    expect(app.routeHandlers[0]).toBeInstanceOf(DummyRouteHandler);
  });
});
