import { AbstractArchitecture, Constructor } from "../architecture";

export type ConfigInfrastructure = {
  repositories: Array<Constructor>;
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
