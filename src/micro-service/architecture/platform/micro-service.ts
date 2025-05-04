import { Application, ConfigApplication } from "../application";
import { ConfigDomain, Domain } from "../domain";
import { ConfigInfrastructure, Infrastructure } from "../infrastructure";
import { ConfigService, HandlersType, Service } from "./service/service";

export type ConfigMicroService = {
  architecture: {
    application: ConfigApplication;
    domain: ConfigDomain;
    infrastructure: ConfigInfrastructure;
    service: ConfigService;
  };
};

export class MicroService {
  private application: Application;
  private domain: Domain;
  private infrastructure: Infrastructure;
  private service: Service;

  constructor(config: ConfigMicroService) {
    const { architecture } = config;
    const { application, domain, infrastructure, service } = architecture;

    this.application = new Application(application);
    this.domain = new Domain(domain);
    this.infrastructure = new Infrastructure(infrastructure);
    this.service = new Service(service);
  }

  public async start(input: { port: number }): Promise<void> {
    const { port } = input;

    await this.service.configureDatabases();

    this.infrastructure.start();

    this.domain.start();

    this.application.start();

    this.service.registerHandlers({
      handlers: this.application.routeHandlers,
      handlersType: HandlersType.ROUTE,
    });
    this.service.registerHandlers({
      handlers: this.application.hookHandlers,
      handlersType: HandlersType.HOOK,
    });

    await this.service.start({ port });
  }
}
