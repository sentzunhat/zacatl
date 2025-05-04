import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  ConfigMicroService,
  MicroService,
} from "../../../../../src/micro-service/architecture/platform/micro-service";
import { Application } from "../../../../../src/micro-service/architecture/application";
import { Infrastructure } from "../../../../../src/micro-service/architecture/infrastructure";
import {
  Service,
  HandlersType,
} from "../../../../../src/micro-service/architecture/platform/service/service";
import { Domain } from "../../../../../src/micro-service/architecture/domain";

describe("MicroService", () => {
  let config: ConfigMicroService;
  let microService: MicroService;

  const port = 3000;

  // We’ll use a minimal config—since MicroService just passes these objects to the constructors,
  // we can use empty objects or simple stubs as necessary.
  beforeEach(() => {
    config = {
      architecture: {
        application: {} as any,
        domain: {} as any,
        infrastructure: {} as any,
        service: {} as any,
      },
    };

    // Create a MicroService instance using the config.
    microService = new MicroService(config);

    // For our test we want the application instance to have defined route and hook handlers.
    // Since MicroService calls:
    //   service.registerHandlers({ handlers: this.application.routeHandlers, ... })
    // we assign dummy values.
    (microService as any).application.routeHandlers = ["dummyRouteHandler"];
    (microService as any).application.hookHandlers = ["dummyHookHandler"];
  });

  it("should start the micro service by starting application, domain, infrastructure and service", async () => {
    // Arrange: create spies on the start and register methods of the dependencies.
    // Spying on the prototype methods works because the MicroService instance calls these methods.
    const appStartSpy = vi
      .spyOn(Application.prototype, "start")
      .mockImplementation(() => {});
    const domainStartSpy = vi
      .spyOn(Domain.prototype, "start")
      .mockImplementation(() => {});
    const infrastructureStartSpy = vi
      .spyOn(Infrastructure.prototype, "start")
      .mockImplementation(() => {});
    const serviceRegisterHandlersSpy = vi
      .spyOn(Service.prototype, "registerHandlers")
      .mockImplementation(() => Promise.resolve());
    const serviceStartSpy = vi
      .spyOn(Service.prototype, "start")
      .mockImplementation(() => Promise.resolve());

    // Act: Call MicroService.start().
    await microService.start({ port });

    // Assert: Verify that the underlying dependencies were started as expected.
    expect(appStartSpy).toHaveBeenCalled();
    expect(domainStartSpy).toHaveBeenCalled();
    expect(infrastructureStartSpy).toHaveBeenCalled();

    // Assert registerHandlers was called twice:
    // First for route handlers...
    expect(serviceRegisterHandlersSpy).toHaveBeenNthCalledWith(1, {
      handlers: (microService as any).application.routeHandlers,
      handlersType: HandlersType.ROUTE,
    });
    // ...and second for hook handlers.
    expect(serviceRegisterHandlersSpy).toHaveBeenNthCalledWith(2, {
      handlers: (microService as any).application.hookHandlers,
      handlersType: HandlersType.HOOK,
    });

    // Assert that service.start was called with the expected port.
    expect(serviceStartSpy).toHaveBeenCalledWith({ port });
  });
});
