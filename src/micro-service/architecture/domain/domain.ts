import { AbstractArchitecture, Constructor } from "../architecture";

export type ConfigDomain = {
  providers: Array<Constructor>;
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
