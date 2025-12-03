import { AbstractArchitecture } from "../architecture";

export type ConfigInfrastructure = {
  repositories: Array<new (...args: unknown[]) => unknown>;
};

export class Infrastructure extends AbstractArchitecture {
  private config: ConfigInfrastructure;

  constructor(config: ConfigInfrastructure) {
    super();

    this.config = config;
  }

  public start(): void {
    this.registerDependencies(this.config.repositories);
  }
}
