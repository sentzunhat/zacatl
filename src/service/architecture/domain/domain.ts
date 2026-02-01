import { AbstractArchitecture, Constructor } from "../architecture";
import { Provider } from "./provider";
import { container } from "tsyringe";

export type ConfigDomain = {
  providers: Array<Constructor>;
};

export class Domain extends AbstractArchitecture {
  private config: ConfigDomain;
  private providers: Array<Provider> = [];

  constructor(config: ConfigDomain) {
    super();

    this.config = config;
  }

  public async start(): Promise<void> {
    this.registerDependencies(this.config.providers);

    // Auto-start providers that implement the start method
    for (const ProviderClass of this.config.providers) {
      if (container.isRegistered(ProviderClass.name)) {
        const provider = container.resolve(ProviderClass.name) as Provider;
        if (
          provider instanceof Provider &&
          typeof provider.start === "function"
        ) {
          await provider.start();
          this.providers.push(provider);
        }
      }
    }
  }
}
