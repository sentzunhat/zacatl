import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  ConfigService,
  Service,
} from "../../../../../src/service/architecture/platform/service";
import { Application } from "../../../../../src/service/architecture/application";
import { Infrastructure } from "../../../../../src/service/architecture/infrastructure";
import {
  Server,
  HandlersType,
} from "../../../../../src/service/architecture/platform/server/server";
import { Domain } from "../../../../../src/service/architecture/domain";

describe("Service", () => {
  let config: ConfigService;
  let service: Service;

  const port = 3000;

  // We’ll use a minimal config—since MicroService just passes these objects to the constructors,
  // we can use empty objects or simple stubs as necessary.
  beforeEach(() => {
    config = {
      architecture: {
        application: {} as any,
        domain: {} as any,
        infrastructure: {} as any,
        server: {
          name: "TestService",
          server: {
            type: "SERVER",
            vendor: "FASTIFY",
            instance: {
              listen: vi.fn(),
              withTypeProvider: vi.fn(() => ({ route: vi.fn() })),
              addHook: vi.fn(),
              register: vi.fn(),
              setNotFoundHandler: vi.fn(),
            },
          },
          databases: [],
        } as any,
      },
    };

    // Create a Service instance using the config.
    service = new Service(config);

    // For our test we want the application instance to have defined route and hook handlers.
    // Since Service calls:
    //   service.registerHandlers({ handlers: this.application.routeHandlers, ... })
    // we assign dummy values.
    (service as any).application.routeHandlers = ["dummyRouteHandler"];
    (service as any).application.hookHandlers = ["dummyHookHandler"];
  });

  it("should start the service by starting application, domain, infrastructure and server", async () => {
    // Arrange: create spies on the start and register methods of the dependencies.
    // Spying on the prototype methods works because the Service instance calls these methods.
    const appStartSpy = vi
      .spyOn(Application.prototype, "start")
      .mockImplementation(() => Promise.resolve());
    const domainStartSpy = vi
      .spyOn(Domain.prototype, "start")
      .mockImplementation(() => Promise.resolve());
    const infrastructureStartSpy = vi
      .spyOn(Infrastructure.prototype, "start")
      .mockImplementation(() => Promise.resolve());
    const serverRegisterHandlersSpy = vi
      .spyOn(Server.prototype, "registerHandlers")
      .mockImplementation(() => Promise.resolve());
    const serverStartSpy = vi
      .spyOn(Server.prototype, "start")
      .mockImplementation(() => Promise.resolve());

    // Act: Call Service.start().
    await service.start({ port });

    // Assert: Verify that the underlying dependencies were started as expected.
    expect(appStartSpy).toHaveBeenCalled();
    expect(domainStartSpy).toHaveBeenCalled();
    expect(infrastructureStartSpy).toHaveBeenCalled();

    // Assert registerHandlers was called twice:
    // First for route handlers...
    expect(serverRegisterHandlersSpy).toHaveBeenNthCalledWith(1, {
      handlers: (service as any).application.routeHandlers,
      handlersType: HandlersType.ROUTE,
    });
    // ...and second for hook handlers.
    expect(serverRegisterHandlersSpy).toHaveBeenNthCalledWith(2, {
      handlers: (service as any).application.hookHandlers,
      handlersType: HandlersType.HOOK,
    });

    // Assert that server.start was called with the expected port.
    expect(serverStartSpy).toHaveBeenCalledWith({ port });
  });
});
