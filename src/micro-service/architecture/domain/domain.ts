import { AbstractArchitecture } from "../architecture";

export type ConfigDomain = {
  providers: Array<new (...args: unknown[]) => unknown>;
};

export class Domain extends AbstractArchitecture {
  private config: ConfigDomain;

  constructor(config: ConfigDomain) {
    super();

    this.config = config;
  }

  public start(): void {
    this.registerDependencies(this.config.providers);
  }
}
