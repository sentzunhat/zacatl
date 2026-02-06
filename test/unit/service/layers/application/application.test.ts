import { describe, it, expect, vi } from "vitest";
import { FastifyRequest } from "fastify";
import { container } from "tsyringe";

import {
  AbstractRouteHandler,
  Application,
  ConfigApplication,
  HookHandler,
  HookHandlerName,
  Request,
} from "../../../../../src/service/layers/application";

class DummyHookHandler implements HookHandler {
  public name: HookHandlerName = "onRequest";

  async execute(_: FastifyRequest): Promise<void> {}
}

import { FastifyReply } from "fastify";

class DummyRouteHandler extends AbstractRouteHandler {
  constructor() {
    super({
      url: "/",
      schema: {},
      method: "GET",
    });
  }

  handler(_: Request, __: FastifyReply): void | Promise<void> {
    // Dummy implementation
    return;
  }
}

const fakeConfig: ConfigApplication = {
  entryPoints: {
    rest: {
      hooks: [DummyHookHandler],
      routes: [DummyRouteHandler],
    },
  },
};

describe("Application", () => {
  it("should register hook and route handlers on construction (new pattern)", () => {
    const registerSpy = vi.spyOn(container, "register");

    new Application(fakeConfig);

    // Should have registered both hooks and routes
    expect(registerSpy).toHaveBeenCalledWith(
      DummyHookHandler,
      { useClass: DummyHookHandler },
      { lifecycle: 1 },
    );
    expect(registerSpy).toHaveBeenCalledWith(
      DummyRouteHandler,
      { useClass: DummyRouteHandler },
      { lifecycle: 1 },
    );
  });
});
