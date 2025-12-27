import { Application, ConfigApplication } from "../application";
import { ConfigDomain, Domain } from "../domain";
import { ConfigInfrastructure, Infrastructure } from "../infrastructure";
import { ConfigServer, HandlersType, Server } from "./server/server";

export type ConfigMicroService = {
  architecture: {
    application: ConfigApplication;
    domain: ConfigDomain;
    infrastructure: ConfigInfrastructure;
    server: ConfigServer;
  };
};

export class MicroService {
  private application: Application;
  private domain: Domain;
  private infrastructure: Infrastructure;
  private server: Server;

  constructor(config: ConfigMicroService) {
    const { architecture } = config;
    const { application, domain, infrastructure, server } = architecture;

    this.application = new Application(application);
    this.domain = new Domain(domain);
    this.infrastructure = new Infrastructure(infrastructure);
    this.server = new Server(server);
  }

  public async start(input: { port: number }): Promise<void> {
    const { port } = input;

    await this.server.configureDatabases();

    this.infrastructure.start();

    this.domain.start();

    this.application.start();

    this.server.registerHandlers({
      handlers: this.application.routeHandlers,
      handlersType: HandlersType.ROUTE,
    });
    this.server.registerHandlers({
      handlers: this.application.hookHandlers,
      handlersType: HandlersType.HOOK,
    });

    await this.server.start({ port });
  }
}
