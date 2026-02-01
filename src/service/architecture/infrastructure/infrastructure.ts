import { AbstractArchitecture, Constructor } from "../architecture";

export type ConfigInfrastructure = {
  repositories: Array<Constructor>;
  autoRegister?: boolean; // Auto-register on construction (default: false)
};

export class Infrastructure extends AbstractArchitecture {
  private config: ConfigInfrastructure;

  constructor(config: ConfigInfrastructure) {
    super();

    this.config = config;

    // Auto-register if enabled (useful without Service)
    if (config.autoRegister) {
      this.registerDependencies(this.config.repositories);
    }
  }

  public start(): void {
    // Register if not already done
    if (!this.config.autoRegister) {
      this.registerDependencies(this.config.repositories);
    }
  }
}
