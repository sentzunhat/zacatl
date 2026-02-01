import { Application, ConfigApplication } from "../application";
import { ConfigDomain, Domain } from "../domain";
import { ConfigInfrastructure, Infrastructure } from "../infrastructure";
import { ConfigServer, HandlersType, Server } from "./server/server";
import type { Optional } from "../../../optionals";

export type ConfigService = {
  architecture: {
    application?: Optional<ConfigApplication>;
    domain: ConfigDomain;
    infrastructure: ConfigInfrastructure;
    server?: Optional<ConfigServer>;
  };
};

export class Service {
  private application?: Optional<Application>;
  private domain: Domain;
  private infrastructure: Infrastructure;
  private server?: Optional<Server>;

  constructor(config: ConfigService) {
    const { architecture } = config;
    const { application, domain, infrastructure, server } = architecture;

    this.application = application ? new Application(application) : undefined;
    this.domain = new Domain(domain);
    this.infrastructure = new Infrastructure(infrastructure);
    this.server = server ? new Server(server) : undefined;
  }

  public async start(input?: { port?: number }): Promise<void> {
    // Configure databases if server is provided
    if (this.server) {
      await this.server.configureDatabases();
    }

    // Start infrastructure (repositories)
    this.infrastructure.start();

    // Start domain (providers)
    await this.domain.start();

    // Start application (routes/hooks) if provided
    if (this.application) {
      this.application.start();
    }

    // Register handlers and start server if provided
    if (this.server && this.application) {
      this.server.registerHandlers({
        handlers: this.application.routeHandlers,
        handlersType: HandlersType.ROUTE,
      });
      this.server.registerHandlers({
        handlers: this.application.hookHandlers,
        handlersType: HandlersType.HOOK,
      });

      await this.server.start({ port: input?.port ?? 3000 });
    }
  }
}
